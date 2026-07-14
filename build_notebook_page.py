import json
import os
import re

notebook_path = "India_Tourism_Trends_Analysis_CORRECTED.ipynb"
output_path = r"C:\Users\nawee\.gemini\antigravity\brain\fa09e6ab-07f1-487c-9b0e-7bf3a2a2d886\scratch\notebook.html"

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

def parse_inline_markdown(text):
    # Bold
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Italic
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    # Inline code
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    text = text.replace('"', '&quot;')
    return text

def compile_notebook():
    if not os.path.exists(notebook_path):
        print(f"Error: {notebook_path} not found.")
        return
        
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
            
    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>India Tourism Field Notes - Notebook</title>
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
</head>
<body>

    <div class="notebook" id="notebook-main">
        <div class="notebook-spine"></div>
        <div class="notebook-rings">
            <div class="ring"></div><div class="ring"></div><div class="ring"></div>
            <div class="ring"></div><div class="ring"></div><div class="ring"></div>
            <div class="ring"></div><div class="ring"></div><div class="ring"></div>
            <div class="ring"></div><div class="ring"></div><div class="ring"></div>
        </div>

        <div class="notebook-tabs">
            <a href="index.html"       class="tab-link tab-home"      id="link-home">      <i class="fa-solid fa-book-open"></i> Overview</a>
            <a href="seasonality.html" class="tab-link tab-season"    id="link-season">    <i class="fa-solid fa-calendar-days"></i> Seasonality</a>
            <a href="monuments.html"   class="tab-link tab-monuments" id="link-monuments"> <i class="fa-solid fa-landmark"></i> Monuments</a>
            <a href="circles.html"     class="tab-link tab-circles"   id="link-circles">   <i class="fa-solid fa-circle-nodes"></i> Circles</a>
            <a href="predict.html"     class="tab-link tab-predict"   id="link-predict">   <i class="fa-solid fa-wand-magic-sparkles"></i> Predict</a>
            <a href="notebook.html"    class="tab-link tab-notebook active" id="link-notebook"><i class="fa-solid fa-code"></i> Notebook</a>
            <a href="guide.html"       class="tab-link tab-guide"     id="link-guide">     <i class="fa-solid fa-compass"></i> Guide</a>
        </div>

        <main class="paper-content" style="max-height: 850px; overflow: hidden;">
            <header class="header-actions" style="margin-bottom: 20px;">
                <div>
                    <h1 class="journal-title">📓 Research Notebook</h1>
                    <div class="journal-subtitle">India Tourism Trends Analysis (Jupyter Pipeline)</div>
                </div>
                <div class="handwritten-note" style="font-family: var(--font-hand); font-size: 1.1rem;">
                    📝 Local Pipeline Compiled
                </div>
            </header>

            <div class="notebook-scroll-container">
                {cells_content}
            </div>
        </main>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
"""
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_template.format(cells_content="\n".join(cells_html)))
        
    print(f"Successfully generated {output_path}!")

if __name__ == "__main__":
    compile_notebook()
