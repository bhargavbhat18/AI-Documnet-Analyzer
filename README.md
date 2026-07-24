# AI Document Analyzer

An AI-powered document analysis and chat platform that uses Spring Boot, React, ChromaDB, and Ollama (RAG).

## Deployment Guide

This project is prepared for deployment with the backend on **Render** and the frontend on **Vercel**.

---

### Backend Deployment (Render)

Render can build and run the Spring Boot backend using the provided multi-stage `Dockerfile`.

1. **Create a Web Service on Render**:
   - Connect your GitHub repository.
   - Set **Root Directory** to `backend`.
   - Set **Runtime** to `Docker`.
2. **Configure Environment Variables**:
   - Add the following variables under the **Environment** tab:
     - `PORT`: `8081` (or let Render set it dynamically)
     - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<your-mysql-host>:<port>/<db_name>` (from your production MySQL database)
     - `SPRING_DATASOURCE_USERNAME`: `<your-db-username>`
     - `SPRING_DATASOURCE_PASSWORD`: `<your-db-password>`
     - `SPRING_AI_OLLAMA_BASE_URL`: `<your-hosted-ollama-url>`
     - `SPRING_AI_VECTORSTORE_CHROMA_CLIENT_HOST`: `<your-hosted-chromadb-host>`
     - `SPRING_AI_VECTORSTORE_CHROMA_CLIENT_PORT`: `<your-hosted-chromadb-port>`
     - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app` (the domain of your Vercel frontend)

---

### Frontend Deployment (Vercel)

Vercel can build and deploy the React/Vite frontend.

1. **Create a Project on Vercel**:
   - Import your GitHub repository.
   - Set **Root Directory** to `frontend`.
   - Set **Framework Preset** to `Vite`.
   - Set **Build Command** to `npm run build`.
   - Set **Output Directory** to `dist`.
2. **Configure Environment Variables**:
   - Add the following variable under **Environment Variables**:
     - `VITE_API_BASE_URL`: `https://your-backend.onrender.com` (the URL of your Render Web Service)
