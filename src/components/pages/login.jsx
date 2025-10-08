import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import LogoLoginImg from '../../assets/logo-login.png';
// Importaciones de Firebase
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

const googleProvider = new GoogleAuthProvider();

const HulkGymLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('danger');
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Base de datos simulada de usuarios
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    } else {
      return [
        { fullName: 'Administrador', username: 'HulkgymAdmin', password: 'HulkGym2024', role: 'admin' },
        { fullName: 'Cliente Demo', username: 'HulkgymCliente', password: 'HulkGym2024', role: 'cliente' }
      ];
    }
  });
  
  const navigate = useNavigate();

  // Efecto para limpiar cualquier mensaje de desarrollo que pueda existir
  useEffect(() => {
    const alertElements = document.querySelectorAll('.alert');
    alertElements.forEach(el => {
      if (el.textContent && el.textContent.includes('desarrollo')) {
        el.parentNode.removeChild(el);
      }
    });
  }, []);
  
  // Efecto para detectar cuando la página se carga o se descarga
  useEffect(() => {
    // Verificar si hay un estado guardado de autenticación en progreso
    const checkSavedState = () => {
      const savedGoogleAuthState = sessionStorage.getItem('googleAuthInProgress');
      if (savedGoogleAuthState) {
        // Si hay un estado guardado, eliminarlo y asegurarse que el botón esté habilitado
        sessionStorage.removeItem('googleAuthInProgress');
        setIsGoogleLoading(false);
      }
    };

    // Comprobar al cargar la página
    checkSavedState();
    
    // Evento para guardar estado cuando se abandona la página
    const handleBeforeUnload = () => {
      if (isGoogleLoading) {
        // Si la autenticación está en progreso, guardar ese estado
        sessionStorage.setItem('googleAuthInProgress', 'true');
      }
    };
    
    // Evento para manejar cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Si la página es visible de nuevo, resetear el estado de carga si es necesario
        if (isGoogleLoading) {
          const timeInLoading = Date.now() - (parseInt(sessionStorage.getItem('googleLoadingStartTime') || '0'));
          if (timeInLoading > 10000) { // Si han pasado más de 10 segundos
            setIsGoogleLoading(false);
          }
        }
      }
    };
    
    // Añadir event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Verificación periódica para evitar que el botón quede bloqueado
    const timer = setTimeout(() => {
      if (isGoogleLoading) {
        // Si han pasado 30 segundos y sigue cargando, probablemente hubo un problema
        setIsGoogleLoading(false);
      }
    }, 30000);
    
    // Limpiar event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timer);
    };
  }, [isGoogleLoading]);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Trim básico - quitar espacios
    const usuarioSinEspacios = username.trim();
    const passwordSinEspacios = password.trim();

    // Validación simple
    if (!usuarioSinEspacios || !passwordSinEspacios) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    // Credenciales fijas
    if (usuarioSinEspacios === 'HulkgymAdmin' && passwordSinEspacios === 'HulkGym2024') {
      // Es un administrador
      localStorage.setItem('userType', 'admin');
      setAlertVariant('success');
      setAlertMessage('¡Bienvenido Administrador!');
      setShowAlert(true);
      navigate('/admin');
    } 
    else if (usuarioSinEspacios === 'HulkgymCliente' && passwordSinEspacios === 'HulkGym2024') {
      // Es un cliente
      localStorage.setItem('userType', 'cliente');
      setAlertVariant('success');
      setAlertMessage('¡Bienvenido Cliente!');
      setShowAlert(true);
      navigate('/principal');
    }
    else {
      // Buscar en usuarios registrados
      const user = users.find(
        u => u.username === usuarioSinEspacios && u.password === passwordSinEspacios
      );

      if (user) {
        localStorage.setItem('userType', user.role);
        localStorage.setItem('userName', user.fullName);
        setAlertVariant('success');
        setAlertMessage(`¡Bienvenido ${user.fullName}!`);
        setShowAlert(true);
        setTimeout(() => {
          navigate(user.role === 'admin' ? '/admin' : '/principal');
        }, 1000);
      } else {
        // Credenciales incorrectas
        setAlertVariant('danger');
        setAlertMessage('Usuario o contraseña incorrectos');
        setShowAlert(true);
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // Validación
    if (!fullName.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertVariant('danger');
      setAlertMessage('Las contraseñas no coinciden');
      setShowAlert(true);
      return;
    }

    // Verificar si el usuario ya existe
    if (users.some(user => user.username === username.trim())) {
      setAlertVariant('danger');
      setAlertMessage('Este nombre de usuario ya está registrado');
      setShowAlert(true);
      return;
    }

    // Crear nuevo usuario
    const newUser = {
      fullName: fullName.trim(),
      username: username.trim(),
      password: password.trim(),
      role: 'cliente' // Por defecto los nuevos usuarios son clientes
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Guardar en localStorage para que persista
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setAlertVariant('success');
    setAlertMessage('¡Registro exitoso! Ahora puedes iniciar sesión');
    setShowAlert(true);

    // Limpiar formulario y volver a login
    setFullName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setMostrarRegistro(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      // Guardar el tiempo de inicio del proceso de carga
      sessionStorage.setItem('googleLoadingStartTime', Date.now().toString());
      
      setAlertVariant('info');
      setAlertMessage('Conectando con Google...');
      setShowAlert(true);
      
      // Agregar configuración adicional al proveedor de Google
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Usuario autenticado con Google:", user);
      
      // Verificar si el usuario ya existe en nuestra base de datos local
      if (!users.some(u => u.username === user.email)) {
        // Crear nuevo usuario con los datos de Google
        const newUser = {
          fullName: user.displayName || "Usuario de Google",
          username: user.email,
          password: `google_${user.uid}`, // Contraseña ficticia que no usaremos
          role: 'cliente',
          googleAuth: true, // Marcamos que se autenticó con Google
          uid: user.uid
        };
        
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        setAlertVariant('success');
        setAlertMessage('¡Registro con Google exitoso! Serás redirigido automáticamente.');
      } else {
        setAlertVariant('info');
        setAlertMessage('Ya existe una cuenta con este email. Iniciando sesión...');
      }
      
      // Guardar datos del usuario en localStorage
      localStorage.setItem('userType', 'cliente');
      localStorage.setItem('userName', user.displayName || "Usuario de Google");
      
      // Redirigir después de una breve pausa
      setTimeout(() => {
        navigate('/principal');
      }, 2000);
      
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
      
      // Manejar errores específicos para dar mejores mensajes
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'El proceso de inicio de sesión fue cancelado';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Múltiples intentos de inicio de sesión';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta de nuevo.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setAlertVariant('danger');
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsGoogleLoading(false);
      sessionStorage.removeItem('googleAuthInProgress');
      sessionStorage.removeItem('googleLoadingStartTime');
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center vh-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <img src={LogoLoginImg} alt="Logo" className="img-fluid w-50" />
                <p className="text-muted h5">
                  {mostrarRegistro ? 'Crea tu cuenta para continuar' : 'Inicia sesión para continuar'}
                </p>
              </div>
              
              {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                  {alertMessage}
                </Alert>
              )}
              
              {mostrarRegistro ? (
                // Formulario de registro
                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre Completo</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa tu nombre completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Elige un nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Crea una contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <InputGroup.Text 
                        as="button"
                        onClick={togglePasswordVisibility}
                        className="bg-white"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Confirmar Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <InputGroup.Text 
                        as="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="bg-white"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                  
                  <Button variant="success" type="submit" className="w-100 mb-3">
                    REGISTRARSE
                  </Button>
                  
                  <Button 
                    variant="outline-dark" 
                    type="button" 
                    className="w-100 mb-3 d-flex align-items-center justify-content-center"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    data-testid="google-sign-in-button"
                  >
                    <FaGoogle className="me-2" /> 
                    {isGoogleLoading ? "CONECTANDO..." : "REGISTRARSE CON GOOGLE"}
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => setMostrarRegistro(false)}
                      className="text-decoration-none"
                    >
                      ¿Ya tienes una cuenta? Inicia sesión aquí
                    </Button>
                  </div>
                </Form>
              ) : (
                // Formulario de inicio de sesión
                <>
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingresa tu usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Contraseña</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputGroup.Text 
                          as="button"
                          onClick={togglePasswordVisibility}
                          className="bg-white"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                    
                    <Button variant="success" type="submit" className="w-100 py-2 mb-3">
                      INICIAR SESIÓN
                    </Button>
                  </Form>
                  
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => setMostrarRegistro(true)}
                      className="text-decoration-none"
                    >
                      ¿No tienes una cuenta? Regístrate aquí
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HulkGymLogin;