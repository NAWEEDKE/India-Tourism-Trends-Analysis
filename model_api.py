"""
India Tourism - ML Model API
Flask server that trains a Random Forest model on the historical tourism CSV
and exposes a /predict endpoint for the frontend dashboard.

Run with: python model_api.py
Then open the dashboard at: file:///c:/Users/nawee/OneDrive/Documents/LPU/projects/tourism/index.html
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import os, json, re

app = Flask(__name__)
CORS(app)  # Allow requests from the local HTML file

# ── Global model state ──────────────────────────────────────────────────────
model = None
monument_encoder = None
circle_encoder = None
monument_list = []
circle_list   = []

# ── Data paths ───────────────────────────────────────────────────────────────
CSV_PATH = os.path.join(os.path.dirname(__file__), 'India_Tourism_10Year_Monthly_Trends.csv')
MONTHS = ['January','February','March','April','May','June',
          'July','August','September','October','November','December']

def train_model():
    """Load the CSV, encode categoricals, and train the Random Forest."""
    global model, monument_encoder, circle_encoder, monument_list, circle_list

    print("[*] Loading dataset...")
    df = pd.read_csv(CSV_PATH)
    print(f"    Loaded {len(df)} rows.")

    # Basic cleaning
    df = df.dropna(subset=['Domestic_Visitors'])
    df['Domestic_Visitors'] = pd.to_numeric(df['Domestic_Visitors'], errors='coerce')
    df = df.dropna(subset=['Domestic_Visitors'])

    # Month to number
    if df['Month'].dtype == object:
        df['Month_Num'] = df['Month'].apply(
            lambda m: MONTHS.index(m) + 1 if m in MONTHS else int(m)
        )
    else:
        df['Month_Num'] = df['Month']

    # Encode categorical columns
    monument_encoder = LabelEncoder()
    circle_encoder   = LabelEncoder()

    df['Monument_ID'] = monument_encoder.fit_transform(df['Monument'])
    df['Circle_ID']   = circle_encoder.fit_transform(df['Circle'])

    monument_list = sorted(df['Monument'].unique().tolist())
    circle_list   = sorted(df['Circle'].unique().tolist())

    # Features and target
    X = df[['Year', 'Month_Num', 'Circle_ID', 'Monument_ID']]
    y = df['Domestic_Visitors']

    print("[*] Training Random Forest (this takes ~10s)...")
    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1,
        max_depth=20
    )
    model.fit(X, y)

    # Quick accuracy check on training data
    r2 = model.score(X, y)
    print(f"[OK] Model trained! R2 = {r2:.4f}")
    print(f"    Monuments: {len(monument_list)} | Circles: {len(circle_list)}")


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/status', methods=['GET'])
def status():
    """Health check endpoint."""
    return jsonify({
        'status': 'online',
        'model_loaded': model is not None,
        'monuments': len(monument_list),
        'circles': len(circle_list)
    })

@app.route('/metadata', methods=['GET'])
def metadata():
    """Return available monuments and circles for dropdown population."""
    return jsonify({
        'monuments': monument_list,
        'circles': circle_list,
        'months': MONTHS
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict domestic visitor count.
    
    Request body (JSON):
      {
        "monument": "Taj Mahal",
        "circle":   "Agra",          (optional, auto-filled from monument)
        "year":     2025,
        "month":    3
      }
    """
    if model is None:
        return jsonify({'error': 'Model not yet trained'}), 503

    body = request.get_json(force=True)
    monument_name = body.get('monument', '')
    circle_name   = body.get('circle', '')
    year          = int(body.get('year', 2024))
    month         = int(body.get('month', 1))

    # Validate monument
    if monument_name not in monument_encoder.classes_:
        return jsonify({'error': f'Monument "{monument_name}" not in training data. '
                                  f'Try one of: {monument_list[:5]}'}), 400

    # Auto-detect circle from monument if not given
    if not circle_name or circle_name not in circle_encoder.classes_:
        # Read CSV to find circle
        df_tmp = pd.read_csv(CSV_PATH)
        match = df_tmp[df_tmp['Monument'] == monument_name]
        if len(match) > 0:
            circle_name = match['Circle'].iloc[0]
        else:
            circle_name = circle_list[0]

    monument_id = monument_encoder.transform([monument_name])[0]
    circle_id   = circle_encoder.transform([circle_name])[0]

    X_pred = np.array([[year, month, circle_id, monument_id]])
    prediction = model.predict(X_pred)[0]

    # Feature importance
    fi = model.feature_importances_
    feature_names = ['Year', 'Month', 'Circle', 'Monument']

    return jsonify({
        'monument':          monument_name,
        'circle':            circle_name,
        'year':              year,
        'month':             MONTHS[month - 1],
        'predicted_domestic': int(prediction),
        'feature_importance': {
            name: round(float(imp), 4)
            for name, imp in zip(feature_names, fi)
        }
    })

@app.route('/trend', methods=['POST'])
def trend():
    """
    Predict visitor trend for a monument across all 12 months of a given year.
    
    Request body: { "monument": "Taj Mahal", "year": 2025 }
    """
    if model is None:
        return jsonify({'error': 'Model not yet trained'}), 503

    body = request.get_json(force=True)
    monument_name = body.get('monument', '')
    year = int(body.get('year', 2024))

    if monument_name not in monument_encoder.classes_:
        return jsonify({'error': f'Monument not found'}), 400

    df_tmp = pd.read_csv(CSV_PATH)
    match = df_tmp[df_tmp['Monument'] == monument_name]
    circle_name = match['Circle'].iloc[0] if len(match) > 0 else circle_list[0]

    monument_id = monument_encoder.transform([monument_name])[0]
    circle_id   = circle_encoder.transform([circle_name])[0]

    monthly_predictions = []
    for m in range(1, 13):
        X_pred = np.array([[year, m, circle_id, monument_id]])
        pred = model.predict(X_pred)[0]
        monthly_predictions.append(int(pred))

    return jsonify({
        'monument': monument_name,
        'year':     year,
        'months':   MONTHS,
        'predicted_domestic': monthly_predictions
    })

# ── Dynamic Asset Serving ───────────────────────────────────────────────────

def parse_inline_markdown(text):
    # Bold
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Italic
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    # Inline code
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    text = text.replace('"', '&quot;')
    return text

def markdown_to_html(md_text):
    lines = md_text.split('\n')
    html_lines = []
    in_list = False
    in_code = False
    
    for line in lines:
        stripped = line.strip()
        
        # Code blocks
        if stripped.startswith("```"):
            in_code = not in_code
            if in_code:
                html_lines.append("<pre><code>")
            else:
                html_lines.append("</code></pre>")
            continue
            
        if in_code:
            html_lines.append(line)
            continue
            
        # Headings
        if stripped.startswith("#"):
            match = re.match(r'^(#+)\s*(.*)', stripped)
            if match:
                level = len(match.group(1))
                content = match.group(2)
                content = parse_inline_markdown(content)
                html_lines.append(f"<h{level}>{content}</h{level}>")
                continue
                
        # Bullet list items
        if stripped.startswith("- ") or stripped.startswith("* ") or stripped.startswith("1. "):
            if not in_list:
                in_list = True
                html_lines.append("<ul>")
            content = stripped[2:] if stripped.startswith("- ") or stripped.startswith("* ") else stripped[3:]
            content = parse_inline_markdown(content)
            html_lines.append(f"<li>{content}</li>")
            continue
        else:
            if in_list:
                in_list = False
                html_lines.append("</ul>")
                
        # Empty lines
        if not stripped:
            html_lines.append("<br/>")
            continue
            
        # Normal paragraph
        content = parse_inline_markdown(stripped)
        html_lines.append(f"<p>{content}</p>")
        
    if in_list:
        html_lines.append("</ul>")
        
    return "\n".join(html_lines)

@app.route('/api/notebook', methods=['GET'])
def get_notebook_cells():
    """Parses the Jupyter notebook on-demand and returns cells as HTML."""
    notebook_path = os.path.join(os.path.dirname(__file__), "India_Tourism_Trends_Analysis_CORRECTED.ipynb")
    if not os.path.exists(notebook_path):
        return jsonify({"error": f"Notebook file not found at {notebook_path}"}), 404
        
    try:
        with open(notebook_path, "r", encoding="utf-8") as f:
            nb = json.load(f)
            
        cells_html = []
        for idx, cell in enumerate(nb.get("cells", [])):
            cell_type = cell.get("cell_type", "")
            source = "".join(cell.get("source", []))
            
            if cell_type == "markdown":
                parsed_md = markdown_to_html(source)
                cells_html.append(f'<div class="notebook-cell markdown-cell">{parsed_md}</div>')
                
            elif cell_type == "code":
                exec_count = cell.get("execution_count") or ""
                escaped_source = source.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                
                cell_html = []
                cell_html.append(f'<div class="notebook-cell code-cell">')
                cell_html.append(f'  <div class="cell-input">')
                cell_html.append(f'    <span class="cell-input-label">In [{exec_count}]:</span>')
                cell_html.append(f'    <pre><code class="language-python">{escaped_source}</code></pre>')
                cell_html.append(f'  </div>')
                
                outputs = cell.get("outputs", [])
                for out in outputs:
                    out_type = out.get("output_type", "")
                    
                    if out_type == "stream":
                        text = "".join(out.get("text", []))
                        escaped_text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                        cell_html.append(f'  <div class="cell-output">')
                        cell_html.append(f'    <pre class="output-stdout">{escaped_text}</pre>')
                        cell_html.append(f'  </div>')
                        
                    elif out_type in ["display_data", "execute_result"]:
                        data = out.get("data", {})
                        
                        if "image/png" in data:
                            img_b64 = data["image/png"].strip().replace("\n", "")
                            cell_html.append(f'  <div class="cell-output">')
                            cell_html.append(f'    <div class="taped-plot">')
                            cell_html.append(f'      <div class="tape"></div>')
                            cell_html.append(f'      <img src="data:image/png;base64,{img_b64}" alt="Notebook Plot" />')
                            cell_html.append(f'    </div>')
                            cell_html.append(f'  </div>')
                            
                        elif "text/html" in data:
                            html_table = "".join(data["text/html"])
                            cell_html.append(f'  <div class="cell-output">')
                            cell_html.append(f'    <div class="output-table">{html_table}</div>')
                            cell_html.append(f'  </div>')
                            
                        elif "text/plain" in data:
                            text = "".join(data["text/plain"])
                            escaped_text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                            cell_html.append(f'  <div class="cell-output">')
                            cell_html.append(f'    <pre class="output-stdout">{escaped_text}</pre>')
                            cell_html.append(f'  </div>')
                            
                cell_html.append(f'</div>')
                cells_html.append("\n".join(cell_html))
                
        return jsonify({"cells_html": "\n".join(cells_html)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/doodles/<path:filename>', methods=['GET'])
def serve_doodle(filename):
    """Serves monument doodle PNGs directly from the local scratch directory."""
    doodles_dir = r"C:\Users\nawee\.gemini\antigravity\brain\fa09e6ab-07f1-487c-9b0e-7bf3a2a2d886\scratch\temp_doodles"
    return send_from_directory(doodles_dir, filename)

# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    train_model()
    print("\n[*] Starting API server at http://localhost:5050")
    print("    Open: http://localhost:8765/predict.html")
    app.run(host='0.0.0.0', port=5050, debug=False)
