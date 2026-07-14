import os
import shutil
import json

# Setup directories
artifacts_dir = r"C:\Users\nawee\.gemini\antigravity\brain\5b9b8c89-a6b6-4f09-91ea-b36eeeaf49eb"
scratch_dir = os.path.join(artifacts_dir, "scratch")
project_dir = r"c:\Users\nawee\OneDrive\Documents\LPU\projects\tourism"
doodles_dir = os.path.join(project_dir, "doodles")

# Ensure doodles directory exists
os.makedirs(doodles_dir, exist_ok=True)

# 1. Map sketch files to clean names
doodle_mapping = {
    "taj_mahal_sketch_1783932301106.png": "taj_mahal.png",
    "qutub_minar_sketch_1783932315803.png": "qutub_minar.png",
    "red_fort_sketch_1783932326822.png": "red_fort.png",
    "sun_temple_sketch_1783932337552.png": "sun_temple.png",
    "charminar_sketch_1783932349794.png": "charminar.png",
    "golconda_fort_sketch_1783932359359.png": "golconda.png",
    "ellora_caves_sketch_1783932369042.png": "ellora_caves.png",
    "shore_temple_sketch_1783932382040.png": "mamallapuram.png",
    "doodles_placeholder_1783933351216.png": "placeholder.png"
}

print("--- Copying Doodle Images ---")
for src_name, dst_name in doodle_mapping.items():
    src_path = os.path.join(artifacts_dir, src_name)
    dst_path = os.path.join(doodles_dir, dst_name)
    
    if os.path.exists(src_path):
        try:
            shutil.copy2(src_path, dst_path)
            print(f"Copied: {src_name} -> doodles/{dst_name}")
        except Exception as e:
            print(f"Error copying {src_name}: {e}")
    else:
        print(f"Warning: Source file {src_name} not found in artifacts!")

# 2. Extract statistics JSON and save without base64
print("\n--- Processing JSON Dataset ---")
src_json = os.path.join(scratch_dir, "tourism_summary_data_compressed.json")
dst_json = os.path.join(project_dir, "tourism_summary_data.json")

if os.path.exists(src_json):
    try:
        with open(src_json, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Remove base64 strings from doodles data
        if "doodles" in data:
            for mon_name, mon_data in data["doodles"].items():
                if "image_base64" in mon_data:
                    del mon_data["image_base64"]
                    
        # Write clean data back
        with open(dst_json, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(',', ':'))
            
        print(f"SUCCESS: Wrote clean JSON to {dst_json} ({os.path.getsize(dst_json)/1024:.1f} KB)")
    except Exception as e:
        print(f"Error processing JSON: {e}")
else:
    print(f"Error: Source JSON {src_json} not found!")

print("\n--- Setup Complete ---")
