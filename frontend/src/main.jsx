import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// In production (Vercel), VITE_API_BASE_URL points to the Render backend.
// In local dev, VITE_API_BASE_URL is set to http://localhost:8081 via .env.local.
// DO NOT fall back to the Render URL — that would bypass the Vite proxy locally
// and hit Render cold-start timeouts, causing "Network error" on every first request.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

// Set a reasonable timeout so we don't wait forever if the backend is unreachable
axios.defaults.timeout = 60000; // 60 seconds (accounts for Render cold-start)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
