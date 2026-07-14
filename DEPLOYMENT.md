# Deployment Guide: India Tourism Dashboard

This guide walks you through uploading your project to **GitHub** and deploying the static frontend to **GitHub Pages**.

---

## Part 1: Push to GitHub

1. **Open PowerShell / Terminal** and navigate to the project directory:
   ```powershell
   cd "C:\git\tourism"
   ```

2. **Initialize Git** (already completed):
   ```bash
   git init
   ```

3. **Stage and Commit** the files:
   ```bash
   git add .
   git commit -m "Initial commit: Tourism Field Notes Dashboard"
   ```

4. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new).
   - Enter a name (e.g., `india-tourism-dashboard`).
   - Leave "Initialize this repository with" unchecked.
   - Click **Create repository**.

5. **Link and Push** your code to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```
   *(Be sure to replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.)*

---

## Part 2: Deploy Frontend on GitHub Pages

Once your code is pushed to GitHub, you can host the interactive dashboard frontend for free using GitHub Pages:

1. On GitHub, go to your repository's **Settings** tab.
2. In the left sidebar, click on **Pages** (under the "Code and automation" section).
3. Under **Build and deployment**:
   - Set **Source** to `Deploy from a branch`.
   - Set **Branch** to `main` and the folder to `/ (root)`.
4. Click **Save**.
5. Wait 1–2 minutes. Refresh the page to see your live URL (e.g., `https://YOUR_USERNAME.github.io/india-tourism-dashboard/`).

---

## Part 3: Deploying the ML Backend (Optional)

The frontend is a static site (HTML, CSS, JS) and will host perfectly on GitHub Pages. The **Overview**, **Seasonality**, **Monuments**, **Circles**, and **Guide** sections will work fully out-of-the-box because they use the static JSON database.

However, the **Visitor Predictor** and **Research Notebook** tabs require the Python Flask ML backend (`model_api.py`) to serve forecasts and Jupyter data.

### Option A: Run Backend Locally (Hybrid Deployment)
Keep the Flask backend running locally. Anyone viewing your GitHub Pages link on your computer (or if you configure CORS) can connect if the API endpoint points to a local address, but it won't work for public users unless the API is hosted online.

### Option B: Deploy Backend Online (Fully Public)
To make the predictions and notebook public, you can deploy `model_api.py` for free on hosting platforms like **Render**, **Railway**, or **Koyeb**:

1. Create a `requirements.txt` file (already created) in your project folder with the following dependencies:
   ```text
   flask
   flask-cors
   pandas
   numpy
   scikit-learn
   gunicorn
   ```
2. Create a free account on **Render** (render.com) or **Railway** (railway.app).
3. Connect your GitHub repository.
4. Set the build command:
   ```bash
   pip install -r requirements.txt
   ```
5. Set the start command:
   ```bash
   gunicorn model_api:app
   ```
6. Update the API URL in `app.js` and `notebook.html` from `http://localhost:5050` to your newly deployed Render API URL, commit, and push!
