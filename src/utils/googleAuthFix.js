/**
 * Utilidad simplificada para corregir problemas con la autenticación de Google
 * y gestionar el estado del botón cuando se cierra la pestaña
 */

// Función que limpia mensajes de desarrollo y verifica el estado del botón
export const cleanupGoogleDevMessages = () => {
  setTimeout(() => {
    // Buscar alertas con mensajes específicos de desarrollo
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      if (alert.textContent && alert.textContent.includes('desarrollo') && alert.textContent.includes('Google')) {
        alert.remove();
      }
    });
    
    // Verificar si hay botones de Google en estado de carga
    const googleButtons = document.querySelectorAll('button[data-testid="google-sign-in-button"]');
    googleButtons.forEach(button => {
      if (button.disabled && button.textContent.includes('CONECTANDO')) {
        // Verificar si debe restaurarse basado en el tiempo transcurrido
        const loadingStartTime = sessionStorage.getItem('googleLoadingStartTime');
        const currentTime = Date.now();
        
        if (!loadingStartTime || (currentTime - parseInt(loadingStartTime)) > 15000) {
          // Si han pasado más de 15 segundos o no hay registro de tiempo, habilitar el botón
          button.disabled = false;
          
          // Actualizar el texto del botón
          const googleIcon = button.querySelector('svg');
          button.innerHTML = '';
          if (googleIcon) {
            button.appendChild(googleIcon);
            button.innerHTML += ' <span class="me-2"></span>REGISTRARSE CON GOOGLE';
          } else {
            button.textContent = 'REGISTRARSE CON GOOGLE';
          }
          
          // Limpiar el estado guardado
          sessionStorage.removeItem('googleAuthInProgress');
          sessionStorage.removeItem('googleLoadingStartTime');
        }
      }
    });
  }, 1000);
};

// Solo ejecutar la limpieza cuando se carga la página
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Ejecutar la limpieza al cargar
    cleanupGoogleDevMessages();
    
    // También configurar un intervalo para verificar periódicamente
    setInterval(cleanupGoogleDevMessages, 5000);
  });
}

export default cleanupGoogleDevMessages;