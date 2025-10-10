import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importar páginas de ADMINISTRADOR
import Login from './pages/administrador/Login'
import Dashboard from './pages/administrador/Dashboard'
import CrearCargo from './pages/administrador/CrearCargo'
import CrearVotacion from './pages/administrador/CrearVotacion'
import CrearReporte from './pages/administrador/CrearReporte'
import Usuarios from './pages/administrador/Usuarios'
import ResultadosVotacion from './pages/administrador/ResultadosVotacion'
import Registro from './pages/administrador/Registro'
import Recuperar from './pages/administrador/Recuperar'
import GestionVotacion from './pages/administrador/GestionVotacion'

// Importar página de VOTACIÓN
import VotingPage from './pages/Votacion/votinpage.jsx'

import Layout from './components/Layout'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 🔹 Redirigir desde / al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* RUTA DE LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PÁGINAS DE AUTENTICACIÓN */}
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Recuperar" element={<Recuperar />} />

        {/* RUTA DE VOTACIÓN */}
        <Route path="/votacion" element={<VotingPage />} />

        {/* RUTAS DEL ADMIN */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="crear-votacion" element={<CrearVotacion />} />
          <Route path="crear-cargo" element={<CrearCargo />} />
          <Route path="resultados-votacion" element={<ResultadosVotacion />} />
          <Route path="crear-reporte" element={<CrearReporte />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="gestion-votacion" element={<GestionVotacion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
