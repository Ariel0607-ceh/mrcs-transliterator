import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        style: {
          background: '#0f1f3a',
          color: '#f4e4bc',
          border: '1px solid #d4af37',
        },
      }}
    />
  </StrictMode>,
)
