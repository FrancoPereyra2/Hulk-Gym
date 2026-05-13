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
import {
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";
import LogoLoginImg from "../../assets/logo-login.png";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";
import axios from "axios";
import "../../styles/admin.css";
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
        const res = await axios.get(`${API}/api/auth/verificar-primer-usuario`);
        setEsPrimerUsuario(res.data.esPrimerUsuario);
        if (res.data.esPrimerUsuario) navigate("/registro");
      } catch (error) {
        console.error("Error verificando primer usuario:", error);
      }
    };
    verificarPrimerUsuario();
  }, [navigate]);

  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");
    if (token && emailParam) verificarTokenCambioPassword(token, emailParam);
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
        setAlertMessage("El enlace es inválido o ha expirado.");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage("El enlace es inválido o ha expirado.");
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
      setAlertMessage("Completá todos los campos");
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
      navigate(usuario.rol === "admin" ? "/admin" : "/principal", {
        replace: true,
      });
    } catch (error) {
      if (error.response?.data?.requiereCambioPassword) {
        setMostrarCambioPassword(true);
        setTokenCambio(error.response.data.tokenCambio);
        setEmailCambio(error.response.data.email);
        return;
      }
      setAlertVariant("danger");
      setAlertMessage(
        error.response?.data?.mensaje || "Credenciales incorrectas",
      );
      setShowAlert(true);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (nuevaPassword.length < 6) {
      setAlertVariant("danger");
      setAlertMessage("Mínimo 6 caracteres");
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
        nuevaPassword,
      });
      setAlertVariant("success");
      setAlertMessage("¡Contraseña actualizada!");
      setShowAlert(true);
      setTimeout(() => {
        setMostrarCambioPassword(false);
        window.history.replaceState({}, document.title, "/login");
      }, 1500);
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage(
        error.response?.data?.mensaje || "Error al cambiar contraseña",
      );
      setShowAlert(true);
    }
  };

  const handleGoogleSignIn = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await axios.post(`${API}/api/google/auth`, { idToken });
      const { accessToken, refreshToken, usuario } = response.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userType", usuario.rol);
      localStorage.setItem("userName", usuario.nombre);
      localStorage.setItem("userEmail", usuario.email);
      navigate(usuario.rol === "admin" ? "/admin" : "/principal", {
        replace: true,
      });
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage("No se pudo conectar con Google");
      setShowAlert(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!emailRecuperacion.trim()) {
      setAlertVariant("danger");
      setAlertMessage("Ingresá tu correo");
      setShowAlert(true);
      return;
    }
    try {
      await axios.post(`${API}/api/auth/forgot-password`, {
        email: emailRecuperacion.trim(),
      });
      setAlertVariant("success");
      setAlertMessage("Si el correo existe, recibirás un enlace.");
      setShowAlert(true);
      setEmailRecuperacion("");
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage("Error al enviar el correo");
      setShowAlert(true);
    }
  };

  if (mostrarRecuperacion) {
    return (
      <div
        style={{ minHeight: "100vh", display: "flex", background: "#f1f5f9" }}
      >
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px",
          }}
          className="d-none d-lg-flex"
        >
          <img
            src={LogoLoginImg}
            alt="HULK GYM"
            style={{
              width: "220px",
              marginBottom: "32px",
              filter: "brightness(1.2)",
            }}
          />
          <h2
            style={{
              color: "#f1f5f9",
              fontWeight: 800,
              fontSize: "1.75rem",
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            Recuperá tu acceso
          </h2>
          <p
            style={{
              color: "#94a3b8",
              textAlign: "center",
              fontSize: "0.9375rem",
              maxWidth: "320px",
            }}
          >
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div className="d-lg-none text-center mb-4">
              <img
                src={LogoLoginImg}
                alt="HULK GYM"
                style={{ width: "120px" }}
              />
            </div>

            <h4
              style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}
            >
              Recuperar contraseña
            </h4>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.875rem",
                marginBottom: "24px",
              }}
            >
              Ingresá tu correo electrónico
            </p>

            {showAlert && (
              <Alert
                variant={alertVariant}
                onClose={() => setShowAlert(false)}
                dismissible
                style={{ borderRadius: "10px", fontSize: "0.875rem" }}
              >
                {alertMessage}
              </Alert>
            )}

            <Form onSubmit={handleForgotPassword}>
              <Form.Group className="mb-4">
                <div style={{ position: "relative" }}>
                  <FaEnvelope
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "14px",
                      color: "#94a3b8",
                    }}
                  />
                  <Form.Control
                    type="email"
                    placeholder="tu@email.com"
                    value={emailRecuperacion}
                    onChange={(e) => setEmailRecuperacion(e.target.value)}
                    required
                    className="login-input"
                    style={{
                      paddingLeft: "42px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      padding: "12px 14px 12px 42px",
                      fontSize: "0.9375rem",
                    }}
                  />
                </div>
              </Form.Group>
              <Button
                type="submit"
                className="w-100 py-2 mb-3 fw-bold border-0"
                style={{
                  background: "#2563eb",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  letterSpacing: "0.03em",
                }}
              >
                ENVIAR ENLACE
              </Button>
            </Form>

            <button
              onClick={() => setMostrarRecuperacion(false)}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: 0,
              }}
            >
              <FaArrowLeft size={12} /> Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mostrarCambioPassword) {
    return (
      <div
        style={{ minHeight: "100vh", display: "flex", background: "#f1f5f9" }}
      >
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px",
          }}
          className="d-none d-lg-flex"
        >
          <img
            src={LogoLoginImg}
            alt="HULK GYM"
            style={{ width: "220px", marginBottom: "32px" }}
          />
          <h2
            style={{
              color: "#f1f5f9",
              fontWeight: 800,
              fontSize: "1.75rem",
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            Nueva contraseña
          </h2>
          <p
            style={{
              color: "#94a3b8",
              textAlign: "center",
              fontSize: "0.9375rem",
              maxWidth: "320px",
            }}
          >
            Elegí una contraseña segura para tu cuenta
          </p>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div className="d-lg-none text-center mb-4">
              <img
                src={LogoLoginImg}
                alt="HULK GYM"
                style={{ width: "120px" }}
              />
            </div>

            <h4
              style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}
            >
              Cambiar contraseña
            </h4>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.875rem",
                marginBottom: "24px",
              }}
            >
              Hola {nombreUsuario}
            </p>

            {showAlert && (
              <Alert
                variant={alertVariant}
                onClose={() => setShowAlert(false)}
                dismissible
                style={{ borderRadius: "10px", fontSize: "0.875rem" }}
              >
                {alertMessage}
              </Alert>
            )}

            <Form onSubmit={handleCambiarPassword}>
              <Form.Group className="mb-3">
                <div style={{ position: "relative" }}>
                  <FaLock
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "14px",
                      color: "#94a3b8",
                    }}
                  />
                  <Form.Control
                    type={showNuevaPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                    className="login-input"
                    style={{
                      paddingLeft: "42px",
                      paddingRight: "42px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.9375rem",
                    }}
                  />
                  <span
                    onClick={toggleNuevaPasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "14px",
                      cursor: "pointer",
                      color: "#94a3b8",
                    }}
                  >
                    {showNuevaPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <div style={{ position: "relative" }}>
                  <FaLock
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "14px",
                      color: "#94a3b8",
                    }}
                  />
                  <Form.Control
                    type={showConfirmarPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={confirmarNuevaPassword}
                    onChange={(e) => setConfirmarNuevaPassword(e.target.value)}
                    required
                    className="login-input"
                    style={{
                      paddingLeft: "42px",
                      paddingRight: "42px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.9375rem",
                    }}
                  />
                  <span
                    onClick={toggleConfirmarPasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "14px",
                      cursor: "pointer",
                      color: "#94a3b8",
                    }}
                  >
                    {showConfirmarPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>
              <Button
                type="submit"
                className="w-100 py-2 fw-bold border-0"
                style={{
                  background: "#059669",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  letterSpacing: "0.03em",
                }}
              >
                CAMBIAR CONTRASEÑA
              </Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f1f5f9" }}>
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
        }}
        className="d-none d-lg-flex"
      >
        <img
          src={LogoLoginImg}
          alt="HULK GYM"
          style={{
            width: "220px",
            marginBottom: "40px",
            filter: "brightness(1.2)",
          }}
        />
        <h1
          style={{
            color: "#f1f5f9",
            fontWeight: 800,
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          HULK GYM
        </h1>
        <p
          style={{
            color: "#94a3b8",
            textAlign: "center",
            fontSize: "1rem",
            maxWidth: "320px",
            lineHeight: "1.6",
          }}
        >
          Sistema de gestión de gimnasio. Administrá clientes, rutinas y mucho
          más.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div className="d-lg-none text-center mb-4">
            <img
              src={LogoLoginImg}
              alt="HULK GYM"
              style={{ width: "140px", marginBottom: "8px" }}
            />
            <h4 style={{ fontWeight: 800, color: "#0f172a" }}>HULK GYM</h4>
          </div>

          <h3
            style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}
          >
            Iniciar sesión
          </h3>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              marginBottom: "28px",
            }}
          >
            Ingresá tus credenciales para continuar
          </p>

          {showAlert && (
            <Alert
              variant={alertVariant}
              onClose={() => setShowAlert(false)}
              dismissible
              style={{ borderRadius: "10px", fontSize: "0.875rem" }}
            >
              {alertMessage}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <div style={{ position: "relative" }}>
                <FaEnvelope
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "14px",
                    color: "#94a3b8",
                  }}
                />
                <Form.Control
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                  style={{
                    paddingLeft: "42px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    padding: "12px 14px 12px 42px",
                    fontSize: "0.9375rem",
                  }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <div style={{ position: "relative" }}>
                <FaLock
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    zIndex: 1,
                    fontSize: "0.875rem",
                  }}
                />
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                  style={{
                    padding: "12px 40px 12px 42px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.9375rem",
                    lineHeight: "1.5",
                  }}
                />
                <span
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#94a3b8",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </span>
              </div>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 py-2 mb-3 fw-bold border-0"
              style={{
                background: "#2563eb",
                borderRadius: "10px",
                fontSize: "0.875rem",
                letterSpacing: "0.03em",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              }}
            >
              INICIAR SESIÓN
            </Button>
          </Form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            <span
              style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}
            >
              o
            </span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.885rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s ease",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <FaGoogle size={16} style={{ color: "#4285f4" }} />
            {isGoogleLoading ? "Conectando..." : "Iniciar sesión con Google"}
          </button>

          <div className="text-center">
            <span
              onClick={() => setMostrarRecuperacion(true)}
              style={{
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "0.8125rem",
                fontWeight: 600,
              }}
            >
              ¿Olvidaste tu contraseña?
            </span>
            <div style={{ marginTop: "16px" }}>
              <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                ¿Necesitás una cuenta? Contactá al administrador.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HulkGymLogin;
