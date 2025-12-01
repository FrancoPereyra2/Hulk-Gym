import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import LogoLoginImg from '../../assets/logo-login.png';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

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
  
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { 
              if (node.textContent && node.textContent.includes('desarrollo')) {
                node.remove();
              }
              
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

  useEffect(() => {
    const creandoAdmin = localStorage.getItem('creandoAdmin') === 'true';
    if (creandoAdmin) {
      setIsCreatingAdmin(true);
      localStorage.removeItem('creandoAdmin');
    }

    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (creandoAdmin && userType !== 'admin') {
      navigate('/login');
    } else if (creandoAdmin) {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const currentUser = users.find(u => u.username === userEmail && u.role === 'admin');
        if (!currentUser) {
          navigate('/login');
        }
      }
    }
  }, [navigate]);

  const handleRegister = (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

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

    if (users.some(user => user.username === email.trim())) {
      setAlertVariant('danger');
      setAlertMessage('Este correo electrónico ya está registrado');
      setShowAlert(true);
      return;
    }

    const newUser = {
      fullName: fullName.trim(),
      username: email.trim(),
      password: password.trim(),
      role: isCreatingAdmin ? 'admin' : 'cliente' 
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setAlertVariant('success');
    setAlertMessage(isCreatingAdmin 
      ? '¡Nuevo administrador registrado correctamente!' 
      : '¡Registro exitoso! Ahora puedes iniciar sesión');
    setShowAlert(true);

    setTimeout(() => {
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      navigate(isCreatingAdmin ? '/admin' : '/login');
    }, 2000);
  };

  const googleButtonRef = useRef(null);
  
  useEffect(() => {
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
    
    cleanup();
    
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
  
  useEffect(() => {
    if (googleButtonRef.current) {
      const oldButton = googleButtonRef.current;
      const newButton = oldButton.cloneNode(true);
      
      if (oldButton.parentNode) {
        oldButton.parentNode.replaceChild(newButton, oldButton);
        googleButtonRef.current = newButton;
        
        newButton.addEventListener('click', handleGoogleSignIn);
      }
    }
  }, []);

  const handleGoogleSignIn = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsGoogleLoading(true);
      setAlertVariant('info');
      setAlertMessage('Conectando con Google...');
      setShowAlert(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const existingUser = users.find(u => u.username === user.email);
      
      if (!existingUser) {
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
      
      const userRole = existingUser ? existingUser.role : 'cliente';
      localStorage.setItem('userType', userRole);
      localStorage.setItem('userName', user.displayName || "Usuario de Google");
      localStorage.setItem('userEmail', user.email);
      
      setTimeout(() => {
        navigate(userRole === 'admin' ? '/admin' : '/principal');
      }, 1500);
      
    } catch (error) {
      console.error("Error de autenticación:", error);
      
      setAlertVariant('danger');
      setAlertMessage(`Error: ${error.message || 'No se pudo conectar con Google'}`);
      setShowAlert(true);
    } finally {
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

  useEffect(() => {
    const checkSavedState = () => {
      const savedGoogleAuthState = sessionStorage.getItem('googleAuthInProgress');
      if (savedGoogleAuthState) {
        sessionStorage.removeItem('googleAuthInProgress');
        setIsGoogleLoading(false);
      }
    };

    checkSavedState();

    const handleBeforeUnload = () => {
      if (isGoogleLoading) {
        sessionStorage.setItem('googleAuthInProgress', 'true');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const googlePopup = window.open('', 'googleAuthPopup');
        if (!googlePopup || googlePopup.closed) {
          setIsGoogleLoading(false);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timer = setTimeout(() => {
      if (isGoogleLoading) {
        setIsGoogleLoading(false);
      }
    }, 30000);

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
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="bg-transparent border-0"
                      style={{ cursor: 'pointer' }}
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
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="bg-transparent border-0"
                      style={{ cursor: 'pointer' }}
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


