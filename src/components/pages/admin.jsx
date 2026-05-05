import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
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
  Badge,
  Offcanvas,
  Pagination,
  Modal,
  ButtonGroup,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUser,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBars,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUsers,
  FaTimes,
  FaDollarSign,
  FaCalendarAlt,
  FaDumbbell,
  FaMoon,
  FaSun,
  FaChartLine,
  FaUserShield,
  FaEnvelope,
  FaFilter,
  FaFileExcel,
} from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/es";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import axios from "axios";

dayjs.locale("es");

// ─── Tema ────────────────────────────────────────────────────────────────────
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("tema") === "oscuro";
  });

  useEffect(() => {
    localStorage.setItem("tema", isDarkMode ? "oscuro" : "claro");
    document.body.setAttribute("data-bs-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const alternarTema = useCallback(() => setIsDarkMode((prev) => !prev), []);

  return { isDarkMode, alternarTema };
};

// ─── Debounce hook ───────────────────────────────────────────────────────────
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// ─── Helpers puros (fuera del componente para no recrearse) ──────────────────
const obtenerEstadoPago = (fechaVencimiento) => {
  const diferenciaDias = Math.floor(
    (new Date() - new Date(fechaVencimiento)) / 86400000
  );
  return diferenciaDias <= 0
    ? { color: "success", texto: "PAGADO" }
    : diferenciaDias <= 5
    ? { color: "warning", texto: "DEBE" }
    : { color: "danger", texto: "VENCIDO" };
};

const parseFechaDD_MM_YYYY = (fechaString) => {
  if (!fechaString) return null;
  const partes = fechaString.split("/");
  if (partes.length !== 3) return null;
  const fecha = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
  return isNaN(fecha.getTime()) ? null : fecha;
};

const getEstadoMembresiaFn = (cliente) => {
  try {
    const venc = parseFechaDD_MM_YYYY(cliente?.vencimiento);
    if (!venc) return "Activo";
    return venc < new Date() ? "Expirada" : "Activo";
  } catch {
    return "Activo";
  }
};

const formatearFechaParaInputFn = (fechaString) => {
  if (!fechaString) return "";
  const partes = fechaString.split("/");
  if (partes.length !== 3) return "";
  return `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
};

// ─── StatCard ────────────────────────────────────────────────────────────────
const StatCard = memo(({ title, value, icon: Icon, color, isDarkMode }) => (
  <Card
    className="h-100 border-0 shadow-lg"
    style={{
      background: isDarkMode
        ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
        : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
      backdropFilter: "blur(15px)",
      borderRadius: "20px",
      transition: "all 0.3s ease",
    }}
  >
    <Card.Body className="p-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          <p
            className={`small mb-1 ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}
            style={{ fontSize: "0.75rem" }}
          >
            {title}
          </p>
          <h3 className={`fw-bold mb-0 text-${color}`} style={{ fontSize: "1.5rem" }}>
            {value}
          </h3>
        </div>
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center bg-${color} bg-opacity-10 flex-shrink-0`}
          style={{ width: "48px", height: "48px", minWidth: "48px" }}
        >
          <Icon className={`text-${color}`} size={20} />
        </div>
      </div>
    </Card.Body>
  </Card>
));

// ─── ClienteRow ──────────────────────────────────────────────────────────────
const ClienteRow = memo(
  ({ cliente, membership, isDarkMode, onSelect, onDelete, onRenovar, onTogglePago }) => (
    <tr onClick={() => onSelect(cliente)} style={{ cursor: "pointer" }} className="align-middle">
      <td>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow-sm"
          style={{ width: 48, height: 48, fontWeight: 700 }}
        >
          {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : <FaUser />}
        </div>
      </td>
      <td>
        <div className={`fw-bold ${isDarkMode ? "text-white" : "text-dark"}`}>
          {cliente.nombre}
        </div>
        <div className={`small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}>
          DNI: {cliente.dni}
        </div>
        {cliente.pagoMesActual && (
          <Badge bg="success" className="mt-1">
            <FaDollarSign className="me-1" size={10} />
            Pagado
          </Badge>
        )}
      </td>
      <td className="d-none d-lg-table-cell" style={{ minWidth: 200 }}>
        <div className={`small mb-1 ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}>
          Vence: {cliente.vencimiento || "—"}
        </div>
      </td>
      <td>
        <Badge
          bg={membership === "Activo" ? "success" : "danger"}
          className="d-inline-flex align-items-center px-3 py-2"
          style={{ borderRadius: "8px" }}
        >
          {membership === "Activo" ? (
            <FaCheckCircle className="me-2" />
          ) : (
            <FaTimesCircle className="me-2" />
          )}
          {membership}
        </Badge>
      </td>
      <td>
        <div className="fw-bold text-success fs-5">
          ${(Number(cliente.precio) || 0).toLocaleString()}
        </div>
        <small className={isDarkMode ? "text-light opacity-75" : "text-muted"}>mensual</small>
      </td>
      <td>
        <div className="d-flex gap-1">
          {membership === "Expirada" && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onRenovar(cliente, e); }}
              className="border-0"
              title="Renovar membresía"
            >
              <FaCheckCircle />
            </Button>
          )}
          <Button
            variant={cliente.pagoMesActual ? "success" : "danger"}
            size="sm"
            onClick={(e) => { e.stopPropagation(); onTogglePago(cliente); }}
            className="border-0"
          >
            <FaDollarSign />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(cliente, e); }}
            className="border-0"
          >
            <FaTrash />
          </Button>
        </div>
      </td>
    </tr>
  )
);

// ─── Sidebar (memoizado para no re-renderizar con cada estado) ───────────────
const Sidebar = memo(({ isDarkMode, navigate, handleOpenEmailModal, handleLogout, cuentasVencidas }) => (
  <Navbar
    className="d-flex flex-column h-100"
    style={{
      background: isDarkMode
        ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"
        : "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
      borderRight: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    }}
  >
    <Container fluid className="d-flex flex-column h-100 p-0">
      <Navbar.Brand className="p-3 w-100">
        <h3
          className={`fw-bold text-center ${isDarkMode ? "text-success" : "text-primary"}`}
          style={{
            background: isDarkMode ? "linear-gradient(45deg, #60a5fa, #34d399)" : undefined,
            WebkitBackgroundClip: isDarkMode ? "text" : undefined,
            WebkitTextFillColor: isDarkMode ? "transparent" : undefined,
            color: isDarkMode ? undefined : "#222",
            fontFamily: '"Fjalla One", sans-serif',
          }}
        >
          HULK GYM
        </h3>
        <p
          className={`text-center small mb-4 ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}
          style={{ color: isDarkMode ? undefined : "#222", fontWeight: 500 }}
        >
          Panel Administrativo
        </p>

        <Nav className="flex-column w-100">
          <Nav.Link
            className={`d-flex align-items-center mb-2 ${isDarkMode ? "text-info" : "text-primary"}`}
            style={{
              transition: "all 0.3s ease",
              borderRadius: "8px",
              padding: "12px 16px",
              backgroundColor: isDarkMode ? "rgba(13, 202, 240, 0.1)" : "rgba(0, 123, 255, 0.1)",
            }}
          >
            <FaUsers className="me-2" />
            <span>Gestión de Clientes</span>
          </Nav.Link>

          <Nav.Link
            className={`d-flex align-items-center mb-2 ${isDarkMode ? "text-light" : "text-dark"}`}
            onClick={() => navigate("/rutinas")}
            style={{ cursor: "pointer", transition: "all 0.3s ease", borderRadius: "8px", padding: "12px 16px" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateX(5px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <FaDumbbell className="me-2" />
            <span>Rutinas</span>
          </Nav.Link>

          <Nav.Link
            className={`d-flex align-items-center mb-2 ${isDarkMode ? "text-light" : "text-dark"}`}
            style={{ transition: "all 0.3s ease", borderRadius: "8px", padding: "12px 16px", cursor: "pointer" }}
            onClick={handleOpenEmailModal}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateX(5px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <FaEnvelope className="me-2" />
            <span>Historial de Emails</span>
            {cuentasVencidas.length > 0 && (
              <Badge bg="danger" className="ms-2">{cuentasVencidas.length}</Badge>
            )}
          </Nav.Link>

          <hr style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", margin: "20px 0" }} />

          <Nav.Link
            className="d-flex align-items-center text-danger mt-auto mb-3"
            onClick={handleLogout}
            style={{ cursor: "pointer", transition: "all 0.3s ease", borderRadius: "8px", padding: "12px 16px" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220, 53, 69, 0.1)"; e.currentTarget.style.transform = "translateX(5px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <FaTimes className="me-2" />
            <span>Cerrar Sesión</span>
          </Nav.Link>
        </Nav>
      </Navbar.Brand>
    </Container>
  </Navbar>
));

// ─── BarChart (memoizado) ─────────────────────────────────────────────────────
const BarChart = memo(({ datosIngresos, valorMaximo, isDarkMode, isMobile }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  const hayDatos = datosIngresos.some((item) => item.valor > 0);
  if (!hayDatos) {
    return (
      <Card className="shadow-sm mb-3">
        <Card.Body className="text-center py-4">
          <Card.Title as="h5" className="mb-2">
            Ingresos por mes basados en clientes registrados
          </Card.Title>
          <p className="text-muted small">No hay datos de ingresos para mostrar en el gráfico.</p>
        </Card.Body>
      </Card>
    );
  }

  const chartHeight = isMobile ? 180 : 240;
  const gap = isMobile ? 4 : 12;
  const indexMax = datosIngresos.reduce(
    (acc, cur, i) => (cur.valor > (datosIngresos[acc]?.valor || 0) ? i : acc),
    0
  );

  return (
    <Card className="shadow-sm mb-3">
      <Card.Body
        style={{
          background: isDarkMode
            ? "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
            : "linear-gradient(180deg, rgba(59,130,246,0.03), transparent)",
        }}
      >
        <Card.Title as="h6" className="mb-3">
          Ingresos por mes basados en clientes registrados
        </Card.Title>
        <div style={{ padding: isMobile ? "0.25rem" : "1rem" }}>
          <div style={{ height: chartHeight + 40, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap, height: chartHeight }}>
              {datosIngresos.map((item, index) => {
                const valor = item.valor || 0;
                const heightPx = valorMaximo > 0
                  ? Math.max((valor / valorMaximo) * chartHeight, valor > 0 ? 6 : 2)
                  : 0;
                const hue = 200 - Math.floor((index / datosIngresos.length) * 70);
                const colorStart = `hsl(${hue} 90% 55%)`;
                const colorEnd = `hsl(${Math.max(hue - 12, 160)} 80% 40%)`;
                const isMax = index === indexMax;

                return (
                  <div
                    key={index}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: isMobile ? 20 : 28 }}
                  >
                    <div style={{ height: chartHeight - heightPx }} />
                    <div
                      role="button"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{
                        width: isMobile ? "90%" : "70%",
                        height: heightPx,
                        background: `linear-gradient(180deg, ${colorStart}, ${colorEnd})`,
                        borderRadius: isMax ? 10 : 6,
                        boxShadow: hoveredBar === index ? "0 8px 20px rgba(0,0,0,0.2)" : "0 4px 10px rgba(0,0,0,0.08)",
                        transition: "transform 120ms ease, box-shadow 120ms ease",
                        transform: hoveredBar === index ? "translateY(-6px) scale(1.02)" : "translateY(0)",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {(hoveredBar === index || (!isMobile && isMax)) && valor > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -26,
                            background: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.95)",
                            color: isDarkMode ? "#fff" : "#111",
                            padding: "3px 8px",
                            borderRadius: 8,
                            fontSize: isMobile ? 9 : 12,
                            fontWeight: 700,
                            boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ${valor.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={{ height: 6 }} />
                    <div
                      style={{
                        fontSize: isMobile ? 9 : 12,
                        color: isDarkMode ? "#e6eef8" : "#374151",
                        fontWeight: 600,
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.mes}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 8,
                textAlign: "right",
                fontSize: isMobile ? 9 : 11,
                color: isDarkMode ? "#9fb4ff" : "#6b7280",
              }}
            >
              Datos basados en clientes activos — año actual
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
});

// ─── AdminClientes ────────────────────────────────────────────────────────────
const AdminClientes = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();

  const detalleClienteRef = useRef(null);
  const tablaClientesRef = useRef(null);

  // ── Auth ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");
      if (!token || userType !== "admin") navigate("/login", { replace: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  // ── Estado UI ──
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // ── Modales ──
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [showModalRenovar, setShowModalRenovar] = useState(false);
  const [clienteARenovar, setClienteARenovar] = useState(null);

  // ── Clientes ──
  const [clientes, setClientes] = useState(() => {
    try {
      const saved = localStorage.getItem("clientes");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // ── Email ──
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [cuentasVencidas, setCuentasVencidas] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [verificandoEmails, setVerificandoEmails] = useState(false);

  // ── Form ──
  const [formData, setFormData] = useState({
    nombre: "", dni: "", email: "",
    fechaInicio: "", vencimiento: "",
    estado: "Activo", estadoCuenta: "Activo", precio: 10000,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ── Resize handler ──
  useEffect(() => {
    let timeoutId;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(timeoutId); };
  }, []);

  // ── Persistir clientes (debounced) ──
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem("clientes", JSON.stringify(clientes)), 500);
    return () => clearTimeout(t);
  }, [clientes]);

  // ── Fetch clientes desde API ──
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) setClientes(res.data);
      } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  // ── Reset pagos mensuales ──
  useEffect(() => {
    const fechaActual = new Date();
    const ultimaVerificacionPagos = localStorage.getItem("ultimaVerificacionPagos");
    let debeResetear = !ultimaVerificacionPagos;

    if (ultimaVerificacionPagos) {
      const prev = new Date(ultimaVerificacionPagos);
      if (fechaActual.getMonth() !== prev.getMonth() || fechaActual.getFullYear() !== prev.getFullYear()) {
        debeResetear = true;
      }
    }

    if (debeResetear) {
      setClientes((prev) => {
        const actualizados = prev.map((c) => ({ ...c, pagoMesActual: false }));
        localStorage.setItem("clientes", JSON.stringify(actualizados));
        return actualizados;
      });
      localStorage.setItem("ultimaVerificacionPagos", fechaActual.toISOString());
    }
  }, []);

  // ── Verificación automática de vencimientos (cada 1 hora) ──
  const verificarVencimientosAutomaticos = useCallback(async () => {
    try {
      const { verificarVencimientosAutomaticos: verificar } =
        await import("../../services/emailService");
      const resultado = await verificar();
      if (resultado.emailsEnviados > 0) {
        const historialStr = localStorage.getItem("emailHistory");
        setEmailHistory(historialStr ? JSON.parse(historialStr) : []);
      }
    } catch (error) {
      console.error("❌ Error en verificación automática:", error);
    }
  }, []);

  useEffect(() => {
    verificarVencimientosAutomaticos();
    const intervalo = setInterval(verificarVencimientosAutomaticos, 3600000);
    return () => clearInterval(intervalo);
  }, [verificarVencimientosAutomaticos]);

  // ── Cuentas vencidas (solo recalcula cuando cambian los clientes) ──
  useEffect(() => {
    const hoy = new Date();
    const vencidas = clientes.filter((cliente) => {
      if (!cliente.vencimiento || !cliente.email?.trim()) return false;
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        return new Date(`${anio}-${mes}-${dia}T23:59:59`) < hoy;
      } catch { return false; }
    });
    setCuentasVencidas(vencidas);
  }, [clientes]);

  // ── Estadísticas ──
  const estadisticas = useMemo(() => {
    const activos = clientes.filter((c) => getEstadoMembresiaFn(c) === "Activo").length;
    const expiradas = clientes.filter((c) => getEstadoMembresiaFn(c) === "Expirada").length;
    const ingresos = clientes
      .filter((c) => getEstadoMembresiaFn(c) === "Activo")
      .reduce((total, c) => total + (c.precio || 0), 0);
    return {
      clientesActivos: activos,
      membresiasVencidas: expiradas,
      ingresosMes: `$${ingresos.toLocaleString()}`,
      totalClientes: clientes.length,
    };
  }, [clientes]);

  // ── Datos gráfico ──
  const datosIngresos = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const ingresosMensuales = Array(12).fill(0);

    clientes.forEach((cliente) => {
      if (cliente.estadoCuenta !== "Activo" || !cliente.fechaInicio) return;
      const fecha = cliente.fechaInicio.includes("/")
        ? parseFechaDD_MM_YYYY(cliente.fechaInicio)
        : new Date(cliente.fechaInicio);
      if (!fecha || isNaN(fecha.getTime())) return;
      if (fecha.getFullYear() === currentYear) {
        ingresosMensuales[fecha.getMonth()] += Number(cliente.precio) || 0;
      }
    });

    return meses.map((mes, index) => ({ mes, valor: ingresosMensuales[index] }));
  }, [clientes]);

  const valorMaximo = useMemo(
    () => Math.max(...datosIngresos.map((i) => i.valor), 0) || 10000,
    [datosIngresos]
  );

  // ── Filtrado ──
  const clientesFiltrados = useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    return clientes.filter((cliente) => {
      const nombre = (cliente.nombre || "").toLowerCase();
      const dni = String(cliente.dni || "");
      const termino = debouncedSearchTerm.toLowerCase();
      const coincide = nombre.includes(termino) || dni.includes(termino);
      if (filtroActivo === "activos") return coincide && getEstadoMembresiaFn(cliente) === "Activo";
      if (filtroActivo === "vencidos") return coincide && getEstadoMembresiaFn(cliente) === "Expirada";
      return coincide;
    });
  }, [clientes, debouncedSearchTerm, filtroActivo]);

  const clientesPaginados = useMemo(() => {
    const porPagina = 10;
    const inicio = (paginaActual - 1) * porPagina;
    return {
      clientes: clientesFiltrados.slice(inicio, inicio + porPagina),
      totalPaginas: Math.ceil(clientesFiltrados.length / porPagina),
    };
  }, [clientesFiltrados, paginaActual]);

  // ── Progreso membresía ──
  const calcularProgresoMembresia = useCallback((cliente) => {
    const inicio = parseFechaDD_MM_YYYY(cliente.fechaInicio);
    const venc = parseFechaDD_MM_YYYY(cliente.vencimiento);
    const ahora = new Date();
    if (!inicio || !venc) return { pct: 0, diasRestantes: null, vencido: false };
    const totalMs = venc - inicio;
    const restanteMs = venc - ahora;
    const vencido = restanteMs <= 0;
    const transcurridoMs = ahora > inicio ? Math.min(Math.max(0, ahora - inicio), totalMs) : 0;
    const pct = totalMs > 0 ? Math.round((transcurridoMs / totalMs) * 100) : 100;
    const diasRestantes = vencido ? 0 : Math.ceil(Math.max(0, restanteMs) / 86400000);
    return { pct: Math.max(0, Math.min(100, pct)), diasRestantes, vencido };
  }, []);

  // ── getEstadoMembresia (memoizado por referencia estable) ──
  const getEstadoMembresia = useCallback(getEstadoMembresiaFn, []);

  // ── Estado pago del cliente seleccionado ──
  const estadoPagoSeleccionado = useMemo(
    () => clienteSeleccionado ? obtenerEstadoPago(clienteSeleccionado.vencimiento) : null,
    [clienteSeleccionado]
  );

  // ── Emails filtrados (memoizado) ──
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

  const formatearFechaCorta = useCallback((fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }, []);

  // ── Scroll animado al detalle (intacto) ──
  const seleccionarCliente = useCallback((cliente) => {
    setClienteSeleccionado(cliente);
    setTimeout(() => {
      requestAnimationFrame(() => {
        const detalleElement = detalleClienteRef.current || document.getElementById("detalle-cliente");
        if (detalleElement) {
          const rect = detalleElement.getBoundingClientRect();
          if (rect.height > 0) {
            const targetPosition = rect.top + window.pageYOffset - 20;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1200;
            let start = null;
            const animation = (currentTime) => {
              if (start === null) start = currentTime;
              const timeElapsed = currentTime - start;
              const progress = Math.min(timeElapsed / duration, 1);
              const ease = progress < 0.5
                ? 8 * progress ** 4
                : 1 - Math.pow(-2 * progress + 2, 4) / 2;
              window.scrollTo(0, startPosition + distance * ease);
              if (timeElapsed < duration) requestAnimationFrame(animation);
            };
            requestAnimationFrame(animation);
          } else {
            setTimeout(() => {
              (detalleClienteRef.current || document.getElementById("detalle-cliente"))
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }
        }
      });
    }, 100);
  }, []);

  // ── Scroll animado al cerrar detalle (intacto) ──
  const cancelarSeleccion = useCallback(() => {
    const tablaElement = tablaClientesRef.current || document.getElementById("tabla-clientes");
    if (tablaElement) {
      const targetPosition = tablaElement.getBoundingClientRect().top + window.pageYOffset - 100;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 800;
      let start = null;
      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = progress < 0.5
          ? 8 * progress ** 4
          : 1 - Math.pow(-2 * progress + 2, 4) / 2;
        window.scrollTo(0, startPosition + distance * ease);
        if (timeElapsed < duration) requestAnimationFrame(animation);
        else setClienteSeleccionado(null);
      };
      requestAnimationFrame(animation);
    } else {
      setClienteSeleccionado(null);
    }
  }, []);

  // ── Form handlers ──
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "fechaInicio" && value) {
      const [year, month, day] = value.split("-");
      const fechaVencimiento = new Date(year, month - 1, day);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        fechaInicio: `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`,
        vencimiento: `${fechaVencimiento.getDate().toString().padStart(2, "0")}/${(fechaVencimiento.getMonth() + 1).toString().padStart(2, "0")}/${fechaVencimiento.getFullYear()}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const abrirModalNuevo = useCallback(() => {
    const hoy = new Date();
    const venc = new Date(hoy);
    venc.setDate(venc.getDate() + 30);
    const fmt = (d) => `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    setFormData({ nombre: "", dni: "", email: "", fechaInicio: fmt(hoy), vencimiento: fmt(venc), estado: "Activo", estadoCuenta: "Activo", precio: 10000 });
    setShowModalNuevo(true);
  }, []);

  const abrirModalRenovar = useCallback((cliente, e) => {
    if (e) e.stopPropagation();
    setClienteARenovar(cliente);
    setShowModalRenovar(true);
  }, []);

  const abrirModalEliminar = useCallback((cliente, e) => {
    if (e) e.stopPropagation();
    setClienteAEliminar(cliente);
    setShowModalEliminar(true);
  }, []);

  const abrirModalEditar = useCallback((cliente, e) => {
    if (e) e.stopPropagation();
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre,
      dni: cliente.dni,
      email: cliente.email,
      fechaInicio: cliente.fechaInicio,
      vencimiento: cliente.vencimiento,
      estadoCuenta: cliente.estadoCuenta || "Activo",
      precio: cliente.precio,
    });
    setShowModalEditar(true);
  }, []);

  // ── Logout / navegación ──
  const handleLogout = useCallback(() => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  }, [navigate]);

  const handleNuevoAdmin = useCallback(() => {
    localStorage.setItem("creandoAdmin", "true");
    navigate("/registro");
  }, [navigate]);

  // ── CRUD clientes ──
  const guardarNuevoCliente = async () => {
    if (!formData.nombre?.trim()) return Swal.fire({ icon: "warning", title: "Campo requerido", text: "El nombre es obligatorio" });
    if (!formData.dni?.trim()) return Swal.fire({ icon: "warning", title: "Campo requerido", text: "El DNI es obligatorio" });
    if (!formData.email?.trim()) return Swal.fire({ icon: "warning", title: "Campo requerido", text: "El email es obligatorio para enviar las credenciales" });

    try {
      Swal.fire({ title: "Registrando cliente...", html: "Se enviará un email con las credenciales de acceso", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const token = localStorage.getItem("token");
      const partes = formData.nombre.trim().split(" ");
      const hoy = new Date().toISOString().split("T")[0];
      const unMesDespues = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

      const res = await axios.post(
        "http://localhost:3000/api/auth/registrar-cliente",
        {
          nombre: partes[0] || formData.nombre.trim(),
          apellido: partes.slice(1).join(" ") || "",
          dni: formData.dni.trim(),
          email: formData.email.trim().toLowerCase(),
          fechaInicio: formData.fechaInicio || hoy,
          vencimiento: formData.vencimiento || unMesDespues,
          precio: parseFloat(formData.precio) || 10000,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const c = res.data.cliente;
      setClientes((prev) => [...prev, {
        id: c.id, _id: c.id, nombre: c.nombre, dni: c.dni, email: c.email,
        fechaInicio: c.fechaInicio, vencimiento: c.vencimiento,
        estadoCuenta: c.estadoCuenta || "Activo", precio: c.precio || 10000,
        pagoMesActual: c.pagoMesActual || false, cuentaActivada: c.cuentaActivada || false,
      }]);
      setShowModalNuevo(false);
      Swal.fire({
        icon: "success", title: "¡Cliente registrado!",
        html: `<div style="text-align:left"><p><strong>${formData.nombre}</strong> ha sido registrado correctamente.</p><hr><p>📧 Se ha enviado un email a <strong>${formData.email}</strong> con:</p><ul><li>Credenciales de acceso temporales</li><li>Enlace para cambiar contraseña</li></ul><p class="text-muted small">El cliente deberá cambiar su contraseña antes de poder acceder.</p></div>`,
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      const msg = error.response?.data?.mensaje || (error.request ? "No se pudo conectar con el servidor" : error.message);
      Swal.fire({ icon: "error", title: "Error al registrar", text: msg });
    }
  };

  const guardarClienteEditado = async () => {
    try {
      const token = localStorage.getItem("token");
      const clienteId = clienteSeleccionado?._id;
      const res = await axios.put(
        `http://localhost:3000/api/clientes/${clienteId}`,
        { nombre: formData.nombre, dni: formData.dni, email: formData.email, fechaInicio: formData.fechaInicio, vencimiento: formData.vencimiento, precio: formData.precio, estadoCuenta: formData.estadoCuenta },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientes((prev) => prev.map((c) => (c._id === clienteId || c.id === clienteId ? res.data : c)));
      if (clienteSeleccionado?._id === clienteId || clienteSeleccionado?.id === clienteId) setClienteSeleccionado(res.data);
      setShowModalEditar(false);
      Swal.fire({ icon: "success", title: "¡Cliente actualizado!", text: `Se actualizó ${formData.nombre} correctamente`, timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.mensaje || "No se pudo actualizar el cliente" });
    }
  };

  const confirmarEliminarCliente = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/clientes/${clienteAEliminar._id || clienteAEliminar.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setClientes((prev) => prev.filter((c) => c._id !== clienteAEliminar._id && c.id !== clienteAEliminar.id));
      setShowModalEliminar(false);
      Swal.fire({ icon: "success", title: "Cliente eliminado", text: `${clienteAEliminar.nombre} fue eliminado correctamente` });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.mensaje || "No se pudo eliminar el cliente" });
    }
  };

  const renovarMembresia = async (cliente) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:3000/api/membresias/${cliente.id}/renovar`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setClientes((prev) => prev.map((c) => c.id === cliente.id ? { ...c, ...res.data.cliente } : c));
      setShowModalRenovar(false);
      Swal.fire({ icon: "success", title: "Membresía renovada", text: `La membresía de ${cliente.nombre} fue renovada correctamente` });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.mensaje || "No se pudo renovar la membresía" });
    }
  };

  const togglePagoMes = useCallback(async (cliente) => {
    const estaPagado = cliente.pagoMesActual;
    const confirmacion = await Swal.fire({
      title: estaPagado ? "Quitar pago del mes" : "Registrar pago del mes",
      html: `<div style="font-size:15px">Cliente: <b>${cliente.nombre}</b><br/>Mes: <b>${dayjs().format("MMMM YYYY")}</b><br/><br/>${estaPagado ? "Se eliminará el registro de pago." : "Se confirmará que el cliente pagó este mes."}</div>`,
      icon: estaPagado ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: estaPagado ? "#d33" : "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: estaPagado ? "Sí, quitar pago" : "Sí, confirmar pago",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://localhost:3000/api/membresias/${cliente._id}/pago`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const clienteActualizado = response.data.cliente;
      setClientes((prev) => prev.map((c) => c._id === cliente._id ? clienteActualizado : c));
      if (clienteSeleccionado?._id === cliente._id) setClienteSeleccionado(clienteActualizado);
      await Swal.fire({ icon: "success", title: estaPagado ? "Pago eliminado" : "Pago registrado", text: estaPagado ? "El cliente figura como pendiente este mes." : "El cliente ahora figura como pagado.", timer: 1800, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el estado del pago." });
    }
  }, [clienteSeleccionado]);

  // ── Email handlers ──
  const fetchEmailHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setEmailHistory([]);
        return Swal.fire({ icon: "error", title: "No autenticado", text: "Debes iniciar sesión para ver el historial de emails." });
      }
      const res = await axios.get("http://localhost:3000/api/emails/", { headers: { Authorization: `Bearer ${token}` } });
      let history = [];
      if (Array.isArray(res.data)) history = res.data;
      else if (Array.isArray(res.data.historial)) history = res.data.historial;
      else if (Array.isArray(res.data.emails)) history = res.data.emails;
      setEmailHistory(history);
    } catch (error) {
      setEmailHistory([]);
      const mensaje = error.response?.status === 403
        ? "No tienes permisos para ver el historial de emails. Vuelve a iniciar sesión."
        : "No se pudo obtener el historial de emails";
      Swal.fire({ icon: "error", title: "Error al cargar historial", text: error.response?.data?.mensaje || mensaje });
    }
  }, []);

  const handleOpenEmailModal = useCallback(() => {
    setShowEmailModal(true);
    fetchEmailHistory();
  }, [fetchEmailHistory]);

  const handleEliminarEmail = useCallback(async (emailId) => {
    const result = await Swal.fire({
      title: "¿Eliminar registro?", text: "¿Estás seguro de que deseas eliminar este registro del historial?",
      icon: "question", showCancelButton: true, confirmButtonColor: "#dc3545", cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar", reverseButtons: true,
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/emails/${emailId}`, { headers: { Authorization: `Bearer ${token}` } });
        await fetchEmailHistory();
        Swal.fire({ icon: "success", title: "Eliminado", text: "El registro ha sido eliminado del historial", timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.mensaje || "No se pudo eliminar el email del historial" });
      }
    }
  }, [fetchEmailHistory]);

  const handleVerificarEmails = useCallback(async () => {
    setVerificandoEmails(true);
    try {
      Swal.fire({ title: "Verificando emails...", html: "Por favor espera mientras verificamos las cuentas vencidas", allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
      const { verificarYNotificarExpiraciones } = await import("../../services/emailService");
      const resultado = await verificarYNotificarExpiraciones();
      if (resultado.error) {
        Swal.fire({ icon: "error", title: "Error en la verificación", text: resultado.error.message, confirmButtonColor: "#dc3545" });
      } else {
        let icon = resultado.clientesVencidos === 0 ? "info" : resultado.errores > 0 && resultado.emailsEnviados === 0 ? "error" : resultado.errores > 0 ? "warning" : "success";
        Swal.fire({
          icon, title: "Verificación completada",
          html: `<div style="text-align:left;padding:10px"><div style="margin-bottom:15px"><h5 style="color:#6c757d;font-size:1.1em;margin-bottom:10px">📊 Resumen de verificación</h5></div><div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:10px"><p style="margin:8px 0"><strong>Clientes verificados:</strong> <span style="color:#0d6efd">${resultado.totalVerificados}</span></p><p style="margin:8px 0"><strong>Emails enviados:</strong> <span style="color:#28a745">${resultado.emailsEnviados}</span></p><p style="margin:8px 0"><strong>Errores:</strong> <span style="color:${resultado.errores > 0 ? "#ffc107" : "#6c757d"}">${resultado.errores}</span></p></div>${resultado.emailsEnviados > 0 ? `<div style="background:#d4edda;color:#155724;padding:10px;border-radius:6px;border-left:4px solid #28a745"><small>¡Revisa tu bandeja de entrada de Gmail para confirmar los envíos!</small></div>` : `<div style="background:#d1ecf1;color:#0c5460;padding:10px;border-radius:6px;border-left:4px solid #17a2b8"><small>No se enviaron emails (no hay cuentas vencidas con email válido)</small></div>`}</div>`,
          confirmButtonColor: "#0d6efd", confirmButtonText: "Entendido", width: "600px",
        });
        localStorage.setItem("ultimaVerificacionEmails", new Date().toISOString());
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error inesperado", text: error.message, confirmButtonColor: "#dc3545" });
    } finally {
      setVerificandoEmails(false);
    }
  }, []);

  const exportarExcel = useCallback(() => {
    if (!clientesFiltrados.length) return alert("No hay datos para exportar.");
    const datos = clientesFiltrados.map((c) => ({
      Nombre: c.nombre, DNI: c.dni, Email: c.email,
      "Fecha Inicio": c.fechaInicio, Vencimiento: c.vencimiento,
      Estado: c.estadoCuenta, Precio: c.precio,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }),
      "Reporte_Clientes.xlsx"
    );
  }, [clientesFiltrados]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Container
      fluid
      className="min-vh-100 d-flex flex-column p-0"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%)",
        minHeight: "100vh",
      }}
    >
      <Row className="flex-grow-1 g-0">
        {/* ── Sidebar desktop ── */}
        <Col
          xs={2} md={2} lg={2}
          className="d-none d-md-block p-0"
          style={{
            minHeight: "100vh",
            backdropFilter: "blur(10px)",
            borderRight: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          }}
        >
          <Sidebar
            isDarkMode={isDarkMode}
            navigate={navigate}
            handleOpenEmailModal={handleOpenEmailModal}
            handleLogout={handleLogout}
            cuentasVencidas={cuentasVencidas}
          />
        </Col>

        {/* ── Sidebar móvil ── */}
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
              borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              color: isDarkMode ? "white" : "dark",
            }}
          >
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <Sidebar
              isDarkMode={isDarkMode}
              navigate={navigate}
              handleOpenEmailModal={handleOpenEmailModal}
              handleLogout={handleLogout}
              cuentasVencidas={cuentasVencidas}
            />
          </Offcanvas.Body>
        </Offcanvas>

        {/* ── Contenido principal ── */}
        <Col xs={12} md={10} lg={10} className="p-0">
          {/* Navbar móvil */}
          <Navbar
            className="d-md-none"
            style={{
              background: isDarkMode ? "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(90deg, #ffffff 0%, #f8faff 100%)",
              backdropFilter: "blur(10px)",
              borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              boxShadow: isDarkMode ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(0,0,0,0.1)",
            }}
            variant={isDarkMode ? "dark" : "light"}
          >
            <Container fluid>
              <Button variant={isDarkMode ? "outline-light" : "outline-dark"} onClick={() => setShowSidebar(true)} className="me-2 border-0" style={{ borderRadius: "12px" }}>
                <FaBars />
              </Button>
              <Navbar.Brand className="fw-bold" style={{ background: "linear-gradient(45deg, #28a745, #20c997)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "1.8rem", fontFamily: '"Fjalla One", sans-serif' }}>
                HULK GYM
              </Navbar.Brand>
              <div className="d-flex align-items-center gap-2">
                <Button variant={isDarkMode ? "outline-info" : "outline-primary"} onClick={alternarTema} size="sm" style={{ borderRadius: "12px" }}>
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </Button>
                <Button variant="outline-danger" onClick={handleLogout} size="sm" style={{ borderRadius: "12px" }}>
                  <FaTimes /> Salir
                </Button>
              </div>
            </Container>
          </Navbar>

          <div className="p-4" style={{ minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="text-center mb-4" style={{ flexGrow: 1 }}>
                <h1
                  className={`${isMobile ? "h3" : "display-4"} fw-bold mb-2`}
                  style={{
                    background: isDarkMode ? "linear-gradient(45deg, #60a5fa, #34d399, #fbbf24)" : undefined,
                    WebkitBackgroundClip: isDarkMode ? "text" : undefined,
                    WebkitTextFillColor: isDarkMode ? "transparent" : undefined,
                    color: isDarkMode ? undefined : "#222",
                    fontFamily: '"Fjalla One", sans-serif',
                    letterSpacing: isMobile ? "1px" : "2px",
                  }}
                >
                  PANEL DE ADMINISTRACIÓN
                </h1>
                <p className={`${isMobile ? "small" : "lead"} ${isDarkMode ? "text-light" : "text-muted"}`} style={{ fontSize: isMobile ? "0.9rem" : "1.1rem", fontWeight: 300 }}>
                  Gestiona tu gimnasio de manera eficiente
                </p>
              </div>
              <Button
                variant={isDarkMode ? "outline-light" : "outline-dark"}
                onClick={alternarTema}
                className="d-none d-md-flex align-items-center border-0"
                style={{ borderRadius: "12px", backdropFilter: "blur(10px)", boxShadow: isDarkMode ? "0 4px 15px rgba(255,255,255,0.1)" : "0 4px 15px rgba(0,0,0,0.1)" }}
              >
                {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
              </Button>
            </div>

            {/* Stat cards */}
            <Row className="g-3 mb-4">
              <Col xs={6} lg={3}><StatCard title="Clientes Activos" value={estadisticas.clientesActivos} icon={FaUsers} color="success" isDarkMode={isDarkMode} /></Col>
              <Col xs={6} lg={3}><StatCard title="Membresías Expiradas" value={estadisticas.membresiasVencidas} icon={FaTimesCircle} color={estadisticas.membresiasVencidas > 0 ? "warning" : "secondary"} isDarkMode={isDarkMode} /></Col>
              <Col xs={6} lg={3}><StatCard title="Ingresos Anuales" value={estadisticas.ingresosMes} icon={FaDollarSign} color={isDarkMode ? "info" : "primary"} isDarkMode={isDarkMode} /></Col>
              <Col xs={6} lg={3}><StatCard title="Total Clientes" value={estadisticas.totalClientes} icon={FaChartLine} color="secondary" isDarkMode={isDarkMode} /></Col>
            </Row>

            {/* Gráfico */}
            <Card className="shadow-lg border-0 mb-5" style={{ background: isDarkMode ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)" : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)", backdropFilter: "blur(15px)", borderRadius: "20px" }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${isDarkMode ? "bg-info bg-opacity-10" : "bg-primary bg-opacity-10"}`} style={{ width: "50px", height: "50px" }}>
                    <FaChartLine className={isDarkMode ? "text-info" : "text-primary"} />
                  </div>
                  <div>
                    <h4 className={`mb-0 fw-bold ${isDarkMode ? "text-white" : "text-dark"}`}>Análisis de Ingresos</h4>
                    <p className={`mb-0 small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}>Ingresos mensuales basados en clientes registrados</p>
                  </div>
                </div>
                <BarChart datosIngresos={datosIngresos} valorMaximo={valorMaximo} isDarkMode={isDarkMode} isMobile={isMobile} />
              </Card.Body>
            </Card>

            {/* Botones de acción */}
            <div className="d-flex flex-column flex-md-row flex-wrap gap-2 mb-4">
              <Button variant="primary" size={isMobile ? "sm" : "md"} onClick={abrirModalNuevo} className="d-flex align-items-center justify-content-center px-3 py-2 shadow-sm border-0" style={{ borderRadius: "10px" }}>
                <FaPlus className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Agregar Cliente</div>
                  {!isMobile && <small className="opacity-75">Registrar nuevo miembro</small>}
                </div>
              </Button>
              <Button variant="outline-success" size={isMobile ? "sm" : "md"} onClick={handleNuevoAdmin} className="d-flex align-items-center justify-content-center px-3 py-2 border-2" style={{ borderRadius: "10px" }}>
                <FaUserShield className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Agregar Admin</div>
                  {!isMobile && <small className="opacity-75">Crear nuevo administrador</small>}
                </div>
              </Button>
              <Button variant="outline-warning" size={isMobile ? "sm" : "md"} onClick={handleVerificarEmails} disabled={verificandoEmails} className="d-flex align-items-center justify-content-center px-3 py-2 border-2" style={{ borderRadius: "10px" }}>
                <FaEnvelope className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">{verificandoEmails ? "Verificando..." : "Verificar Emails"}</div>
                  {!isMobile && <small className="opacity-75">Enviar notificaciones de vencimiento</small>}
                </div>
              </Button>
              <Button variant="outline-success" size={isMobile ? "sm" : "md"} onClick={exportarExcel} className="d-flex align-items-center justify-content-center px-3 py-2 border-2" style={{ borderRadius: "10px" }}>
                <FaFileExcel className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Exportar Reporte</div>
                  {!isMobile && <small className="opacity-75">Descargar listado en Excel</small>}
                </div>
              </Button>
            </div>

            {/* Tabla de clientes */}
            <Card ref={tablaClientesRef} id="tabla-clientes" className="border-0 shadow-lg" style={{ background: isDarkMode ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)" : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)", backdropFilter: "blur(15px)", borderRadius: "20px" }}>
              <Card.Header className="border-0 bg-transparent py-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10" style={{ width: "50px", height: "50px" }}>
                    <FaUsers className="text-success" />
                  </div>
                  <div>
                    <h3 className={`mb-0 fw-bold ${isDarkMode ? "text-white" : "text-dark"}`}>Gestión de Clientes</h3>
                    <p className={`mb-0 small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}>Administra la información de todos los miembros</p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-2 mb-4">
                  <Col xs={12} md={8}>
                    <InputGroup size={isMobile ? "sm" : "md"}>
                      <InputGroup.Text className={isDarkMode ? "bg-secondary border-secondary" : "bg-light border-light"}>
                        <FaSearch className={isDarkMode ? "text-light" : "text-muted"} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={isMobile ? "Buscar DNI..." : "Buscar por DNI..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`border-start-0 ${isDarkMode ? "bg-dark text-white" : ""}`}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Col>
                  <Col xs={12} md={4}>
                    <ButtonGroup size={isMobile ? "sm" : "md"} className="w-100">
                      <Button variant={filtroActivo === "todos" ? "primary" : "outline-primary"} onClick={() => setFiltroActivo("todos")} className="flex-fill" style={{ fontSize: isMobile ? "0.75rem" : "1rem" }}>Todos</Button>
                      <Button variant={filtroActivo === "activos" ? "success" : "outline-success"} onClick={() => setFiltroActivo("activos")} className="flex-fill" style={{ fontSize: isMobile ? "0.75rem" : "1rem" }}>Activos</Button>
                      <Button variant={filtroActivo === "vencidos" ? "danger" : "outline-danger"} onClick={() => setFiltroActivo("vencidos")} className="flex-fill" style={{ fontSize: isMobile ? "0.75rem" : "1rem" }}>Expirados</Button>
                    </ButtonGroup>
                  </Col>
                </Row>

                {!isMobile ? (
                  <div className="table-responsive">
                    <Table hover className={`mb-4 ${isDarkMode ? "table-dark" : ""}`}>
                      <thead className={isDarkMode ? "table-secondary" : "table-light"}>
                        <tr>
                          <th style={{ width: 60 }}></th>
                          <th>Cliente</th>
                          <th className="d-none d-lg-table-cell">Membresía</th>
                          <th>Estado</th>
                          <th>Precio</th>
                          <th style={{ width: "100px" }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientesPaginados.clientes.length > 0 ? (
                          clientesPaginados.clientes.map((cliente) => (
                            <ClienteRow
                              key={cliente._id || cliente.id}
                              cliente={cliente}
                              membership={getEstadoMembresia(cliente)}
                              progreso={calcularProgresoMembresia(cliente)}
                              isDarkMode={isDarkMode}
                              onSelect={seleccionarCliente}
                              onDelete={abrirModalEliminar}
                              onRenovar={abrirModalRenovar}
                              onTogglePago={togglePagoMes}
                            />
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-5">
                              <div className={isDarkMode ? "text-light opacity-50" : "text-muted"}>
                                <FaUsers size={48} className="mb-3 d-block mx-auto" />
                                <p>No se encontraron clientes con email registrado</p>
                                <small>Total clientes: {clientes.length} | Con email: {clientes.filter((c) => c.email?.trim()).length}</small>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 mb-4">
                    {clientesPaginados.clientes.length > 0 ? (
                      clientesPaginados.clientes.map((cliente) => {
                        const membership = getEstadoMembresia(cliente);
                        return (
                          <Card key={cliente.id} className="border-0 shadow-sm" role="button" onClick={() => seleccionarCliente(cliente)} style={{ transition: "all 0.3s ease", borderRadius: "12px", background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)" }}>
                            <Card.Body className="p-3">
                              <div className="d-flex align-items-center mb-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-3 shadow-sm" style={{ width: "50px", height: "50px", fontWeight: 700 }}>
                                  {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : <FaUser />}
                                </div>
                                <div className="flex-grow-1">
                                  <div className={`fw-bold mb-1 ${isDarkMode ? "text-white" : "text-dark"}`}>{cliente.nombre}</div>
                                  <div className={`small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}>DNI: {cliente.dni}</div>
                                  <div className="mt-2">
                                    <Badge bg={membership === "Activo" ? "success" : "danger"} className="me-2 px-3 py-2" style={{ borderRadius: "8px" }}>{membership}</Badge>
                                    <span className="text-success fw-bold">${(Number(cliente.precio) || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex justify-content-end">
                                <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); abrirModalEliminar(cliente, e); }} className="border-0 px-3" style={{ borderRadius: "8px" }}>
                                  <FaTrash />
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })
                    ) : (
                      <Alert variant={isDarkMode ? "dark" : "light"} className="text-center py-4 border-0 shadow-sm">
                        <FaUsers size={48} className={`mb-3 ${isDarkMode ? "text-light opacity-50" : "text-muted"}`} />
                        <p className={`mb-0 ${isDarkMode ? "text-light" : "text-muted"}`}>No se encontraron clientes con los criterios de búsqueda</p>
                      </Alert>
                    )}
                  </div>
                )}

                {clientesFiltrados.length > 10 && (
                  <div className="d-flex justify-content-center">
                    <Pagination className="mb-0">
                      <Pagination.Prev onClick={() => setPaginaActual((p) => Math.max(1, p - 1))} disabled={paginaActual === 1} />
                      {[...Array(clientesPaginados.totalPaginas).keys()].map((n) => (
                        <Pagination.Item key={n + 1} active={n + 1 === paginaActual} onClick={() => setPaginaActual(n + 1)}>{n + 1}</Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => setPaginaActual((p) => Math.min(clientesPaginados.totalPaginas, p + 1))} disabled={paginaActual === clientesPaginados.totalPaginas} />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Detalle cliente */}
            {clienteSeleccionado && (
              <Card ref={detalleClienteRef} id="detalle-cliente" className={`mt-5 border-0 shadow-lg overflow-hidden ${isDarkMode ? "bg-dark" : "bg-white"}`}>
                <div className="position-relative py-5 px-4" style={{ background: isDarkMode ? "linear-gradient(135deg, #1e40af 0%, #3730a3 100%)" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", minHeight: "180px" }}>
                  <Row className="align-items-center">
                    <Col xs={12} md={8} className="text-white">
                      <div className="d-flex align-items-center mb-4">
                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center me-4 shadow-lg" style={{ width: "80px", height: "80px" }}>
                          <FaUser size={40} color="#3b82f6" />
                        </div>
                        <div>
                          <h2 className="mb-2 fw-bold">{clienteSeleccionado.nombre}</h2>
                          <p className="mb-0 text-white text-opacity-75 fs-5">Cliente #{clienteSeleccionado.id} • DNI: {clienteSeleccionado.dni}</p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} md={4} className="text-md-end">
                      <Badge bg={getEstadoMembresia(clienteSeleccionado) === "Activo" ? "success" : "danger"} className="d-inline-flex align-items-center fs-6 px-4 py-2 mb-3" style={{ borderRadius: "12px" }}>
                        {getEstadoMembresia(clienteSeleccionado) === "Activo" ? <FaCheckCircle className="me-2" /> : <FaTimesCircle className="me-2" />}
                        Membresía: {getEstadoMembresia(clienteSeleccionado)}
                      </Badge>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col xs={12} className="d-flex justify-content-end">
                      <ButtonGroup>
                        <Button variant="light" size="md" className="d-flex align-items-center px-4 fw-bold" onClick={() => abrirModalEditar(clienteSeleccionado)} style={{ borderRadius: "12px 0 0 12px" }}>
                          <FaEdit className="me-2" /> Editar
                        </Button>
                        <Button variant="outline-light" size="md" className="d-flex align-items-center px-4 fw-bold" onClick={cancelarSeleccion} style={{ borderRadius: "0 12px 12px 0" }}>
                          <FaTimes className="me-2" /> Cerrar
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>
                </div>

                <Card.Body className="p-4">
                  <Row className="g-4">
                    <Col xs={12} md={6}>
                      <Card className={`h-100 border-0 ${isDarkMode ? "bg-dark" : "bg-light"} shadow-sm`}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-info bg-opacity-25" : "bg-primary bg-opacity-10"} p-2 me-3`}>
                              <FaUser size={18} className={isDarkMode ? "text-info" : "text-primary"} />
                            </div>
                            <h5 className="mb-0 fw-bold">Información Personal</h5>
                          </div>
                          <Table borderless className={`mb-0 ${isDarkMode ? "table-dark" : ""}`}>
                            <tbody>
                              <tr><td width="40%" className="fw-bold text-muted ps-0">Nombre Completo:</td><td className="fs-6">{clienteSeleccionado.nombre}</td></tr>
                              <tr><td className="fw-bold text-muted ps-0">DNI:</td><td className="fs-6">{clienteSeleccionado.dni}</td></tr>
                              <tr>
                                <td className="fw-bold text-muted ps-0">Email:</td>
                                <td className="fs-6">
                                  <div className="d-flex align-items-center">
                                    <FaEnvelope className={`me-2 ${isDarkMode ? "text-light" : "text-dark"}`} size={14} />
                                    <span>{clienteSeleccionado.email || "No registrado"}</span>
                                  </div>
                                </td>
                              </tr>
                              <tr><td className="fw-bold text-muted ps-0">Fecha de Registro:</td><td className="fs-6">{clienteSeleccionado.fechaInicio}</td></tr>
                              <tr><td className="fw-bold text-muted ps-0">Último Pago:</td><td className="fs-6">{clienteSeleccionado.fechaUltimoPago || "No disponible"}</td></tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12} md={6}>
                      <Card className={`h-100 border-0 ${isDarkMode ? "bg-dark" : "bg-light"} shadow-sm`}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-success bg-opacity-25" : "bg-success bg-opacity-10"} p-2 me-3`}>
                              <FaDollarSign size={18} className="text-success" />
                            </div>
                            <h5 className="mb-0 fw-bold">Detalles de Membresía</h5>
                          </div>
                          <Table borderless className={`mb-0 ${isDarkMode ? "table-dark" : ""}`}>
                            <tbody>
                              <tr>
                                <td width="40%" className="fw-bold text-muted ps-0">Inicio:</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <FaCalendarAlt className={`me-2 ${isDarkMode ? "text-light" : "text-dark"}`} size={14} />
                                    <span>{clienteSeleccionado.fechaInicio || "No disponible"}</span>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-bold text-muted ps-0">Vencimiento:</td>
                                <td>
                                  <Badge bg={clienteSeleccionado.estado === "Activo" ? "success" : "danger"} className="py-1 px-2" style={{ fontWeight: "normal" }}>
                                    {clienteSeleccionado.vencimiento}
                                  </Badge>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12}>
                      <Card className={`border-0 ${isDarkMode ? "bg-dark" : "bg-light"} shadow-sm`}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-warning bg-opacity-25" : "bg-warning bg-opacity-10"} p-2 me-3`}>
                              <FaDollarSign size={18} className="text-warning" />
                            </div>
                            <h5 className="mb-0 fw-bold">Información de Pago</h5>
                          </div>
                          <Row>
                            <Col md={4}>
                              <div className={`p-3 rounded-3 mb-3 ${isDarkMode ? "bg-dark bg-opacity-50" : "bg-light"}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-1 text-muted">Precio de Membresía</p>
                                    <h2 className="text-success fw-bold mb-0">${clienteSeleccionado.precio?.toLocaleString()}</h2>
                                  </div>
                                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-success bg-opacity-25" : "bg-success bg-opacity-10"} p-3`}>
                                    <FaDollarSign size={24} className="text-success" />
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className={`p-3 rounded-3 mb-3 ${isDarkMode ? "bg-dark bg-opacity-50" : "bg-light"}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-1 text-muted">Estado de Membresía</p>
                                    <h4 className={`fw-bold mb-0 ${getEstadoMembresia(clienteSeleccionado) === "Activo" ? "text-success" : "text-danger"}`}>
                                      {getEstadoMembresia(clienteSeleccionado)}
                                    </h4>
                                  </div>
                                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${getEstadoMembresia(clienteSeleccionado) === "Activo" ? isDarkMode ? "bg-success bg-opacity-25" : "bg-success bg-opacity-10" : isDarkMode ? "bg-danger bg-opacity-25" : "bg-danger bg-opacity-10"} p-3`}>
                                    {getEstadoMembresia(clienteSeleccionado) === "Activo" ? <FaCheckCircle size={24} className="text-success" /> : <FaTimesCircle size={24} className="text-danger" />}
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className={`p-3 rounded-3 mb-3 ${isDarkMode ? "bg-dark bg-opacity-50" : "bg-light"}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-1 text-muted">Pago Mes Actual</p>
                                    <h4 className={`fw-bold mb-0 ${clienteSeleccionado.pagoMesActual ? "text-success" : "text-danger"}`}>
                                      {clienteSeleccionado.pagoMesActual ? "Pagado" : "Pendiente"}
                                    </h4>
                                  </div>
                                  <Button variant={clienteSeleccionado.pagoMesActual ? "success" : "danger"} className="rounded-circle p-3" onClick={(e) => { e.stopPropagation(); togglePagoMes(clienteSeleccionado); }}>
                                    <FaDollarSign size={24} />
                                  </Button>
                                </div>
                              </div>
                            </Col>
                          </Row>
                          {getEstadoMembresia(clienteSeleccionado) === "Expirada" && (
                            <Alert variant="danger" className="mt-3 d-flex justify-content-between align-items-center">
                              <div>
                                <strong>Membresía Expirada</strong>
                                <p className="mb-0 small">Esta membresía ha vencido. Renuévala para reactivar el acceso.</p>
                              </div>
                              <Button variant="success" onClick={() => abrirModalRenovar(clienteSeleccionado)} className="ms-3">
                                <FaCheckCircle className="me-2" />Renovar Membresía
                              </Button>
                            </Alert>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>

      {/* ── Modales ── */}
      {[
        { show: showModalNuevo, onHide: () => setShowModalNuevo(false), title: "Nuevo Cliente", onSave: guardarNuevoCliente, saveLabel: "Guardar" },
        { show: showModalEditar, onHide: () => setShowModalEditar(false), title: "Editar Cliente", onSave: guardarClienteEditado, saveLabel: "Guardar Cambios" },
      ].map(({ show, onHide, title, onSave, saveLabel }) => (
        <Modal key={title} show={show} onHide={onHide} size="md">
          <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              {[
                { label: "Nombre Completo", name: "nombre", type: "text" },
                { label: "DNI", name: "dni", type: "text" },
                { label: "Email *", name: "email", type: "email", placeholder: "cliente@ejemplo.com", required: true, hint: <Form.Text className="text-muted"><strong>Campo obligatorio</strong> - Necesario para notificaciones{title === "Nuevo Cliente" ? " y gestión del cliente" : ""}</Form.Text> },
              ].map(({ label, name, type, placeholder, required, hint }) => (
                <Form.Group className="mb-3" key={name}>
                  <Form.Label>{label}</Form.Label>
                  <Form.Control type={type} name={name} value={formData[name] || ""} onChange={handleFormChange} placeholder={placeholder} required={required} />
                  {hint}
                </Form.Group>
              ))}
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Inicio</Form.Label>
                <Form.Control type="date" name="fechaInicio" value={formatearFechaParaInputFn(formData.fechaInicio)} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Vencimiento</Form.Label>
                <Form.Control type="date" name="vencimiento" value={formatearFechaParaInputFn(formData.vencimiento)} readOnly />
                <Form.Text>Se calcula automáticamente (30 días después del inicio)</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control type="number" name="precio" value={formData.precio} onChange={handleFormChange} />
                </InputGroup>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>Cancelar</Button>
            <Button variant="primary" onClick={onSave}>{saveLabel}</Button>
          </Modal.Footer>
        </Modal>
      ))}

      <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)}>
        <Modal.Header closeButton><Modal.Title>Confirmar Eliminación</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
          <p className="fw-bold">{clienteAEliminar?.nombre}</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminarCliente}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: isDarkMode ? "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(90deg, #ffffff 0%, #f8faff 100%)", color: isDarkMode ? "white" : "dark" }}>
          <Modal.Title><FaEnvelope className="me-2" />Historial de Emails Enviados</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: isDarkMode ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)", color: isDarkMode ? "white" : "dark" }}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h6 className="mb-3"><FaCalendarAlt className="me-2" />Filtrar por rango de fechas</h6>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Desde</Form.Label>
                    <Form.Control type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex gap-2">
                  <Button variant="secondary" onClick={() => { setFiltroDesde(""); setFiltroHasta(""); }}>Limpiar</Button>
                </Col>
              </Row>
              {(filtroDesde || filtroHasta) && (
                <Alert variant="info" className="mt-3 mb-0 py-2 d-flex align-items-center">
                  <FaFilter className="me-2" />
                  <span>
                    Mostrando emails
                    {filtroDesde && ` desde ${formatearFechaCorta(filtroDesde)}`}
                    {filtroHasta && ` hasta ${formatearFechaCorta(filtroHasta)}`}
                  </span>
                  <small className="text-muted ms-2">({emailsFiltrados.length} resultado/s)</small>
                </Alert>
              )}
            </Card.Body>
          </Card>

          {emailHistory.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaEnvelope size={40} className="mb-2" />
              <p className="mb-0">No se han enviado emails aún</p>
            </Alert>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {[...emailsFiltrados]
                .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))
                .map((email) => (
                  <Card key={email._id} className="mb-2" style={{ background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)", color: isDarkMode ? "white" : "dark", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}` }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1"><FaUser className="me-2 text-primary" />{email.clienteNombre}</h6>
                          <p className="mb-1 small"><FaUser className="me-1 text-muted" />DNI: {email.clienteDNI}</p>
                          <p className="mb-1 small"><FaEnvelope className="me-1 text-muted" />{email.clienteEmail}</p>
                          <p className="mb-0 small text-muted"><FaCalendarAlt className="me-1" />{new Date(email.fechaEnvio).toLocaleString("es-AR")}</p>
                        </div>
                        <div className="text-end d-flex flex-column align-items-end gap-2">
                          <div>
                            <Badge bg={email.tipo === "vencimiento" ? "danger" : email.tipo === "activacion" ? "info" : "warning"} className="mb-2">
                              {email.tipo === "vencimiento" ? "Vencida" : email.tipo === "activacion" ? "Activación" : "Recordatorio"}
                            </Badge>
                            <br />
                            <Badge bg={email.estado === "Enviado" ? "success" : email.estado === "Simulado" ? "warning" : "danger"}>
                              {email.estado === "Enviado" ? <><FaCheckCircle className="me-1" />Enviado</> : email.estado === "Simulado" ? <><FaEnvelope className="me-1" />Simulado</> : <><FaTimesCircle className="me-1" />Error</>}
                            </Badge>
                            {email.error && <div className="mt-1"><small className="text-muted" title={email.error}>{email.error.substring(0, 30)}...</small></div>}
                          </div>
                          <Button variant="outline-danger" size="sm" onClick={() => handleEliminarEmail(email._id)} className="border-0" title="Eliminar registro"><FaTrash /></Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: isDarkMode ? "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(90deg, #ffffff 0%, #f8faff 100%)" }}>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalRenovar} onHide={() => setShowModalRenovar(false)}>
        <Modal.Header closeButton><Modal.Title>Renovar Membresía</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas renovar la membresía de este cliente?</p>
          <p className="fw-bold">{clienteARenovar?.nombre}</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
          <p className="fw-bold">Cambios que se aplicarán:</p>
          <ul>
            <li>Se extenderá la fecha de vencimiento por 30 días más</li>
            <li>El estado cambiará a "Activo"</li>
            <li>Se marcará el pago del mes actual como completado</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalRenovar(false)}>Cancelar</Button>
          <Button variant="success" onClick={() => renovarMembresia(clienteARenovar)}><FaCheckCircle className="me-2" />Confirmar Renovación</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminClientes;