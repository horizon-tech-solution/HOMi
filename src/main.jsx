import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import App from './App.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import { AgentAuthProvider } from './context/AgentAuthContext'  

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <UserAuthProvider>
        <AgentAuthProvider>   {/* ← wrap here */}
          <App />
        </AgentAuthProvider>
      </UserAuthProvider>
    </AdminAuthProvider>
  </StrictMode>,
)