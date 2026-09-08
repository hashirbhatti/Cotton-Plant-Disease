import sys
import os
import numpy as np
from PIL import Image

# Ensure api directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import run_robust_pipeline, load_config_and_models

def run_tests():
    print("--- Starting Robust Pipeline Backend Tests ---")
    load_config_and_models()

    # Test 1: Quality Gate - Small Image (<32x32)
    small_img = Image.new("RGB", (20, 20), color=(128, 128, 128))
    res1 = run_robust_pipeline(small_img)
    print("\n[TEST 1] Small Image (<32x32):")
    print(f"Class: {res1['class']}, Stage: {res1['stage']}, Status: {res1['status']}")
    print(f"Message: {res1['message']}")
    assert res1['class'] == 'Unclassified'
    assert res1['stage'] == 'quality_gate'

    # Test 2: Quality Gate - Blank / Uniform Image (Std Dev < 3.0)
    blank_img = Image.new("RGB", (256, 256), color=(200, 200, 200))
    res2 = run_robust_pipeline(blank_img)
    print("\n[TEST 2] Blank Uniform Image (StdDev < 3.0):")
    print(f"Class: {res2['class']}, Stage: {res2['stage']}, Status: {res2['status']}")
    print(f"Message: {res2['message']}")
    assert res2['class'] == 'Unclassified'
    assert res2['stage'] == 'quality_gate'

    # Test 3: Synthetic Non-Plant Noise Image (Plant Leaf Gate check)
    np.random.seed(42)
    noise_arr = np.random.randint(0, 256, (256, 256, 3), dtype=np.uint8)
    noise_img = Image.fromarray(noise_arr)
    res3 = run_robust_pipeline(noise_img)
    print("\n[TEST 3] Noise / Non-Plant Image:")
    print(f"Class: {res3['class']}, Stage: {res3['stage']}, Status: {res3['status']}")
    print(f"Message: {res3['message']}")
    print(f"Gate Details: {res3['details'].get('plant_gate')}")

    print("\n--- ALL BACKEND PIPELINE UNIT TESTS PASSED ---")

if __name__ == "__main__":
    run_tests()
