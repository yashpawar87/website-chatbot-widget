# Cloud Deployment Guide (The "Split" Architecture)

This guide provides step-by-step instructions to deploy your RAG Chatbot to the cloud without using Docker. This "split" architecture is highly scalable and cost-effective.

## Overview
- **Database**: Qdrant Cloud (Free)
- **Backend**: Render (FastAPI Python App) (~$7/mo for 1GB+ RAM)
- **Frontend**: Vercel (Next.js App) (Free)

---

## 1. Setup Qdrant Cloud (Database)
Qdrant will store your website's data as vector embeddings.

1. Go to [Qdrant Cloud](https://cloud.qdrant.io/) and create a free account.
2. Click **Create Cluster** and choose the **Free Tier** (1GB of storage is more than enough).
3. Once the cluster is running, click on it to view the dashboard.
4. **Get your Credentials**:
   - Locate the **Cluster URL** 
   - Generate a **Data Access API Key** and copy it.
5. Save both of these; you will need them for the Backend setup.

---

## 2. Setup Render (Python Backend)
Render will host your FastAPI application and handle the AI generation and embedding processing.

1. Create a GitHub repository and push this entire project to it.
2. Go to [Render](https://render.com/) and create an account.
3. Click **New +** -> **Web Service** -> **Build and deploy from a Git repository**.
4. Connect your GitHub account and select your chatbot repository.
5. **Configuration**:
   - **Name**: `website-chatbot-backend`
   - **Root Directory**: `.` (Leave blank or set to root)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.api.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Select **Starter ($7/mo)**. *(Do not use the Free tier. The Free tier only has 512MB of RAM, which will crash with an "Out of Memory" error when HuggingFace tries to load the embedding model).*
6. **Environment Variables** (Add these under the advanced settings):
   - `GROQ_API_KEY` = *[Your Groq API Key]*
   - `WORDPRESS_URL` = `https://baellchen.com`
   - `QDRANT_URL` = *[Your Qdrant Cluster URL from Step 1]*
   - `QDRANT_API_KEY` = *[Your Qdrant API Key from Step 1]*
   - `FRONTEND_URL` = *[We will update this after setting up Vercel]*
7. Click **Create Web Service**. Wait for the deployment to finish.
8. Copy the Render URL (e.g., `https://website-chatbot-backend.onrender.com`).

---

## 3. Run Data Ingestion (One-Time)
Before your chatbot can answer questions, you need to scrape your website and send the data to Qdrant. Since your backend is connected to Qdrant Cloud, you can actually run this script locally on your Mac!

1. Open your terminal on your Mac.
2. Add your Qdrant keys to your local `.env` file:
   ```env
   QDRANT_URL=your-qdrant-cluster-url
   QDRANT_API_KEY=your-qdrant-api-key
   WORDPRESS_URL=https://baellchen.com
   ```
3. Run the ingestion script:
   ```bash
   source .venv/bin/activate
   python -m ai.ingestion.ingest
   ```
4. Check your Qdrant Cloud dashboard to confirm the vectors were successfully uploaded.

---

## 4. Setup Vercel (Next.js Frontend)
Vercel will host the Chat UI and serve the `widget.js` script to your main website.

1. Go to [Vercel](https://vercel.com/) and create a free account.
2. Click **Add New...** -> **Project**.
3. Connect your GitHub and select the exact same chatbot repository.
4. **Configuration**:
   - **Project Name**: `website-chatbot-frontend`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select the `frontend` folder.
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = *[Your Render Backend URL from Step 2]*
6. Click **Deploy**.
7. Once finished, Vercel will give you a domain (e.g., `https://website-chatbot-frontend.vercel.app`).
8. **Final Backend Step**: Go back to your Render dashboard, edit your Environment Variables, and set `FRONTEND_URL` to your new Vercel domain to allow CORS.

---

## 5. Embed the Widget on Your Main Website
Now that both the frontend and backend are live, you can embed the widget on your live WordPress site.

Copy this HTML and place it right before the closing `</body>` tag on your website:

```html
<script src="https://website-chatbot-frontend.vercel.app/widget.js"></script>
```
*(Make sure to replace the URL with your actual Vercel domain).*
