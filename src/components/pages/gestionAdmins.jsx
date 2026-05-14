import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Spinner,
  Navbar,
  Nav,
  Offcanvas,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaEdit,
  FaTrash,
  FaUserShield,
  FaSave,
  FaTimes,
  FaUsers,
  FaDumbbell,
  FaMoon,
  FaSun,
  FaBars,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useTheme } from "./admin.jsx";
import Swal from "sweetalert2";
import axios from "axios";
import logo from "../../assets/logo-login.png";
import "../../styles/admin.css";
const API = import.meta.env.VITE_API_URL;

const GestionAdmins = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 992);

  const [showEditModal, setShowEditModal] = useState(false);
  const [adminEditando, setAdminEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [cuentasVencidas, setCuentasVencidas] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const token = localStorage.getItem("token");
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchEmailHistory = useCallback(async () => {
    setLoadingEmails(true);
    try {
      const res = await axios.get(`${API}/api/emails/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let history = [];
      if (Array.isArray(res.data)) history = res.data;
      else if (Array.isArray(res.data.historial)) history = res.data.historial;
      else if (Array.isArray(res.data.emails)) history = res.data.emails;
      setEmailHistory(history);
    } catch (error) {
      setEmailHistory([]);
      Swal.fire({
        icon: "error",
        title: "Error al cargar historial",
        text:
          error.response?.data?.mensaje ||
          "No se pudo obtener el historial de emails",
      });
    } finally {
      setLoadingEmails(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchCuentasVencidas = async () => {
      try {
        const res = await axios.get(`${API}/api/clientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hoy = new Date();
        const vencidas = res.data.filter((cliente) => {
          if (!cliente.vencimiento || !cliente.email?.trim()) return false;
          try {
            const [dia, mes, anio] = cliente.vencimiento.split("/");
            return new Date(`${anio}-${mes}-${dia}T23:59:59`) < hoy;
          } catch {
            return false;
          }
        });
        setCuentasVencidas(vencidas);
      } catch (err) {
        console.error("Error obteniendo cuentas vencidas:", err);
      }
    };
    fetchCuentasVencidas();
  }, []);

  const handleOpenEmailModal = useCallback(() => {
    setShowEmailModal(true);
    fetchEmailHistory();
  }, [fetchEmailHistory]);

  const handleEliminarEmail = useCallback(
    async (emailId) => {
      const result = await Swal.fire({
        title: "¿Eliminar registro?",
        text: "¿Estás seguro de que deseas eliminar este registro del historial?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API}/api/emails/${emailId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchEmailHistory();
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El registro ha sido eliminado del historial",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.mensaje ||
              "No se pudo eliminar el email del historial",
          });
        }
      }
    },
    [fetchEmailHistory, token],
  );

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

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los administradores",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEditar = (admin) => {
    setAdminEditando(admin);
    setFormData({
      nombre: admin.nombre || "",
      apellido: admin.apellido || "",
      email: admin.email || "",
      dni: admin.dni || "",
    });
    setShowEditModal(true);
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      await axios.put(`${API}/api/auth/admins/${adminEditando._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      fetchAdmins();
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "Administrador actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.mensaje || "Error al actualizar",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (admin) => {
    if (
      admin._id === usuarioLogueado?._id ||
      admin._id === usuarioLogueado?.id
    ) {
      Swal.fire({
        icon: "error",
        title: "No permitido",
        text: "No podés eliminarte a vos mismo",
      });
      return;
    }
    const result = await Swal.fire({
      title: "¿Eliminar administrador?",
      html: `¿Estás seguro de eliminar a <strong>${admin.nombre} ${admin.apellido}</strong>?<br/><small>Esta acción no se puede deshacer.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API}/api/auth/admins/${admin._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins();
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "Administrador eliminado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.mensaje || "Error al eliminar",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

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
              width: "150px",
              height: "auto",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              filter: "brightness(1.3)",
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
            Panel Administrativo
          </p>
          <Nav className="flex-column w-100">
            <Nav.Link
              className="d-flex align-items-center mb-2"
              onClick={() => navigate("/admin")}
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
              <FaUsers className="me-2" />
              <span>Gestión de Clientes</span>
            </Nav.Link>

            <Nav.Link
              className="d-flex align-items-center mb-2 text-white"
              style={{
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "rgba(37, 99, 235, 0.2)",
              }}
            >
              <FaUserShield className="me-2" />
              <span>Gestión de Admins</span>
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

            <Nav.Link
              className="d-flex align-items-center mb-2"
              style={{
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                color: "rgba(255, 255, 255, 0.55)",
              }}
              onClick={handleOpenEmailModal}
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
              <FaEnvelope className="me-2" />
              <span>Historial de Emails</span>
              {cuentasVencidas.length > 0 && (
                <Badge bg="danger" className="ms-2">
                  {cuentasVencidas.length}
                </Badge>
              )}
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
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="text-center" style={{ flexGrow: 1 }}>
                <h1
                  className={`${isMobile ? "h3" : "display-4"} fw-bold mb-2`}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: isDarkMode ? "#f1f5f9" : "#0f172a",
                  }}
                >
                  GESTIÓN DE ADMINISTRADORES
                </h1>
                <p
                  className={`${isMobile ? "small" : "lead"} ${isDarkMode ? "text-light" : "text-muted"}`}
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                    fontWeight: 300,
                  }}
                >
                  Administrá los permisos y cuentas del equipo
                </p>
              </div>
              <Button
                variant={isDarkMode ? "outline-light" : "outline-dark"}
                onClick={alternarTema}
                className="d-none d-md-flex align-items-center border-0 flex-shrink-0"
                style={{ borderRadius: "8px", marginTop: "4px" }}
              >
                {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
              </Button>
            </div>

            <Card
              style={{
                background: isDarkMode ? "#1e293b" : "#DFDFDF",
                border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0"}`,
                borderRadius: "16px",
                boxShadow: isDarkMode
                  ? "0 4px 16px rgba(0,0,0,0.4)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: "#2563eb" }} />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "18px",
                      background: isDarkMode
                        ? "rgba(37,99,235,0.1)"
                        : "rgba(37,99,235,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <FaUserShield
                      size={32}
                      style={{ color: "#2563eb", opacity: 0.5 }}
                    />
                  </div>
                  <h5
                    style={{
                      color: isDarkMode ? "#e2e8f0" : "#334155",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    Sin administradores
                  </h5>
                  <p
                    style={{
                      color: isDarkMode ? "#64748b" : "#94a3b8",
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    No se encontraron cuentas de administrador
                  </p>
                </div>
              ) : (
                <div style={{ padding: "8px" }}>
                  {admins.map((admin, i) => {
                    const esMismo =
                      admin._id?.toString() ===
                        usuarioLogueado?._id?.toString() ||
                      admin._id?.toString() === usuarioLogueado?.id?.toString();
                    return (
                      <div
                        key={admin._id}
                        className="gestion-admins-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "14px 16px",
                          marginTop: i === 0 ? "0" : "10px",
                          borderRadius: "12px",
                          marginBottom: "4px",
                          background: esMismo
                            ? isDarkMode
                              ? "rgba(37,99,235,0.12)"
                              : "#eff6ff"
                            : "transparent",
                          border: esMismo
                            ? `1px solid ${isDarkMode ? "rgba(37,99,235,0.25)" : "#79b3fa"}`
                            : "1px solid transparent",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!esMismo)
                            e.currentTarget.style.background = isDarkMode
                              ? "rgba(255,255,255,0.03)"
                              : "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!esMismo)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: esMismo
                              ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                              : "linear-gradient(135deg, #64748b, #475569)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "1.2rem",
                            flexShrink: 0,
                            boxShadow: esMismo
                              ? "0 4px 12px rgba(37,99,235,0.35)"
                              : "none",
                          }}
                        >
                          {admin.nombre?.charAt(0).toUpperCase()}
                        </div>

                        <div
                          className="gestion-admins-info"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              fontSize: "0.9375rem",
                              marginBottom: "2px",
                              gap: "8px",
                            }}
                          >
                            {admin.nombre} {admin.apellido}
                            {esMismo && (
                              <span
                                style={{
                                  fontSize: "0.625rem",
                                  fontWeight: 700,
                                  color: "#2563eb",
                                  background: isDarkMode
                                    ? "rgba(37,99,235,0.2)"
                                    : "#dbeafe",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  display: "inline-block",
                                  marginLeft: "8px",
                                }}
                              >
                                VOS
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8125rem",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            {admin.email} · DNI {admin.dni}
                          </div>
                        </div>

                        <div
                          className="acciones"
                          style={{ display: "flex", gap: "6px", flexShrink: 0 }}
                        >
                          <button
                            onClick={() => handleEditar(admin)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "8px",
                              border: "none",
                              background: isDarkMode
                                ? "rgba(37,99,235,0.12)"
                                : "rgba(37,99,235,0.06)",
                              color: "#2563eb",
                              cursor: "pointer",
                              fontWeight: 500,
                              fontSize: "0.8125rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#2563eb";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isDarkMode
                                ? "rgba(37,99,235,0.12)"
                                : "rgba(37,99,235,0.06)";
                              e.currentTarget.style.color = "#2563eb";
                            }}
                          >
                            <FaEdit size={12} /> Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(admin)}
                            disabled={esMismo}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "8px",
                              border: "none",
                              background: esMismo
                                ? "transparent"
                                : isDarkMode
                                  ? "rgba(220,38,38,0.12)"
                                  : "rgba(220,38,38,0.06)",
                              color: esMismo
                                ? isDarkMode
                                  ? "#475569"
                                  : "#cbd5e1"
                                : "#dc2626",
                              cursor: esMismo ? "not-allowed" : "pointer",
                              fontWeight: 500,
                              fontSize: "0.8125rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!esMismo) {
                                e.currentTarget.style.background = "#dc2626";
                                e.currentTarget.style.color = "#fff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!esMismo) {
                                e.currentTarget.style.background = isDarkMode
                                  ? "rgba(220,38,38,0.12)"
                                  : "rgba(220,38,38,0.06)";
                                e.currentTarget.style.color = "#dc2626";
                              }
                            }}
                          >
                            <FaTrash size={12} /> Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </Col>
      </Row>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            background: isDarkMode ? "#1e293b" : "#fff",
            borderBottom: isDarkMode
              ? "1px solid rgba(148,163,184,0.08)"
              : "1px solid #e2e8f0",
          }}
        >
          <Modal.Title
            style={{
              fontWeight: 700,
              fontSize: "1.125rem",
              color: isDarkMode ? "#f1f5f9" : "#0f172a",
            }}
          >
            <FaEdit className="me-2" style={{ color: "#2563eb" }} />
            Editar Administrador
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: isDarkMode ? "#0f172a" : "#fff",
            padding: "20px 24px",
          }}
        >
          <Form>
            <Row className="g-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                    }}
                  >
                    Nombre
                  </Form.Label>
                  <Form.Control
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    style={{
                      borderRadius: "8px",
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      border: `1px solid ${isDarkMode ? "rgba(148,163,184,0.15)" : "#e2e8f0"}`,
                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                    }}
                  >
                    Apellido
                  </Form.Label>
                  <Form.Control
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                    style={{
                      borderRadius: "8px",
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      border: `1px solid ${isDarkMode ? "rgba(148,163,184,0.15)" : "#e2e8f0"}`,
                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                    }}
                  >
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={{
                      borderRadius: "8px",
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      border: `1px solid ${isDarkMode ? "rgba(148,163,184,0.15)" : "#e2e8f0"}`,
                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                    }}
                  >
                    DNI
                  </Form.Label>
                  <Form.Control
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    style={{
                      borderRadius: "8px",
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      border: `1px solid ${isDarkMode ? "rgba(148,163,184,0.15)" : "#e2e8f0"}`,
                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer
          style={{
            background: isDarkMode ? "#0f172a" : "#fff",
            borderTop: isDarkMode
              ? "1px solid rgba(148,163,184,0.08)"
              : "1px solid #e2e8f0",
          }}
        >
          <Button
            onClick={() => setShowEditModal(false)}
            style={{
              background: isDarkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              border: isDarkMode
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid #e2e8f0",
              color: isDarkMode ? "#e2e8f0" : "#475569",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "0.8125rem",
            }}
          >
            <FaTimes className="me-1" /> Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={guardando}
            style={{
              background: "#2563eb",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.8125rem",
            }}
          >
            {guardando ? (
              <Spinner size="sm" className="me-1" />
            ) : (
              <FaSave className="me-1" />
            )}{" "}
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

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
            paddingBottom: "5px",
            boxShadow: isDarkMode ? "none" : "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Modal.Title
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: isDarkMode ? "#f1f5f9" : "#0f172a",
            }}
          >
            <FaEnvelope className="me-2 mb-2" style={{ color: "#2563eb" }} />
            Historial de Emails Enviados
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: isDarkMode ? "#0f172a" : "#cbd5e1",
            color: isDarkMode ? "white" : "#0f172a",
          }}
        >
          <p
            className="small mb-4"
            style={{
              color: isDarkMode ? "#94a3b8" : "#64748b",
            }}
          >
            Consultá el historial de notificaciones enviadas a los clientes
          </p>

          <Card
            className="mb-4"
            style={{
              background: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "#ffffff",
              borderRadius: "12px",
              boxShadow: isDarkMode ? "none" : "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Card.Body className="p-3">
              <h6
                className="mb-3"
                style={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e2e8f0" : "#475569",
                }}
              >
                <FaCalendarAlt
                  className="me-2 mb-2"
                  style={{ color: "#2563eb" }}
                />
                Filtrar por rango de fechas
              </h6>
              <Row className="align-items-end g-2">
                <Col xs={5} md={4}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: isDarkMode ? "#cbd5e1" : "#475569",
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
                        color: isDarkMode ? "#cbd5e1" : "#475569",
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
                      background: isDarkMode ? "transparent" : "#e2e8f0",
                      border: isDarkMode
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid #cbd5e1",
                      color: isDarkMode ? "#94a3b8" : "#475569",
                      fontWeight: 500,
                      fontSize: "0.8125rem",
                      padding: "6px 14px",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      if (isDarkMode) {
                        e.currentTarget.style.borderColor =
                          "rgba(255, 255, 255, 0.4)";
                        e.currentTarget.style.color = "#e2e8f0";
                      } else {
                        e.currentTarget.style.background = "#cbd5e1";
                        e.currentTarget.style.borderColor = "#94a3b8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isDarkMode) {
                        e.currentTarget.style.borderColor =
                          "rgba(255, 255, 255, 0.2)";
                        e.currentTarget.style.color = "#94a3b8";
                      } else {
                        e.currentTarget.style.background = "#e2e8f0";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                      }
                    }}
                  >
                    <span className="d-none d-md-inline">Limpiar filtros</span>
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
                      : "#ecfeff",
                    color: isDarkMode ? "#67e8f9" : "#0891b2",
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                  }}
                >
                  <FaFilter className="me-2" />
                  <span>
                    Mostrando emails
                    {filtroDesde &&
                      ` desde ${formatearFechaCorta(filtroDesde)}`}
                    {filtroHasta &&
                      ` hasta ${formatearFechaCorta(filtroHasta)}`}
                  </span>
                  <small className="ms-2" style={{ opacity: 0.7 }}>
                    ({emailsFiltrados.length} resultado/s)
                  </small>
                </Alert>
              )}
            </Card.Body>
          </Card>

          {loadingEmails ? (
            <div
              className="text-center py-5"
              style={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
            >
              <Spinner
                animation="border"
                className="mb-3"
                style={{ color: "#2563eb", opacity: 0.6 }}
              />
              <p className="mb-0" style={{ fontSize: "0.9375rem" }}>
                Cargando historial...
              </p>
            </div>
          ) : emailHistory.length === 0 ? (
            <div
              className="text-center py-5"
              style={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
            >
              <FaEnvelope size={48} className="mb-3" style={{ opacity: 0.3 }} />
              <p className="mb-0" style={{ fontSize: "0.9375rem" }}>
                No se han enviado emails aún
              </p>
              <small>Los emails enviados aparecerán aquí</small>
            </div>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {[...emailsFiltrados]
                .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))
                .map((email) => (
                  <Card
                    key={email._id}
                    className="mb-3"
                    style={{
                      background: isDarkMode ? "#1e293b" : "#ffffff",
                      border: "none",
                      borderRadius: "14px",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: isDarkMode
                        ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                        : "0 2px 8px rgba(0, 0, 0, 0.06)",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? "0 8px 24px rgba(0, 0, 0, 0.5)"
                        : "0 8px 24px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                        : "0 2px 8px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.transform = "translateY(0)";
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
                              {email.clienteNombre ? (
                                email.clienteNombre.charAt(0).toUpperCase()
                              ) : (
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
                                  letterSpacing: "-0.01em",
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
                        <Col xs={12} md={5}>
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
                                      : email.tipo === "activacion"
                                        ? isDarkMode
                                          ? "#164e63"
                                          : "#e0f2fe"
                                        : isDarkMode
                                          ? "#78350f"
                                          : "#fffbeb",
                                  color:
                                    email.tipo === "vencimiento"
                                      ? "#ffffff"
                                      : email.tipo === "activacion"
                                        ? isDarkMode
                                          ? "#67e8f9"
                                          : "#0369a1"
                                        : isDarkMode
                                          ? "#fcd34d"
                                          : "#92400e",
                                  border: `1.5px solid ${
                                    email.tipo === "vencimiento"
                                      ? "#dc2626"
                                      : email.tipo === "activacion"
                                        ? isDarkMode
                                          ? "#0e7490"
                                          : "#bae6fd"
                                        : isDarkMode
                                          ? "#92400e"
                                          : "#fde68a"
                                  }`,
                                }}
                              >
                                {email.tipo === "vencimiento" ? (
                                  <FaTimesCircle
                                    style={{ fontSize: "0.5625rem" }}
                                  />
                                ) : email.tipo === "activacion" ? (
                                  <FaEnvelope
                                    style={{ fontSize: "0.5625rem" }}
                                  />
                                ) : (
                                  <FaCalendarAlt
                                    style={{ fontSize: "0.5625rem" }}
                                  />
                                )}
                                {email.tipo === "vencimiento"
                                  ? "Vencida"
                                  : email.tipo === "activacion"
                                    ? "Activación"
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
                                  <FaCheckCircle
                                    style={{ fontSize: "0.5625rem" }}
                                  />
                                ) : email.estado === "Simulado" ? (
                                  <FaEnvelope
                                    style={{ fontSize: "0.5625rem" }}
                                  />
                                ) : (
                                  <FaTimesCircle
                                    style={{ fontSize: "0.5625rem" }}
                                  />
                                )}
                                {email.estado}
                              </span>
                            </div>
                            {email.error && (
                              <div
                                style={{
                                  background: isDarkMode
                                    ? "rgba(239, 68, 68, 0.08)"
                                    : "rgba(239, 68, 68, 0.04)",
                                  borderRadius: "8px",
                                  padding: "6px 10px",
                                  marginBottom: "8px",
                                }}
                              >
                                <small
                                  style={{
                                    color: isDarkMode ? "#fca5a5" : "#dc2626",
                                    fontSize: "0.6875rem",
                                  }}
                                >
                                  {email.error.substring(0, 60)}...
                                </small>
                              </div>
                            )}
                            <div className="d-flex justify-content-between align-items-center mt-auto">
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
                                {new Date(email.fechaEnvio).toLocaleString(
                                  "es-AR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </small>
                              <button
                                onClick={() => handleEliminarEmail(email._id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: isDarkMode ? "#94a3b8" : "#94a3b8",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#ef4444";
                                  e.currentTarget.style.background = isDarkMode
                                    ? "rgba(239, 68, 68, 0.1)"
                                    : "rgba(239, 68, 68, 0.06)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = isDarkMode
                                    ? "#94a3b8"
                                    : "#94a3b8";
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                                title="Eliminar registro"
                              >
                                <FaTrash size={10} /> Eliminar
                              </button>
                            </div>
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
            paddingTop: "0",
          }}
        >
          <Button
            onClick={() => setShowEmailModal(false)}
            style={{
              borderRadius: "8px",
              background: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#64748b",
              border: isDarkMode
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "none",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.875rem",
              padding: "10px 24px",
            }}
            onMouseEnter={(e) => {
              if (!isDarkMode) e.currentTarget.style.background = "#94a3b8";
            }}
            onMouseLeave={(e) => {
              if (!isDarkMode) e.currentTarget.style.background = "#64748b";
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionAdmins;
