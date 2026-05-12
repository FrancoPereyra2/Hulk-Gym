import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Card,
  Badge,
  Navbar,
  Nav,
  Offcanvas,
  Modal,
  Form,
  Alert,
  InputGroup,
} from "react-bootstrap";
import {
  FaUsers,
  FaDumbbell,
  FaTimes,
  FaBars,
  FaMoon,
  FaSun,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEnvelope,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./admin.jsx";
import Swal from "sweetalert2";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../../assets/logo-login.png";
import "../../styles/admin.css";
import "../../styles/rutinas.css";
const API = import.meta.env.VITE_API_URL;

const capitalizarPrimeraLetra = (texto) => {
  if (!texto) return "";
  return texto
    .split(" ")
    .map(
      (palabra) =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase(),
    )
    .join(" ");
};

const Rutinas = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const detalleRef = useRef(null);

  const [userType, setUserType] = useState(() =>
    localStorage.getItem("userType"),
  );
  const isReadOnly = userType === "cliente";

  const [showModalNuevaRutina, setShowModalNuevaRutina] = useState(false);
  const [showModalEditarRutina, setShowModalEditarRutina] = useState(false);

  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formDataRutina, setFormDataRutina] = useState({
    nombre: "",
    ejercicios: [],
  });
  const [formDataEjercicio, setFormDataEjercicio] = useState({
    ejercicio: "",
    series: "",
    repeticiones: "",
  });
  const [formDataEdicion, setFormDataEdicion] = useState({
    id: null,
    nombre: "",
    ejercicios: [],
  });
  const [formDataEjercicioEdicion, setFormDataEjercicioEdicion] = useState({
    ejercicio: "",
    series: "",
    repeticiones: "",
  });
  const [ejercicioEnEdicion, setEjercicioEnEdicion] = useState(null);
  const [indexEjercicioEdicion, setIndexEjercicioEdicion] = useState(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [cuentasVencidas, setCuentasVencidas] = useState([]);

  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  const formatearFechaCorta = useCallback((fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }, []);

  const emailsFiltrados = useMemo(() => {
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
  }, [emailHistory, filtroDesde, filtroHasta]);

  const verificarCuentasVencidas = useCallback(() => {
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    const hoy = new Date();
    const vencidas = clientes.filter((cliente) => {
      if (!cliente.vencimiento || !cliente.email || cliente.email.trim() === "")
        return false;
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
        return fechaVencimiento < hoy;
      } catch (error) {
        return false;
      }
    });
    setCuentasVencidas(vencidas);
    return vencidas;
  }, []);

  useEffect(() => {
    verificarCuentasVencidas();
  }, [verificarCuentasVencidas]);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/rutinas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRutinas(res.data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al cargar rutinas",
          text:
            error.response?.data?.mensaje ||
            "No se pudieron cargar las rutinas",
        });
      }
    };
    fetchRutinas();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    const userEmail = localStorage.getItem("userEmail");

    if (!storedUserType) {
      navigate("/login");
      return;
    }

    setUserType(storedUserType);

    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const currentUser = users.find((u) => u.username === userEmail);
      if (!currentUser) {
        localStorage.removeItem("userType");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleAgregarRutina = () => {
    setFormDataRutina({ nombre: "", ejercicios: [] });
    setShowModalNuevaRutina(true);
  };

  const handleFormRutinaChange = (e) => {
    const { name, value } = e.target;
    setFormDataRutina((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormEjercicioChange = (e) => {
    const { name, value } = e.target;
    setFormDataEjercicio((prev) => ({ ...prev, [name]: value }));
  };

  const agregarEjercicio = () => {
    if (!formDataEjercicio.ejercicio.trim()) return;
    const nuevo = {
      ejercicio: capitalizarPrimeraLetra(formDataEjercicio.ejercicio.trim()),
      series: parseInt(formDataEjercicio.series) || 0,
      repeticiones: parseInt(formDataEjercicio.repeticiones) || 0,
    };
    setFormDataRutina((prev) => ({
      ...prev,
      ejercicios: [...prev.ejercicios, nuevo],
    }));
    setFormDataEjercicio({ ejercicio: "", series: "", repeticiones: "" });
  };

  const eliminarEjercicio = (index) => {
    setFormDataRutina((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((_, i) => i !== index),
    }));
  };

  const guardarNuevaRutina = async () => {
    if (!formDataRutina.nombre.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const ejercicios = formDataRutina.ejercicios.map((ej) => ({
        nombre: ej.ejercicio,
        series: Number(ej.series),
        repeticiones: Number(ej.repeticiones),
      }));
      const res = await axios.post(
        `${API}/api/rutinas`,
        {
          nombre: capitalizarPrimeraLetra(formDataRutina.nombre.trim()),
          ejercicios,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRutinas((prev) => [...prev, res.data.rutina]);
      setShowModalNuevaRutina(false);
      Swal.fire({ icon: "success", title: "Rutina creada" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al crear rutina",
        text: error.response?.data?.mensaje || "No se pudo crear la rutina",
      });
    }
  };

  const handleEditarRutina = (id) => {
    const rutina = rutinas.find((r) => r._id === id || r.id === id);
    if (!rutina) return;
    setFormDataEdicion({
      id: rutina._id || rutina.id,
      nombre: rutina.nombre,
      ejercicios: rutina.ejercicios.map((ej) => ({
        ejercicio: ej.nombre || ej.ejercicio,
        series: ej.series,
        repeticiones: ej.repeticiones,
      })),
    });
    setShowModalEditarRutina(true);
  };

  const handleFormEdicionChange = (e) => {
    const { name, value } = e.target;
    setFormDataEdicion((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormEjercicioEdicionChange = (e) => {
    const { name, value } = e.target;
    setFormDataEjercicioEdicion((prev) => ({ ...prev, [name]: value }));
  };

  const agregarEjercicioEdicion = () => {
    if (!formDataEjercicioEdicion.ejercicio.trim()) return;
    const nuevo = {
      ejercicio: capitalizarPrimeraLetra(
        formDataEjercicioEdicion.ejercicio.trim(),
      ),
      series: parseInt(formDataEjercicioEdicion.series) || 0,
      repeticiones: parseInt(formDataEjercicioEdicion.repeticiones) || 0,
    };
    setFormDataEdicion((prev) => ({
      ...prev,
      ejercicios: [...prev.ejercicios, nuevo],
    }));
    setFormDataEjercicioEdicion({
      ejercicio: "",
      series: "",
      repeticiones: "",
    });
  };

  const eliminarEjercicioEdicion = async (index) => {
    const result = await Swal.fire({
      title: "¿Eliminar ejercicio?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      setFormDataEdicion((prev) => ({
        ...prev,
        ejercicios: prev.ejercicios.filter((_, i) => i !== index),
      }));
    }
  };

  const guardarEdicionRutina = async () => {
    if (!formDataEdicion.nombre.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const ejercicios = formDataEdicion.ejercicios.map((ej) => ({
        nombre: ej.ejercicio,
        series: Number(ej.series),
        repeticiones: Number(ej.repeticiones),
      }));
      const res = await axios.put(
        `${API}/api/rutinas/${formDataEdicion.id}`,
        {
          nombre: capitalizarPrimeraLetra(formDataEdicion.nombre.trim()),
          ejercicios,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRutinas((prev) =>
        prev.map((r) =>
          (r._id || r.id) === formDataEdicion.id ? res.data.rutina : r,
        ),
      );
      if (
        rutinaSeleccionada &&
        (rutinaSeleccionada._id || rutinaSeleccionada.id) === formDataEdicion.id
      ) {
        setRutinaSeleccionada(res.data.rutina);
      }
      setShowModalEditarRutina(false);
      setModoEdicion(false);
      Swal.fire({ icon: "success", title: "Rutina actualizada" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar rutina",
        text:
          error.response?.data?.mensaje || "No se pudo actualizar la rutina",
      });
    }
  };

  const handleCancelarEdicion = () => {
    const start = window.scrollY;
    setModoEdicion(false);
    const duration = 1200;
    const startTime = performance.now();
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start * (1 - easeInOut(progress)));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setRutinaSeleccionada(null);
      }
    };
    requestAnimationFrame(step);
  };

  const abrirModalEliminar = async (rutina, e) => {
    if (e) e.stopPropagation();
    const result = await Swal.fire({
      title: "¿Eliminar rutina?",
      html: `¿Estás seguro que querés eliminar <strong>"${rutina.nombre}"</strong>?<br/><small>Esta acción no se puede deshacer.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/rutinas/${rutina._id || rutina.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRutinas((prev) =>
        prev.filter((r) => (r._id || r.id) !== (rutina._id || rutina.id)),
      );
      if (
        rutinaSeleccionada &&
        (rutinaSeleccionada._id || rutinaSeleccionada.id) ===
          (rutina._id || rutina.id)
      ) {
        setRutinaSeleccionada(null);
      }
      Swal.fire({ icon: "success", title: "Rutina eliminada" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar rutina",
        text: error.response?.data?.mensaje || "No se pudo eliminar la rutina",
      });
    }
  };

  const handleSeleccionarRutina = (rutina) => {
    setRutinaSeleccionada(rutina);
    setModoEdicion(false);
    setTimeout(() => {
      const el = detalleRef.current;
      if (!el) return;
      const start = window.scrollY;
      const end = el.getBoundingClientRect().top + window.scrollY;
      const duration = 1500;
      const startTime = performance.now();
      const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start + (end - start) * easeInOut(progress));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0);
  };

  const iniciarEdicionEjercicio = (ejercicio, index) => {
    setEjercicioEnEdicion(ejercicio);
    setIndexEjercicioEdicion(index);
    setFormDataEjercicioEdicion({
      ejercicio: ejercicio.ejercicio,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
    });
  };

  const guardarEjercicioEditado = () => {
    if (!formDataEjercicioEdicion.ejercicio.trim()) return;
    const ejerciciosActualizados = formDataEdicion.ejercicios.map((ej, idx) => {
      if (idx === indexEjercicioEdicion) {
        return {
          ejercicio: capitalizarPrimeraLetra(
            formDataEjercicioEdicion.ejercicio.trim(),
          ),
          series: parseInt(formDataEjercicioEdicion.series) || 0,
          repeticiones: parseInt(formDataEjercicioEdicion.repeticiones) || 0,
        };
      }
      return ej;
    });
    setFormDataEdicion((prev) => ({
      ...prev,
      ejercicios: ejerciciosActualizados,
    }));
    cancelarEdicionEjercicio();
  };

  const cancelarEdicionEjercicio = () => {
    setEjercicioEnEdicion(null);
    setIndexEjercicioEdicion(null);
    setFormDataEjercicioEdicion({
      ejercicio: "",
      series: "",
      repeticiones: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const fetchEmailHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setEmailHistory([]);
        Swal.fire({
          icon: "error",
          title: "No autenticado",
          text: "Debes iniciar sesión para ver el historial de emails.",
        });
        return;
      }
      const res = await axios.get(`${API}/api/emails/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let history = [];
      if (Array.isArray(res.data)) {
        history = res.data;
      } else if (Array.isArray(res.data.historial)) {
        history = res.data.historial;
      } else if (Array.isArray(res.data.emails)) {
        history = res.data.emails;
      }
      setEmailHistory(history);
    } catch (error) {
      setEmailHistory([]);
      let mensaje = "No se pudo obtener el historial de emails";
      if (error.response && error.response.status === 403) {
        mensaje =
          "No tienes permisos para ver el historial de emails. Vuelve a iniciar sesión.";
      }
      Swal.fire({
        icon: "error",
        title: "Error al cargar historial",
        text: error.response?.data?.mensaje || mensaje,
      });
    }
  }, []);

  const handleEliminarEmail = useCallback(
    async (emailId) => {
      Swal.fire({
        title: "¿Eliminar registro?",
        text: "¿Estás seguro de que deseas eliminar este registro del historial?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem("token");
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
      });
    },
    [fetchEmailHistory],
  );

  const handleOpenEmailModal = useCallback(() => {
    setShowEmailModal(true);
    fetchEmailHistory();
  }, [fetchEmailHistory]);

  const renderSidebar = () => (
    <Navbar
      className="d-flex flex-column h-100"
      style={{
        background: "#1e293b",
        borderRight: "none",
      }}
    >
      <Container fluid className="d-flex flex-column h-100 p-0">
        <Navbar.Brand className="p-3 w-100 text-center">
          <img
            src={logo}
            alt="HULK GYM"
            style={{
              width: "130px",
              height: "auto",
              marginBottom: "16px",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              filter: "brightness(1.6) contrast(1.05)",
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
            {isReadOnly ? "Panel de Cliente" : "Panel Administrativo"}
          </p>

          <Nav className="flex-column w-100">
            <Nav.Link
              className="d-flex align-items-center mb-2"
              onClick={() =>
                navigate(userType === "admin" ? "/admin" : "/principal")
              }
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "10px 14px",
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
              <span>
                {isReadOnly ? "Mi Información" : "Gestión de Clientes"}
              </span>
            </Nav.Link>

            <Nav.Link
              className="d-flex align-items-center mb-2"
              style={{
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "rgba(37, 99, 235, 0.2)",
              }}
              onClick={() => navigate("/rutinas")}
            >
              <FaDumbbell className="me-2" />
              <span>Rutinas</span>
            </Nav.Link>

            {!isReadOnly && (
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
            )}

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
                padding: "10px 14px",
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
      className="rutinas-layout d-flex flex-column p-0"
      style={{ minHeight: "100vh" }}
    >
      <Row className="flex-grow-1 g-0">
        <Col
          xs={2}
          md={2}
          lg={2}
          className="admin-sidebar d-none d-md-block p-0"
          style={{ minHeight: "100vh" }}
        >
          {renderSidebar()}
        </Col>

        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          className="w-75"
          placement="start"
          style={{
            background: isDarkMode ? "#1e293b" : "#ffffff",
          }}
        >
          <Offcanvas.Header
            closeButton
            style={{
              background: "transparent",
              borderBottom: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
              color: isDarkMode ? "white" : "dark",
            }}
          >
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">{renderSidebar()}</Offcanvas.Body>
        </Offcanvas>

        <Col xs={12} md={10} lg={10} className="p-0">
          <Navbar
            className="d-md-none navbar-mobile"
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
                  RUTINAS
                </h1>
                <p
                  className={`${isMobile ? "small" : "lead"} ${isDarkMode ? "text-light" : "text-muted"}`}
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                    fontWeight: 300,
                  }}
                >
                  {isReadOnly
                    ? "Consulta las rutinas de entrenamiento disponibles"
                    : "Gestiona y crea rutinas de entrenamiento"}
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

            {!isReadOnly && (
              <div className="d-flex justify-content-end mb-4">
                {!isMobile && (
                  <Button
                    onClick={handleAgregarRutina}
                    className="d-flex align-items-center px-4 py-2"
                    style={{
                      borderRadius: "8px",
                      background: "#2563eb",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      boxShadow: "0 1px 3px rgba(37, 99, 235, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#1d4ed8";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(37, 99, 235, 0.4)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#2563eb";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(37, 99, 235, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FaPlus className="me-2" />
                    Nueva Rutina
                  </Button>
                )}
              </div>
            )}

            <Row xs={1} md={2} lg={3} className="g-4">
              {rutinas.length > 0 ? (
                rutinas.map((rutina, index) => (
                  <Col key={rutina._id || rutina.id || `rutina-${index}`}>
                    <Card
                      className="h-100 border-0"
                      onClick={() => handleSeleccionarRutina(rutina)}
                      style={{
                        cursor: "pointer",
                        background: isDarkMode ? "#1e293b" : "#e4e4e4",
                        borderRadius: "16px",
                        border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0"}`,
                        boxShadow: isDarkMode
                          ? "0 2px 8px rgba(0,0,0,0.3)"
                          : "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.2s ease",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = isDarkMode
                          ? "0 8px 24px rgba(0,0,0,0.5)"
                          : "0 8px 24px rgba(0,0,0,0.08)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = isDarkMode
                          ? "0 2px 8px rgba(0,0,0,0.3)"
                          : "0 2px 8px rgba(0,0,0,0.04)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <Card.Body className="p-0">
                        <div
                          style={{
                            padding: "20px 20px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "14px",
                              background:
                                "linear-gradient(135deg, #3b82f6, #2563eb)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                            }}
                          >
                            <FaDumbbell size={22} color="#ffffff" />
                          </div>
                          <div className="min-w-0">
                            <h6
                              style={{
                                fontWeight: 700,
                                fontSize: "1.125rem",
                                color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                margin: 0,
                              }}
                            >
                              {rutina.nombre}
                            </h6>
                            <div
                              style={{
                                fontSize: "0.8125rem",
                                color: isDarkMode ? "#64748b" : "#94a3b8",
                                marginTop: "3px",
                              }}
                            >
                              {rutina.ejercicios?.length || 0} ejercicios
                            </div>
                          </div>
                        </div>

                        <div style={{ padding: "0 20px 20px" }}>
                          {rutina.ejercicios && rutina.ejercicios.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {rutina.ejercicios.map((ejercicio, idx) => (
                                <div
                                  key={`${rutina._id || rutina.id}-ej-${idx}`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    background: isDarkMode
                                      ? "rgba(255,255,255,0.03)"
                                      : "#DFDFDF",
                                    border: `1px solid ${isDarkMode ? "rgba(148,163,184,0.05)" : "#e2e8f0"}`,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                      minWidth: 0,
                                      flex: 1,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.8125rem",
                                        fontWeight: 700,
                                        color: "#2563eb",
                                        background: isDarkMode
                                          ? "rgba(37,99,235,0.15)"
                                          : "rgba(37,99,235,0.08)",
                                        width: "26px",
                                        height: "26px",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {idx + 1}
                                    </span>
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        fontSize: "0.9375rem",
                                        color: isDarkMode
                                          ? "#e2e8f0"
                                          : "#334155",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {ejercicio.nombre || ejercicio.ejercicio}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flexShrink: 0,
                                      marginLeft: "16px",
                                    }}
                                  >
                                    <div style={{ textAlign: "center" }}>
                                      <div
                                        style={{
                                          fontWeight: 700,
                                          fontSize: "1.0625rem",
                                          color: isDarkMode
                                            ? "#f1f5f9"
                                            : "#0f172a",
                                          lineHeight: 1,
                                        }}
                                      >
                                        {ejercicio.series}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.6875rem",
                                          color: isDarkMode
                                            ? "#64748b"
                                            : "#94a3b8",
                                        }}
                                      >
                                        series
                                      </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                      <div
                                        style={{
                                          fontWeight: 700,
                                          fontSize: "1.0625rem",
                                          color: isDarkMode
                                            ? "#f1f5f9"
                                            : "#0f172a",
                                          lineHeight: 1,
                                        }}
                                      >
                                        {ejercicio.repeticiones}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.6875rem",
                                          color: isDarkMode
                                            ? "#64748b"
                                            : "#94a3b8",
                                        }}
                                      >
                                        reps
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              style={{ textAlign: "center", padding: "24px 0" }}
                            >
                              <FaDumbbell
                                size={32}
                                style={{
                                  color: isDarkMode ? "#475569" : "#cbd5e1",
                                  marginBottom: "10px",
                                  opacity: 0.5,
                                }}
                              />
                              <p
                                style={{
                                  color: isDarkMode ? "#64748b" : "#94a3b8",
                                  fontSize: "0.875rem",
                                  margin: 0,
                                }}
                              >
                                Sin ejercicios aún
                              </p>
                            </div>
                          )}
                        </div>
                      </Card.Body>

                      {!isReadOnly && (
                        <Card.Footer
                          style={{
                            background: "transparent",
                            borderTop: ` ${isDarkMode ? "rgba(148, 163, 184, 0.06)" : "#f1f5f9"}`,
                            padding: "10px 20px",
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditarRutina(rutina.id || rutina._id);
                              }}
                              style={{
                                padding: "6px 8px",
                                cursor: "pointer",
                                borderRadius: "6px",
                                color: isDarkMode ? "#64748b" : "#94a3b8",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#2563eb";
                                e.currentTarget.style.background = isDarkMode
                                  ? "rgba(37,99,235,0.1)"
                                  : "rgba(37,99,235,0.06)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = isDarkMode
                                  ? "#64748b"
                                  : "#94a3b8";
                                e.currentTarget.style.background =
                                  "transparent";
                              }}
                            >
                              <FaEdit size={14} /> Editar
                            </span>
                            <span
                              onClick={(e) => abrirModalEliminar(rutina, e)}
                              style={{
                                padding: "6px 8px",
                                cursor: "pointer",
                                borderRadius: "6px",
                                color: isDarkMode ? "#64748b" : "#94a3b8",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#dc2626";
                                e.currentTarget.style.background = isDarkMode
                                  ? "rgba(239,68,68,0.1)"
                                  : "rgba(239,68,68,0.06)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = isDarkMode
                                  ? "#64748b"
                                  : "#94a3b8";
                                e.currentTarget.style.background =
                                  "transparent";
                              }}
                            >
                              <FaTrash size={14} /> Eliminar
                            </span>
                          </div>
                        </Card.Footer>
                      )}
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <Card
                    style={{
                      textAlign: "center",
                      padding: "64px 24px",
                      background: isDarkMode ? "#1e293b" : "#ffffff",
                      borderRadius: "16px",
                      border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0"}`,
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "18px",
                        background: isDarkMode
                          ? "rgba(37,99,235,0.12)"
                          : "rgba(37,99,235,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                      }}
                    >
                      <FaDumbbell
                        size={32}
                        style={{ color: "#2563eb", opacity: 0.5 }}
                      />
                    </div>
                    <h5
                      style={{
                        color: isDarkMode ? "#e2e8f0" : "#334155",
                        fontWeight: 600,
                        fontSize: "1.125rem",
                      }}
                    >
                      No hay rutinas
                    </h5>
                    <p
                      style={{
                        color: isDarkMode ? "#64748b" : "#94a3b8",
                        fontSize: "0.9375rem",
                        margin: 0,
                      }}
                    >
                      {isReadOnly
                        ? "No tenés rutinas asignadas"
                        : "Creá una desde Nueva Rutina"}
                    </p>
                  </Card>
                </Col>
              )}
            </Row>

            {!isReadOnly && (
              <div className="position-fixed bottom-0 end-0 mb-4 me-4 d-md-none">
                <Button
                  onClick={handleAgregarRutina}
                  className="btn-floating rounded-circle shadow-lg border-0 d-flex align-items-center justify-content-center"
                >
                  <FaPlus size={24} />
                </Button>
              </div>
            )}

            {rutinaSeleccionada && (
              <Row className="mt-5" ref={detalleRef}>
                <Col>
                  <Card
                    style={{
                      borderRadius: "16px",
                      background: isDarkMode ? "#1e293b" : "#e4e4e4",
                      border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
                      boxShadow: isDarkMode
                        ? "0 4px 16px rgba(0,0,0,0.4)"
                        : "0 4px 16px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "24px 24px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "16px",
                          background:
                            "linear-gradient(135deg, #3b82f6, #2563eb)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                        }}
                      >
                        <FaDumbbell size={26} color="#ffffff" />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 700,
                            color: isDarkMode ? "#f1f5f9" : "#0f172a",
                            fontSize: "1.5rem",
                            margin: 0,
                          }}
                        >
                          {rutinaSeleccionada.nombre}
                        </h3>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: isDarkMode ? "#64748b" : "#94a3b8",
                          }}
                        >
                          {rutinaSeleccionada.ejercicios?.length || 0}{" "}
                          ejercicios
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: "20px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "16px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: isDarkMode ? "#e2e8f0" : "#475569",
                          }}
                        >
                          Ejercicios
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: isDarkMode
                              ? "rgba(148,163,184,0.1)"
                              : "#e2e8f0",
                          }}
                        />
                      </div>

                      {rutinaSeleccionada.ejercicios &&
                      rutinaSeleccionada.ejercicios.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {rutinaSeleccionada.ejercicios.map((ejercicio, i) => (
                            <div
                              key={`sel-${rutinaSeleccionada._id || rutinaSeleccionada.id}-${i}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 18px",
                                borderRadius: "10px",
                                background: isDarkMode
                                  ? "rgba(255,255,255,0.03)"
                                  : "#DFDFDF",
                                border: `1px solid ${isDarkMode ? "rgba(148,163,184,0.05)" : "#e2e8f0"}`,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "14px",
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 700,
                                    color: "#2563eb",
                                    background: isDarkMode
                                      ? "rgba(37,99,235,0.15)"
                                      : "rgba(37,99,235,0.08)",
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                  }}
                                >
                                  {ejercicio.nombre || ejercicio.ejercicio}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  flexShrink: 0,
                                  marginLeft: "20px",
                                }}
                              >
                                <div style={{ textAlign: "center" }}>
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      fontSize: "1.125rem",
                                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {ejercicio.series}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: isDarkMode ? "#64748b" : "#94a3b8",
                                      marginTop: "2px",
                                    }}
                                  >
                                    series
                                  </div>
                                </div>
                                <span
                                  style={{
                                    color: isDarkMode ? "#475569" : "#cbd5e1",
                                    fontSize: "1.125rem",
                                    fontWeight: 300,
                                  }}
                                >
                                  ×
                                </span>
                                <div style={{ textAlign: "center" }}>
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      fontSize: "1.125rem",
                                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {ejercicio.repeticiones}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: isDarkMode ? "#64748b" : "#94a3b8",
                                      marginTop: "2px",
                                    }}
                                  >
                                    reps
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "32px 0" }}>
                          <FaDumbbell
                            size={40}
                            style={{
                              color: isDarkMode ? "#475569" : "#cbd5e1",
                              marginBottom: "12px",
                              opacity: 0.5,
                            }}
                          />
                          <p
                            style={{
                              color: isDarkMode ? "#64748b" : "#94a3b8",
                              fontSize: "0.9375rem",
                              margin: 0,
                            }}
                          >
                            No hay ejercicios en esta rutina
                          </p>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        borderTop: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.08)" : "#f1f5f9"}`,
                        padding: "14px 24px",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      {!isReadOnly && (
                        <Button
                          onClick={() =>
                            handleEditarRutina(rutinaSeleccionada.id)
                          }
                          style={{
                            borderRadius: "8px",
                            background: "#2563eb",
                            border: "none",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            padding: "9px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#1d4ed8")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#2563eb")
                          }
                        >
                          <FaEdit size={14} /> Editar
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={handleCancelarEdicion}
                        style={{
                          borderRadius: "8px",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          padding: "9px 18px",
                          background: isDarkMode
                            ? "rgba(255,255,255,0.08)"
                            : "#f1f5f9",
                          border: isDarkMode
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid #e2e8f0",
                          color: isDarkMode ? "#e2e8f0" : "#475569",
                        }}
                      >
                        Cerrar
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </Col>
      </Row>

      {!isReadOnly && (
        <>
          <Modal
            show={showModalNuevaRutina}
            onHide={() => setShowModalNuevaRutina(false)}
            size="lg"
            centered
            enforceFocus={false}
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
                <FaDumbbell className="me-2" style={{ color: "#2563eb" }} />
                Nueva Rutina
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              style={{
                background: isDarkMode ? "#0f172a" : "#cbd5e1",
                padding: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: isDarkMode ? "#94a3b8" : "#64748b",
                  marginBottom: "24px",
                }}
              >
                Creá una nueva rutina de entrenamiento con sus ejercicios
              </p>
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                    }}
                  >
                    Nombre de la Rutina
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    placeholder="Ej: Rutina de Fuerza"
                    value={formDataRutina.nombre}
                    onChange={handleFormRutinaChange}
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(148, 163, 184, 0.2)"
                        : "#cbd5e1",
                      background: isDarkMode ? "#1e293b" : "#ffffff",
                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "0.9375rem",
                    }}
                  />
                </Form.Group>

                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: isDarkMode ? "#f1f5f9" : "#0f172a",
                      }}
                    >
                      Ejercicios
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: isDarkMode ? "#64748b" : "#94a3b8",
                      }}
                    >
                      {formDataRutina.ejercicios.length} ejercicios
                    </span>
                  </div>

                  <div
                    style={{
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
                      borderRadius: "10px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <Row className="g-2 align-items-end">
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label
                            style={{
                              fontWeight: 600,
                              fontSize: "0.6875rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            Ejercicio
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="ejercicio"
                            placeholder="Press de banca"
                            value={formDataEjercicio.ejercicio}
                            onChange={handleFormEjercicioChange}
                            style={{
                              borderColor: isDarkMode
                                ? "rgba(148, 163, 184, 0.2)"
                                : "#cbd5e1",
                              background: isDarkMode ? "#0f172a" : "#ffffff",
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "0.875rem",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} md={2}>
                        <Form.Group>
                          <Form.Label
                            style={{
                              fontWeight: 600,
                              fontSize: "0.6875rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            Series
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="series"
                            placeholder="3"
                            min="1"
                            value={formDataEjercicio.series}
                            onChange={handleFormEjercicioChange}
                            style={{
                              borderColor: isDarkMode
                                ? "rgba(148, 163, 184, 0.2)"
                                : "#cbd5e1",
                              background: isDarkMode ? "#0f172a" : "#ffffff",
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "0.875rem",
                              textAlign: "center",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} md={2}>
                        <Form.Group>
                          <Form.Label
                            style={{
                              fontWeight: 600,
                              fontSize: "0.6875rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            Reps
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="repeticiones"
                            placeholder="10"
                            min="1"
                            value={formDataEjercicio.repeticiones}
                            onChange={handleFormEjercicioChange}
                            style={{
                              borderColor: isDarkMode
                                ? "rgba(148, 163, 184, 0.2)"
                                : "#cbd5e1",
                              background: isDarkMode ? "#0f172a" : "#ffffff",
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "0.875rem",
                              textAlign: "center",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Button
                          onClick={agregarEjercicio}
                          size="sm"
                          className="w-100"
                          style={{
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            background: "#2563eb",
                            border: "none",
                            padding: "8px 12px",
                          }}
                        >
                          <FaPlus size={10} className="me-1" /> Agregar
                        </Button>
                      </Col>
                    </Row>
                  </div>

                  {formDataRutina.ejercicios.length > 0 && (
                    <div
                      style={{
                        background: isDarkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.15)" : "#cbd5e1"}`,
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: isDarkMode
                          ? "none"
                          : "0 1px 3px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      {formDataRutina.ejercicios.map((ej, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            borderBottom:
                              idx < formDataRutina.ejercicios.length - 1
                                ? `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.06)" : "#f1f5f9"}`
                                : "none",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              }}
                            >
                              {ej.ejercicio}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 500,
                                  color: isDarkMode ? "#94a3b8" : "#64748b",
                                }}
                              >
                                Series
                              </span>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.9375rem",
                                  color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                  background: isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "#f1f5f9",
                                  padding: "2px 10px",
                                  borderRadius: "6px",
                                  minWidth: "32px",
                                  textAlign: "center",
                                }}
                              >
                                {ej.series}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 500,
                                  color: isDarkMode ? "#94a3b8" : "#64748b",
                                }}
                              >
                                Reps
                              </span>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.9375rem",
                                  color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                  background: isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "#f1f5f9",
                                  padding: "2px 10px",
                                  borderRadius: "6px",
                                  minWidth: "32px",
                                  textAlign: "center",
                                }}
                              >
                                {ej.repeticiones}
                              </span>
                            </div>
                            <div style={{ display: "flex", marginLeft: "8px" }}>
                              <span
                                onClick={() => eliminarEjercicio(idx)}
                                style={{
                                  color: isDarkMode ? "#f87171" : "#dc2626",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  opacity: 0.7,
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = "1";
                                  e.currentTarget.style.background = isDarkMode
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(239, 68, 68, 0.08)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = "0.7";
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <FaTrash size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer
              style={{
                background: isDarkMode ? "#0f172a" : "#cbd5e1",
                borderTop: isDarkMode ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0",
                padding: "16px 24px",
                gap: "8px",
              }}
            >
              <Button
                variant="light"
                onClick={() => setShowModalNuevaRutina(false)}
                style={{
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  padding: "9px 18px",
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.06)"
                    : "#f1f5f9",
                  border: isDarkMode
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid #e2e8f0",
                  color: isDarkMode ? "#e2e8f0" : "#475569",
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarNuevaRutina}
                disabled={!formDataRutina.nombre.trim()}
                style={{
                  borderRadius: "8px",
                  background: "#2563eb",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "9px 20px",
                }}
              >
                <FaPlus className="me-2" size={12} />
                Guardar Rutina
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showModalEditarRutina}
            onHide={() => {
              setShowModalEditarRutina(false);
              cancelarEdicionEjercicio();
            }}
            size="lg"
            centered
            enforceFocus={false}
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
                <FaEdit className="me-2" style={{ color: "#2563eb" }} />
                Editar Rutina
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              style={{
                background: isDarkMode ? "#0f172a" : "#cbd5e1",
                padding: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: isDarkMode ? "#94a3b8" : "#64748b",
                  marginBottom: "24px",
                }}
              >
                Modificá el nombre y los ejercicios de la rutina
              </p>
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                    }}
                  >
                    Nombre de la Rutina
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    placeholder="Ej: Rutina de Fuerza"
                    value={formDataEdicion.nombre}
                    onChange={handleFormEdicionChange}
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(148, 163, 184, 0.2)"
                        : "#cbd5e1",
                      background: isDarkMode ? "#1e293b" : "#ffffff",
                      color: isDarkMode ? "#f1f5f9" : "#0f172a",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "0.9375rem",
                    }}
                  />
                </Form.Group>

                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: isDarkMode ? "#f1f5f9" : "#0f172a",
                      }}
                    >
                      Ejercicios
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: isDarkMode ? "#64748b" : "#94a3b8",
                      }}
                    >
                      {formDataEdicion.ejercicios.length} ejercicios
                    </span>
                  </div>

                  <div
                    style={{
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
                      borderRadius: "10px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <Row className="g-2 align-items-end">
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label
                            style={{
                              fontWeight: 600,
                              fontSize: "0.6875rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            Ejercicio
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="ejercicio"
                            placeholder="Press de banca"
                            value={formDataEjercicioEdicion.ejercicio}
                            onChange={handleFormEjercicioEdicionChange}
                            style={{
                              borderColor: isDarkMode
                                ? "rgba(148, 163, 184, 0.2)"
                                : "#cbd5e1",
                              background: isDarkMode ? "#0f172a" : "#ffffff",
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "0.875rem",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} md={2}>
                        <Form.Group>
                          <Form.Label
                            style={{
                              fontWeight: 600,
                              fontSize: "0.6875rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            Series
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="series"
                            placeholder="3"
                            min="1"
                            value={formDataEjercicioEdicion.series}
                            onChange={handleFormEjercicioEdicionChange}
                            style={{
                              borderColor: isDarkMode
                                ? "rgba(148, 163, 184, 0.2)"
                                : "#cbd5e1",
                              background: isDarkMode ? "#0f172a" : "#ffffff",
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "0.875rem",
                              textAlign: "center",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} md={2}>
                        <Form.Group>
                          <Form.Label
                            style={{
                              fontWeight: 600,
                              fontSize: "0.6875rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: isDarkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            Reps
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="repeticiones"
                            placeholder="10"
                            min="1"
                            value={formDataEjercicioEdicion.repeticiones}
                            onChange={handleFormEjercicioEdicionChange}
                            style={{
                              borderColor: isDarkMode
                                ? "rgba(148, 163, 184, 0.2)"
                                : "#cbd5e1",
                              background: isDarkMode ? "#0f172a" : "#ffffff",
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "0.875rem",
                              textAlign: "center",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        {ejercicioEnEdicion ? (
                          <div className="d-flex gap-1">
                            <Button
                              onClick={guardarEjercicioEditado}
                              size="sm"
                              style={{
                                borderRadius: "6px",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                background: "#059669",
                                border: "none",
                                padding: "8px 12px",
                                flex: 1,
                              }}
                            >
                              Guardar
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={cancelarEdicionEjercicio}
                              style={{
                                borderRadius: "6px",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                padding: "8px 12px",
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={agregarEjercicioEdicion}
                            size="sm"
                            className="w-100"
                            style={{
                              borderRadius: "6px",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              background: "#2563eb",
                              border: "none",
                              padding: "8px 12px",
                            }}
                          >
                            <FaPlus size={10} className="me-1" /> Agregar
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </div>

                  {formDataEdicion.ejercicios.length > 0 && (
                    <div
                      style={{
                        background: isDarkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.15)" : "#cbd5e1"}`,
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: isDarkMode
                          ? "none"
                          : "0 1px 3px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      {formDataEdicion.ejercicios.map((ej, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            borderBottom:
                              idx < formDataEdicion.ejercicios.length - 1
                                ? `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.06)" : "#f1f5f9"}`
                                : "none",
                            background:
                              indexEjercicioEdicion === idx
                                ? isDarkMode
                                  ? "rgba(37, 99, 235, 0.08)"
                                  : "rgba(37, 99, 235, 0.03)"
                                : "transparent",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              }}
                            >
                              {ej.ejercicio}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 500,
                                  color: isDarkMode ? "#94a3b8" : "#64748b",
                                }}
                              >
                                Series
                              </span>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.9375rem",
                                  color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                  background: isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "#f1f5f9",
                                  padding: "2px 10px",
                                  borderRadius: "6px",
                                  minWidth: "32px",
                                  textAlign: "center",
                                }}
                              >
                                {ej.series}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 500,
                                  color: isDarkMode ? "#94a3b8" : "#64748b",
                                }}
                              >
                                Reps
                              </span>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.9375rem",
                                  color: isDarkMode ? "#f1f5f9" : "#0f172a",
                                  background: isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "#f1f5f9",
                                  padding: "2px 10px",
                                  borderRadius: "6px",
                                  minWidth: "32px",
                                  textAlign: "center",
                                }}
                              >
                                {ej.repeticiones}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "4px",
                                marginLeft: "8px",
                              }}
                            >
                              <span
                                onClick={() => iniciarEdicionEjercicio(ej, idx)}
                                style={{
                                  color:
                                    ejercicioEnEdicion !== null
                                      ? isDarkMode
                                        ? "#475569"
                                        : "#cbd5e1"
                                      : isDarkMode
                                        ? "#60a5fa"
                                        : "#2563eb",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  cursor:
                                    ejercicioEnEdicion !== null
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    ejercicioEnEdicion !== null ? 0.4 : 0.7,
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                }}
                                onMouseEnter={(e) => {
                                  if (ejercicioEnEdicion === null) {
                                    e.currentTarget.style.opacity = "1";
                                    e.currentTarget.style.background =
                                      isDarkMode
                                        ? "rgba(37, 99, 235, 0.2)"
                                        : "rgba(37, 99, 235, 0.08)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (ejercicioEnEdicion === null) {
                                    e.currentTarget.style.opacity = "0.7";
                                    e.currentTarget.style.background =
                                      "transparent";
                                  }
                                }}
                              >
                                <FaEdit size={14} />
                              </span>
                              <span
                                onClick={() => eliminarEjercicioEdicion(idx)}
                                style={{
                                  color: isDarkMode ? "#f87171" : "#dc2626",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  opacity: 0.7,
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = "1";
                                  e.currentTarget.style.background = isDarkMode
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(239, 68, 68, 0.08)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = "0.7";
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <FaTrash size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer
              style={{
                background: isDarkMode ? "#0f172a" : "#cbd5e1",
                borderTop: isDarkMode ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0",
                padding: "16px 24px",
                gap: "8px",
              }}
            >
              <Button
                variant="light"
                onClick={() => {
                  setShowModalEditarRutina(false);
                  cancelarEdicionEjercicio();
                }}
                style={{
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  padding: "9px 18px",
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.06)"
                    : "#f1f5f9",
                  border: isDarkMode
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid #e2e8f0",
                  color: isDarkMode ? "#e2e8f0" : "#475569",
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarEdicionRutina}
                disabled={
                  !formDataEdicion.nombre.trim() || ejercicioEnEdicion !== null
                }
                style={{
                  borderRadius: "8px",
                  background: "#2563eb",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "9px 20px",
                }}
              >
                <FaCheckCircle className="me-2" size={12} />
                Guardar Cambios
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      <Modal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        size="lg"
        centered
        enforceFocus={false}
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
            <FaEnvelope className="me-2" style={{ color: "#2563eb" }} />
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
              color: isDarkMode ? "#94a3b8" : "#475569",
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
                        boxShadow: isDarkMode
                          ? "none"
                          : "0 1px 2px rgba(0, 0, 0, 0.04)",
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
                        boxShadow: isDarkMode
                          ? "none"
                          : "0 1px 2px rgba(0, 0, 0, 0.04)",
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
                      : "#e0f2fe",
                    color: isDarkMode ? "#67e8f9" : "#0369a1",
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

          {emailHistory.length === 0 ? (
            <div
              className="text-center py-5"
              style={{
                color: isDarkMode ? "#64748b" : "#94a3b8",
              }}
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

export default Rutinas;
