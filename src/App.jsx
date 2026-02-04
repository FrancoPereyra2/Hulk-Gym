import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

import Login from './components/pages/login.jsx';
import Registro from './components/pages/registro.jsx';
import PagePrincipal from './components/pages/pagePrincipal.jsx';
import Administrador from './components/pages/admin.jsx';
import Rutinas from './components/pages/rutinas.jsx';

// Componente para rutas protegidas
const RutaProtegida = ({ children, requiereAdmin = false }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiereAdmin && userType !== 'admin') {
    return <Navigate to="/principal" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/principal"
            element={
              <RutaProtegida>
                <PagePrincipal />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin"
            element={
              <RutaProtegida requiereAdmin>
                <Administrador />
              </RutaProtegida>
            }
          />
          <Route
            path="/rutinas"
            element={
              <RutaProtegida>
                <Rutinas />
              </RutaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
