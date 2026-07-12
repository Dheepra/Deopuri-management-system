import { useState } from "react";
import toast from "react-hot-toast";
import { http } from "../services/http.js";
import { matches, minLength, required, runValidators } from "../utils/validators.js";

export default function CreatePassword({ userId, token, onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const linkInvalid = !userId || !token;

  const validate = (pw = password, cpw = confirmPassword) => ({
    password: runValidators(pw, required("Password"), minLength(8)),
    confirmPassword: runValidators(cpw, required("Confirm password"), matches(pw, "password")),
  });

  const clearError = (name) =>
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (linkInvalid) {
      toast.error("Missing or invalid setup link. Use the link from your email, or log in with your temporary password.");
      return;
    }

    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    try {
      setLoading(true);
      // Relative path → Vite proxy → backend. token authorises the password set for this userId.
      await http.post(`/deopuri/auth/create-password/${userId}`, { userId, password, token });
      toast.success("Password created — please log in");
      onSuccess?.();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data || "Failed to create password";
      toast.error(typeof msg === "string" ? msg : "Failed to create password");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (invalid) =>
    [
      "w-full rounded-xl border px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:ring-2 focus:ring-brand-100",
      invalid ? "border-red-400 focus:border-red-500" : "border-ink-200 focus:border-brand-500",
    ].join(" ");

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">🔐</span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">Create your password</h2>
          <p className="text-xs text-ink-500">Set a password to finish activating your account.</p>
        </div>
      </div>

      {linkInvalid && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700">
          ⚠️ Missing or invalid setup link. Open the link from your email, or log in with your temporary password.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">🔑 New password</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
            className={inputCls(Boolean(errors.password))}
          />
          {errors.password && (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">✅ Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
            className={inputCls(Boolean(errors.confirmPassword))}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.confirmPassword}</p>
          )}
        </label>

        <button
          type="submit"
          disabled={loading || linkInvalid}
          className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating…" : "🔓 Create password"}
        </button>
      </form>
    </div>
  );
}
