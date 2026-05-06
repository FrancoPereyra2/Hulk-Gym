import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = API;

const AuthContext = createContext(null);

const rutasPublicas = [
  "/api/auth/verificar-primer-usuario",
  "/api/auth/primer-admin",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/cambiar-password",
  "/api/auth/verificar-token-password",
  "/api/google/auth"
];

const esRutaPublica = (url) => {
  return rutasPublicas.some(ruta => url.includes(ruta));
};

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!esRutaPublica(config.url)) {
      console.warn("⚠️ No hay token para ruta protegida:", config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !esRutaPublica(error.config?.url)) {
      console.error("🚨 401 Unauthorized - Limpiando sesión");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem("usuario");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const setAuthFromResponse = (data) => {
    const usuarioData = data.usuario;
    const token = data.token || data.accessToken;

    setUsuario(usuarioData);
    setAccessToken(token);

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
    localStorage.setItem("userType", usuarioData.rol);
    localStorage.setItem("userName", usuarioData.nombre);
    localStorage.setItem("userEmail", usuarioData.email);

  };

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    setAuthFromResponse(res.data);
    return res.data.usuario;
  };

  const loginWithGoogle = async (idToken) => {
    const res = await axios.post("/api/google/auth", { idToken });
    setAuthFromResponse(res.data);
    return res.data.usuario;
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await axios.post("/api/auth/logout");
      }
    } catch (error) {
    } finally {
      setUsuario(null);
      setAccessToken(null);
      localStorage.clear();
    }
  };

  const refresh = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const res = await axios.post("/api/auth/refresh", { token: refreshToken });
    const newToken = res.data.accessToken;
    setAccessToken(newToken);
    localStorage.setItem("token", newToken);
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      accessToken, 
      login, 
      loginWithGoogle, 
      logout, 
      refresh 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};