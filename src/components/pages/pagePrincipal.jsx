import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  InputGroup,
  Nav,
  Navbar,
  Offcanvas,
  Badge,
  Modal,
  Alert,
  ListGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUser,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBars,
  FaTimes,
  FaDumbbell,
  FaMoon,
  FaSun,
  FaUserCheck,
  FaCalendarAlt,
  FaIdCard,
  FaUsers,
  FaEnvelope,
  FaBell,
  FaHistory,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFilter,
} from "react-icons/fa";
import { useTheme } from "./admin.jsx";
import logo from "../../assets/logo-login.png";
import "../../styles/admin.css";
const API = import.meta.env.VITE_API_URL;

const PagePrincipal = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();

  const [userType, setUserType] = useState(() =>
    localStorage.getItem("userType"),
  );
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 992);

  const [clientes, setClientes] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState(() => {
    const savedHistory = localStorage.getItem("emailHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [cuentasVencidas, setCuentasVencidas] = useState([]);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [clienteLogueado, setClienteLogueado] = useState(null);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const cargarDatosCliente = async () => {
      if (userType !== "cliente") return;
      try {
        const token = localStorage.getItem("token");
        if (!usuario || !usuario.email) return;
        const res = await axios.get(
          `${API}/api/clientes/email/${usuario.email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setClienteLogueado(res.data);
      } catch (error) {
        console.error("Error al obtener datos del cliente:", error);
      }
    };
    cargarDatosCliente();
  }, [userType]);

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    if (!storedUserType) navigate("/login");
    else setUserType(storedUserType);
  }, [navigate]);

  useEffect(() => {
    const fetchClientes = async () => {
      if (userType !== "admin") return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/clientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(res.data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
    fetchClientes();
  }, [userType]);

  useEffect(() => {
    verificarCuentasVencidas();
  }, [clientes]);

  const calcularEstado = (vencimiento) => {
    if (!vencimiento) return "Expirada";
    const hoy = new Date();
    const [dia, mes, anio] = vencimiento.split("/");
    const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
    return fechaVencimiento >= hoy ? "Activo" : "Expirada";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const verificarCuentasVencidas = () => {
    const hoy = new Date();
    const vencidas = clientes.filter((cliente) => {
      if (!cliente.vencimiento) return true;
      const [dia, mes, anio] = cliente.vencimiento.split("/");
      const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
      return fechaVencimiento < hoy;
    });
    setCuentasVencidas(vencidas);
    return vencidas;
  };

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const emailsFiltrados = (() => {
    if (!filtroDesde && !filtroHasta) return emailHistory;
    const desde = filtroDesde ? new Date(filtroDesde + "T00:00:00") : null;
    const hasta = filtroHasta ? new Date(filtroHasta + "T23:59:59") : null;
    return emailHistory.filter((email) => {
      const fechaEmail = new Date(email.fechaEnvio);
      if (isNaN(fechaEmail)) return false;
      if (desde && hasta) return fechaEmail >= desde && fechaEmail <= hasta;
      if (desde) return fechaEmail >= desde;
      if (hasta) return fechaEmail <= hasta;
      return true;
    });
  })();

  const renderSidebar = () => (
    <Navbar
      className="d-flex flex-column h-100"
      style={{ background: "#1e293b", borderRight: "none" }}
    >
      <Container fluid className="d-flex flex-column h-100 p-0">
        <Navbar.Brand className="p-3 w-100 text-center">
          <img
            src={logo}
            alt="HULK GYM"
            style={{
              width: "130px",
              height: "auto",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "16px",
              filter: "brightness(1.4) contrast(1.1)",
            }}
          />
          <p
            className="text-center small mb-4"
            style={{
              color: "rgba(255, 255, 255, 0.45)",
              fontWeight: 500,
              fontSize: "0.675rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {userType === "cliente"
              ? "Panel de Cliente"
              : "Panel Administrativo"}
          </p>
          <Nav className="flex-column w-100">
            <Nav.Link
              className="d-flex align-items-center mb-2"
              style={{
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "rgba(37, 99, 235, 0.2)",
              }}
            >
              <FaUsers className="me-2" />
              <span>
                {userType === "cliente"
                  ? "Mi Estado de Cuenta"
                  : "Consultar Clientes"}
              </span>
            </Nav.Link>
            <Nav.Link
              className="d-flex align-items-center mb-2"
              onClick={() => navigate("/rutinas")}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "1rem",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.55)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.55)";
              }}
            >
              <FaDumbbell className="me-2" />
              <span>Rutinas</span>
            </Nav.Link>
            <hr
              style={{
                borderColor: "rgba(255, 255, 255, 0.06)",
                margin: "16px 0",
              }}
            />
            <Nav.Link
              className="d-flex align-items-center mt-auto mb-3"
              onClick={handleLogout}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "1rem",
                fontWeight: 500,
                color: "rgba(248, 113, 113, 0.8)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(220, 38, 38, 0.15)";
                e.currentTarget.style.color = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(248, 113, 113, 0.8)";
              }}
            >
              <FaTimes className="me-2" />
              <span>Cerrar Sesión</span>
            </Nav.Link>
          </Nav>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );

  return (
    <Container
      fluid
      className="admin-layout min-vh-100 d-flex flex-column p-0"
      style={{
        background: isDarkMode ? "#0f172a" : "#cbd5e1",
        minHeight: "100vh",
      }}
    >
      <Row className="flex-grow-1 g-0">
        <Col
          xs={2}
          md={2}
          lg={2}
          className="admin-sidebar d-none d-lg-block p-0"
          style={{ minHeight: "100vh", background: "#0f172a" }}
        >
          {renderSidebar()}
        </Col>

        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          className="w-75"
          placement="start"
          style={{ background: "#1e293b" }}
        >
          <Offcanvas.Header
            closeButton
            closeVariant="white"
            style={{
              background: "transparent",
              borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
              color: "white",
            }}
          >
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">{renderSidebar()}</Offcanvas.Body>
        </Offcanvas>

        <Col xs={12} lg={10} className="p-0">
          <Navbar
            className="d-lg-none"
            style={{
              background: isDarkMode ? "rgba(15, 23, 42, 0.95)" : "#ffffff",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
              boxShadow: isDarkMode
                ? "0 1px 3px rgba(0,0,0,0.3)"
                : "0 1px 3px rgba(0,0,0,0.1)",
            }}
            variant={isDarkMode ? "dark" : "light"}
          >
            <Container fluid>
              <Button
                variant={isDarkMode ? "outline-light" : "outline-dark"}
                onClick={() => setShowSidebar(true)}
                className="me-2 border-0"
                style={{ borderRadius: "8px" }}
              >
                <FaBars />
              </Button>
              <Navbar.Brand
                className="fw-bold"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  fontSize: "1.5rem",
                  color: isDarkMode ? "#60a5fa" : "#2563eb",
                }}
              >
                HULK GYM
              </Navbar.Brand>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant={isDarkMode ? "outline-info" : "outline-primary"}
                  onClick={alternarTema}
                  size="sm"
                  style={{ borderRadius: "8px" }}
                >
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={handleLogout}
                  size="sm"
                  style={{ borderRadius: "8px" }}
                >
                  <FaTimes /> Salir
                </Button>
              </div>
            </Container>
          </Navbar>

          <div className="p-4" style={{ minHeight: "100vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="text-center mb-4" style={{ flexGrow: 1 }}>
                <h1
                  className={`${isMobile ? "h3" : "display-4"} fw-bold mb-2`}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: isDarkMode ? "#f1f5f9" : "#0f172a",
                  }}
                >
                  {userType === "cliente" && clienteLogueado
                    ? "MI ESTADO DE CUENTA"
                    : "GESTIÓN DE CLIENTES"}
                </h1>
                <p
                  className={`${isMobile ? "small" : "lead"} ${isDarkMode ? "text-light" : "text-muted"}`}
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                    fontWeight: 300,
                  }}
                >
                  {userType === "cliente" && clienteLogueado
                    ? `Bienvenido ${clienteLogueado.nombre}`
                    : "Busca y consulta el estado de las membresías"}
                </p>
              </div>
              <Button
                variant={isDarkMode ? "outline-light" : "outline-dark"}
                onClick={alternarTema}
                className="d-none d-md-flex align-items-center border-0"
                style={{ borderRadius: "8px" }}
              >
                {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
              </Button>
            </div>

            {userType === "cliente" && clienteLogueado && (
              <Row className="justify-content-center">
                <Col xs={12} lg={8} xl={6}>
                  <Card
                    style={{
                      borderRadius: "20px",
                      background: isDarkMode ? "#1e293b" : "#ffffff",
                      border: "none",
                      boxShadow: isDarkMode
                        ? "0 8px 32px rgba(0,0,0,0.5)"
                        : "0 4px 20px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        padding: "32px 28px 24px",
                        color: "#ffffff",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.15)",
                          border: "3px solid rgba(255,255,255,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          fontSize: "2rem",
                          fontWeight: 700,
                        }}
                      >
                        {clienteLogueado.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <h3
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          margin: "0 0 4px",
                        }}
                      >
                        {clienteLogueado.nombre}
                      </h3>
                      <p
                        style={{
                          margin: "0 0 16px",
                          opacity: 0.75,
                          color: "#EEEEEE",
                          fontSize: "1.07rem",
                          fontWeight: 500,
                        }}
                      >
                        DNI: {clienteLogueado.dni}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          background:
                            calcularEstado(clienteLogueado.vencimiento) ===
                            "Activo"
                              ? "#059669"
                              : "#dc2626",
                          color: "#fff",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          padding: "10px 28px",
                          borderRadius: "20px",
                        }}
                      >
                        {calcularEstado(clienteLogueado.vencimiento) ===
                        "Activo"
                          ? "✦ Membresía Activa"
                          : "✧ Membresía Expirada"}
                      </span>
                    </div>

                    <Card.Body className="p-4">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        <Row className="g-3">
                          <Col xs={6}>
                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "12px",
                                background: isDarkMode
                                  ? "rgba(255,255,255,0.03)"
                                  : "#DFDFDF",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.6875rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  color: "#758A93",
                                  marginBottom: "6px",
                                  fontWeight: 600,
                                }}
                              >
                                Inicio
                              </div>
                              <div
                                style={{
                                  fontSize: "0.9375rem",
                                  fontWeight: 700,
                                  color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                }}
                              >
                                {clienteLogueado.fechaInicio || "—"}
                              </div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "12px",
                                background: isDarkMode
                                  ? "rgba(255,255,255,0.03)"
                                  : "#DFDFDF",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.6875rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  color: "#758A93",
                                  marginBottom: "6px",
                                  fontWeight: 600,
                                }}
                              >
                                Vencimiento
                              </div>
                              <div
                                style={{
                                  fontSize: "0.9375rem",
                                  fontWeight: 700,
                                  color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                }}
                              >
                                {clienteLogueado.vencimiento || "—"}
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <div
                          style={{
                            padding: "14px",
                            borderRadius: "12px",
                            background: isDarkMode
                              ? "rgba(255,255,255,0.03)"
                              : "#DFDFDF",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.6875rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#758A93",
                              marginBottom: "6px",
                              fontWeight: 600,
                              textAlign: isMobile ? "center" : "left",
                            }}
                          >
                            Email
                          </div>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: isDarkMode ? "#e2e8f0" : "#334155",
                              textAlign: isMobile ? "center" : "left",
                            }}
                          >
                            {clienteLogueado.email || "No registrado"}
                          </div>
                        </div>

                        <Row className="g-3">
                          <Col xs={6}>
                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "12px",
                                background: isDarkMode
                                  ? "rgba(255,255,255,0.03)"
                                  : "#DFDFDF",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.6875rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  color: "#758A93",
                                  marginBottom: "6px",
                                  fontWeight: 600,
                                }}
                              >
                                Precio
                              </div>
                              <div
                                style={{
                                  fontSize: "1.125rem",
                                  fontWeight: 800,
                                  color: "#059669",
                                }}
                              >
                                $
                                {(
                                  Number(clienteLogueado.precio) || 0
                                ).toLocaleString()}
                              </div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "12px",
                                background: isDarkMode
                                  ? "rgba(255,255,255,0.03)"
                                  : "#DFDFDF",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.6875rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  color: isDarkMode ? "#64748b" : "#758A93",
                                  marginBottom: "6px",
                                  fontWeight: 600,
                                }}
                              >
                                Pago del Mes
                              </div>
                              <div
                                style={{
                                  fontSize: "0.9375rem",
                                  fontWeight: 700,
                                  color: clienteLogueado.pagoMesActual
                                    ? "#059669"
                                    : "#dc2626",
                                }}
                              >
                                {clienteLogueado.pagoMesActual
                                  ? "✓ Pagado"
                                  : "Pendiente"}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </Col>
      </Row>

      <Modal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{
            background: isDarkMode ? "#1e293b" : "#ffffff",
            borderBottom: isDarkMode
              ? "1px solid rgba(148, 163, 184, 0.08)"
              : "1px solid #e2e8f0",
            padding: "20px 24px",
          }}
        >
          <Modal.Title
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: isDarkMode ? "#f1f5f9" : "#0f172a",
            }}
          >
            <FaEnvelope className="me-2" style={{ color: "#2563eb" }} />
            Historial de Emails Enviados
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: isDarkMode ? "#0f172a" : "#cbd5e1",
            padding: "24px",
          }}
        >
          <Card
            className="mb-4"
            style={{
              background: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "#ffffff",
              borderRadius: "12px",
              border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.15)" : "#e2e8f0"}`,
            }}
          >
            <Card.Body className="p-3">
              <h6
                className="mb-3"
                style={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e2e8f0" : "#334155",
                }}
              >
                <FaCalendarAlt className="me-2" style={{ color: "#2563eb" }} />
                Filtrar por rango de fechas
              </h6>
              <Row className="align-items-end g-2">
                <Col xs={5} md={4}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: isDarkMode ? "#cbd5e1" : "#334155",
                      }}
                    >
                      Desde
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={filtroDesde}
                      onChange={(e) => setFiltroDesde(e.target.value)}
                      style={{
                        borderColor: isDarkMode
                          ? "rgba(148, 163, 184, 0.2)"
                          : "#cbd5e1",
                        background: isDarkMode
                          ? "rgba(30, 41, 59, 0.5)"
                          : "#ffffff",
                        color: isDarkMode ? "#e2e8f0" : "#0f172a",
                        fontSize: "0.875rem",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={5} md={4}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: isDarkMode ? "#cbd5e1" : "#334155",
                      }}
                    >
                      Hasta
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={filtroHasta}
                      onChange={(e) => setFiltroHasta(e.target.value)}
                      style={{
                        borderColor: isDarkMode
                          ? "rgba(148, 163, 184, 0.2)"
                          : "#cbd5e1",
                        background: isDarkMode
                          ? "rgba(30, 41, 59, 0.5)"
                          : "#ffffff",
                        color: isDarkMode ? "#e2e8f0" : "#0f172a",
                        fontSize: "0.875rem",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={2} md={4} className="d-flex align-items-end">
                  <Button
                    onClick={() => {
                      setFiltroDesde("");
                      setFiltroHasta("");
                    }}
                    style={{
                      borderRadius: "8px",
                      background: isDarkMode ? "transparent" : "#cbd5e1",
                      border: isDarkMode
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid #94a3b8",
                      color: isDarkMode ? "#94a3b8" : "#334155",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      padding: "6px 14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span className="d-none d-md-inline">Limpiar</span>
                    <FaTimes className="d-md-none" />
                  </Button>
                </Col>
              </Row>
              {(filtroDesde || filtroHasta) && (
                <Alert
                  variant="info"
                  className="mt-3 mb-0 py-2 d-flex align-items-center border-0"
                  style={{
                    background: isDarkMode
                      ? "rgba(8, 145, 178, 0.15)"
                      : "#e0f2fe",
                    color: isDarkMode ? "#67e8f9" : "#0369a1",
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                  }}
                >
                  <FaFilter className="me-2" />
                  Mostrando {emailsFiltrados.length} resultado/s
                </Alert>
              )}
            </Card.Body>
          </Card>

          {emailHistory.length === 0 ? (
            <div
              className="text-center py-5"
              style={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
            >
              <FaEnvelope size={48} className="mb-3" style={{ opacity: 0.3 }} />
              <p className="mb-0" style={{ fontSize: "0.9375rem" }}>
                No se han enviado emails aún
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {[...emailsFiltrados]
                .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))
                .map((email) => (
                  <Card
                    key={email.id}
                    className="mb-3"
                    style={{
                      background: isDarkMode ? "#1e293b" : "#ffffff",
                      border: "none",
                      borderRadius: "14px",
                      boxShadow: isDarkMode
                        ? "0 2px 8px rgba(0,0,0,0.3)"
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <Card.Body className="p-0">
                      <Row className="g-0">
                        <Col xs={12} md={7} className="p-3 pe-md-2">
                          <div className="d-flex align-items-start">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                              style={{
                                width: "46px",
                                height: "46px",
                                background:
                                  "linear-gradient(135deg, #3b82f6, #2563eb)",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                              }}
                            >
                              {email.clienteNombre?.charAt(0).toUpperCase() || (
                                <FaUser size={18} />
                              )}
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <h6
                                className="mb-2"
                                style={{
                                  fontWeight: 700,
                                  color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                  fontSize: "0.9375rem",
                                }}
                              >
                                {email.clienteNombre}
                              </h6>
                              <div
                                style={{
                                  fontSize: "0.8125rem",
                                  color: isDarkMode ? "#94a3b8" : "#64748b",
                                  lineHeight: "1.6",
                                }}
                              >
                                <div className="d-flex align-items-center mb-1">
                                  <span
                                    style={{
                                      width: "18px",
                                      textAlign: "center",
                                      marginRight: "8px",
                                      color: isDarkMode ? "#64748b" : "#94a3b8",
                                    }}
                                  >
                                    <FaUser style={{ fontSize: "0.625rem" }} />
                                  </span>
                                  <span>
                                    DNI:{" "}
                                    <strong
                                      style={{
                                        color: isDarkMode
                                          ? "#e2e8f0"
                                          : "#334155",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {email.clienteDNI}
                                    </strong>
                                  </span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <span
                                    style={{
                                      width: "18px",
                                      textAlign: "center",
                                      marginRight: "8px",
                                      color: isDarkMode ? "#64748b" : "#94a3b8",
                                    }}
                                  >
                                    <FaEnvelope
                                      style={{ fontSize: "0.625rem" }}
                                    />
                                  </span>
                                  <span className="text-truncate">
                                    {email.clienteEmail}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col
                          xs={12}
                          md={5}
                          style={{
                            background: isDarkMode
                              ? "rgba(15, 23, 42, 0.4)"
                              : "#e2e8f0",
                            borderLeft: isDarkMode
                              ? "1px solid rgba(148, 163, 184, 0.06)"
                              : "1px solid #cbd5e1",
                          }}
                        >
                          <div className="p-3 h-100 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  fontSize: "0.6875rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.03em",
                                  background:
                                    email.tipo === "vencimiento"
                                      ? "#dc2626"
                                      : "#d97706",
                                  color: "#ffffff",
                                }}
                              >
                                {email.tipo === "vencimiento" ? (
                                  <FaTimesCircle
                                    style={{ fontSize: "0.5625rem" }}
                                  />
                                ) : (
                                  <FaBell style={{ fontSize: "0.5625rem" }} />
                                )}
                                {email.tipo === "vencimiento"
                                  ? "Vencida"
                                  : "Recordatorio"}
                              </span>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  fontSize: "0.6875rem",
                                  fontWeight: 700,
                                  background:
                                    email.estado === "Enviado"
                                      ? "#059669"
                                      : email.estado === "Simulado"
                                        ? "#d97706"
                                        : "#dc2626",
                                  color: "#ffffff",
                                }}
                              >
                                {email.estado === "Enviado" ? (
                                  <>
                                    <FaCheckCircle
                                      style={{ fontSize: "0.5625rem" }}
                                    />
                                    Enviado
                                  </>
                                ) : email.estado === "Simulado" ? (
                                  <>
                                    <FaBell style={{ fontSize: "0.5625rem" }} />
                                    Simulado
                                  </>
                                ) : (
                                  <>
                                    <FaTimesCircle
                                      style={{ fontSize: "0.5625rem" }}
                                    />
                                    Error
                                  </>
                                )}
                              </span>
                            </div>
                            <small
                              style={{
                                fontSize: "0.6875rem",
                                color: isDarkMode ? "#64748b" : "#94a3b8",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <FaCalendarAlt
                                className="me-1"
                                style={{ fontSize: "0.5625rem" }}
                              />
                              {email.fechaEnvio}
                            </small>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer
          style={{
            background: isDarkMode ? "#0f172a" : "#cbd5e1",
            borderTop: "none",
            padding: "16px 24px",
          }}
        >
          <Button
            onClick={() => setShowEmailModal(false)}
            style={{
              borderRadius: "8px",
              background: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#334155",
              border: "none",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.875rem",
              padding: "10px 24px",
            }}
            onMouseEnter={(e) => {
              if (!isDarkMode) e.currentTarget.style.background = "#475569";
            }}
            onMouseLeave={(e) => {
              if (!isDarkMode) e.currentTarget.style.background = "#334155";
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PagePrincipal;
