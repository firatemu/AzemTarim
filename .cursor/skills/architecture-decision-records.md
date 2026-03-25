# Architecture Decision Records (ADR) Skill

## Purpose
Automatically capture and structure architectural decisions made during development sessions.

## When to Trigger
- When a major refactoring is proposed.
- When a new technology or library is introduced.
- When an existing architectural pattern is modified.

## How to Record
1. **Identify the decision**: What is being changed?
2. **Context**: Explain the background and the problem being solved.
3. **Decided Action**: Document the chosen path.
4. **Rationale**: Why was this path chosen over others?
5. **Impact**: How will this affect the codebase in the long run?

## Storage
Save ADRs to `docs/adr/*.md` with a zero-padded index (e.g., `001-use-prisma.md`).
