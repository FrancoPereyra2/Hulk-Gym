import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import LogoLoginImg from '../../assets/logo-login.png';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

const googleProvider = new GoogleAuthProvider();

const HulkGymLogin = () => {
  const [email, setEmail] = useState('');
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
  const [isFirstUse, setIsFirstUse] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGoogleAdmin, setIsGoogleAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
 
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    } else {
      setIsFirstUse(true);
      return [];
    }
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isFirstUse && users.length === 0) {
      setMostrarRegistro(true);
      setIsAdmin(true);
      setAlertVariant('info');
      setAlertMessage('¡Bienvenido! Por favor, crea el primer usuario administrador.');
      setShowAlert(true);
    }
  }, [isFirstUse, users]);
  
  useEffect(() => {
    const alertElements = document.querySelectorAll('.alert');
    alertElements.forEach(el => {
      if (el.textContent && el.textContent.includes('desarrollo')) {
        el.parentNode.removeChild(el);
      }
    });
  }, []);
  
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
        if (isGoogleLoading) {
          const timeInLoading = Date.now() - (parseInt(sessionStorage.getItem('googleLoadingStartTime') || '0'));
          if (timeInLoading > 10000) {
            setIsGoogleLoading(false);
          }
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
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const emailSinEspacios = email.trim();
    const passwordSinEspacios = password.trim();

    if (!emailSinEspacios || !passwordSinEspacios) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    const user = users.find(
      u => u.username === emailSinEspacios && u.password === passwordSinEspacios
    );

    if (user) {
      localStorage.setItem('userType', user.role);
      localStorage.setItem('userName', user.fullName);
      localStorage.setItem('userEmail', user.username);
      
      setAlertVariant('success');
      setAlertMessage(`¡Bienvenido ${user.fullName}!`);
      setShowAlert(true);
      
      setTimeout(() => {
        navigate(user.role === 'admin' ? '/admin' : '/principal');
      }, 1000);
    } else {
      setAlertVariant('danger');
      setAlertMessage('Correo electrónico o contraseña incorrectos');
      setShowAlert(true);
    }
  };

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
      role: isAdmin ? 'admin' : 'cliente'
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setAlertVariant('success');
    if (isFirstUse) {
      setAlertMessage('¡Administrador registrado correctamente! Ahora puedes iniciar sesión');
      setIsFirstUse(false);
      setIsAdmin(false);
    } else {
      setAlertMessage('¡Registro exitoso! Ahora puedes iniciar sesión');
    }
    setShowAlert(true);

    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMostrarRegistro(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      sessionStorage.setItem('googleLoadingStartTime', Date.now().toString());
      
      setAlertVariant('info');
      setAlertMessage('Conectando con Google...');
      setShowAlert(true);
      
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const existingUser = users.find(u => u.username === user.email);
      
      if (!existingUser) {
        if (!mostrarRegistro) {
          setAlertVariant('danger');
          setAlertMessage('No existe una cuenta con este correo electrónico. Por favor, regístrate primero.');
          setShowAlert(true);
          return;
        }
        
        const newUser = {
          fullName: user.displayName || "Usuario de Google",
          username: user.email,
          password: `google_${user.uid}`,
          role: isFirstUse ? 'admin' : 'cliente',
          googleAuth: true,
          uid: user.uid
        };
        
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        setAlertVariant('success');
        setAlertMessage(`¡Registro exitoso como ${isFirstUse ? 'administrador' : 'cliente'}! Serás redirigido automáticamente.`);
        
        localStorage.setItem('userType', isFirstUse ? 'admin' : 'cliente');
        localStorage.setItem('userName', user.displayName || "Usuario de Google");
        localStorage.setItem('userEmail', user.email);
        
        setTimeout(() => {
          navigate(isFirstUse ? '/admin' : '/principal');
        }, 2000);
      } else {
        setAlertVariant('success');
        setAlertMessage('Iniciando sesión...');
        
        localStorage.setItem('userType', existingUser.role);
        localStorage.setItem('userName', existingUser.fullName);
        localStorage.setItem('userEmail', existingUser.username);
        
        setTimeout(() => {
          navigate(existingUser.role === 'admin' ? '/admin' : '/principal');
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
      
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

  const [mostrarActivacion, setMostrarActivacion] = useState(false);
  const [tokenActivacion, setTokenActivacion] = useState('');
  const [dniActivacion, setDniActivacion] = useState('');
  const [passwordActivacion, setPasswordActivacion] = useState('');
  const [confirmPasswordActivacion, setConfirmPasswordActivacion] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const dni = urlParams.get('dni');
    
    if (token && dni) {
      setTokenActivacion(token);
      setDniActivacion(dni);
      setMostrarActivacion(true);
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleActivarCuenta = (e) => {
    e.preventDefault();

    if (!passwordActivacion.trim() || !confirmPasswordActivacion.trim()) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    if (passwordActivacion !== confirmPasswordActivacion) {
      setAlertVariant('danger');
      setAlertMessage('Las contraseñas no coinciden');
      setShowAlert(true);
      return;
    }

    if (passwordActivacion.length < 6) {
      setAlertVariant('danger');
      setAlertMessage('La contraseña debe tener al menos 6 caracteres');
      setShowAlert(true);
      return;
    }

    try {
      const tokensGuardados = JSON.parse(localStorage.getItem('tokensActivacion') || '[]');
      const tokenValido = tokensGuardados.find(t => 
        t.token === tokenActivacion && 
        t.clienteDNI === dniActivacion && 
        !t.usado &&
        new Date(t.fechaExpiracion) > new Date()
      );

      if (!tokenValido) {
        setAlertVariant('danger');
        setAlertMessage('Token inválido o expirado. Contacta al gimnasio para obtener un nuevo enlace.');
        setShowAlert(true);
        return;
      }

      const clientesGuardados = JSON.parse(localStorage.getItem('clientes') || '[]');
      const cliente = clientesGuardados.find(c => c.dni === dniActivacion && c.id === tokenValido.clienteId);

      if (!cliente) {
        setAlertVariant('danger');
        setAlertMessage('Cliente no encontrado.');
        setShowAlert(true);
        return;
      }

      const usuariosActuales = JSON.parse(localStorage.getItem('users') || '[]');
      
      const usuarioExistente = usuariosActuales.find(u => u.username === cliente.email);
      
      if (usuarioExistente) {
        setAlertVariant('danger');
        setAlertMessage('Ya existe una cuenta con este email.');
        setShowAlert(true);
        return;
      }

      const nuevoUsuario = {
        fullName: cliente.nombre,
        username: cliente.email,
        password: passwordActivacion.trim(),
        role: 'cliente',
        clienteId: cliente.id,
        activadoPorToken: true
      };

      const usuariosActualizados = [...usuariosActuales, nuevoUsuario];
      localStorage.setItem('users', JSON.stringify(usuariosActualizados));
      setUsers(usuariosActualizados);

      const clientesActualizados = clientesGuardados.map(c => 
        c.id === cliente.id ? { ...c, cuentaActivada: true, fechaActivacion: new Date().toISOString() } : c
      );
      localStorage.setItem('clientes', JSON.stringify(clientesActualizados));

      const tokensActualizados = tokensGuardados.map(t => 
        t.token === tokenActivacion ? { ...t, usado: true, fechaUso: new Date().toISOString() } : t
      );
      localStorage.setItem('tokensActivacion', JSON.stringify(tokensActualizados));

      (async () => {
        try {
          const { enviarCredencialesAcceso } = await import('../../services/emailService');
          const resultadoEmail = await enviarCredencialesAcceso(cliente, passwordActivacion.trim());
          
          if (resultadoEmail.success) {
            
            const historialStr = localStorage.getItem('emailHistory');
            const historial = historialStr ? JSON.parse(historialStr) : [];
            
            historial.push({
              id: Date.now(),
              clienteNombre: cliente.nombre,
              clienteDNI: cliente.dni,
              clienteEmail: cliente.email,
              tipo: 'credenciales',
              fechaEnvio: new Date().toLocaleString('es-AR'),
              estado: 'Enviado',
              error: null,
              asunto: '✅ Cuenta activada - Tus credenciales - HULK GYM'
            });
            
            localStorage.setItem('emailHistory', JSON.stringify(historial));
            
            setAlertVariant('success');
            setAlertMessage('¡Cuenta activada exitosamente! Se ha enviado un email con tus credenciales.');
          } else {
            console.error('❌ Error al enviar email:', resultadoEmail.error);
            setAlertVariant('success');
            setAlertMessage('¡Cuenta activada exitosamente! (No se pudo enviar el email de confirmación)');
          }
        } catch (error) {
          console.error('Error al enviar email:', error);
          setAlertVariant('success');
          setAlertMessage('¡Cuenta activada exitosamente! Ya puedes iniciar sesión.');
        }
        
        setShowAlert(true);
      })();

      setAlertVariant('success');
      setAlertMessage('¡Cuenta activada exitosamente! Ya puedes iniciar sesión.');
      setShowAlert(true);

      setTimeout(() => {
        setMostrarActivacion(false);
        setTokenActivacion('');
        setDniActivacion('');
        setPasswordActivacion('');
        setConfirmPasswordActivacion('');
        setEmail(cliente.email);
      }, 2000);

    } catch (error) {
      console.error('Error al activar cuenta:', error);
      setAlertVariant('danger');
      setAlertMessage('Error al activar la cuenta. Inténtalo de nuevo.');
      setShowAlert(true);
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
                  {mostrarActivacion 
                    ? 'Activa tu cuenta creando una contraseña'
                    : isFirstUse 
                      ? 'Crea el primer usuario administrador' 
                      : mostrarRegistro 
                        ? 'Crea tu cuenta para continuar' 
                        : 'Inicia sesión para continuar'}
                </p>
              </div>
              
              {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                  {alertMessage}
                </Alert>
              )}
              
              {mostrarActivacion ? (
                <Form onSubmit={handleActivarCuenta}>
                  <Alert variant="info" className="mb-3">
                    <strong>¡Bienvenido a HULK GYM!</strong><br />
                    Crea tu contraseña para activar tu cuenta y acceder a tu información.
                  </Alert>

                  <Form.Group className="mb-3">
                    <Form.Label>DNI</Form.Label>
                    <Form.Control
                      type="text"
                      value={dniActivacion}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Nueva Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Crea tu contraseña (mín. 6 caracteres)"
                        value={passwordActivacion}
                        onChange={(e) => setPasswordActivacion(e.target.value)}
                      />
                      <InputGroup.Text 
                        as="button"
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="bg-transparent"
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
                        value={confirmPasswordActivacion}
                        onChange={(e) => setConfirmPasswordActivacion(e.target.value)}
                      />
                      <InputGroup.Text 
                        as="button"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="bg-transparent"
                        style={{ cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                  
                  <Button variant="success" type="submit" className="w-100 mb-3">
                    ACTIVAR CUENTA
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => setMostrarActivacion(false)}
                      className="text-decoration-none"
                    >
                      ¿Ya tienes cuenta? Inicia sesión aquí
                    </Button>
                  </div>
                </Form>
              ) : mostrarRegistro ? (
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
                        style={{ borderRight: 'none' }}
                      />
                      <InputGroup.Text 
                        as="button"
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="bg-transparent"
                        style={{ cursor: 'pointer' }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ borderRight: 'none' }}
                      />
                      <InputGroup.Text 
                        as="button"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="bg-transparent"
                        style={{ cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                  
                  {/* Solo mostrar checkbox para crear admin si NO es el primer uso Y el usuario tiene permisos de admin */}
                  {!isFirstUse && !isAdmin && users.some(u => u.role === 'admin' && u.username === localStorage.getItem('userEmail')) && (
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="adminCheck"
                        label="Registrar como administrador"
                        checked={isAdmin}
                        onChange={() => setIsAdmin(!isAdmin)}
                      />
                    </Form.Group>
                  )}
                  
                  <Button variant="success" type="submit" className="w-100 mb-3">
                    {isFirstUse ? 'CREAR ADMINISTRADOR' : 'REGISTRARSE'}
                  </Button>
                  
                  {(isFirstUse || !isAdmin) && (
                    <>
                      {isFirstUse && (
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox"
                            id="googleAdminCheck"
                            label="Registrarse con Google como administrador"
                            checked={true}
                            disabled={true}
                          />
                        </Form.Group>
                      )}
                    
                      <Button 
                        variant="outline-secondary"
                        type="button" 
                        className="w-100 mb-3 d-flex align-items-center justify-content-center"
                        onClick={() => {
                          if (isFirstUse) {
                            setIsGoogleAdmin(true);
                          } else {
                            setIsGoogleAdmin(false);
                          }
                          handleGoogleSignIn();
                        }}
                        disabled={isGoogleLoading}
                        data-testid="google-sign-in-button"
                        style={{
                          borderColor: 'var(--bs-border-color)',
                          color: 'var(--bs-body-color)',
                          backgroundColor: 'var(--bs-body-bg)',
                          fontSize: '14px',
                          fontWeight: '500',
                          padding: '10px 24px'
                        }}
                      >
                        <FaGoogle className="me-3" style={{ color: '#4285f4', fontSize: '18px' }} /> 
                        {isGoogleLoading ? "Conectando..." : `Registrarse con Google${isFirstUse ? ' (Admin)' : ''}`}
                      </Button>
                    </>
                  )}
                  
                  {!isFirstUse && (
                    <div className="text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setMostrarRegistro(false)}
                        className="text-decoration-none"
                      >
                        ¿Ya tienes una cuenta? Inicia sesión aquí
                      </Button>
                    </div>
                  )}
                </Form>
              ) : (
                <>
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Ingresa tu correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                          style={{ borderRight: 'none' }}
                        />
                        <InputGroup.Text 
                          as="button"
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="bg-transparent"
                          style={{ cursor: 'pointer' }}
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
                  
                  <hr className="my-4" />
                  
                  <div className="text-center mb-3">
                    <p className="text-muted">O inicia sesión con:</p>
                  </div>
                  
                  <Button 
                    variant="outline-secondary"
                    type="button" 
                    className="w-100 mb-3 d-flex align-items-center justify-content-center"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    data-testid="google-sign-in-button"
                    style={{
                      borderColor: 'var(--bs-border-color)',
                      color: 'var(--bs-body-color)',
                      backgroundColor: 'var(--bs-body-bg)',
                      fontSize: '16px',
                      fontWeight: '500',
                      padding: '10px 24px'
                    }}
                  >
                    <FaGoogle className="me-3" style={{ color: '#4285f4', fontSize: '18px' }} /> 
                    {isGoogleLoading ? "Conectando..." : "Iniciar sesión con Google"}
                  </Button>
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