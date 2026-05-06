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
} from "react-icons/fa";
import { useTheme } from "./admin.jsx";
const API = import.meta.env.VITE_API_URL;

const PagePrincipal = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();

  const [userType, setUserType] = useState(() =>
    localStorage.getItem("userType")
  );

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
  const [tokensActivacion, setTokensActivacion] = useState(() => {
    const savedTokens = localStorage.getItem("tokensActivacion");
    return savedTokens ? JSON.parse(savedTokens) : [];
  });

  useEffect(() => {
  const cargarDatosCliente = async () => {
    if (userType !== "cliente") return;

    try {
      const token = localStorage.getItem("token");

      if (!usuario || !usuario.email) {
        console.error("No hay usuario guardado en localStorage");
        return;
      }

      const res = await axios.get(
        `${API}/api/clientes/email/${usuario.email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
    const userEmail = localStorage.getItem("userEmail");

    if (!storedUserType) {
      navigate("/login");
    } else {
      setUserType(storedUserType);
    }
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

  const enviarEmail = async (cliente, tipo = "vencimiento") => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nuevoEmail = {
        id: Date.now(),
        clienteNombre: cliente.nombre,
        clienteDNI: cliente.dni,
        clienteEmail: cliente.email || `${cliente.dni}@gmail.com`,
        tipo: tipo,
        fechaEnvio: new Date().toLocaleString("es-AR"),
        estado: "Simulado",
        error: null,
        asunto:
          tipo === "vencimiento"
            ? "Membresía Vencida - HULK GYM"
            : "Recordatorio de Vencimiento - HULK GYM",
        metodo: "Simulación",
      };

      const nuevoHistorial = [...emailHistory, nuevoEmail];
      setEmailHistory(nuevoHistorial);
      localStorage.setItem("emailHistory", JSON.stringify(nuevoHistorial));

      return nuevoEmail;
    } catch (error) {
      console.error("❌ Error en envío de email:", error);

      const emailError = {
        id: Date.now(),
        clienteNombre: cliente.nombre,
        clienteDNI: cliente.dni,
        clienteEmail: cliente.email || `${cliente.dni}@gmail.com`,
        tipo: tipo,
        fechaEnvio: new Date().toLocaleString("es-AR"),
        estado: "Error",
        error: error.message,
        asunto:
          tipo === "vencimiento"
            ? "Membresía Vencida - HULK GYM"
            : "Recordatorio de Vencimiento - HULK GYM",
        metodo: "Error",
      };

      const nuevoHistorial = [...emailHistory, emailError];
      setEmailHistory(nuevoHistorial);
      localStorage.setItem("emailHistory", JSON.stringify(nuevoHistorial));

      return emailError;
    }
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

  const enviarNotificacionesMasivas = async () => {
    const vencidas = verificarCuentasVencidas();

    if (vencidas.length === 0) {
      alert("No hay cuentas vencidas para notificar.");
      return;
    }

    const confirmar = window.confirm(
      `📧 ¿Enviar notificaciones a ${vencidas.length} clientes con cuentas vencidas?\n\n⚠️ Esto es una simulación.`
    );

    if (!confirmar) return;

    alert("🚀 Iniciando envío de notificaciones...");

    setShowNotificationAlert(true);

    try {
      const clientesParaNotificar = [];
      const ahora = new Date();
      const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

      for (const cliente of vencidas) {
        const ultimoEmail = emailHistory
          .filter(
            (email) =>
              email.clienteDNI === cliente.dni &&
              (email.estado === "Enviado" || email.estado === "Simulado")
          )
          .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))[0];

        if (!ultimoEmail || new Date(ultimoEmail.fechaEnvio) < hace24h) {
          clientesParaNotificar.push(cliente);
        }
      }

      if (clientesParaNotificar.length === 0) {
        alert(
          "Todos los clientes ya fueron notificados en las últimas 24 horas."
        );
        setShowNotificationAlert(false);
        return;
      }

      let exitosos = 0;
      let errores = 0;

      for (let i = 0; i < clientesParaNotificar.length; i++) {
        const cliente = clientesParaNotificar[i];
        try {
          const resultado = await enviarEmail(cliente, "vencimiento");

          if (resultado.estado === "Simulado") {
            exitosos++;
          } else {
            errores++;
          }

          if (i < clientesParaNotificar.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error("❌ Error enviando a:", cliente.nombre, error);
          errores++;
        }
      }

      const mensaje = `🎉 PROCESO COMPLETADO:\n\n✅ ${exitosos} notificaciones enviadas\n❌ ${errores} errores`;

      alert(mensaje);
    } catch (error) {
      alert("❌ Error en el proceso. Ver consola para detalles.");
    }

    setTimeout(() => setShowNotificationAlert(false), 2000);
  };

  const reenviarEmailActivacion = useCallback(async (cliente) => {
    if (cliente.cuentaActivada) {
      alert("Esta cuenta ya está activada.");
      return;
    }

    try {
      const nuevoToken = Math.random().toString(36).substring(2, 15);
      const tokenData = {
        token: nuevoToken,
        clienteId: cliente.id,
        clienteDNI: cliente.dni,
        clienteEmail: cliente.email,
        fechaCreacion: new Date().toISOString(),
        usado: false,
        fechaExpiracion: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      setTokensActivacion((prev) =>
        prev.map((t) =>
          t.clienteId === cliente.id ? { ...t, usado: true } : t
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTokensActivacion((prev) => [...prev, tokenData]);
      alert(`Email de activación simulado enviado a ${cliente.email}`);
    } catch (error) {
      console.error("Error al reenviar email:", error);
      alert("Error al reenviar el email de activación.");
    }
  }, []);

  const renderSidebar = () => (
    <Navbar
      className="d-flex flex-column h-100"
      style={{
        background: isDarkMode
          ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
        borderRight: `1px solid ${
          isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
        }`,
      }}
    >
      <Container fluid className="d-flex flex-column h-100 p-0">
        <Navbar.Brand className="p-3 w-100">
          <h3
            className={`fw-bold text-center ${
              isDarkMode ? "text-success" : "text-primary"
            }`}
            style={{
              background: isDarkMode
                ? "linear-gradient(45deg, #60a5fa, #34d399)"
                : undefined,
              WebkitBackgroundClip: isDarkMode ? "text" : undefined,
              WebkitTextFillColor: isDarkMode ? "transparent" : undefined,
              color: isDarkMode ? undefined : "#222",
              fontFamily: '"Fjalla One", sans-serif',
            }}
          >
            HULK GYM
          </h3>
          <p
            className={`text-center small mb-4 ${
              isDarkMode ? "text-light opacity-75" : "text-muted"
            }`}
            style={{
              color: isDarkMode ? undefined : "#222",
              fontWeight: 500,
            }}
          >
            {userType === "cliente"
              ? "Panel de Cliente"
              : "Panel Administrativo"}
          </p>

          <Nav className="flex-column w-100">
            <Nav.Link
              className={`d-flex align-items-center mb-2 ${
                isDarkMode ? "text-info" : "text-primary"
              }`}
              style={{
                transition: "all 0.3s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                backgroundColor: isDarkMode
                  ? "rgba(13, 202, 240, 0.1)"
                  : "rgba(0, 123, 255, 0.1)",
              }}
              onClick={() =>
                navigate(userType === "admin" ? "/admin" : "/principal")
              }
            >
              <FaUsers className="me-2" />
              <span>
                {userType === "cliente"
                  ? "Mi Estado de Cuenta"
                  : "Consultar Clientes"}
              </span>
            </Nav.Link>

            <Nav.Link
              className={`d-flex align-items-center mb-2 ${
                isDarkMode ? "text-light" : "text-dark"
              }`}
              style={{
                transition: "all 0.3s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/rutinas")}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)";
                e.target.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.transform = "translateX(0)";
              }}
            >
              <FaDumbbell className="me-2" />
              <span>Rutinas</span>
            </Nav.Link>

            <hr
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.2)",
                margin: "20px 0",
              }}
            />

            <Nav.Link
              className="d-flex align-items-center text-danger mt-auto mb-3"
              onClick={handleLogout}
              style={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderRadius: "8px",
                padding: "12px 16px",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
                e.target.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.transform = "translateX(0)";
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
      className="d-flex flex-column p-0"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%)",
        minHeight: "100vh",
      }}
    >
      {showNotificationAlert && (
        <Alert
          variant="success"
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 9999, width: "auto" }}
        >
          <FaBell className="me-2" />
          Enviando notificaciones a cuentas vencidas...
        </Alert>
      )}

      <Modal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{
            background: isDarkMode
              ? "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)"
              : "linear-gradient(90deg, #ffffff 0%, #f8faff 100%)",
            color: isDarkMode ? "white" : "dark",
          }}
        >
          <Modal.Title>
            <FaHistory className="me-2" />
            Historial de Emails Enviados
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: isDarkMode
              ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
            color: isDarkMode ? "white" : "dark",
          }}
        >
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FaExclamationTriangle className="me-2 text-warning" />
                Cuentas Vencidas Actuales:{" "}
                <Badge bg="danger">{cuentasVencidas.length}</Badge>
              </h6>
              <Button
                variant="warning"
                size="sm"
                onClick={enviarNotificacionesMasivas}
                disabled={cuentasVencidas.length === 0}
              >
                <FaBell className="me-1" />
                Notificar Vencidas
              </Button>
            </Col>
          </Row>

          {emailHistory.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaEnvelope size={40} className="mb-2" />
              <p className="mb-0">No se han enviado emails aún</p>
            </Alert>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <ListGroup>
                {emailHistory
                  .sort(
                    (a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio)
                  )
                  .map((email) => (
                    <ListGroup.Item
                      key={email.id}
                      style={{
                        background: isDarkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(255,255,255,0.8)",
                        color: isDarkMode ? "white" : "dark",
                        border: `1px solid ${
                          isDarkMode
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.1)"
                        }`,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <FaUser className="me-2 text-primary" />
                            {email.clienteNombre}
                          </h6>
                          <p className="mb-1 small">
                            <FaIdCard className="me-1 text-muted" />
                            DNI: {email.clienteDNI}
                          </p>
                          <p className="mb-1 small">
                            <FaEnvelope className="me-1 text-muted" />
                            {email.clienteEmail}
                          </p>
                          <p className="mb-0 small text-muted">
                            <FaCalendarAlt className="me-1" />
                            {email.fechaEnvio}
                          </p>
                        </div>
                        <div className="text-end">
                          <Badge
                            bg={
                              email.tipo === "vencimiento"
                                ? "danger"
                                : "warning"
                            }
                            className="mb-2"
                          >
                            {email.tipo === "vencimiento"
                              ? "Vencida"
                              : "Recordatorio"}
                          </Badge>
                          <br />
                          <Badge
                            bg={
                              email.estado === "Enviado"
                                ? "success"
                                : email.estado === "Simulado"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {email.estado === "Enviado" ? (
                              <>
                                <FaCheckCircle className="me-1" />
                                Enviado
                              </>
                            ) : email.estado === "Simulado" ? (
                              <>
                                <FaBell className="me-1" />
                                Simulado
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="me-1" />
                                Error
                              </>
                            )}
                          </Badge>
                          {email.metodo && (
                            <div className="mt-1">
                              <small className="text-muted">
                                Método: {email.metodo}
                              </small>
                            </div>
                          )}
                          {email.error && (
                            <div className="mt-1">
                              <small className="text-muted" title={email.error}>
                                {email.error.substring(0, 30)}...
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer
          style={{
            background: isDarkMode
              ? "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)"
              : "linear-gradient(90deg, #ffffff 0%, #f8faff 100%)",
          }}
        >
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Row className="flex-grow-1 m-0" style={{ minHeight: "100vh" }}>
        <Col
          xs={2}
          md={2}
          lg={2}
          className="d-none d-md-block p-0"
          style={{
            backdropFilter: "blur(10px)",
            borderRight: `1px solid ${
              isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
            }`,
          }}
        >
          {renderSidebar()}
        </Col>

        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          className="w-75"
          style={{
            background: isDarkMode
              ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
            backdropFilter: "blur(15px)",
          }}
          placement="start"
        >
          <Offcanvas.Header
            closeButton
            style={{
              background: "transparent",
              borderBottom: `1px solid ${
                isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
              }`,
              color: isDarkMode ? "white" : "dark",
            }}
          >
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">{renderSidebar()}</Offcanvas.Body>
        </Offcanvas>

        <Col
          xs={12}
          md={10}
          lg={10}
          className="p-0 d-flex flex-column"
          style={{ minHeight: "100vh" }}
        >
          <Navbar
            className="d-md-none"
            style={{
              background: isDarkMode
                ? "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)"
                : "linear-gradient(90deg, #ffffff 0%, #f8faff 100%)",
              backdropFilter: "blur(10px)",
              borderBottom: `1px solid ${
                isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
              }`,
              boxShadow: isDarkMode
                ? "0 2px 20px rgba(0,0,0,0.3)"
                : "0 2px 20px rgba(0,0,0,0.1)",
            }}
            variant={isDarkMode ? "dark" : "light"}
          >
            <Container fluid>
              <Button
                variant={isDarkMode ? "outline-light" : "outline-dark"}
                onClick={() => setShowSidebar(true)}
                className="me-2 border-0"
                style={{
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                }}
              >
                <FaBars />
              </Button>
              <Navbar.Brand
                className="fw-bold"
                style={{
                  background: "linear-gradient(45deg, #28a745, #20c997)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "1.8rem",
                  fontFamily: '"Fjalla One", sans-serif',
                }}
              >
                HULK GYM
              </Navbar.Brand>

              <div className="d-flex align-items-center gap-2">
                <Button
                  variant={isDarkMode ? "outline-light" : "outline-dark"}
                  size="sm"
                  onClick={alternarTema}
                  className="d-none d-md-flex align-items-center border-0"
                  style={{
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(10px)",
                    boxShadow: isDarkMode
                      ? "0 4px 15px rgba(255,255,255,0.1)"
                      : "0 4px 15px rgba(0,0,0,0.1)",
                  }}
                >
                  {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
                </Button>
              </div>
            </Container>
          </Navbar>

          <Container
            fluid
            className="p-3 p-lg-5"
            style={{ minHeight: "100vh" }}
          >
            <Row className="mb-3 mb-lg-4">
              <Col className="d-flex justify-content-end">
                <Button
                  variant={isDarkMode ? "outline-light" : "outline-dark"}
                  size="sm"
                  onClick={alternarTema}
                  className="d-none d-md-flex align-items-center border-0"
                  style={{
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(10px)",
                    padding: "10px 20px",
                  }}
                >
                  {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
                </Button>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <div className="text-center mb-4 mb-lg-5">
                  <h1
                    className="fw-bold mb-2 mb-lg-3"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(45deg, #60a5fa, #34d399, #fbbf24)"
                        : "linear-gradient(45deg, #1e40af, #059669, #d97706)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: '"Fjalla One", sans-serif',
                      fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                    }}
                  >
                    {userType === "cliente" && clienteLogueado
                      ? "MI ESTADO DE CUENTA"
                      : "GESTIÓN DE CLIENTES"}
                  </h1>
                  <p
                    className={`mb-0 ${
                      isDarkMode ? "text-light opacity-75" : "text-muted"
                    }`}
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
                    }}
                  >
                    {userType === "cliente" && clienteLogueado
                      ? `Bienvenido ${clienteLogueado.nombre}`
                      : "Busca y consulta el estado de las membresías"}
                  </p>
                </div>
              </Col>

              {userType === "cliente" && clienteLogueado && (
                <Col xs={12} lg={10} xl={9} className="mx-auto mb-4">
                  <Card
                    className="border-0 shadow-lg overflow-hidden"
                    style={{
                      background: isDarkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.98)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "24px",
                    }}
                  >
                    <div
                      style={{
                        background: isDarkMode
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.02)",
                        padding: "3rem 2rem",
                        borderBottom: `1px solid ${
                          isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)"
                        }`,
                      }}
                    >
                      <Row className="align-items-center">
                        <Col xs={12} md={8}>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white shadow-lg"
                              style={{
                                width: "100px",
                                height: "100px",
                                fontWeight: 700,
                                fontSize: "2.5rem",
                              }}
                            >
                              {clienteLogueado.nombre ? (
                                clienteLogueado.nombre.charAt(0).toUpperCase()
                              ) : (
                                <FaUser />
                              )}
                            </div>
                            <div className="ms-4">
                              <h2
                                className={`${
                                  isDarkMode ? "text-light" : "text-dark"
                                } fw-bold mb-2`}
                                style={{
                                  fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                                }}
                              >
                                {clienteLogueado.nombre}
                              </h2>
                              <p
                                className={`${
                                  isDarkMode ? "text-light" : "text-muted"
                                } mb-0`}
                                style={{
                                  fontSize: "1.1rem",
                                }}
                              >
                                DNI: {clienteLogueado.dni}
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col
                          xs={12}
                          md={4}
                          className="text-md-end mt-3 mt-md-0"
                        >
                          {calcularEstado(clienteLogueado.vencimiento) ===
                          "Activo" ? (
                            <Badge
                              bg="success"
                              pill
                              className="px-4 py-3 shadow"
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                              }}
                            >
                              <FaCheckCircle className="me-2" size={18} />
                              Membresía Activa
                            </Badge>
                          ) : (
                            <Badge
                              bg="danger"
                              pill
                              className="px-4 py-3 shadow"
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                              }}
                            >
                              <FaTimesCircle className="me-2" size={18} />
                              Membresía Expirada
                            </Badge>
                          )}
                        </Col>
                      </Row>
                    </div>

                    <Card.Body className="p-4 p-lg-5">
                      <Row className="g-3 g-lg-4 mb-4">
                        <Col xs={12} md={6}>
                          <div
                            className={`h-100 p-4 rounded-4 ${
                              isDarkMode ? "bg-dark" : "bg-light"
                            }`}
                            style={{
                              transition: "all 0.3s ease",
                              border: isDarkMode
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-8px)";
                              e.currentTarget.style.boxShadow = isDarkMode
                                ? "0 12px 24px rgba(0,0,0,0.4)"
                                : "0 12px 24px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                <FaEnvelope className="text-info" size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">Email</p>
                                <h6
                                  className="mb-0 fw-bold text-truncate"
                                  style={{ fontSize: "0.95rem" }}
                                >
                                  {clienteLogueado.email || "No registrado"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} md={6}>
                          <div
                            className={`h-100 p-4 rounded-4 ${
                              isDarkMode ? "bg-dark" : "bg-light"
                            }`}
                            style={{
                              transition: "all 0.3s ease",
                              border: isDarkMode
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-8px)";
                              e.currentTarget.style.boxShadow = isDarkMode
                                ? "0 12px 24px rgba(0,0,0,0.4)"
                                : "0 12px 24px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                <FaCalendarAlt
                                  className="text-success"
                                  size={24}
                                />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">
                                  Fecha de Inicio
                                </p>
                                <h6 className="mb-0 fw-bold">
                                  {clienteLogueado.fechaInicio || "N/A"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} md={6}>
                          <div
                            className={`h-100 p-4 rounded-4 ${
                              isDarkMode ? "bg-dark" : "bg-light"
                            }`}
                            style={{
                              transition: "all 0.3s ease",
                              border: isDarkMode
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-8px)";
                              e.currentTarget.style.boxShadow = isDarkMode
                                ? "0 12px 24px rgba(0,0,0,0.4)"
                                : "0 12px 24px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                <FaCalendarAlt
                                  className="text-warning"
                                  size={24}
                                />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">
                                  Vencimiento
                                </p>
                                <h6 className="mb-0 fw-bold">
                                  {clienteLogueado.vencimiento || "N/A"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} md={6}>
                          <div
                            className={`h-100 p-4 rounded-4 ${
                              isDarkMode ? "bg-dark" : "bg-light"
                            }`}
                            style={{
                              transition: "all 0.3s ease",
                              border: isDarkMode
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-8px)";
                              e.currentTarget.style.boxShadow = isDarkMode
                                ? "0 12px 24px rgba(0,0,0,0.4)"
                                : "0 12px 24px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                <FaUserCheck className="text-info" size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">
                                  Estado de Cuenta
                                </p>
                                <h6 className="mb-0 fw-bold">
                                  {clienteLogueado.estadoCuenta || "Activo"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={12}>
                          <div
                            className={`h-100 p-4 rounded-4 ${
                              isDarkMode ? "bg-dark" : "bg-light"
                            }`}
                            style={{
                              transition: "all 0.3s ease",
                              border: isDarkMode
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-8px)";
                              e.currentTarget.style.boxShadow = isDarkMode
                                ? "0 12px 24px rgba(0,0,0,0.4)"
                                : "0 12px 24px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className={`rounded-circle ${(() => {
                                  if (!clienteLogueado.vencimiento)
                                    return "bg-secondary";
                                  try {
                                    const [dia, mes, anio] =
                                      clienteLogueado.vencimiento.split("/");
                                    const fechaVenc = new Date(
                                      anio,
                                      mes - 1,
                                      dia
                                    );
                                    const hoy = new Date();
                                    const diff = Math.ceil(
                                      (fechaVenc - hoy) / (1000 * 60 * 60 * 24)
                                    );
                                    if (diff > 7) return "bg-success";
                                    if (diff > 0) return "bg-warning";
                                    return "bg-danger";
                                  } catch {
                                    return "bg-secondary";
                                  }
                                })()} bg-opacity-10 p-3 me-3`}
                              >
                                <FaCalendarAlt
                                  className={(() => {
                                    if (!clienteLogueado.vencimiento)
                                      return "text-secondary";
                                    try {
                                      const [dia, mes, anio] =
                                        clienteLogueado.vencimiento.split("/");
                                      const fechaVenc = new Date(
                                        anio,
                                        mes - 1,
                                        dia
                                      );
                                      const hoy = new Date();
                                      const diff = Math.ceil(
                                        (fechaVenc - hoy) /
                                          (1000 * 60 * 60 * 24)
                                      );
                                      if (diff > 7) return "text-success";
                                      if (diff > 0) return "text-warning";
                                      return "text-danger";
                                    } catch {
                                      return "text-secondary";
                                    }
                                  })()}
                                  size={24}
                                />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">
                                  Días Restantes
                                </p>
                                <h6 className="mb-0 fw-bold">
                                  {(() => {
                                    if (!clienteLogueado.vencimiento)
                                      return "N/A";
                                    try {
                                      const [dia, mes, anio] =
                                        clienteLogueado.vencimiento.split("/");
                                      const fechaVenc = new Date(
                                        anio,
                                        mes - 1,
                                        dia
                                      );
                                      const hoy = new Date();
                                      const diff = Math.ceil(
                                        (fechaVenc - hoy) /
                                          (1000 * 60 * 60 * 24)
                                      );
                                      return diff > 0
                                        ? `${diff} días`
                                        : "Expirada";
                                    } catch {
                                      return "N/A";
                                    }
                                  })()}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Alert
                        variant={
                          calcularEstado(clienteLogueado.vencimiento) ===
                          "Activo"
                            ? "success"
                            : "danger"
                        }
                        className="mb-0 border-0 shadow-sm"
                        style={{
                          borderRadius: "16px",
                          background:
                            calcularEstado(clienteLogueado.vencimiento) ===
                            "Activo"
                              ? isDarkMode
                                ? "rgba(34, 197, 94, 0.1)"
                                : "rgba(34, 197, 94, 0.1)"
                              : isDarkMode
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                        }}
                      >
                        <div className="d-flex align-items-start">
                          {calcularEstado(clienteLogueado.vencimiento) ===
                          "Activo" ? (
                            <FaCheckCircle
                              size={28}
                              className="me-3 text-success flex-shrink-0"
                            />
                          ) : (
                            <FaTimesCircle
                              size={28}
                              className="me-3 text-danger flex-shrink-0"
                            />
                          )}
                          <div>
                            <h5 className="mb-2 fw-bold">
                              {calcularEstado(clienteLogueado.vencimiento) ===
                              "Activo"
                                ? "¡Tu membresía está activa!"
                                : "Tu membresía ha expirado"}
                            </h5>
                            <p className="mb-0">
                              {calcularEstado(clienteLogueado.vencimiento) ===
                              "Activo"
                                ? "Continúa disfrutando de todos nuestros servicios y mantente en forma. ¡Sigue así!"
                                : "Contacta al gimnasio para renovar tu membresía y seguir entrenando con nosotros."}
                            </p>
                          </div>
                        </div>
                      </Alert>
                    </Card.Body>
                  </Card>
                </Col>
             
              )}
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default PagePrincipal;
