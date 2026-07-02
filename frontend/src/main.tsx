import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import App from './App.tsx'

// Intercept global fetch to automatically include credentials (cookies) for cross-origin API calls
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const url = typeof input === 'string' 
    ? input 
    : input instanceof URL 
      ? input.toString() 
      : (input as Request).url;
      
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  if (url.startsWith(apiUrl) || url.startsWith('/') || url.includes('localhost:3000')) {
    init = init || {};
    init.credentials = 'include';
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

