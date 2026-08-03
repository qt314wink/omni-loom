# Specimen v0 proof

This proof remains simulation-only. It does not operate a physical loom or claim fabrication fidelity.

## Run

```bash
python3 -m unittest tests/test_specimen.py -v
python3 scripts/specimen/compile_specimen.py examples/specimen-v0/specimen.json
sha256sum examples/specimen-v0/generated/plan.json examples/specimen-v0/generated/receipt.json
```

Run the sequence twice from a clean working tree. The plan and receipt hashes must remain identical.

## Safe-failure proof

The test suite increases the requested width beyond `machineProfile.constraints.maxWidthMm` and requires compilation to fail before returning or writing a plan.

## Boundaries

- generated output is disposable;
- `simulationOnly` must remain true;
- `evidenceMaturity` remains `simulated`;
- `approvalState` remains `draft`;
- no machine adapter, device connection, pricing, deployment, interaction redesign, or physical-result claim is authorized;
- adding a second backend is blocked until this proof passes twice and receives human review.
