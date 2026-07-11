# Security & Auth Changes — Deopuri Management System

This document records the **Tier‑0 security hardening**, the **create‑password token flow**,
the **JSON logging** switch, and how **login / account creation** work now.

> Audience: backend + frontend devs and reviewers. All changes are source‑only; rebuild both apps
> and run the DB with the new config. Nothing here changes the domain schema except adding no new
> columns (the `invitation_token` column already existed on `users`).

---

## 1. What changed at a glance (Before → After)

| Area | Before (bug/risk) | After (fix) |
|---|---|---|
| **Public registration** | `POST /api/auth/register` accepted **any** role incl. `ADMIN` | Server‑side whitelist — only `HOSPITAL_ADMIN` / `MEDICAL_ADMIN`. `ADMIN`/`DOCTOR` rejected |
| **Approve user** | `GET /api/admin/approve-user/**` was `permitAll` — anyone could self‑approve | Falls under `/api/admin/**` → **`ROLE_ADMIN` only** |
| **Create doctor** | `POST /api/hospital-admin/doctors` public + `hospitalAdminId` from client | **`ROLE_HOSPITAL_ADMIN` only** |
| **Create password** | `POST /api/auth/create-password/{userId}` set a password for **any** userId with no proof (account takeover) | Requires a **single‑use invitation token** bound to the user |
| **Doctor temp password** | Hardcoded `Temp@123` for every doctor | **Random per‑doctor** temp password (emailed) |
| **SMTP credentials** | Real Gmail app‑password committed in `application-dev.properties` | Moved to env (`MAIL_USERNAME` / `MAIL_PASSWORD`); **old password must be rotated** |
| **Cart** | `/api/cart/**` partly public; `removeItem` deleted any row by id | **Authenticated**; acting user derived from JWT; ownership checked on remove |
| **Orders** | `confirmOrder/{userId}` & `getUserOrders/{userId}` trusted the path id | User derived from JWT; non‑admin cannot read another user's orders |
| **Payments** | `/api/payments/**` unscoped (IDOR on money) | Recording a payment is **`ROLE_ADMIN` only**; history is **owner‑or‑admin** scoped |
| **Logs** | Plain text + raw `Hibernate:` SQL dumped to stdout | **Structured JSON** (ECS) console logs; SQL noise off by default |
| **JWT secret** | Dev fallback secret committed; default profile `dev` | Prod (`application.properties`) has **no default** secret → app **fails fast** without `JWT_SECRET` |

---

## 2. Authorization matrix (after)

| Endpoint | Access |
|---|---|
| `POST /api/auth/login`, `/register`, `/create-password/**` | Public (create‑password validated by token) |
| `GET /api/products/**`, `/api/hospitals`, `/uploads/**` | Public |
| `POST /api/hospital-admin/doctors` | `ROLE_HOSPITAL_ADMIN` |
| `/api/hospital-admin/**` (doctor lookups) | Authenticated |
| `/api/cart/**` | Authenticated (self only) |
| `/api/orders/**` | Authenticated (self; admin sees all) |
| `POST /api/payments/**` | `ROLE_ADMIN` |
| `GET /api/payments/**` | Authenticated (owner or admin) |
| `/api/admin/**` (incl. approve‑user, notifications) | `ROLE_ADMIN` |
| `POST/PUT/DELETE /api/products/**` | `ROLE_ADMIN` |
| everything else | Authenticated |

> Note: authorities are `ROLE_ADMIN` / `ROLE_HOSPITAL_ADMIN` / `ROLE_MEDICAL_ADMIN` / `ROLE_DOCTOR`.
> "admin‑only" checks match `ROLE_ADMIN` exactly (not the `_ADMIN` suffix on hospital/medical).

---

## 3. Login flows

### 3.1 Normal login
```
POST /api/auth/login { email, password }
  └─ user APPROVED?  no  → 403 "Account not active"
  └─ password matches? no → 401
  └─ yes → LoginResponse { token, role, id, status:"SUCCESS", invitationToken:null }
FE: store session (auth.session), redirect to ROLE_HOME[role]
```

### 3.2 Doctor first‑time login (temp password)
```
Doctor logs in with the EMAILED random temp password, passwordCreated=false
  └─ LoginResponse { status:"FIRST_TIME_LOGIN", id, invitationToken }   (no JWT yet)
FE (LoginForm → Login page): opens CreatePassword with { userId:id, token:invitationToken }
```

### 3.3 Email "Create Password" link
```
Email link → /login?userId=X&token=Y
FE (Login page useEffect): opens CreatePassword with { userId:X, token:Y }
```

---

## 4. Account creation flows

### 4.1 Self‑registration (Hospital / Medical admin)
```
POST /api/auth/register { firstName,...,role }
  └─ role must be HOSPITAL_ADMIN or MEDICAL_ADMIN   (else 422 role_not_allowed)
  └─ email/mobile unique? else 409
  └─ save user status=PENDING  → email/notify admins
  └─ "Waiting for Admin Approval"
Admin later: GET /api/admin/approve-user/{id}  (ADMIN only) → status=APPROVED → user can log in
```
`ADMIN` (company admin) is **seeded manually in the DB**, never self‑registered.

### 4.2 Doctor creation (by Hospital Admin)
```
POST /api/hospital-admin/doctors  (ROLE_HOSPITAL_ADMIN)
  └─ create Users(role=DOCTOR, status=APPROVED, passwordCreated=false)
  └─ tempPassword = random  (BCrypt‑hashed)
  └─ invitationToken = random UUID  (stored on the user)
  └─ email: temp password + link /login?userId=X&token=<invitationToken>
```

### 4.3 Create password (the secured takeover fix)
```
POST /api/auth/create-password/{userId} { password, token }
  └─ user exists? else 404
  └─ passwordCreated already true? → reject
  └─ token present AND == user.invitationToken?  no → 422 "Invalid or expired password-setup link"
  └─ set BCrypt password, passwordCreated=true, invitationToken=null (single‑use / no replay)
```
Both the **first‑time‑login** path (token returned by login) and the **email‑link** path
(token in the URL) carry the same token, so the endpoint is safe to keep public — it is
authorised by the token, not by a guessable userId.

---

## 5. JSON logging

`application.properties`:
```properties
logging.structured.format.console=ecs
logging.structured.ecs.service.name=deopuri
spring.jpa.show-sql=false
logging.level.org.hibernate.SQL=WARN
logging.level.org.hibernate.orm.jdbc.bind=WARN
```
- Every console line is now a **single JSON object** (Elastic Common Schema). The per‑request
  `requestId` (MDC) is emitted as a field, so a whole request chain can be filtered by it.
- Raw `Hibernate:` SQL (which was printed straight to stdout as non‑JSON) is **off**. To debug a
  query locally, temporarily set `spring.jpa.show-sql=true` / `logging.level.org.hibernate.SQL=DEBUG`.

---

## 6. Required operator actions (not code)

1. **Rotate the leaked SMTP app‑password** (it was committed to git). Revoke it in the Google
   account, create a new one, set `MAIL_USERNAME` / `MAIL_PASSWORD` as env vars. Purge it from git
   history (BFG / `git filter-repo`) — old commits still contain it.
2. **Set `JWT_SECRET`** (≥ 32 chars) in every non‑dev environment, and run with
   `SPRING_PROFILES_ACTIVE=prod`. Prod refuses to start without a secret (by design).
3. **Provide `MAIL_USERNAME` / `MAIL_PASSWORD`** in dev too, or email sending will be disabled.
4. **Rebuild** backend + frontend and smoke‑test:
   - register `role:"ADMIN"` → rejected.
   - non‑admin `GET /api/orders/user/{otherId}` and `GET /api/payments/order/{num}` → 403.
   - `create-password` with wrong/missing token → 422 "Invalid or expired…".

---

## 7. Still open (tracked, not in this change)

- **Tier‑1 (money/stock):** stock is never decremented (overselling); cart uses base product price
  not variant price; amounts are `Double` (use `BigDecimal`); order‑number generation is a race;
  registration rolls back if email fails.
- **Tier‑2 (frontend):** some appointment/doctor/notification calls use tokenless `axios`/`fetch`
  and hardcoded `http://localhost:8080`; no 401 response‑interceptor (expired token traps the user);
  a few null‑guards missing.
- Securing `/api/appointments/**` (still public) needs those frontend calls to send the JWT first.
