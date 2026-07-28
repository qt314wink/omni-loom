# Omni-Loom Interaction and Conversion Intent Matrix

Status: evidence-only audit
Scope: current `index.html`
Source behavior is not modified by this branch.

## Governing rule

No new interaction, persuasion, audio, haptic, animation, social-proof, or conversion feature may be added until the current layer has an explicit user benefit, accessible behavior, privacy boundary, failure state, and verification result.

| Feature | Intended user benefit | Required behavior | Prohibited behavior | Evidence required |
|---|---|---|---|---|
| Exit-intent whitepaper dialog | offer a useful technical artifact before departure | shown at most once per session; Escape closes; focus enters and returns; close is always available | trapping navigation; repeated display; false scarcity; hidden subscription | keyboard test, focus test, session guard, copy review |
| Newsletter / whitepaper email | deliver explicitly requested material | clear consent; privacy notice; success/error state; no unrelated enrollment | silent list enrollment; fake success; email leakage | form-state test, network contract, privacy copy |
| Ambient audio | optional sensory context | off by default; starts only after user gesture; persistent mute; no reduced-motion conflict | autoplay; surprise volume; blocking access | user-gesture test, default-state test, cleanup test |
| Haptics | optional tactile confirmation on supported devices | capability check; brief bounded patterns; no meaning conveyed only by vibration | repeated vibration; unsupported calls; coercive feedback | capability and preference tests |
| Scroll progress | orientation within the narrative | visual width and `aria-valuenow` remain synchronized | decorative progress unrelated to real position | scroll calculation test and accessibility check |
| 3D card motion | communicate depth and interactivity | keyboard equivalent; reduced-motion replacement; bounded transforms | motion-only affordance; pointer-only behavior; excessive vestibular motion | pointer, keyboard, and reduced-motion tests |
| Particle and background motion | ambient material atmosphere | disabled or simplified under reduced motion; disposed on unload | permanent animation loops without cleanup | runtime preference and cleanup evidence |
| Social proof | communicate verified adoption or validation | every number and quote has a source and date | fabricated ratings, users, savings, or testimonials | claim-to-evidence receipt |
| Analytics | measure defined product questions | disabled until consent, minimization, retention, and event schema are approved | placeholder IDs activated casually; email or free-text capture | analytics decision record and privacy test |

## Current high-risk claims

The page contains an `aggregateRating` structured-data object. Until a documented source establishes the rating value and count, publication of that object must be treated as a blocking evidence failure.

The page also describes a 40-page whitepaper and quantified annual time savings. Those claims require one of:

- an actual downloadable artifact and version;
- a measured study and calculation method;
- an explicit `proposed` or `illustrative` label.

## Required audit outputs

The static audit generates `artifacts/interaction-audit.json` with:

- check ID;
- severity;
- pass/fail result;
- evidence expectation;
- total failures;
- critical-failure count.

The report is a gate, not proof of complete accessibility. Manual keyboard, screen-reader, mobile, motion-sensitivity, and consent review remains required.

## Approval gate

This branch must remain draft. Product changes are intentionally excluded. After the audit runs:

1. each critical failure becomes a bounded remediation issue;
2. each issue declares exact allowed paths;
3. behavior fixes are separated by concern;
4. new conversion features remain frozen;
5. Jennipher approves remediation PRs individually.

## Stop conditions

Stop and request review when:

- a proposed fix changes product claims or pricing;
- a real mailing provider or analytics service is introduced;
- personal data storage is required;
- a change touches generated imagery or fabrication content;
- accessibility repair requires a visual redesign;
- source changes fall outside the approved remediation issue.
