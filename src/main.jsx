import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import { AreaSlugRoute } from './components/AreaSlugRoute'
import { LoginPage } from './pages/LoginPage'
import { RestaurantAdminPage } from './pages/RestaurantAdminPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RestaurantAdminPage />} />
          <Route path="/:areaId/:filter1/:filter2?" element={<AreaSlugRoute />} />
          <Route path="/:areaId" element={<App />} />
          <Route path="/" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
