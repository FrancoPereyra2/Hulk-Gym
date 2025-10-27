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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('danger');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Estado para determinar si estamos creando un administrador
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  
  // Cargar usuarios del localStorage sin datos hardcodeados
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
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

  // Verificar si se está creando un administrador
  useEffect(() => {
    const creandoAdmin = localStorage.getItem('creandoAdmin') === 'true';
    if (creandoAdmin) {
      setIsCreatingAdmin(true);
      // Limpiar el flag después de usarlo
      localStorage.removeItem('creandoAdmin');
    }

    // Verificar que el usuario actual tenga permisos de administrador
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (creandoAdmin && userType !== 'admin') {
      // Si no es un administrador, redirigir al login
      navigate('/login');
    } else if (creandoAdmin) {
      // Verificar en la base de usuarios
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const currentUser = users.find(u => u.username === userEmail && u.role === 'admin');
        if (!currentUser) {
          // Si no es admin, redirigir al login
          navigate('/login');
        }
      }
    }
  }, [navigate]);

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

    // Verificar si el usuario ya existe
    if (users.some(user => user.username === email.trim())) {
      setAlertVariant('danger');
      setAlertMessage('Este correo electrónico ya está registrado');
      setShowAlert(true);
      return;
    }

    // Crear nuevo usuario
    const newUser = {
      fullName: fullName.trim(),
      username: email.trim(),
      password: password.trim(),
      role: isCreatingAdmin ? 'admin' : 'cliente' // Asignar rol según el contexto
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Guardar en localStorage para que persista
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setAlertVariant('success');
    setAlertMessage(isCreatingAdmin 
      ? '¡Nuevo administrador registrado correctamente!' 
      : '¡Registro exitoso! Ahora puedes iniciar sesión');
    setShowAlert(true);

    // Limpiar formulario y redirigir
    setTimeout(() => {
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Si estamos creando un admin, redirigir a la página de admin
      // Si es registro normal, redirigir al login
      navigate(isCreatingAdmin ? '/admin' : '/login');
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
      
      // Autenticación con popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Verificar si el usuario ya existe
      const existingUser = users.find(u => u.username === user.email);
      
      if (!existingUser) {
        // Registrar como cliente o admin según el contexto
        const newUser = {
          fullName: user.displayName || "Usuario de Google",
          username: user.email,
          password: `google_${user.uid}`,
          role: isCreatingAdmin ? 'admin' : 'cliente',
          googleAuth: true,
          uid: user.uid
        };
        
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        setAlertVariant('success');
        setAlertMessage(isCreatingAdmin 
          ? '¡Nuevo administrador registrado correctamente con Google!' 
          : '¡Registro exitoso! Serás redirigido automáticamente.');
      } else {
        setAlertVariant('info');
        setAlertMessage('Ya existe una cuenta con este email. Iniciando sesión...');
      }
      
      // Guardar información del usuario
      const userRole = existingUser ? existingUser.role : 'cliente';
      localStorage.setItem('userType', userRole);
      localStorage.setItem('userName', user.displayName || "Usuario de Google");
      localStorage.setItem('userEmail', user.email);
      
      // Mostrar mensaje y redireccionar
      setTimeout(() => {
        navigate(userRole === 'admin' ? '/admin' : '/principal');
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
                  {isCreatingAdmin 
                    ? 'Crea un nuevo administrador' 
                    : 'Crea tu cuenta para continuar'}
                </p>
              </div>
              
              {/* Añadir alerta si se está creando un admin sin permiso */}
              {isCreatingAdmin && (
                <Alert variant="info" className="mb-3">
                  <strong>Importante:</strong> Estás creando una cuenta con permisos de administrador.
                </Alert>
              )}
              
              {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                  {alertMessage}
                </Alert>
              )}
              
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
                      className="bg-transparent border-0"
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
                      className="bg-transparent border-0"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
                
                <Button variant="success" type="submit" className="w-100 mb-3">
                  {isCreatingAdmin ? 'REGISTRAR ADMINISTRADOR' : 'REGISTRARSE'}
                </Button>
                
                {/* Botón de Google para registro, adaptado según contexto */}
                <Button 
                  variant="outline-secondary"
                  type="button" 
                  className="w-100 mb-3 d-flex align-items-center justify-content-center"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  data-testid="google-sign-in-button"
                >
                  <FaGoogle className="me-2" style={{ color: '#42f442ff' }} /> 
                  {isGoogleLoading 
                    ? "Conectando..." 
                    : isCreatingAdmin 
                      ? "Registrar admin con Google" 
                      : "Registrarse con Google"}
                </Button>
              </Form>
              
              <div className="text-center">
                {isCreatingAdmin ? (
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/admin')}
                    className="text-decoration-none"
                  >
                    Volver al panel de administración
                  </Button>
                ) : (
                  <Link to="/login" className="text-decoration-none">
                    ¿Ya tienes una cuenta? Inicia sesión aquí
                  </Link>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Registro;


