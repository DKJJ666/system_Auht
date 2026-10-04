import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login.jsx'
import Cadastro from './pages/Cadastro/Cadastro.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RotasProtegidas from './components/RotaProtegida.jsx'


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RotasProtegidas><Dashboard /></RotasProtegidas>} />
      </Routes>
    </>
  )
}

export default App

