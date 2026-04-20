# Karpathy-Inspired Claude Code Guidelines

Local vendored copy for agent use.

Source:
- Repository: https://github.com/forrestchang/andrej-karpathy-skills
- Upstream raw file: https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md

Purpose:
- Keep the core behavior rules in the project root so local coding agents can read them.
- Preserve a sync target separate from project-specific instructions in `AGENTS.md`.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: these guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them instead of picking silently.
- If a simpler approach exists, say so.
- If something is unclear, stop, name the confusion, and ask.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If 200 lines can be 50, rewrite it.

Ask: would a senior engineer call this overcomplicated? If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:
- Don't improve adjacent code, comments, or formatting unless required.
- Don't refactor things that are not broken.
- Match existing style, even if you would do it differently.
- If you notice unrelated dead code, mention it instead of deleting it.

When your changes create orphans:
- Remove imports, variables, or functions made unused by your change.
- Don't remove pre-existing dead code unless asked.

Test: every changed line should trace directly to the request.

## 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- Add validation -> write tests for invalid inputs, then make them pass.
- Fix the bug -> write a test that reproduces it, then make it pass.
- Refactor X -> ensure tests pass before and after.

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let the agent loop independently. Weak criteria like "make it work" require repeated clarification.

Signals this is working:
- Fewer unnecessary changes in diffs.
- Fewer rewrites due to overcomplication.
- Clarifying questions happen before implementation.
- PRs stay narrow and task-aligned.