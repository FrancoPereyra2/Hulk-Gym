import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUserShield, FaCrown, FaGoogle } from 'react-icons/fa';
import LogoLoginImg from '../../assets/logo-login.png';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";
const API = import.meta.env.VITE_API_URL;

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('danger');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [esPrimerUsuario, setEsPrimerUsuario] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [creandoAdminFlag, setCreandoAdminFlag] = useState(() => {
    const flag = localStorage.getItem('creandoAdmin') === 'true';
    if (flag) localStorage.removeItem('creandoAdmin');
    return flag;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const verificarTipoRegistro = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/verificar-primer-usuario`);
        setEsPrimerUsuario(res.data.esPrimerUsuario);

        if (creandoAdminFlag) {
          setIsCreatingAdmin(true);
          const userType = localStorage.getItem('userType');
          if (userType !== 'admin' && !res.data.esPrimerUsuario) {
            navigate('/login');
            return;
          }
        }

        if (!res.data.esPrimerUsuario && !creandoAdminFlag) {
          navigate('/login');
          return;
        }

      } catch (error) {
        console.error("Error verificando tipo de registro:", error);
        navigate('/login');
      } finally {
        setCargando(false);
      }
    };

    verificarTipoRegistro();
  }, [navigate, creandoAdminFlag]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !dni.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
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

    if (password.length < 6) {
      setAlertVariant('danger');
      setAlertMessage('La contraseña debe tener al menos 6 caracteres');
      setShowAlert(true);
      return;
    }

    try {
      let endpoint = "";
      let headers = {};

      if (esPrimerUsuario) {
        endpoint = `${API}/api/auth/primer-admin`;
      } else if (isCreatingAdmin) {
        endpoint = `${API}/api/auth/registrar-admin`;
        const token = localStorage.getItem("token");
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await axios.post(endpoint, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        email: email.trim(),
        password: password.trim(),
      }, { headers });

      setAlertVariant('success');
      setAlertMessage(esPrimerUsuario 
        ? '¡Administrador principal creado! Ya puedes iniciar sesión.' 
        : '¡Nuevo administrador registrado correctamente!');
      setShowAlert(true);

      setTimeout(() => {
        setNombre('');
        setApellido('');
        setDni('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        navigate(esPrimerUsuario ? '/login' : '/admin');
      }, 2000);

    } catch (error) {
      console.error("❌ Error en registro:", error);
      setAlertVariant('danger');
      setAlertMessage(
        error.response?.data?.mensaje || 
        'Error al registrar. Verifica tus datos.'
      );
      setShowAlert(true);
    }
  };

  const handleGoogleAdminRegister = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      const idToken = await user.getIdToken();

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${API}/api/google/auth`,
        { idToken },
        { headers }
      );

      setAlertVariant("success");
      setAlertMessage("¡Administrador registrado con Google correctamente!");
      setShowAlert(true);

      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage(
        error.response?.data?.mensaje ||
          error.message ||
          "No se pudo registrar con Google"
      );
      setShowAlert(true);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (cargando) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Verificando...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center vh-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <img src={LogoLoginImg} alt="Logo" className="img-fluid w-50" />
                
                {esPrimerUsuario ? (
                  <>
                    <div className="mt-3">
                      <FaCrown size={40} className="text-warning mb-2" />
                      <h4 className="text-success">¡Bienvenido a HULK GYM!</h4>
                    </div>
                    <p className="text-muted">
                      Crea la cuenta de administrador principal
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mt-3">
                      <FaUserShield size={40} className="text-primary mb-2" />
                      <h4 className="text-primary">Nuevo Administrador</h4>
                    </div>
                    <p className="text-muted">
                      Registra un nuevo administrador del sistema
                    </p>
                  </>
                )}
              </div>
              
              {esPrimerUsuario && (
                <Alert variant="info" className="mb-3">
                  <strong>Primer inicio:</strong> Esta cuenta tendrá todos los permisos de administrador.
                </Alert>
              )}
              
              {isCreatingAdmin && !esPrimerUsuario && (
                <Alert variant="warning" className="mb-3">
                  <strong>Importante:</strong> Estás creando una cuenta con permisos de administrador.
                </Alert>
              )}
              
              {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                  {alertMessage}
                </Alert>
              )}
              
              <Form onSubmit={handleRegister}>
                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Número de documento"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="admin@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
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
                  {esPrimerUsuario ? 'CREAR ADMINISTRADOR PRINCIPAL' : 'REGISTRAR ADMINISTRADOR'}
                </Button>
                {isCreatingAdmin && (
                  <Button
                    variant="outline-danger"
                    type="button"
                    className="w-100 mb-3 d-flex align-items-center justify-content-center"
                    onClick={handleGoogleAdminRegister}
                  >
                    <FaGoogle className="me-2" />
                    Registrar administrador con Google
                  </Button>
                )}
              </Form>
              
              <div className="text-center">
                {isCreatingAdmin && !esPrimerUsuario ? (
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/admin')}
                    className="text-decoration-none"
                  >
                    Volver al panel de administración
                  </Button>
                ) : (
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/login')}
                    className="text-decoration-none"
                  >
                    Volver al inicio de sesión
                  </Button>
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