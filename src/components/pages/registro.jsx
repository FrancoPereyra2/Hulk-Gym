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
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaCrown,
  FaGoogle,
  FaUser,
  FaEnvelope,
  FaLock,
  FaIdCard,
  FaArrowLeft,
} from "react-icons/fa";
import LogoLoginImg from "../../assets/logo-login.png";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";
const API = import.meta.env.VITE_API_URL;

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("danger");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [esPrimerUsuario, setEsPrimerUsuario] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [creandoAdminFlag, setCreandoAdminFlag] = useState(() => {
    const flag = localStorage.getItem("creandoAdmin") === "true";
    if (flag) localStorage.removeItem("creandoAdmin");
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
          const userType = localStorage.getItem("userType");
          if (userType !== "admin" && !res.data.esPrimerUsuario) {
            navigate("/login");
            return;
          }
        }

        if (!res.data.esPrimerUsuario && !creandoAdminFlag) {
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Error verificando tipo de registro:", error);
        navigate("/login");
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
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !dni.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setAlertVariant("danger");
      setAlertMessage("Por favor, completa todos los campos");
      setShowAlert(true);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setAlertVariant("danger");
      setAlertMessage("Por favor, introduce un correo electrónico válido");
      setShowAlert(true);
      return;
    }
    if (password !== confirmPassword) {
      setAlertVariant("danger");
      setAlertMessage("Las contraseñas no coinciden");
      setShowAlert(true);
      return;
    }
    if (password.length < 6) {
      setAlertVariant("danger");
      setAlertMessage("La contraseña debe tener al menos 6 caracteres");
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
      const res = await axios.post(
        endpoint,
        {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          dni: dni.trim(),
          email: email.trim(),
          password: password.trim(),
        },
        { headers },
      );
      setAlertVariant("success");
      setAlertMessage(
        esPrimerUsuario
          ? "¡Administrador principal creado! Ya puedes iniciar sesión."
          : "¡Nuevo administrador registrado correctamente!",
      );
      setShowAlert(true);
      setTimeout(() => {
        navigate(esPrimerUsuario ? "/login" : "/admin");
      }, 2000);
    } catch (error) {
      setAlertVariant("danger");
      setAlertMessage(
        error.response?.data?.mensaje ||
          "Error al registrar. Verifica tus datos.",
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
        { headers },
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
          "No se pudo registrar con Google",
      );
      setShowAlert(true);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          background: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            style={{ color: "#2563eb" }}
            role="status"
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p
            style={{
              color: "#64748b",
              marginTop: "12px",
              fontSize: "0.875rem",
            }}
          >
            Verificando...
          </p>
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
            width: "200px",
            marginBottom: "32px",
            filter: "brightness(1.2)",
          }}
        />
        {esPrimerUsuario ? (
          <>
            <FaCrown
              size={48}
              style={{ color: "#fbbf24", marginBottom: "16px" }}
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
              ¡Bienvenido!
            </h2>
            <p
              style={{
                color: "#94a3b8",
                textAlign: "center",
                fontSize: "0.9375rem",
                maxWidth: "320px",
              }}
            >
              Creá la cuenta de administrador principal para comenzar
            </p>
          </>
        ) : (
          <>
            <FaUserShield
              size={48}
              style={{ color: "#60a5fa", marginBottom: "16px" }}
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
              Nuevo Admin
            </h2>
            <p
              style={{
                color: "#94a3b8",
                textAlign: "center",
                fontSize: "0.9375rem",
                maxWidth: "320px",
              }}
            >
              Registrá un nuevo administrador para el sistema
            </p>
          </>
        )}
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
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div className="d-lg-none text-center mb-4">
            <img
              src={LogoLoginImg}
              alt="HULK GYM"
              style={{ width: "200px", marginBottom: "32px" }}
            />
            <h5 style={{ fontWeight: 800, color: "#2a0f0f" }}>HULK GYM</h5>
          </div>

          <h3
            style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}
          >
            {esPrimerUsuario ? "Crear Administrador" : "Nuevo Administrador"}
          </h3>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              marginBottom: "24px",
            }}
          >
            {esPrimerUsuario
              ? "Configurá la cuenta principal del sistema"
              : "Completá los datos del nuevo administrador"}
          </p>

          {esPrimerUsuario && (
            <Alert
              variant="info"
              style={{
                borderRadius: "10px",
                fontSize: "0.8125rem",
                marginBottom: "16px",
              }}
            >
              Primer inicio: esta cuenta tendrá todos los permisos.
            </Alert>
          )}

          {isCreatingAdmin && !esPrimerUsuario && (
            <div
              style={{
                background: "#fff3cd",
                border: "1px solid #ffc107",
                color: "#664d03",
                borderRadius: "10px",
                fontSize: "0.8125rem",
                padding: "12px 16px",
                marginBottom: "16px",
              }}
            >
              <strong>Importante:</strong> Estás creando una cuenta con permisos
              de administrador.
            </div>
          )}

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

          <Form onSubmit={handleRegister}>
            <Row className="g-2 mb-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#475569",
                    }}
                  >
                    Nombre
                  </Form.Label>
                  <div style={{ position: "relative" }}>
                    <FaUser
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        zIndex: 1,
                        fontSize: "0.8125rem",
                      }}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      className="login-input"
                      style={{
                        padding: "10px 14px 10px 40px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#475569",
                    }}
                  >
                    Apellido
                  </Form.Label>
                  <div style={{ position: "relative" }}>
                    <FaUser
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        zIndex: 1,
                        fontSize: "0.8125rem",
                      }}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                      className="login-input"
                      style={{
                        padding: "10px 14px 10px 40px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#475569",
                }}
              >
                DNI
              </Form.Label>
              <div style={{ position: "relative" }}>
                <FaIdCard
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    zIndex: 1,
                    fontSize: "0.8125rem",
                  }}
                />
                <Form.Control
                  type="text"
                  placeholder="Número de documento"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                  className="login-input"
                  style={{
                    padding: "10px 14px 10px 40px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#475569",
                }}
              >
                Correo Electrónico
              </Form.Label>
              <div style={{ position: "relative" }}>
                <FaEnvelope
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    zIndex: 1,
                    fontSize: "0.8125rem",
                  }}
                />
                <Form.Control
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                  style={{
                    padding: "10px 14px 10px 40px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                style={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#475569",
                }}
              >
                Contraseña
              </Form.Label>
              <div style={{ position: "relative" }}>
                <FaLock
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    zIndex: 1,
                    fontSize: "0.8125rem",
                  }}
                />
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                  style={{
                    padding: "10px 40px 10px 40px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.875rem",
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

            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#475569",
                }}
              >
                Confirmar Contraseña
              </Form.Label>
              <div style={{ position: "relative" }}>
                <FaLock
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    zIndex: 1,
                    fontSize: "0.8125rem",
                  }}
                />
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="login-input"
                  style={{
                    padding: "10px 40px 10px 40px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.875rem",
                  }}
                />
                <span
                  onClick={toggleConfirmPasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#94a3b8",
                    zIndex: 1,
                  }}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </span>
              </div>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mb-3 fw-bold border-0"
              style={{
                background: esPrimerUsuario ? "#2563eb" : "#059669",
                borderRadius: "10px",
                fontSize: "0.875rem",
                letterSpacing: "0.03em",
                padding: "12px",
                boxShadow: esPrimerUsuario
                  ? "0 4px 12px rgba(37, 99, 235, 0.3)"
                  : "0 4px 12px rgba(5, 150, 105, 0.3)",
              }}
            >
              {esPrimerUsuario
                ? "CREAR ADMINISTRADOR PRINCIPAL"
                : "REGISTRAR ADMINISTRADOR"}
            </Button>

            {isCreatingAdmin && (
              <button
                type="button"
                onClick={handleGoogleAdminRegister}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.2s ease",
                  marginBottom: "16px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0, 0, 0, 0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <FaGoogle size={16} style={{ color: "#4285f4" }} />
                Registrar con Google
              </button>
            )}
          </Form>

          <div className="text-center">
            <button
              onClick={() =>
                navigate(
                  isCreatingAdmin && !esPrimerUsuario ? "/admin" : "/login",
                )
              }
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "0.8125rem",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaArrowLeft size={12} />
              {isCreatingAdmin && !esPrimerUsuario
                ? "Volver al panel"
                : "Volver al inicio de sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
