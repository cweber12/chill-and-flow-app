---
description: "Run the full pipeline: code review → generate tests → commit and push"
mode: "agent"
tools: [read, search, edit, execute, agent]
---

Run the following three steps in order. Stop if any step fails.

1. **Code Review** — Invoke the `code-review` agent to scan for coverage gaps, bugs, edge cases, and security issues in `src/`. Report findings.

2. **Test Generation** — Invoke the `test-writer` agent to write tests for any uncovered code identified in step 1 (and any other untested source files). Confirm all tests pass.

3. **Commit & Push** — Invoke the `release` agent to validate, commit, and push all changes to `https://github.com/cweber12/chill-and-flow-app.git`.

Report the combined results of all three steps.
