# AI boundaries for Pathfinder

## Authoritative learning model

Pathfinder's learner-facing coaching is compiled deterministically from reviewed pattern profiles, problem teaching facts, intuition facts, and exact execution traces. That model is authoritative because it supports consistent progression, checked feedback, repair links, and reproducible tests.

An AI response must not replace a reviewed answer, explanation, hint ladder, trace, correctness claim, complexity claim, or progress decision. It must not reveal gated algorithm/topic information before the intended data-structure checkpoint.

## Allowed future AI role

AI may be used only as an explicit, optional and clearly bounded enhancement—for example, to propose a follow-up question or draft material for human review. It must not silently alter deterministic scoring, feedback, completion, mastery, or canonical coaching paths. The static app must remain fully usable when AI is unavailable.

## Privacy and security boundary

Never expose API keys in browser code, Vite environment values intended for the client, logs, fixtures, documentation examples, or commits. Requests requiring a secret belong in a separately hosted server or serverless function. Browser configuration may identify a deliberately public API endpoint, but not authenticate with a secret.

Minimize learner data sent to any future service and do not transmit unnecessary progress history or identifying information. Treat all external output as untrusted until reviewed and validated.

## Accessibility and quality boundary

An AI-assisted enhancement must preserve keyboard, touch, and mobile accessibility, including clear control labels, focus handling, and status announcements. It must be covered by focused tests appropriate to its integration, and the project must pass `npm test` and `npm run build` from `leetcode-coach`.