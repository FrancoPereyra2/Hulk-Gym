import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import LogoLoginImg from '../../assets/logo-login.png';
// Importaciones de Firebase
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

// Crear un nuevo proveedor para evitar conflictos con instancias anteriores
const googleProvider = new GoogleAuthProvider();

const Registro = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(''); // Cambiado de username a email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('danger');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleDevMessage, setShowGoogleDevMessage] = useState(false);
  
  // Cargar usuarios del localStorage al iniciar
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

  // Eliminar cualquier alerta estática de desarrollo en el DOM
  useEffect(() => {
    // Esta función busca y elimina cualquier elemento que contenga el texto "desarrollo"
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Nodo elemento
              if (node.textContent && node.textContent.includes('desarrollo')) {
                node.remove();
              }
              
              // Buscar dentro de elementos anidados
              const alertElements = node.querySelectorAll('*');
              alertElements.forEach(el => {
                if (el.textContent && el.textContent.includes('desarrollo')) {
                  el.remove();
                }
              });
            }
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();

    // Validación
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, introduce un correo electrónico válido');
      setShowAlert(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertVariant('danger');
      setAlertMessage('Las contraseñas no coinciden');
      setShowAlert(true);
      return;
    }

    // Verificar si el correo ya existe
    if (users.some(user => user.username === email.trim())) {
      setAlertVariant('danger');
      setAlertMessage('Este correo electrónico ya está registrado');
      setShowAlert(true);
      return;
    }

    // Crear nuevo usuario
    const newUser = {
      fullName: fullName.trim(),
      username: email.trim(), // Guardar email en campo username para mantener compatibilidad
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

    // Limpiar formulario y redirigir al login después de un tiempo
    setTimeout(() => {
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      navigate('/login');
    }, 2000);
  };

  // Referencia al botón de Google para tener acceso directo a él
  const googleButtonRef = useRef(null);
  
  // Función para eliminar cualquier alerta o mensaje de desarrollo
  useEffect(() => {
    // Buscar y eliminar cualquier alerta que contenga la palabra "desarrollo"
    const cleanup = () => {
      const alerts = document.querySelectorAll('.alert');
      alerts.forEach(alert => {
        if (alert.textContent && alert.textContent.toLowerCase().includes('desarrollo')) {
          if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
          }
        }
      });
    };
    
    // Ejecutar limpieza inmediatamente y después de cualquier cambio en el DOM
    cleanup();
    
    // Configurar observador de DOM para eliminar alertas añadidas dinámicamente
    const observer = new MutationObserver(mutations => {
      mutations.forEach(() => {
        cleanup();
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Reemplazar cualquier handler existente en el botón de Google al renderizar
  useEffect(() => {
    if (googleButtonRef.current) {
      // Limpiar todos los eventos antiguos
      const oldButton = googleButtonRef.current;
      const newButton = oldButton.cloneNode(true);
      
      // Reemplazar el botón con uno nuevo y asignar el nuevo handler
      if (oldButton.parentNode) {
        oldButton.parentNode.replaceChild(newButton, oldButton);
        googleButtonRef.current = newButton;
        
        // Asignar el nuevo manejador de eventos
        newButton.addEventListener('click', handleGoogleSignIn);
      }
    }
  }, []);

  // Función simplificada de autenticación con Google
  const handleGoogleSignIn = async (e) => {
    if (e) e.preventDefault();
    
    try {
      // Mostrar estado de carga
      setIsGoogleLoading(true);
      setAlertVariant('info');
      setAlertMessage('Conectando con Google...');
      setShowAlert(true);
      
      // Nombrar el popup para poder referenciarlo después
      const windowFeatures = 'width=500,height=600,resizable,scrollbars=yes,status=1';
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      
      // Autenticación con popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Usuario autenticado:", user);
      
      // Verificar si el usuario ya existe
      if (!users.some(u => u.username === user.email)) {
        const newUser = {
          fullName: user.displayName || "Usuario de Google",
          username: user.email,
          password: `google_${user.uid}`,
          role: 'cliente',
          googleAuth: true,
          uid: user.uid
        };
        
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
      
      // Guardar información del usuario
      localStorage.setItem('userType', 'cliente');
      localStorage.setItem('userName', user.displayName || "Usuario de Google");
      
      // Mostrar mensaje y redireccionar
      setAlertVariant('success');
      setAlertMessage('¡Autenticación exitosa! Redirigiendo...');
      setShowAlert(true);
      
      setTimeout(() => {
        navigate('/principal');
      }, 1500);
      
    } catch (error) {
      console.error("Error de autenticación:", error);
      
      // Mensaje de error específico
      setAlertVariant('danger');
      setAlertMessage(`Error: ${error.message || 'No se pudo conectar con Google'}`);
      setShowAlert(true);
    } finally {
      // Siempre desactivamos el estado de carga y limpiamos el estado guardado
      setIsGoogleLoading(false);
      sessionStorage.removeItem('googleAuthInProgress');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
        // Verificar el estado del popup de Google
        const googlePopup = window.open('', 'googleAuthPopup');
        if (!googlePopup || googlePopup.closed) {
          // El popup se cerró sin completar la autenticación
          setIsGoogleLoading(false);
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
        console.log('Tiempo de autenticación excedido, reseteando botón');
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

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center vh-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <img src={LogoLoginImg} alt="Logo" className="img-fluid w-50" />
                <p className="text-muted h5">
                  Crea tu cuenta para continuar
                </p>
              </div>
              
              {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                  {alertMessage}
                </Alert>
              )}
              
              {/* Eliminamos este mensaje estático si existe */}
              
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
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                
                {/* Nuevo botón de Google con ref para poder manipularlo directamente */}
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
              </Form>
              
              <div className="text-center">
                <Link to="/login" className="text-decoration-none">
                  ¿Ya tienes una cuenta? Inicia sesión aquí
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Registro;

