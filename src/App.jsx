import { useState } from 'react'
import Login from './components/pages/login.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PagePrincipal from './components/pages/pagePrincipal.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/principal" element={<PagePrincipal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
