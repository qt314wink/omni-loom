#!/usr/bin/env python3
import argparse, hashlib, json, sys
from pathlib import Path

class SpecimenError(Exception):
    pass

def canonical_bytes(value):
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")

def compile_specimen(specimen):
    required = ["schemaVersion", "specimenId", "machineProfile", "materialAssumptions", "inputPattern"]
    missing = [key for key in required if key not in specimen]
    if missing:
        raise SpecimenError(f"schema-invalid: missing {', '.join(missing)}")

    machine = specimen["machineProfile"]
    constraints = machine.get("constraints", {})
    pattern = specimen["inputPattern"]
    diameter = float(specimen["materialAssumptions"]["nominalDiameterMm"])
    width_cells = int(pattern["widthCells"])
    height_cells = int(pattern["heightCells"])
    width_mm = width_cells * diameter
    height_mm = height_cells * diameter

    if width_mm > float(constraints["maxWidthMm"]):
        raise SpecimenError(
            f"machine-constraint: unsupported-width requested={width_mm:.6f} max={constraints['maxWidthMm']}"
        )
    if height_mm > float(constraints["maxHeightMm"]):
        raise SpecimenError(
            f"machine-constraint: unsupported-height requested={height_mm:.6f} max={constraints['maxHeightMm']}"
        )

    operations = []
    for row in range(height_cells):
        shed = row % 2
        operations.append({"op": "lift", "row": row, "shed": shed})
        operations.append({"op": "weft", "row": row, "direction": "left-to-right" if row % 2 == 0 else "right-to-left"})
        operations.append({"op": "advance", "row": row, "distanceMm": diameter})

    plan = {
        "planVersion": "0.1.0",
        "specimenId": specimen["specimenId"],
        "machineProfile": {"kind": machine["kind"], "profileVersion": machine["profileVersion"]},
        "dimensions": {"widthCells": width_cells, "heightCells": height_cells, "widthMm": width_mm, "heightMm": height_mm},
        "materialAssumptions": specimen["materialAssumptions"],
        "operations": operations,
        "simulationOnly": True
    }
    plan_bytes = canonical_bytes(plan)
    receipt = {
        "receiptVersion": "0.1.0",
        "specimenId": specimen["specimenId"],
        "inputDigest": hashlib.sha256(canonical_bytes(specimen)).hexdigest(),
        "planDigest": hashlib.sha256(plan_bytes).hexdigest(),
        "operationCount": len(operations),
        "evidenceMaturity": specimen.get("evidenceMaturity", "simulated"),
        "approvalState": specimen.get("approvalState", "draft")
    }
    return plan, receipt

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("specimen")
    parser.add_argument("--out-dir", default="examples/specimen-v0/generated")
    args = parser.parse_args()
    specimen = json.loads(Path(args.specimen).read_text())
    try:
        plan, receipt = compile_specimen(specimen)
    except SpecimenError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "plan.json").write_bytes(canonical_bytes(plan))
    (out / "receipt.json").write_bytes(canonical_bytes(receipt))
    print(receipt["planDigest"])
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
