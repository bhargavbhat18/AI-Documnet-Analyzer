import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// In production (Vercel), VITE_API_BASE_URL should point to the Render backend.
// If it is not set on Vercel, we fallback to the deployed Render backend URL.
// In local dev, we default to empty string so it hits the local Vite proxy.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://ai-documnet-analyzer.onrender.com');

// Set a reasonable timeout so we don't wait forever if the backend is unreachable
axios.defaults.timeout = 60000; // 60 seconds (accounts for Render cold-start)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
