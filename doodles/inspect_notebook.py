import json

nb_path = "India_Tourism_Trends_Analysis_CORRECTED.ipynb"
with open(nb_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

print(f"Total cells: {len(nb['cells'])}")
for i, cell in enumerate(nb['cells']):
    cell_type = cell.get("cell_type", "")
    source_lines = cell.get("source", [])
    source_text = "".join(source_lines).strip()
    
    if cell_type == "markdown":
        # Print headings
        first_line = source_lines[0].strip() if source_lines else ""
        if first_line.startswith("#"):
            print(f"\n--- Cell {i} (Markdown Heading) ---")
            print(source_text[:120])
    elif cell_type == "code":
        # Check if cell imports something, defines functions, runs models, or plots
        snippet = source_text[:200].replace('\n', ' ')
        if any(keyword in source_text for keyword in ["import ", "plt.", "sns.", "model =", "predict", "train_test_split", "RandomForest"]):
            print(f"Cell {i} (Code snippet): {snippet[:100]}...")
