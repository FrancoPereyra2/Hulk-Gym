import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  InputGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaGoogle, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import LogoLoginImg from "../../assets/logo-login.png";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;

const googleProvider = new GoogleAuthProvider();

const HulkGymLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("danger");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [esPrimerUsuario, setEsPrimerUsuario] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [tokenCambio, setTokenCambio] = useState("");
  const [emailCambio, setEmailCambio] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState("");
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verificarPrimerUsuario = async () => {
      try {
        const res = await axios.get(
          `${API}/api/auth/verificar-primer-usuario`,
        );

        setEsPrimerUsuario(res.data.esPrimerUsuario);

        if (res.data.esPrimerUsuario) {
          console.info("🚀 Redirigiendo a registro (primer usuario)...");
          navigate("/registro");
        } else {
          console.info(
            "✅ Ya hay usuarios registrados:",
            res.data.totalUsuarios,
          );
        }
      } catch (error) {
        console.error("Error verificando primer usuario:", error);
      }
    };

    verificarPrimerUsuario();
  }, [navigate]);

  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (token && emailParam) {
      verificarTokenCambioPassword(token, emailParam);
    }
  }, [searchParams]);

  const verificarTokenCambioPassword = async (token, email) => {
    try {
      const res = await axios.get(
        `${API}/api/auth/verificar-token?token=${token}&email=${email}`,
      );

      if (res.data.valido) {
        setMostrarCambioPassword(true);
        setTokenCambio(token);
        setEmailCambio(email);
        setNombreUsuario(res.data.nombre);
      } else {
        setAlertVariant("danger");
        setAlertMessage(
          "El enlace para cambiar contraseña es inválido o ha expirado.",
        );
        setShowAlert(true);
      }
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage(
        "El enlace para cambiar contraseña es inválido o ha expirado.",
      );
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleNuevaPasswordVisibility = () =>
    setShowNuevaPassword(!showNuevaPassword);
  const toggleConfirmarPasswordVisibility = () =>
    setShowConfirmarPassword(!showConfirmarPassword);

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailSinEspacios = email.trim();
    const passwordSinEspacios = password.trim();

    if (!emailSinEspacios || !passwordSinEspacios) {
      setAlertVariant("danger");
      setAlertMessage("Por favor, completa todos los campos");
      setShowAlert(true);
      return;
    }

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email: emailSinEspacios,
        password: passwordSinEspacios,
      });

      const { accessToken, refreshToken, usuario } = res.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userType", usuario.rol);
      localStorage.setItem("userName", usuario.nombre);
      localStorage.setItem("userEmail", usuario.email);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      setAlertVariant("success");
      setAlertMessage(`¡Bienvenido ${usuario.nombre}!`);
      setShowAlert(true);

      setTimeout(() => {
        navigate(usuario.rol === "admin" ? "/admin" : "/principal", {
          replace: true,
        });
      }, 800);
    } catch (error) {
      console.error("❌ Error en login:", error);

      if (error.response?.data?.requiereCambioPassword) {
        setMostrarCambioPassword(true);
        setTokenCambio(error.response.data.tokenCambio);
        setEmailCambio(error.response.data.email);
        setAlertVariant("warning");
        setAlertMessage("Debes cambiar tu contraseña temporal para continuar.");
        setShowAlert(true);
        return;
      }

      setAlertVariant("danger");
      setAlertMessage(
        error.response?.data?.mensaje ||
          "Correo electrónico o contraseña incorrectos",
      );
      setShowAlert(true);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    if (nuevaPassword.length < 6) {
      setAlertVariant("danger");
      setAlertMessage("La contraseña debe tener al menos 6 caracteres");
      setShowAlert(true);
      return;
    }

    if (nuevaPassword !== confirmarNuevaPassword) {
      setAlertVariant("danger");
      setAlertMessage("Las contraseñas no coinciden");
      setShowAlert(true);
      return;
    }

    try {
      await axios.post(`${API}/api/auth/cambiar-password`, {
        token: tokenCambio,
        email: emailCambio,
        nuevaPassword: nuevaPassword,
      });

      setAlertVariant("success");
      setAlertMessage("¡Contraseña actualizada! Ya puedes iniciar sesión.");
      setShowAlert(true);

      setTimeout(() => {
        setMostrarCambioPassword(false);
        setTokenCambio("");
        setEmailCambio("");
        setNuevaPassword("");
        setConfirmarNuevaPassword("");
        window.history.replaceState({}, document.title, "/login");
      }, 2000);
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage(
        error.response?.data?.mensaje || "Error al cambiar la contraseña",
      );
      setShowAlert(true);
    }
  };

  const handleGoogleSignIn = async (e) => {
    if (e) e.preventDefault();

    try {
      setIsGoogleLoading(true);
      setAlertVariant("info");
      setAlertMessage("Conectando con Google...");
      setShowAlert(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await axios.post(
        `${API}/api/google/auth`,
        {
          idToken: idToken,
        },
      );

      const { accessToken, refreshToken, usuario } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userType", usuario.rol);
      localStorage.setItem("userName", usuario.nombre);
      localStorage.setItem("userEmail", usuario.email);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      setAlertVariant("success");
      setAlertMessage(`¡Bienvenido ${usuario.nombre}!`);
      setShowAlert(true);

      setTimeout(() => {
        navigate(usuario.rol === "admin" ? "/admin" : "/principal", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error("❌ Error con Google:", error);
      setAlertVariant("danger");
      setAlertMessage(
        error.response?.data?.mensaje ||
          error.message ||
          "No se pudo conectar con Google",
      );
      setShowAlert(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!emailRecuperacion.trim()) {
      setAlertVariant("danger");
      setAlertMessage("Ingresa tu correo electrónico");
      setShowAlert(true);
      return;
    }

    try {
      await axios.post(`${API}/api/auth/forgot-password`, {
        email: emailRecuperacion.trim(),
      });

      setAlertVariant("success");
      setAlertMessage(
        "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
      );
      setShowAlert(true);

      setEmailRecuperacion("");
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage("Error al enviar el correo.");
      setShowAlert(true);
    }
  };

  if (mostrarRecuperacion) {
    return (
      <Container fluid>
        <Row className="justify-content-center align-items-center vh-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={4}>
            <Card className="border-0 shadow">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <img
                    src={LogoLoginImg}
                    alt="Logo"
                    className="img-fluid w-50"
                  />
                  <h4 className="mt-3">Recuperar contraseña</h4>
                  <p className="text-muted">
                    Ingresa tu correo y te enviaremos un enlace para restablecer
                    tu contraseña.
                  </p>
                </div>

                {showAlert && (
                  <Alert
                    variant={alertVariant}
                    onClose={() => setShowAlert(false)}
                    dismissible
                  >
                    {alertMessage}
                  </Alert>
                )}

                <Form onSubmit={handleForgotPassword}>
                  <Form.Group className="mb-4">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu correo"
                      value={emailRecuperacion}
                      onChange={(e) => setEmailRecuperacion(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 py-2 mb-3 fw-bold border-0"
                    style={{
                      background: "linear-gradient(135deg, #0400f7, #3352ff)",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0, 16, 247, 0.4)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 6px 18px rgba(4, 0, 247, 0.6)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(4, 0, 247, 0.4)";
                    }}
                  >
                    ENVIAR ENLACE
                  </Button>
                </Form>

                <Button
                  variant="link"
                  className="w-100 fw-semibold text-decoration-none"
                  style={{
                    color: "#0d6efd",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setMostrarRecuperacion(false)}
                  onMouseOver={(e) => {
                    e.target.style.color = "#084298";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#0d6efd";
                  }}
                >
                  ← Volver al inicio de sesión
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (mostrarCambioPassword) {
    return (
      <Container fluid>
        <Row className="justify-content-center align-items-center vh-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={4}>
            <Card className="border-0 shadow">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <img
                    src={LogoLoginImg}
                    alt="Logo"
                    className="img-fluid w-50"
                  />
                  <h4 className="mt-3">Cambiar contraseña</h4>
                  <p className="text-muted">
                    Hola {nombreUsuario}, ingresa tu nueva contraseña.
                  </p>
                </div>

                {showAlert && (
                  <Alert
                    variant={alertVariant}
                    onClose={() => setShowAlert(false)}
                    dismissible
                  >
                    {alertMessage}
                  </Alert>
                )}

                <Form onSubmit={handleCambiarPassword}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nueva contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showNuevaPassword ? "text" : "password"}
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        required
                      />
                      <InputGroup.Text
                        as="button"
                        type="button"
                        onClick={toggleNuevaPasswordVisibility}
                        className="bg-transparent"
                        style={{ cursor: "pointer" }}
                      >
                        {showNuevaPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmarPassword ? "text" : "password"}
                        value={confirmarNuevaPassword}
                        onChange={(e) =>
                          setConfirmarNuevaPassword(e.target.value)
                        }
                        required
                      />
                      <InputGroup.Text
                        as="button"
                        type="button"
                        onClick={toggleConfirmarPasswordVisibility}
                        className="bg-transparent"
                        style={{ cursor: "pointer" }}
                      >
                        {showConfirmarPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 py-2 fw-bold border-0"
                    style={{
                      background: "linear-gradient(135deg, #198754, #157347)",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(25, 135, 84, 0.4)",
                    }}
                  >
                    CAMBIAR CONTRASEÑA
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
                <p className="text-muted h5">Inicia sesión para continuar</p>
              </div>

              {showAlert && (
                <Alert
                  variant={alertVariant}
                  onClose={() => setShowAlert(false)}
                  dismissible
                >
                  {alertMessage}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                      required
                    />
                    <InputGroup.Text
                      as="button"
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="bg-transparent"
                      style={{ cursor: "pointer" }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 py-2 mb-3 fw-bold border-0"
                  style={{
                    backgroundColor: "#198754", 
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(25, 135, 84, 0.35)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 18px rgba(25, 135, 84, 0.5)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(25, 135, 84, 0.35)";
                  }}
                >
                  INICIAR SESIÓN
                </Button>
              </Form>

              <Button
                variant="outline-secondary"
                type="button"
                className="w-100 mb-3 d-flex align-items-center justify-content-center"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                <FaGoogle className="me-2" style={{ color: "#42f442ff" }} />
                {isGoogleLoading
                  ? "Conectando..."
                  : "Iniciar sesión con Google"}
              </Button>

              <div className="text-center mb-3">
                <small
                  className="text-primary fs-6"
                  style={{ cursor: "pointer" }}
                  onClick={() => setMostrarRecuperacion(true)}
                >
                  ¿Olvidaste tu contraseña?
                </small>
              </div>

              <div className="text-center">
                <small className="text-muted">
                  ¿Necesitas una cuenta? Contacta al administrador del gimnasio.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HulkGymLogin;
