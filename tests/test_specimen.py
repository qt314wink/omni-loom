#!/usr/bin/env python3
import copy, hashlib, importlib.util, json, tempfile, unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts/specimen/compile_specimen.py"
spec = importlib.util.spec_from_file_location("compile_specimen", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

SPECIMEN_PATH = Path(__file__).resolve().parents[1] / "examples/specimen-v0/specimen.json"

def digest(value):
    return hashlib.sha256(module.canonical_bytes(value)).hexdigest()

class SpecimenCompilerTest(unittest.TestCase):
    def setUp(self):
        self.specimen = json.loads(SPECIMEN_PATH.read_text())

    def test_identical_inputs_produce_identical_plan_and_receipt(self):
        plan_a, receipt_a = module.compile_specimen(copy.deepcopy(self.specimen))
        plan_b, receipt_b = module.compile_specimen(copy.deepcopy(self.specimen))
        self.assertEqual(module.canonical_bytes(plan_a), module.canonical_bytes(plan_b))
        self.assertEqual(module.canonical_bytes(receipt_a), module.canonical_bytes(receipt_b))
        self.assertEqual(receipt_a["planDigest"], digest(plan_a))

    def test_unsupported_width_fails_before_plan_emission(self):
        invalid = copy.deepcopy(self.specimen)
        invalid["inputPattern"]["widthCells"] = 1000
        invalid["materialAssumptions"]["nominalDiameterMm"] = 1
        with self.assertRaisesRegex(module.SpecimenError, "unsupported-width"):
            module.compile_specimen(invalid)

    def test_units_and_simulation_boundary_are_explicit(self):
        plan, receipt = module.compile_specimen(copy.deepcopy(self.specimen))
        self.assertIn("widthMm", plan["dimensions"])
        self.assertIn("heightMm", plan["dimensions"])
        self.assertTrue(plan["simulationOnly"])
        self.assertEqual(receipt["evidenceMaturity"], "simulated")
        self.assertEqual(receipt["approvalState"], "draft")

    def test_missing_required_field_fails(self):
        invalid = copy.deepcopy(self.specimen)
        del invalid["machineProfile"]
        with self.assertRaisesRegex(module.SpecimenError, "schema-invalid"):
            module.compile_specimen(invalid)

if __name__ == "__main__":
    unittest.main()
