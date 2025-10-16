import { useState } from 'react'
import Login from './components/pages/login.jsx'
import Registro from './components/pages/registro.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PagePrincipal from './components/pages/pagePrincipal.jsx'
import Administrador from './components/pages/admin.jsx'
import Rutinas from './components/pages/rutinas.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/principal" element={<PagePrincipal />} />
        <Route path="/admin" element={<Administrador />} />
        <Route path="/rutinas" element={<Rutinas />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
