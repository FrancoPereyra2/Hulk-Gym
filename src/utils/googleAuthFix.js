export const cleanupGoogleDevMessages = () => {
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      if (alert.textContent && alert.textContent.includes('desarrollo') && alert.textContent.includes('Google')) {
        alert.remove();
      }
    });

    const googleButtons = document.querySelectorAll('button[data-testid="google-sign-in-button"]');
    googleButtons.forEach(button => {
      if (button.disabled && button.textContent.includes('CONECTANDO')) {
        const loadingStartTime = sessionStorage.getItem('googleLoadingStartTime');
        const currentTime = Date.now();

        if (!loadingStartTime || (currentTime - parseInt(loadingStartTime)) > 15000) {
          button.disabled = false;

          const googleIcon = button.querySelector('svg');
          button.innerHTML = '';
          if (googleIcon) {
            button.appendChild(googleIcon);
            button.innerHTML += ' <span class="me-2"></span>REGISTRARSE CON GOOGLE';
          } else {
            button.textContent = 'REGISTRARSE CON GOOGLE';
          }

          sessionStorage.removeItem('googleAuthInProgress');
          sessionStorage.removeItem('googleLoadingStartTime');
        }
      }
    });
  }, 1000);
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    cleanupGoogleDevMessages();
    setInterval(cleanupGoogleDevMessages, 5000);
  });
}

export default cleanupGoogleDevMessages;