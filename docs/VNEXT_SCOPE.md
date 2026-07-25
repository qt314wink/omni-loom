# Omni-Loom vNext Scope — From Concept Site to Evidence-Bearing Product Demonstrator

## Version thesis

The next version should stop behaving primarily like a cinematic manifesto and begin proving the compiler thesis through inspectable product behavior. The visual language remains tactile, but each decorative layer must carry semantic responsibility: material, constraint, provenance, machine state, or verification.

## Product shape

### 1. Interactive compiler demonstrator

A user imports an SVG or chooses a fixture, selects a fabrication modality, and receives:

- normalized geometry,
- constraint warnings,
- generated `stitch_plan.json`,
- adapter output preview,
- a deterministic run receipt,
- before/after visual and semantic diffs.

**Definition of done:** the same fixture and parameters generate byte-identical normalized IR and equivalent adapter output across repeated runs.

### 2. Provenance and evidence ledger

Every transformation appends a receipt containing prior state, new state, evidence IDs, actor, version, timestamp, rule set, and reason. Corrections supersede prior records rather than overwriting them.

**Definition of done:** a reviewer can reconstruct any exported toolpath from source fixture, compiler version, parameter set, and receipt chain.

### 3. Adapter laboratory

Ship simulated adapters for CNC, embroidery, and laser first. Each adapter declares accepted primitives, machine limits, unit handling, compensation rules, and failure states.

**Definition of done:** unsupported operations fail explicitly with machine-specific remediation rather than silently degrading.

### 4. Material-aware diagnostics

Replace generic “morphism” panels with real diagnostic lenses:

- geometry integrity,
- physical feasibility,
- registration and tolerance,
- material stress,
- tool/machine compatibility,
- provenance completeness.

**Definition of done:** each warning links to the responsible input, rule, affected output, severity, confidence, and proposed correction.

### 5. Case-study evidence mode

Add a narrative layer for funders and partners containing a verified problem statement, workflow benchmark, fixture library, failure examples, pilot protocol, and clearly labeled assumptions.

**Definition of done:** no quantitative claim appears without a source, measurement method, or explicit “hypothesis” label.

## Information architecture

1. **Overview** — thesis, verified outcomes, live demo entry.
2. **Compile** — import, normalize, diagnose, configure, export.
3. **Run receipt** — timeline, evidence graph, diffs, reproducibility data.
4. **Adapters** — machine profiles, capability matrices, test fixtures.
5. **Case study** — problem, method, evidence, limitations, roadmap.
6. **System docs** — IR schema, contracts, invariants, threat model, QA.

## Technical architecture

- `apps/web`: Vite + React + TypeScript strict.
- `packages/ir-schema`: JSON Schema + generated TypeScript types.
- `packages/compiler-core`: deterministic pure transforms with golden fixtures.
- `packages/adapter-cnc`, `adapter-embroidery`, `adapter-laser`.
- `packages/evidence-ledger`: append-only receipts and content hashes.
- `packages/ui`: semantic tokens, responsive components, Storybook.
- `packages/visualizer`: SVG/Canvas/WebGPU progressive enhancement.
- `tests/golden`: fixture inputs and approved normalized/output snapshots.

## Release gates

### Gate 0 — Claims
Every metric is sourced, measured, or labeled as an assumption.

### Gate 1 — Determinism
Repeated fixture compilation produces stable hashes and documented tolerances.

### Gate 2 — Translation integrity
IR, adapter output, preview, and receipt agree for every supported fixture.

### Gate 3 — Mobile and accessibility
320px minimum viewport, keyboard-complete flow, reduced motion, WCAG AA contrast, and no hover-only meaning.

### Gate 4 — Performance
Lighthouse ≥90 for performance/accessibility/best practices/SEO on the public case-study route; the demo route documents heavier GPU requirements separately.

### Gate 5 — Pilot readiness
A fabrication partner can run the fixture protocol, record machine results, and return evidence without developer intervention.

## Next build sequence

1. Convert the single file into the monorepo shell and preserve this responsive landing page as `/overview`.
2. Define `stitch_plan.schema.json` and five golden fixtures.
3. Build the compile flow with simulated CNC output.
4. Add evidence receipts and reproducibility hashes.
5. Add embroidery and laser adapters with explicit capability matrices.
6. Run mobile/accessibility/performance QA and publish the pilot protocol.
