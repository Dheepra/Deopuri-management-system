# 1. Record architecture decisions

Date: 2026-05-14

## Status

Accepted

## Context

We need a lightweight way to capture significant architectural choices made
during the evolution of the Deopuri Management System (module boundaries,
auth approach, persistence choices, etc.) so future contributors can
understand *why* the code looks the way it does — not just *what* it does.

## Decision

We will use Architecture Decision Records (ADRs) in `docs/adr/` to document
each significant decision. ADRs are short, numbered Markdown files with the
sections: Status, Context, Decision, Consequences. New decisions are added
as new files, not by editing existing ones.

## Consequences

- A clear, append-only log of architectural decisions sits alongside the code.
- Reviewers can point new ADRs at by file path during code review.
- Old ADRs that get superseded are not deleted; they are marked
  `Status: Superseded by ADR-NNNN`.
