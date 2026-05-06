import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;;

export const isUserAdmin = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.usuario.rol === "admin";
  } catch (error) {
    return false;
  }
};

export const grantAdminRights = async (email, token) => {
  try {
    const res = await axios.put(
      `${API_URL}/rol`,
      { email, rol: "admin" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, message: res.data.mensaje };
  } catch (error) {
    return { success: false, message: error.response?.data?.mensaje || "Error en el servidor" };
  }
};

export const getUsers = async (token) => {
  try {
    const res = await axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: res.data.usuarios };
  } catch (error) {
    return { success: false, message: error.response?.data?.mensaje || "Error en el servidor" };
  }
};

export default {
  isUserAdmin,
  grantAdminRights,
  getUsers
};