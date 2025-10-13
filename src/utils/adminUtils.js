/**
 * Utilidades para la administración de usuarios y autenticación
 */

// Verificar si un usuario es administrador
export const isUserAdmin = (email) => {
  const savedUsers = localStorage.getItem('users');
  if (!savedUsers) return false;
  
  const users = JSON.parse(savedUsers);
  return users.some(user => user.username === email && user.role === 'admin');
};

// Conceder permisos de administrador a un usuario
export const grantAdminRights = (email, currentAdminEmail) => {
  // Verificar que quien lo solicita sea un administrador
  if (!isUserAdmin(currentAdminEmail)) {
    return {success: false, message: 'No tienes permisos para realizar esta operación'};
  }
  
  const savedUsers = localStorage.getItem('users');
  if (!savedUsers) {
    return {success: false, message: 'No hay usuarios registrados'};
  }
  
  const users = JSON.parse(savedUsers);
  const userIndex = users.findIndex(user => user.username === email);
  
  if (userIndex === -1) {
    return {success: false, message: 'Usuario no encontrado'};
  }
  
  // Actualizar rol del usuario
  users[userIndex].role = 'admin';
  localStorage.setItem('users', JSON.stringify(users));
  
  return {success: true, message: 'Permisos de administrador concedidos correctamente'};
};

// Obtener lista de usuarios (solo para admins)
export const getUsers = (adminEmail) => {
  if (!isUserAdmin(adminEmail)) {
    return {success: false, message: 'No tienes permisos para realizar esta operación'};
  }
  
  const savedUsers = localStorage.getItem('users');
  if (!savedUsers) {
    return {success: true, data: []};
  }
  
  const users = JSON.parse(savedUsers);
  
  // Devolver lista pero sin mostrar contraseñas
  const safeUserList = users.map(({password, ...rest}) => rest);
  
  return {success: true, data: safeUserList};
};

export default {
  isUserAdmin,
  grantAdminRights,
  getUsers
};
