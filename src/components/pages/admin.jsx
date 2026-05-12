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
import { enviarCredencialesAcceso } from "../../services/emailService.js";
import "../../styles/admin.css";
import logo from "../../assets/logo-login.png";
const API = import.meta.env.VITE_API_URL;

dayjs.locale("es");

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

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const obtenerEstadoPago = (fechaVencimiento) => {
  const diferenciaDias = Math.floor(
    (new Date() - new Date(fechaVencimiento)) / 86400000,
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
  const fecha = new Date(
    Number(partes[2]),
    Number(partes[1]) - 1,
    Number(partes[0]),
  );
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

const StatCard = memo(({ title, value, icon: Icon, color, isDarkMode }) => (
  <Card
    className="h-100 border-0 shadow-lg"
    style={{
      background: isDarkMode
        ? "var(--bg-surface-dark)"
        : "var(--bg-surface-light)",
      borderRadius: "16px",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
          <h3
            className={`fw-bold mb-0 text-${color}`}
            style={{ fontSize: "1.5rem" }}
          >
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

const ClienteRow = memo(
  ({
    cliente,
    membership,
    isDarkMode,
    onSelect,
    onDelete,
    onRenovar,
    onTogglePago,
  }) => (
    <tr
      onClick={() => onSelect(cliente)}
      style={{ cursor: "pointer" }}
      className="align-middle"
    >
      <td>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
          style={{
            width: 40,
            height: 40,
            fontWeight: 700,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
          }}
        >
          {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : <FaUser />}
        </div>
      </td>
      <td>
        <div className={`fw-bold ${isDarkMode ? "text-white" : "text-dark"}`}>
          {cliente.nombre}
        </div>
        <div
          className={`small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}
        >
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
        <div
          className={`small mb-1 ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}
        >
          Vence: {cliente.vencimiento || "—"}
        </div>
      </td>
      <td>
        <Badge
          bg={membership === "Activo" ? "success" : "danger"}
          className="d-inline-flex align-items-center px-3 py-2"
          style={{ borderRadius: "6px" }}
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
        <div className="fw-bold fs-5" style={{ color: "#059669" }}>
          ${(Number(cliente.precio) || 0).toLocaleString()}
        </div>
        <small className={isDarkMode ? "text-light opacity-75" : "text-muted"}>
          mensual
        </small>
      </td>
      <td>
        <div className="d-flex gap-1">
          {membership === "Expirada" && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRenovar(cliente, e);
              }}
              className="border-0"
              title="Renovar membresía"
            >
              <FaCheckCircle />
            </Button>
          )}
          <Button
            variant={cliente.pagoMesActual ? "success" : "danger"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePago(cliente);
            }}
            className="border-0"
          >
            <FaDollarSign />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cliente, e);
            }}
            className="border-0"
          >
            <FaTrash />
          </Button>
        </div>
      </td>
    </tr>
  ),
);

const Sidebar = memo(
  ({
    isDarkMode,
    navigate,
    handleOpenEmailModal,
    handleLogout,
    cuentasVencidas,
  }) => (
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
              className="d-flex align-items-center mb-2 text-white"
              style={{
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                fontWeight: 600,
                position: "relative",
              }}
            >
              <FaUsers className="me-2" />
              <span>Gestión de Clientes</span>
            </Nav.Link>

            <Nav.Link
              className="d-flex align-items-center mb-2"
              onClick={() => navigate("/rutinas")}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "rgba(255, 255, 255, 0.55)",
                fontWeight: 500,
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
                padding: "12px 16px",
                cursor: "pointer",
                color: "rgba(255, 255, 255, 0.55)",
                fontWeight: 500,
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
                color: "rgba(248, 113, 113, 0.8)",
                fontWeight: 500,
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
  ),
);

const BarChart = memo(
  ({ datosIngresos, valorMaximo, isDarkMode, isMobile }) => {
    const [hoveredBar, setHoveredBar] = useState(null);

    const barColors = [
      "#2563eb",
      "#3b82f6",
      "#60a5fa",
      "#93bbfd",
      "#7c3aed",
      "#8b5cf6",
      "#a78bfa",
      "#c4b5fd",
      "#0891b2",
      "#06b6d4",
      "#22d3ee",
      "#67e8f9",
    ];

    const hayDatos = datosIngresos.some((item) => item.valor > 0);
    if (!hayDatos) {
      return (
        <Card className="shadow-sm mb-3" style={{ borderRadius: "12px" }}>
          <Card.Body className="text-center py-4">
            <Card.Title as="h5" className="mb-2">
              Ingresos por mes basados en clientes registrados
            </Card.Title>
            <p className="text-muted small">
              No hay datos de ingresos para mostrar en el gráfico.
            </p>
          </Card.Body>
        </Card>
      );
    }

    const chartHeight = isMobile ? 180 : 240;
    const gap = isMobile ? 4 : 12;
    const indexMax = datosIngresos.reduce(
      (acc, cur, i) => (cur.valor > (datosIngresos[acc]?.valor || 0) ? i : acc),
      0,
    );

    return (
      <Card className="shadow-sm mb-3" style={{ borderRadius: "12px" }}>
        <Card.Body
          style={{
            background: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "#f8fafc",
          }}
        >
          <Card.Title as="h6" className="mb-3" style={{ fontWeight: 600 }}>
            Ingresos por mes basados en clientes registrados
          </Card.Title>
          <div style={{ padding: isMobile ? "0.25rem" : "1rem" }}>
            <div
              style={{
                height: chartHeight + 40,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap,
                  height: chartHeight,
                }}
              >
                {datosIngresos.map((item, index) => {
                  const valor = item.valor || 0;
                  const heightPx =
                    valorMaximo > 0
                      ? Math.max(
                          (valor / valorMaximo) * chartHeight,
                          valor > 0 ? 6 : 2,
                        )
                      : 0;
                  const barColor = barColors[index % barColors.length];
                  const isMax = index === indexMax;

                  return (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: isMobile ? 20 : 28,
                      }}
                    >
                      <div style={{ height: chartHeight - heightPx }} />
                      <div
                        role="button"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{
                          width: isMobile ? "90%" : "70%",
                          height: heightPx,
                          background: barColor,
                          borderRadius: isMax ? 8 : 6,
                          boxShadow:
                            hoveredBar === index
                              ? `0 8px 20px ${barColor}40`
                              : `0 2px 8px ${barColor}20`,
                          transition:
                            "transform 150ms ease, box-shadow 150ms ease",
                          transform:
                            hoveredBar === index
                              ? "translateY(-4px) scale(1.02)"
                              : "translateY(0)",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        {(hoveredBar === index || (!isMobile && isMax)) &&
                          valor > 0 && (
                            <div
                              style={{
                                position: "absolute",
                                top: -28,
                                background: isDarkMode
                                  ? "rgba(15, 23, 42, 0.95)"
                                  : "rgba(255, 255, 255, 0.95)",
                                color: isDarkMode ? "#e2e8f0" : "#1e293b",
                                padding: "4px 10px",
                                borderRadius: 8,
                                fontSize: isMobile ? 9 : 12,
                                fontWeight: 600,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                whiteSpace: "nowrap",
                                border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.2)" : "rgba(0,0,0,0.1)"}`,
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
                          color: isDarkMode ? "#94a3b8" : "#64748b",
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
                  color: isDarkMode ? "#64748b" : "#94a3b8",
                }}
              >
                Datos basados en clientes activos — año actual
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  },
);

const AdminClientes = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();

  const detalleClienteRef = useRef(null);
  const tablaClientesRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");
      if (!token || userType !== "admin") navigate("/login", { replace: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 992);

  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [showModalRenovar, setShowModalRenovar] = useState(false);
  const [clienteARenovar, setClienteARenovar] = useState(null);

  const [clientes, setClientes] = useState(() => {
    try {
      const saved = localStorage.getItem("clientes");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [cuentasVencidas, setCuentasVencidas] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [verificandoEmails, setVerificandoEmails] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    email: "",
    fechaInicio: "",
    vencimiento: "",
    estado: "Activo",
    estadoCuenta: "Activo",
    precio: 10000,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    let timeoutId;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 992), 100);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () => localStorage.setItem("clientes", JSON.stringify(clientes)),
      500,
    );
    return () => clearTimeout(t);
  }, [clientes]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/clientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) setClientes(res.data);
      } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    const fechaActual = new Date();
    const ultimaVerificacionPagos = localStorage.getItem(
      "ultimaVerificacionPagos",
    );
    let debeResetear = !ultimaVerificacionPagos;

    if (ultimaVerificacionPagos) {
      const prev = new Date(ultimaVerificacionPagos);
      if (
        fechaActual.getMonth() !== prev.getMonth() ||
        fechaActual.getFullYear() !== prev.getFullYear()
      ) {
        debeResetear = true;
      }
    }

    if (debeResetear) {
      setClientes((prev) => {
        const actualizados = prev.map((c) => ({ ...c, pagoMesActual: false }));
        localStorage.setItem("clientes", JSON.stringify(actualizados));
        return actualizados;
      });
      localStorage.setItem(
        "ultimaVerificacionPagos",
        fechaActual.toISOString(),
      );
    }
  }, []);

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

  useEffect(() => {
    const hoy = new Date();
    const vencidas = clientes.filter((cliente) => {
      if (!cliente.vencimiento || !cliente.email?.trim()) return false;
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        return new Date(`${anio}-${mes}-${dia}T23:59:59`) < hoy;
      } catch {
        return false;
      }
    });
    setCuentasVencidas(vencidas);
  }, [clientes]);

  const estadisticas = useMemo(() => {
    const activos = clientes.filter(
      (c) => getEstadoMembresiaFn(c) === "Activo",
    ).length;
    const expiradas = clientes.filter(
      (c) => getEstadoMembresiaFn(c) === "Expirada",
    ).length;
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

  const datosIngresos = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
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

    return meses.map((mes, index) => ({
      mes,
      valor: ingresosMensuales[index],
    }));
  }, [clientes]);

  const valorMaximo = useMemo(
    () => Math.max(...datosIngresos.map((i) => i.valor), 0) || 10000,
    [datosIngresos],
  );

  const clientesFiltrados = useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    return clientes.filter((cliente) => {
      const nombre = (cliente.nombre || "").toLowerCase();
      const dni = String(cliente.dni || "");
      const termino = debouncedSearchTerm.toLowerCase();
      const coincide = nombre.includes(termino) || dni.includes(termino);
      if (filtroActivo === "activos")
        return coincide && getEstadoMembresiaFn(cliente) === "Activo";
      if (filtroActivo === "vencidos")
        return coincide && getEstadoMembresiaFn(cliente) === "Expirada";
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

  const calcularProgresoMembresia = useCallback((cliente) => {
    const inicio = parseFechaDD_MM_YYYY(cliente.fechaInicio);
    const venc = parseFechaDD_MM_YYYY(cliente.vencimiento);
    const ahora = new Date();
    if (!inicio || !venc)
      return { pct: 0, diasRestantes: null, vencido: false };
    const totalMs = venc - inicio;
    const restanteMs = venc - ahora;
    const vencido = restanteMs <= 0;
    const transcurridoMs =
      ahora > inicio ? Math.min(Math.max(0, ahora - inicio), totalMs) : 0;
    const pct =
      totalMs > 0 ? Math.round((transcurridoMs / totalMs) * 100) : 100;
    const diasRestantes = vencido
      ? 0
      : Math.ceil(Math.max(0, restanteMs) / 86400000);
    return { pct: Math.max(0, Math.min(100, pct)), diasRestantes, vencido };
  }, []);

  const getEstadoMembresia = useCallback(getEstadoMembresiaFn, []);

  const estadoPagoSeleccionado = useMemo(
    () =>
      clienteSeleccionado
        ? obtenerEstadoPago(clienteSeleccionado.vencimiento)
        : null,
    [clienteSeleccionado],
  );

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

  const seleccionarCliente = useCallback((cliente) => {
    setClienteSeleccionado(cliente);
    setTimeout(() => {
      requestAnimationFrame(() => {
        const detalleElement =
          detalleClienteRef.current ||
          document.getElementById("detalle-cliente");
        if (detalleElement) {
          const rect = detalleElement.getBoundingClientRect();
          if (rect.height > 0) {
            const targetPosition = rect.top + window.pageYOffset - 20;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1600;
            let start = null;
            const animation = (currentTime) => {
              if (start === null) start = currentTime;
              const timeElapsed = currentTime - start;
              const progress = Math.min(timeElapsed / duration, 1);
              const ease =
                progress < 0.5
                  ? 8 * progress ** 4
                  : 1 - Math.pow(-2 * progress + 2, 4) / 2;
              window.scrollTo(0, startPosition + distance * ease);
              if (timeElapsed < duration) requestAnimationFrame(animation);
            };
            requestAnimationFrame(animation);
          } else {
            setTimeout(() => {
              (
                detalleClienteRef.current ||
                document.getElementById("detalle-cliente")
              )?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }
        }
      });
    }, 100);
  }, []);

  const cancelarSeleccion = useCallback(() => {
    const tablaElement =
      tablaClientesRef.current || document.getElementById("tabla-clientes");
    if (tablaElement) {
      const targetPosition =
        tablaElement.getBoundingClientRect().top + window.pageYOffset - 100;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1200;
      let start = null;
      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease =
          progress < 0.5
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
    const fmt = (d) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    setFormData({
      nombre: "",
      dni: "",
      email: "",
      fechaInicio: fmt(hoy),
      vencimiento: fmt(venc),
      estado: "Activo",
      estadoCuenta: "Activo",
      precio: 10000,
    });
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

  const guardarNuevoCliente = async () => {
    if (!formData.nombre?.trim())
      return Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El nombre es obligatorio",
      });
    if (!formData.dni?.trim())
      return Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El DNI es obligatorio",
      });
    if (!formData.email?.trim())
      return Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El email es obligatorio para enviar las credenciales",
      });

    try {
      Swal.fire({
        title: "Registrando cliente...",
        html: "Se enviará un email con las credenciales de acceso",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const token = localStorage.getItem("token");
      const partes = formData.nombre.trim().split(" ");
      const hoy = new Date().toISOString().split("T")[0];
      const unMesDespues = new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split("T")[0];

      const res = await axios.post(
        `${API}/api/auth/registrar-cliente`,
        {
          nombre: partes[0] || formData.nombre.trim(),
          apellido: partes.slice(1).join(" ") || "",
          dni: formData.dni.trim(),
          email: formData.email.trim().toLowerCase(),
          fechaInicio: formData.fechaInicio || hoy,
          vencimiento: formData.vencimiento || unMesDespues,
          precio: parseFloat(formData.precio) || 10000,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data?.cliente && res.data?.passwordTemporal) {
        await enviarCredencialesAcceso(
          res.data.cliente,
          res.data.passwordTemporal,
        );
      }

      const c = res.data.cliente;
      setClientes((prev) => [
        ...prev,
        {
          id: c.id,
          _id: c.id,
          nombre: c.nombre,
          dni: c.dni,
          email: c.email,
          fechaInicio: c.fechaInicio,
          vencimiento: c.vencimiento,
          estadoCuenta: c.estadoCuenta || "Activo",
          precio: c.precio || 10000,
          pagoMesActual: c.pagoMesActual || false,
          cuentaActivada: c.cuentaActivada || false,
        },
      ]);
      setShowModalNuevo(false);
      Swal.fire({
        icon: "success",
        title: "¡Cliente registrado!",
        html: `<div style="text-align:left"><p><strong>${formData.nombre}</strong> ha sido registrado correctamente.</p><hr><p>📧 Se ha enviado un email a <strong>${formData.email}</strong> con:</p><ul><li>Credenciales de acceso temporales</li><li>Enlace para cambiar contraseña</li></ul><p class="text-muted small">El cliente deberá cambiar su contraseña antes de poder acceder.</p></div>`,
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      const msg =
        error.response?.data?.mensaje ||
        (error.request ? "No se pudo conectar con el servidor" : error.message);
      Swal.fire({ icon: "error", title: "Error al registrar", text: msg });
    }
  };

  const guardarClienteEditado = async () => {
    try {
      const token = localStorage.getItem("token");
      const clienteId = clienteSeleccionado?._id;
      const res = await axios.put(
        `${API}/api/clientes/${clienteId}`,
        {
          nombre: formData.nombre,
          dni: formData.dni,
          email: formData.email,
          fechaInicio: formData.fechaInicio,
          vencimiento: formData.vencimiento,
          precio: formData.precio,
          estadoCuenta: formData.estadoCuenta,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setClientes((prev) =>
        prev.map((c) =>
          c._id === clienteId || c.id === clienteId ? res.data : c,
        ),
      );
      if (
        clienteSeleccionado?._id === clienteId ||
        clienteSeleccionado?.id === clienteId
      )
        setClienteSeleccionado(res.data);
      setShowModalEditar(false);
      Swal.fire({
        icon: "success",
        title: "¡Cliente actualizado!",
        text: `Se actualizó ${formData.nombre} correctamente`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.mensaje || "No se pudo actualizar el cliente",
      });
    }
  };

  const confirmarEliminarCliente = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API}/api/clientes/${clienteAEliminar._id || clienteAEliminar.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setClientes((prev) =>
        prev.filter(
          (c) => c._id !== clienteAEliminar._id && c.id !== clienteAEliminar.id,
        ),
      );
      setShowModalEliminar(false);
      Swal.fire({
        icon: "success",
        title: "Cliente eliminado",
        text: `${clienteAEliminar.nombre} fue eliminado correctamente`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.mensaje || "No se pudo eliminar el cliente",
      });
    }
  };

  const renovarMembresia = async (cliente) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/api/membresias/${cliente.id}/renovar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setClientes((prev) =>
        prev.map((c) =>
          c.id === cliente.id ? { ...c, ...res.data.cliente } : c,
        ),
      );
      setShowModalRenovar(false);
      Swal.fire({
        icon: "success",
        title: "Membresía renovada",
        text: `La membresía de ${cliente.nombre} fue renovada correctamente`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.mensaje || "No se pudo renovar la membresía",
      });
    }
  };

  const togglePagoMes = useCallback(
    async (cliente) => {
      const estaPagado = cliente.pagoMesActual;
      const confirmacion = await Swal.fire({
        title: estaPagado ? "Quitar pago del mes" : "Registrar pago del mes",
        html: `<div style="font-size:15px">Cliente: <b>${cliente.nombre}</b><br/>Mes: <b>${dayjs().format("MMMM YYYY")}</b><br/><br/>${estaPagado ? "Se eliminará el registro de pago." : "Se confirmará que el cliente pagó este mes."}</div>`,
        icon: estaPagado ? "warning" : "question",
        showCancelButton: true,
        confirmButtonColor: estaPagado ? "#d33" : "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: estaPagado
          ? "Sí, quitar pago"
          : "Sí, confirmar pago",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacion.isConfirmed) return;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `${API}/api/membresias/${cliente._id}/pago`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const clienteActualizado = response.data.cliente;
        setClientes((prev) =>
          prev.map((c) => (c._id === cliente._id ? clienteActualizado : c)),
        );
        if (clienteSeleccionado?._id === cliente._id)
          setClienteSeleccionado(clienteActualizado);
        await Swal.fire({
          icon: "success",
          title: estaPagado ? "Pago eliminado" : "Pago registrado",
          text: estaPagado
            ? "El cliente figura como pendiente este mes."
            : "El cliente ahora figura como pagado.",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el estado del pago.",
        });
      }
    },
    [clienteSeleccionado],
  );

  const fetchEmailHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setEmailHistory([]);
        return Swal.fire({
          icon: "error",
          title: "No autenticado",
          text: "Debes iniciar sesión para ver el historial de emails.",
        });
      }
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
      const mensaje =
        error.response?.status === 403
          ? "No tienes permisos para ver el historial de emails. Vuelve a iniciar sesión."
          : "No se pudo obtener el historial de emails";
      Swal.fire({
        icon: "error",
        title: "Error al cargar historial",
        text: error.response?.data?.mensaje || mensaje,
      });
    }
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
    },
    [fetchEmailHistory],
  );

  const handleVerificarEmails = useCallback(async () => {
    setVerificandoEmails(true);
    try {
      Swal.fire({
        title: "Verificando emails...",
        html: "Por favor espera mientras verificamos las cuentas vencidas",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
      const { verificarYNotificarExpiraciones } =
        await import("../../services/emailService");
      const resultado = await verificarYNotificarExpiraciones();
      if (resultado.error) {
        Swal.fire({
          icon: "error",
          title: "Error en la verificación",
          text: resultado.error.message,
          confirmButtonColor: "#dc3545",
        });
      } else {
        let icon =
          resultado.clientesVencidos === 0
            ? "info"
            : resultado.errores > 0 && resultado.emailsEnviados === 0
              ? "error"
              : resultado.errores > 0
                ? "warning"
                : "success";
        Swal.fire({
          icon,
          title: "Verificación completada",
          html: `<div style="text-align:left;padding:10px"><div style="margin-bottom:15px"><h5 style="color:#6c757d;font-size:1.1em;margin-bottom:10px">📊 Resumen de verificación</h5></div><div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:10px"><p style="margin:8px 0"><strong>Clientes verificados:</strong> <span style="color:#0d6efd">${resultado.totalVerificados}</span></p><p style="margin:8px 0"><strong>Emails enviados:</strong> <span style="color:#28a745">${resultado.emailsEnviados}</span></p><p style="margin:8px 0"><strong>Errores:</strong> <span style="color:${resultado.errores > 0 ? "#ffc107" : "#6c757d"}">${resultado.errores}</span></p></div>${resultado.emailsEnviados > 0 ? `<div style="background:#d4edda;color:#155724;padding:10px;border-radius:6px;border-left:4px solid #28a745"><small>¡Revisa tu bandeja de entrada de Gmail para confirmar los envíos!</small></div>` : `<div style="background:#d1ecf1;color:#0c5460;padding:10px;border-radius:6px;border-left:4px solid #17a2b8"><small>No se enviaron emails (no hay cuentas vencidas con email válido)</small></div>`}</div>`,
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Entendido",
          width: "600px",
        });
        localStorage.setItem(
          "ultimaVerificacionEmails",
          new Date().toISOString(),
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: error.message,
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setVerificandoEmails(false);
    }
  }, []);

  const exportarExcel = useCallback(async () => {
    if (!clientesFiltrados.length) {
      Swal.fire({
        icon: "info",
        title: "Sin datos",
        text: "No hay clientes para exportar con los filtros actuales.",
      });
      return;
    }

    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "HULK GYM";
    workbook.created = new Date();

    const C = {
      navy: "0F172A",
      navyMid: "1E293B",
      slate: "334155",
      slateLight: "64748B",
      white: "FFFFFF",
      rowAlt: "F8FAFC",
      rowBase: "FFFFFF",
      green: "059669",
      greenBg: "D1FAE5",
      red: "DC2626",
      redBg: "FEE2E2",
      amber: "D97706",
      amberBg: "FEF3C7",
      accent: "3B82F6",
      accentBg: "DBEAFE",
      border: "E2E8F0",
    };

    const thinBorder = (color = C.border) => ({
      top: { style: "thin", color: { argb: color } },
      bottom: { style: "thin", color: { argb: color } },
      left: { style: "thin", color: { argb: color } },
      right: { style: "thin", color: { argb: color } },
    });

    const ws = workbook.addWorksheet("Clientes", {
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
      },
      views: [{ state: "frozen", ySplit: 4 }],
    });

    ws.columns = [
      { key: "num", width: 6 },
      { key: "nombre", width: 32 },
      { key: "dni", width: 16 },
      { key: "email", width: 36 },
      { key: "inicio", width: 14 },
      { key: "vencimiento", width: 14 },
      { key: "estado", width: 14 },
      { key: "pago", width: 14 },
      { key: "precio", width: 15 },
    ];

    ws.mergeCells("A1:I1");
    const bannerCell = ws.getCell("A1");
    bannerCell.value = "💪  HULK GYM — Listado de Clientes";
    bannerCell.font = {
      name: "Arial",
      bold: true,
      size: 16,
      color: { argb: C.white },
    };
    bannerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.navy },
    };
    bannerCell.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 36;

    ws.mergeCells("A2:I2");
    const subCell = ws.getCell("A2");
    subCell.value = `Exportado el ${new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}   ·   ${clientesFiltrados.length} clientes`;
    subCell.font = { name: "Arial", size: 10, color: { argb: C.slateLight } };
    subCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.navyMid },
    };
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(2).height = 20;

    ws.mergeCells("A3:I3");
    ws.getCell("A3").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.navyMid },
    };
    ws.getRow(3).height = 6;

    const headers = [
      "#",
      "Nombre y Apellido",
      "DNI",
      "Correo Electrónico",
      "Inicio",
      "Vencimiento",
      "Estado",
      "Pago Mes",
      "Precio",
    ];
    const headerRow = ws.getRow(4);
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = {
        name: "Arial",
        bold: true,
        size: 10,
        color: { argb: C.white },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: C.slate },
      };
      cell.alignment = {
        horizontal: i === 0 ? "center" : i === 8 ? "right" : "left",
        vertical: "middle",
        wrapText: false,
      };
      cell.border = thinBorder(C.navyMid);
    });
    headerRow.height = 26;
    ws.getCell("I4").alignment = { horizontal: "center", vertical: "middle" };

    clientesFiltrados.forEach((c, i) => {
      const rowNum = i + 5;
      const row = ws.getRow(rowNum);
      const isEven = i % 2 === 0;
      const estado = getEstadoMembresiaFn(c);
      const pagado = c.pagoMesActual;

      const bgBase = isEven ? C.rowBase : C.rowAlt;

      const values = [
        i + 1,
        c.nombre,
        c.dni,
        c.email || "—",
        c.fechaInicio || "—",
        c.vencimiento || "—",
        estado,
        pagado ? "✓ Pagado" : "✗ Pendiente",
        Number(c.precio) || 0,
      ];

      values.forEach((val, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = val;
        cell.font = { name: "Arial", size: 10, color: { argb: C.navyMid } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgBase },
        };
        cell.alignment = { vertical: "middle", wrapText: false };
        cell.border = {
          bottom: { style: "thin", color: { argb: C.border } },
          right: { style: "thin", color: { argb: C.border } },
        };

        if (colIdx === 0) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 9, color: { argb: C.slateLight } };
        }

        if (colIdx === 6) {
          const isActivo = estado === "Activo";
          cell.font = {
            name: "Arial",
            bold: true,
            size: 9,
            color: { argb: isActivo ? C.green : C.red },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isActivo ? C.greenBg : C.redBg },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        if (colIdx === 7) {
          cell.font = {
            name: "Arial",
            bold: true,
            size: 9,
            color: { argb: pagado ? C.green : C.amber },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: pagado ? C.greenBg : C.amberBg },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }

        if (colIdx === 8) {
          cell.numFmt = '"$"#,##0';
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.font = {
            name: "Arial",
            bold: true,
            size: 10,
            color: { argb: C.navy },
          };
        }
      });

      row.height = 22;
    });

    const totalRowNum = clientesFiltrados.length + 5;
    const totalRow = ws.getRow(totalRowNum);
    ws.mergeCells(`A${totalRowNum}:H${totalRowNum}`);
    const totalLabelCell = totalRow.getCell(1);
    totalLabelCell.value = `TOTAL — ${clientesFiltrados.length} clientes`;
    totalLabelCell.font = {
      name: "Arial",
      bold: true,
      size: 10,
      color: { argb: C.white },
    };
    totalLabelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.slate },
    };
    totalLabelCell.alignment = { horizontal: "right", vertical: "middle" };

    const totalPriceCell = totalRow.getCell(9);
    totalPriceCell.value = clientesFiltrados.reduce(
      (t, c) => t + (Number(c.precio) || 0),
      0,
    );
    totalPriceCell.numFmt = '"$"#,##0';
    totalPriceCell.font = {
      name: "Arial",
      bold: true,
      size: 11,
      color: { argb: C.white },
    };
    totalPriceCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.slate },
    };
    totalPriceCell.alignment = { horizontal: "right", vertical: "middle" };
    totalRow.height = 26;

    const ws2 = workbook.addWorksheet("Resumen");
    ws2.columns = [{ width: 3 }, { width: 32 }, { width: 22 }, { width: 3 }];

    const addResumenRow = (label, value, opts = {}) => {
      const rowNum = ws2.lastRow ? ws2.lastRow.number + 1 : 1;
      const row = ws2.addRow(["", label, value, ""]);
      row.height = opts.height || 28;

      const lCell = row.getCell(2);
      const vCell = row.getCell(3);

      lCell.font = {
        name: "Arial",
        size: opts.labelSize || 11,
        color: { argb: opts.labelColor || C.slate },
        bold: opts.bold,
      };
      lCell.alignment = { horizontal: "right", vertical: "middle" };

      vCell.font = {
        name: "Arial",
        bold: true,
        size: opts.valueSize || 13,
        color: { argb: opts.valueColor || C.navy },
      };
      vCell.alignment = { horizontal: "left", vertical: "middle" };
      if (opts.numFmt) vCell.numFmt = opts.numFmt;
      if (opts.valueBg) {
        lCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: opts.valueBg },
        };
        vCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: opts.valueBg },
        };
        row.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: opts.valueBg },
        };
        row.getCell(4).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: opts.valueBg },
        };
      }
      return row;
    };

    const activos = clientesFiltrados.filter(
      (c) => getEstadoMembresiaFn(c) === "Activo",
    ).length;
    const expiradas = clientesFiltrados.filter(
      (c) => getEstadoMembresiaFn(c) === "Expirada",
    ).length;
    const pagados = clientesFiltrados.filter((c) => c.pagoMesActual).length;
    const ingresos = clientesFiltrados.reduce(
      (t, c) => t + (Number(c.precio) || 0),
      0,
    );

    ws2.mergeCells("A1:D1");
    const r2Banner = ws2.getCell("A1");
    r2Banner.value = "💪  HULK GYM — Resumen Ejecutivo";
    r2Banner.font = {
      name: "Arial",
      bold: true,
      size: 16,
      color: { argb: C.white },
    };
    r2Banner.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.navy },
    };
    r2Banner.alignment = { horizontal: "center", vertical: "middle" };
    ws2.getRow(1).height = 38;

    ws2.mergeCells("A2:D2");
    ws2.getCell("A2").value =
      `Período: ${new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`;
    ws2.getCell("A2").font = {
      name: "Arial",
      size: 10,
      color: { argb: C.slateLight },
    };
    ws2.getCell("A2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.navyMid },
    };
    ws2.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };
    ws2.getRow(2).height = 20;
    ws2.addRow([]).height = 12;

    ws2.mergeCells("A4:D4");
    ws2.getCell("A4").value = "MEMBRESÍAS";
    ws2.getCell("A4").font = {
      name: "Arial",
      bold: true,
      size: 9,
      color: { argb: C.slateLight },
    };
    ws2.getCell("A4").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.rowAlt },
    };
    ws2.getCell("A4").alignment = { horizontal: "center", vertical: "middle" };
    ws2.getRow(4).height = 18;

    addResumenRow("Total de clientes", clientesFiltrados.length, {
      bold: true,
      valueColor: C.accent,
      valueBg: C.accentBg,
      valueSize: 15,
      height: 32,
    });
    addResumenRow("Membresías activas", activos, {
      bold: true,
      valueColor: C.green,
      valueBg: C.greenBg,
      valueSize: 14,
      height: 30,
    });
    addResumenRow("Membresías expiradas", expiradas, {
      bold: true,
      valueColor: C.red,
      valueBg: C.redBg,
      valueSize: 14,
      height: 30,
    });

    ws2.addRow([]).height = 10;

    ws2.mergeCells(`A${ws2.lastRow.number + 1}:D${ws2.lastRow.number + 1}`);
    const secPagos = ws2.lastRow;
    secPagos.height = 18;
    secPagos.getCell(1).value = "PAGOS DEL MES";
    secPagos.getCell(1).font = {
      name: "Arial",
      bold: true,
      size: 9,
      color: { argb: C.slateLight },
    };
    secPagos.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: C.rowAlt },
    };
    secPagos.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    addResumenRow("Pagos confirmados", pagados, {
      bold: true,
      valueColor: C.green,
      valueBg: C.greenBg,
      valueSize: 14,
      height: 30,
    });
    addResumenRow("Pagos pendientes", clientesFiltrados.length - pagados, {
      bold: true,
      valueColor: C.amber,
      valueBg: C.amberBg,
      valueSize: 14,
      height: 30,
    });
    addResumenRow("Ingreso mensual total", ingresos, {
      bold: true,
      valueColor: C.navy,
      valueBg: C.accentBg,
      valueSize: 15,
      height: 34,
      numFmt: '"$"#,##0',
    });

    ws2.addRow([]).height = 10;

    const lastR = ws2.lastRow.number + 1;
    ws2.mergeCells(`A${lastR}:D${lastR}`);
    ws2.getCell(`A${lastR}`).value =
      `Generado por HULK GYM · ${new Date().toLocaleString("es-AR")}`;
    ws2.getCell(`A${lastR}`).font = {
      name: "Arial",
      size: 9,
      italic: true,
      color: { argb: C.slateLight },
    };
    ws2.getCell(`A${lastR}`).alignment = { horizontal: "center" };
    ws2.getRow(lastR).height = 18;

    const fecha = new Date().toLocaleDateString("es-AR").replace(/\//g, "-");
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `HULKGYM_Clientes_${fecha}.xlsx`,
    );

    Swal.fire({
      icon: "success",
      title: "¡Reporte exportado!",
      html: `<strong>${clientesFiltrados.length}</strong> clientes en 2 hojas.<br/>✅ Formato profesional`,
      timer: 2500,
      showConfirmButton: false,
    });
  }, [clientesFiltrados]);

  return (
    <Container
      fluid
      className="admin-layout min-vh-100 d-flex flex-column p-0"
      style={{
        background: isDarkMode ? "#0f172a" : "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <Row className="flex-grow-1 g-0">
        <Col
          xs={2}
          md={2}
          lg={2}
          className="admin-sidebar d-none d-lg-block p-0"
          style={{
            minHeight: "100vh",
            background: "#0f172a",
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

        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          className="w-75"
          style={{
            background: "#1e293b",
          }}
          placement="start"
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
                  fontSize: "1.8rem",
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
                  PANEL DE ADMINISTRACIÓN
                </h1>
                <p
                  className={`${isMobile ? "small" : "lead"} ${isDarkMode ? "text-light" : "text-muted"}`}
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                    fontWeight: 300,
                  }}
                >
                  Gestiona tu gimnasio de manera eficiente
                </p>
              </div>
              <Button
                variant={isDarkMode ? "outline-light" : "outline-dark"}
                onClick={alternarTema}
                className="d-none d-md-flex align-items-center border-0"
                style={{
                  borderRadius: "8px",
                }}
              >
                {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
              </Button>
            </div>

            <Row className="g-3 mb-4">
              <Col xs={6} lg={3}>
                <StatCard
                  title="Clientes Activos"
                  value={estadisticas.clientesActivos}
                  icon={FaUsers}
                  color="success"
                  isDarkMode={isDarkMode}
                />
              </Col>
              <Col xs={6} lg={3}>
                <StatCard
                  title="Membresías Expiradas"
                  value={estadisticas.membresiasVencidas}
                  icon={FaTimesCircle}
                  color={
                    estadisticas.membresiasVencidas > 0 ? "danger" : "secondary"
                  }
                  isDarkMode={isDarkMode}
                />
              </Col>
              <Col xs={6} lg={3}>
                <StatCard
                  title="Ingresos Anuales"
                  value={estadisticas.ingresosMes}
                  icon={FaDollarSign}
                  color={isDarkMode ? "info" : "primary"}
                  isDarkMode={isDarkMode}
                />
              </Col>
              <Col xs={6} lg={3}>
                <StatCard
                  title="Total Clientes"
                  value={estadisticas.totalClientes}
                  icon={FaChartLine}
                  color="secondary"
                  isDarkMode={isDarkMode}
                />
              </Col>
            </Row>

            <Card
              className="admin-card border-0 mb-5"
              style={{
                background: isDarkMode ? "#1e293b" : "#ffffff",
                borderRadius: "16px",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${isDarkMode ? "bg-info bg-opacity-10" : "bg-primary bg-opacity-10"}`}
                    style={{ width: "50px", height: "50px" }}
                  >
                    <FaChartLine
                      className={isDarkMode ? "text-info" : "text-primary"}
                    />
                  </div>
                  <div>
                    <h4
                      className={`mb-0 fw-bold ${isDarkMode ? "text-white" : "text-dark"}`}
                    >
                      Análisis de Ingresos
                    </h4>
                    <p
                      className={`mb-0 small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}
                    >
                      Ingresos mensuales basados en clientes registrados
                    </p>
                  </div>
                </div>
                <BarChart
                  datosIngresos={datosIngresos}
                  valorMaximo={valorMaximo}
                  isDarkMode={isDarkMode}
                  isMobile={isMobile}
                />
              </Card.Body>
            </Card>

            <div className="d-flex flex-column flex-md-row flex-wrap gap-2 mb-4">
              <Button
                variant="primary"
                size={isMobile ? "sm" : "md"}
                onClick={abrirModalNuevo}
                className="admin-btn d-flex align-items-center justify-content-center px-3 py-2 shadow-sm border-0"
                style={{ borderRadius: "8px" }}
              >
                <FaPlus className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Agregar Cliente</div>
                  {!isMobile && (
                    <small className="opacity-75">
                      Registrar nuevo miembro
                    </small>
                  )}
                </div>
              </Button>
              <Button
                variant="outline-success"
                size={isMobile ? "sm" : "md"}
                onClick={handleNuevoAdmin}
                className="d-flex align-items-center justify-content-center px-3 py-2 border-2"
                style={{ borderRadius: "8px" }}
              >
                <FaUserShield className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Agregar Admin</div>
                  {!isMobile && (
                    <small className="opacity-75">
                      Crear nuevo administrador
                    </small>
                  )}
                </div>
              </Button>
              <Button
                variant="outline-warning"
                size={isMobile ? "sm" : "md"}
                onClick={handleVerificarEmails}
                disabled={verificandoEmails}
                className="d-flex align-items-center justify-content-center px-3 py-2 border-2"
                style={{ borderRadius: "8px" }}
              >
                <FaEnvelope className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">
                    {verificandoEmails ? "Verificando..." : "Verificar Emails"}
                  </div>
                  {!isMobile && (
                    <small className="opacity-75">
                      Enviar notificaciones de vencimiento
                    </small>
                  )}
                </div>
              </Button>
              <Button
                variant="outline-success"
                size={isMobile ? "sm" : "md"}
                onClick={exportarExcel}
                className="d-flex align-items-center justify-content-center px-3 py-2 border-2"
                style={{ borderRadius: "8px" }}
              >
                <FaFileExcel className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Exportar Reporte</div>
                  {!isMobile && (
                    <small className="opacity-75">
                      Descargar listado en Excel
                    </small>
                  )}
                </div>
              </Button>
            </div>

            <Card
              ref={tablaClientesRef}
              id="tabla-clientes"
              className="admin-card border-0"
              style={{
                background: isDarkMode ? "#1e293b" : "#ffffff",
                borderRadius: "16px",
              }}
            >
              <Card.Header className="border-0 bg-transparent py-4">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <FaUsers className="text-success" />
                  </div>
                  <div>
                    <h3
                      className={`mb-0 fw-bold ${isDarkMode ? "text-white" : "text-dark"}`}
                    >
                      Gestión de Clientes
                    </h3>
                    <p
                      className={`mb-0 small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}
                    >
                      Administra la información de todos los miembros
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-2 mb-4">
                  <Col xs={12} md={8}>
                    <InputGroup size={isMobile ? "sm" : "md"}>
                      <InputGroup.Text
                        className={
                          isDarkMode
                            ? "bg-secondary border-secondary"
                            : "bg-light border-light"
                        }
                      >
                        <FaSearch
                          className={isDarkMode ? "text-light" : "text-muted"}
                        />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={
                          isMobile ? "Buscar DNI..." : "Buscar por DNI..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`border-start-0 ${isDarkMode ? "bg-dark text-white" : ""}`}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Col>
                  <Col xs={12} md={4}>
                    <ButtonGroup
                      size={isMobile ? "sm" : "md"}
                      className="w-100"
                    >
                      <Button
                        variant={
                          filtroActivo === "todos"
                            ? "primary"
                            : "outline-primary"
                        }
                        onClick={() => setFiltroActivo("todos")}
                        className="flex-fill"
                        style={{ fontSize: isMobile ? "0.75rem" : "1rem" }}
                      >
                        Todos
                      </Button>
                      <Button
                        variant={
                          filtroActivo === "activos"
                            ? "success"
                            : "outline-success"
                        }
                        onClick={() => setFiltroActivo("activos")}
                        className="flex-fill"
                        style={{ fontSize: isMobile ? "0.75rem" : "1rem" }}
                      >
                        Activos
                      </Button>
                      <Button
                        variant={
                          filtroActivo === "vencidos"
                            ? "danger"
                            : "outline-danger"
                        }
                        onClick={() => setFiltroActivo("vencidos")}
                        className="flex-fill"
                        style={{ fontSize: isMobile ? "0.75rem" : "1rem" }}
                      >
                        Expirados
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>

                {!isMobile ? (
                  <div className="table-responsive">
                    <Table
                      hover
                      className={`admin-table mb-4 ${isDarkMode ? "table-dark" : ""}`}
                    >
                      <thead
                        className={
                          isDarkMode ? "table-secondary" : "table-light"
                        }
                      >
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
                              <div
                                className={
                                  isDarkMode
                                    ? "text-light opacity-50"
                                    : "text-muted"
                                }
                              >
                                <FaUsers
                                  size={48}
                                  className="mb-3 d-block mx-auto"
                                />
                                <p>
                                  No se encontraron clientes con email
                                  registrado
                                </p>
                                <small>
                                  Total clientes: {clientes.length} | Con email:{" "}
                                  {
                                    clientes.filter((c) => c.email?.trim())
                                      .length
                                  }
                                </small>
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
                          <Card
                            key={cliente.id}
                            className="border-0 shadow-sm"
                            role="button"
                            onClick={() => seleccionarCliente(cliente)}
                            style={{
                              transition: "all 0.2s ease",
                              borderRadius: "12px",
                              background: isDarkMode ? "#1e293b" : "#ffffff",
                            }}
                          >
                            <Card.Body className="p-3">
                              <div className="d-flex align-items-center mb-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center text-white me-3 shadow-sm"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    fontWeight: 700,
                                    background:
                                      "linear-gradient(135deg, #3b82f6, #2563eb)",
                                  }}
                                >
                                  {cliente.nombre ? (
                                    cliente.nombre.charAt(0).toUpperCase()
                                  ) : (
                                    <FaUser />
                                  )}
                                </div>
                                <div className="flex-grow-1">
                                  <div
                                    className={`fw-bold mb-1 ${isDarkMode ? "text-white" : "text-dark"}`}
                                  >
                                    {cliente.nombre}
                                  </div>
                                  <div
                                    className={`small ${isDarkMode ? "text-light opacity-75" : "text-muted"}`}
                                  >
                                    DNI: {cliente.dni}
                                  </div>
                                  <div className="mt-2">
                                    <Badge
                                      bg={
                                        membership === "Activo"
                                          ? "success"
                                          : "danger"
                                      }
                                      className="me-2 px-3 py-2"
                                      style={{ borderRadius: "6px" }}
                                    >
                                      {membership}
                                    </Badge>
                                    <span
                                      style={{
                                        color: "#059669",
                                        fontWeight: 700,
                                      }}
                                    >
                                      $
                                      {(
                                        Number(cliente.precio) || 0
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex justify-content-end">
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirModalEliminar(cliente, e);
                                  }}
                                  className="border-0 px-3"
                                  style={{ borderRadius: "6px" }}
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })
                    ) : (
                      <Alert
                        variant={isDarkMode ? "dark" : "light"}
                        className="text-center py-4 border-0 shadow-sm"
                      >
                        <FaUsers
                          size={48}
                          className={`mb-3 ${isDarkMode ? "text-light opacity-50" : "text-muted"}`}
                        />
                        <p
                          className={`mb-0 ${isDarkMode ? "text-light" : "text-muted"}`}
                        >
                          No se encontraron clientes con los criterios de
                          búsqueda
                        </p>
                      </Alert>
                    )}
                  </div>
                )}

                {clientesFiltrados.length > 10 && (
                  <div className="d-flex justify-content-center">
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        onClick={() =>
                          setPaginaActual((p) => Math.max(1, p - 1))
                        }
                        disabled={paginaActual === 1}
                      />
                      {[...Array(clientesPaginados.totalPaginas).keys()].map(
                        (n) => (
                          <Pagination.Item
                            key={n + 1}
                            active={n + 1 === paginaActual}
                            onClick={() => setPaginaActual(n + 1)}
                          >
                            {n + 1}
                          </Pagination.Item>
                        ),
                      )}
                      <Pagination.Next
                        onClick={() =>
                          setPaginaActual((p) =>
                            Math.min(clientesPaginados.totalPaginas, p + 1),
                          )
                        }
                        disabled={
                          paginaActual === clientesPaginados.totalPaginas
                        }
                      />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>

            {clienteSeleccionado && (
              <Card
                ref={detalleClienteRef}
                id="detalle-cliente"
                className={`mt-5 border-0 shadow-lg overflow-hidden ${isDarkMode ? "bg-dark" : "bg-white"}`}
              >
                <div
                  className="client-header position-relative py-4 px-4"
                  style={{
                    background: isDarkMode ? "#1a2744" : "#2563eb",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    borderBottom: isDarkMode
                      ? "1px solid rgba(255, 255, 255, 0.08)"
                      : "none",
                  }}
                >
                  <Row className="align-items-center">
                    <Col xs={12} md={8}>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-4"
                          style={{
                            width: "72px",
                            height: "72px",
                            background: "rgba(255, 255, 255, 0.15)",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            flexShrink: 0,
                          }}
                        >
                          <FaUser size={32} color="#ffffff" />
                        </div>
                        <div>
                          <h2
                            className="mb-1 text-white fw-bold"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                              letterSpacing: "-0.02em",
                              fontSize: "1.5rem",
                            }}
                          >
                            {clienteSeleccionado.nombre}
                          </h2>
                          <div
                            className="text-white"
                            style={{ opacity: 0.85, fontSize: "0.9375rem" }}
                          >
                            {" "}
                            <p
                              className="mb-1"
                              style={{
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                              }}
                            >
                              {" "}
                              Cliente N°{" "}
                              {clientes.indexOf(clienteSeleccionado) + 1}{" "}
                            </p>
                            <p className="mb-0">
                              {" "}
                              DNI: {clienteSeleccionado.dni}{" "}
                            </p>{" "}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
                      <Badge
                        bg={
                          getEstadoMembresia(clienteSeleccionado) === "Activo"
                            ? "success"
                            : "danger"
                        }
                        className="d-inline-flex align-items-center px-3 py-2 mb-3"
                        style={{ borderRadius: "8px", fontSize: "0.8125rem" }}
                      >
                        {getEstadoMembresia(clienteSeleccionado) ===
                        "Activo" ? (
                          <FaCheckCircle className="me-2" />
                        ) : (
                          <FaTimesCircle className="me-2" />
                        )}
                        Membresía: {getEstadoMembresia(clienteSeleccionado)}
                      </Badge>
                      <div className="d-flex justify-content-md-end gap-2">
                        <button
                          onClick={() => abrirModalEditar(clienteSeleccionado)}
                          style={{
                            borderRadius: "8px",
                            background: isDarkMode ? "#3b82f6" : "#10b981",
                            border: "none",
                            color: "#ffffff",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            letterSpacing: "0.01em",
                            padding: "10px 20px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) => {
                            if (isDarkMode) {
                              e.currentTarget.style.background = "#2563eb";
                            } else {
                              e.currentTarget.style.background = "#059669";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isDarkMode) {
                              e.currentTarget.style.background = "#3b82f6";
                            } else {
                              e.currentTarget.style.background = "#10b981";
                            }
                          }}
                        >
                          <FaEdit className="me-2" /> Editar
                        </button>
                        <button
                          onClick={cancelarSeleccion}
                          style={{
                            borderRadius: "8px",
                            background: isDarkMode ? "#ef4444" : "#e2e8f0",
                            border: "none",
                            color: isDarkMode ? "#ffffff" : "#334155",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            letterSpacing: "0.01em",
                            padding: "10px 20px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) => {
                            if (isDarkMode) {
                              e.currentTarget.style.background = "#dc2626";
                            } else {
                              e.currentTarget.style.background = "#cbd5e1";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isDarkMode) {
                              e.currentTarget.style.background = "#ef4444";
                            } else {
                              e.currentTarget.style.background = "#e2e8f0";
                            }
                          }}
                        >
                          <FaTimes className="me-2" /> Cerrar
                        </button>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Card.Body className="p-4">
                  <Row className="g-4">
                    <Col xs={12} md={6}>
                      <Card className="admin-inner-card h-100 border-0">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-info bg-opacity-25" : "bg-primary bg-opacity-10"} p-2 me-3`}
                            >
                              <FaUser
                                size={18}
                                className={
                                  isDarkMode ? "text-info" : "text-primary"
                                }
                              />
                            </div>
                            <h5
                              className="mb-0 fw-bold"
                              style={{
                                color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              }}
                            >
                              Información Personal
                            </h5>
                          </div>
                          <Table borderless className="mb-0">
                            <tbody>
                              <tr>
                                <td
                                  width="40%"
                                  className="fw-bold ps-0"
                                  style={{
                                    color: isDarkMode ? "#94a3b8" : "#64748b",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  Nombre Completo:
                                </td>
                                <td
                                  style={{
                                    color: isDarkMode ? "#e2e8f0" : "#0f172a",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  {clienteSeleccionado.nombre}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  className="fw-bold ps-0"
                                  style={{
                                    color: isDarkMode ? "#94a3b8" : "#64748b",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  DNI:
                                </td>
                                <td
                                  style={{
                                    color: isDarkMode ? "#e2e8f0" : "#0f172a",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  {clienteSeleccionado.dni}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  className="fw-bold ps-0"
                                  style={{
                                    color: isDarkMode ? "#94a3b8" : "#64748b",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  Email:
                                </td>
                                <td
                                  style={{
                                    color: isDarkMode ? "#e2e8f0" : "#0f172a",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  <div className="d-flex align-items-center">
                                    <FaEnvelope
                                      className="me-2"
                                      size={14}
                                      style={{
                                        color: isDarkMode
                                          ? "#94a3b8"
                                          : "#64748b",
                                      }}
                                    />
                                    <span>
                                      {clienteSeleccionado.email ||
                                        "No registrado"}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  className="fw-bold ps-0"
                                  style={{
                                    color: isDarkMode ? "#94a3b8" : "#64748b",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  Fecha de Registro:
                                </td>
                                <td
                                  style={{
                                    color: isDarkMode ? "#e2e8f0" : "#0f172a",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  {clienteSeleccionado.fechaInicio}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  className="fw-bold ps-0"
                                  style={{
                                    color: isDarkMode ? "#94a3b8" : "#64748b",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  Último Pago:
                                </td>
                                <td
                                  style={{
                                    color: isDarkMode ? "#e2e8f0" : "#0f172a",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                    borderBottom: "none",
                                  }}
                                >
                                  {clienteSeleccionado.fechaUltimoPago ||
                                    "No disponible"}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12} md={6}>
                      <Card className="admin-inner-card h-100 border-0">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-success bg-opacity-25" : "bg-success bg-opacity-10"} p-2 me-3`}
                            >
                              <FaDollarSign
                                size={18}
                                className="text-success"
                              />
                            </div>
                            <h5
                              className="mb-0 fw-bold"
                              style={{
                                color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              }}
                            >
                              Detalles de Membresía
                            </h5>
                          </div>
                          <Table borderless className="mb-0">
                            <tbody>
                              <tr>
                                <td
                                  width="40%"
                                  className="fw-bold ps-0"
                                  style={{
                                    color: isDarkMode ? "#94a3b8" : "#64748b",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  Inicio:
                                </td>
                                <td
                                  style={{
                                    color: isDarkMode ? "#e2e8f0" : "#0f172a",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  <div className="d-flex align-items-center">
                                    <FaCalendarAlt
                                      className="me-2"
                                      size={14}
                                      style={{
                                        color: isDarkMode
                                          ? "#94a3b8"
                                          : "#64748b",
                                      }}
                                    />
                                    <span>
                                      {clienteSeleccionado.fechaInicio ||
                                        "No disponible"}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  className="fw-bold ps-0"
                                  style={{
                                    color: isDarkMode ? "#94a3b8" : "#64748b",
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                  }}
                                >
                                  Vencimiento:
                                </td>
                                <td
                                  style={{
                                    borderColor: isDarkMode
                                      ? "rgba(148, 163, 184, 0.08)"
                                      : "#e2e8f0",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                    borderBottom: "none",
                                  }}
                                >
                                  <Badge
                                    bg={
                                      clienteSeleccionado.estado === "Activo"
                                        ? "success"
                                        : "danger"
                                    }
                                    className="py-1 px-2"
                                    style={{ fontWeight: "normal" }}
                                  >
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
                      <Card
                        className="border-0 shadow-sm"
                        style={{
                          background: isDarkMode ? "#1e293b" : "#ffffff",
                          border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
                        }}
                      >
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-warning bg-opacity-25" : "bg-warning bg-opacity-10"} p-2 me-3`}
                            >
                              <FaDollarSign
                                size={18}
                                className="text-warning"
                              />
                            </div>
                            <h5
                              className="mb-0 fw-bold"
                              style={{
                                color: isDarkMode ? "#f1f5f9" : "#0f172a",
                              }}
                            >
                              Información de Pago
                            </h5>
                          </div>
                          <Row>
                            <Col md={4}>
                              <div
                                className="p-3 rounded-3 mb-3"
                                style={{
                                  background: isDarkMode
                                    ? "rgba(30, 41, 59, 0.5)"
                                    : "#f8fafc",
                                  border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p
                                      className="mb-1"
                                      style={{
                                        color: isDarkMode
                                          ? "#94a3b8"
                                          : "#64748b",
                                        fontSize: "0.8125rem",
                                      }}
                                    >
                                      Precio de Membresía
                                    </p>
                                    <h2
                                      className="fw-bold mb-0"
                                      style={{
                                        color: "#059669",
                                        fontSize: "1.75rem",
                                      }}
                                    >
                                      $
                                      {clienteSeleccionado.precio?.toLocaleString()}
                                    </h2>
                                  </div>
                                  <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? "bg-success bg-opacity-25" : "bg-success bg-opacity-10"} p-3`}
                                    style={{ width: "56px", height: "56px" }}
                                  >
                                    <FaDollarSign
                                      size={24}
                                      className="text-success"
                                    />
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div
                                className="p-3 rounded-3 mb-3"
                                style={{
                                  background: isDarkMode
                                    ? "rgba(30, 41, 59, 0.5)"
                                    : "#f8fafc",
                                  border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p
                                      className="mb-1"
                                      style={{
                                        color: isDarkMode
                                          ? "#94a3b8"
                                          : "#64748b",
                                        fontSize: "0.8125rem",
                                      }}
                                    >
                                      Estado de Membresía
                                    </p>
                                    <h4
                                      className="fw-bold mb-0"
                                      style={{
                                        color:
                                          getEstadoMembresia(
                                            clienteSeleccionado,
                                          ) === "Activo"
                                            ? "#059669"
                                            : "#dc2626",
                                        fontSize: "1.25rem",
                                      }}
                                    >
                                      {getEstadoMembresia(clienteSeleccionado)}
                                    </h4>
                                  </div>
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center p-3"
                                    style={{
                                      width: "56px",
                                      height: "56px",
                                      background:
                                        getEstadoMembresia(
                                          clienteSeleccionado,
                                        ) === "Activo"
                                          ? isDarkMode
                                            ? "rgba(5, 150, 105, 0.2)"
                                            : "rgba(5, 150, 105, 0.1)"
                                          : isDarkMode
                                            ? "rgba(220, 38, 38, 0.2)"
                                            : "rgba(220, 38, 38, 0.1)",
                                    }}
                                  >
                                    {getEstadoMembresia(clienteSeleccionado) ===
                                    "Activo" ? (
                                      <FaCheckCircle
                                        size={24}
                                        className="text-success"
                                      />
                                    ) : (
                                      <FaTimesCircle
                                        size={24}
                                        className="text-danger"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div
                                className="p-3 rounded-3 mb-3"
                                style={{
                                  background: isDarkMode
                                    ? "rgba(30, 41, 59, 0.5)"
                                    : "#f8fafc",
                                  border: `1px solid ${isDarkMode ? "rgba(148, 163, 184, 0.1)" : "#e2e8f0"}`,
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p
                                      className="mb-1"
                                      style={{
                                        color: isDarkMode
                                          ? "#94a3b8"
                                          : "#64748b",
                                        fontSize: "0.8125rem",
                                      }}
                                    >
                                      Pago Mes Actual
                                    </p>
                                    <h4
                                      className="fw-bold mb-0"
                                      style={{
                                        color: clienteSeleccionado.pagoMesActual
                                          ? "#059669"
                                          : "#dc2626",
                                        fontSize: "1.25rem",
                                      }}
                                    >
                                      {clienteSeleccionado.pagoMesActual
                                        ? "Pagado"
                                        : "Pendiente"}
                                    </h4>
                                  </div>
                                  <Button
                                    variant={
                                      clienteSeleccionado.pagoMesActual
                                        ? "success"
                                        : "danger"
                                    }
                                    className="rounded-circle p-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePagoMes(clienteSeleccionado);
                                    }}
                                    style={{ width: "56px", height: "56px" }}
                                  >
                                    <FaDollarSign size={24} />
                                  </Button>
                                </div>
                              </div>
                            </Col>
                          </Row>
                          {getEstadoMembresia(clienteSeleccionado) ===
                            "Expirada" && (
                            <Alert
                              variant="danger"
                              className="mt-3 d-flex justify-content-between align-items-center border-0"
                              style={{
                                background: isDarkMode
                                  ? "rgba(220, 38, 38, 0.15)"
                                  : "#fef2f2",
                                color: isDarkMode ? "#fca5a5" : "#991b1b",
                                borderRadius: "8px",
                              }}
                            >
                              <div>
                                <strong>Membresía Expirada</strong>
                                <p
                                  className="mb-0 small"
                                  style={{
                                    color: isDarkMode ? "#fca5a5" : "#991b1b",
                                    opacity: 0.8,
                                  }}
                                >
                                  Esta membresía ha vencido. Renuévala para
                                  reactivar el acceso.
                                </p>
                              </div>
                              <Button
                                variant="success"
                                onClick={() =>
                                  abrirModalRenovar(clienteSeleccionado)
                                }
                                className="ms-3"
                                style={{ borderRadius: "8px" }}
                              >
                                <FaCheckCircle className="me-2" />
                                Renovar Membresía
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

      {[
        {
          show: showModalNuevo,
          onHide: () => setShowModalNuevo(false),
          title: "Nuevo Cliente",
          onSave: guardarNuevoCliente,
          saveLabel: "Guardar",
        },
        {
          show: showModalEditar,
          onHide: () => setShowModalEditar(false),
          title: "Editar Cliente",
          onSave: guardarClienteEditado,
          saveLabel: "Guardar Cambios",
        },
      ].map(({ show, onHide, title, onSave, saveLabel }) => (
        <Modal key={title} show={show} onHide={onHide} size="md" centered>
          <Modal.Header
            closeButton
            style={{
              borderBottom: "none",
              paddingBottom: "0",
              background: isDarkMode ? "#1e293b" : "#f8f9fa",
            }}
          >
            <Modal.Title
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: isDarkMode ? "#f1f5f9" : "#0f172a",
              }}
            >
              {title === "Nuevo Cliente" ? (
                <>
                  <FaUser className="me-2 mb-2" style={{ color: "#2563eb" }} />
                  Nuevo Cliente
                </>
              ) : (
                title
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            className="px-4 pt-2"
            style={{
              background: isDarkMode ? "#0f172a" : "#f8f9fa",
            }}
          >
            <p
              className="small mb-4"
              style={{
                color: isDarkMode ? "#94a3b8" : "#64748b",
              }}
            >
              {title === "Nuevo Cliente"
                ? "Completá los datos para registrar un nuevo miembro"
                : "Modificá los datos del cliente"}
            </p>
            <Form>
              <Form.Group className="mb-3" key="nombre">
                <Form.Label
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    color: isDarkMode ? "#cbd5e1" : "#475569",
                  }}
                >
                  Nombre Completo
                </Form.Label>
                <div style={{ position: "relative" }}>
                  <FaUser
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: isDarkMode ? "#64748b" : "#94a3b8",
                      fontSize: "0.875rem",
                    }}
                  />
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData["nombre"] || ""}
                    onChange={handleFormChange}
                    placeholder="Ej: Juan Pérez"
                    required
                    style={{
                      paddingLeft: "40px",
                      borderColor: isDarkMode
                        ? "rgba(148, 163, 184, 0.2)"
                        : "#cbd5e1",
                      background: isDarkMode
                        ? "rgba(30, 41, 59, 0.5)"
                        : "#ffffff",
                      color: isDarkMode ? "#e2e8f0" : "#0f172a",
                    }}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" key="dni">
                <Form.Label
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    color: isDarkMode ? "#cbd5e1" : "#475569",
                  }}
                >
                  DNI
                </Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={formData["dni"] || ""}
                  onChange={handleFormChange}
                  placeholder="Ej: 30123456"
                  required
                  style={{
                    borderColor: isDarkMode
                      ? "rgba(148, 163, 184, 0.2)"
                      : "#cbd5e1",
                    background: isDarkMode
                      ? "rgba(30, 41, 59, 0.5)"
                      : "#ffffff",
                    color: isDarkMode ? "#e2e8f0" : "#0f172a",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" key="email">
                <Form.Label
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    color: isDarkMode ? "#cbd5e1" : "#475569",
                  }}
                >
                  Email
                </Form.Label>
                <div style={{ position: "relative" }}>
                  <FaEnvelope
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: isDarkMode ? "#64748b" : "#94a3b8",
                      fontSize: "0.875rem",
                    }}
                  />
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData["email"] || ""}
                    onChange={handleFormChange}
                    placeholder="cliente@ejemplo.com"
                    required
                    style={{
                      paddingLeft: "40px",
                      borderColor: isDarkMode
                        ? "rgba(148, 163, 184, 0.2)"
                        : "#cbd5e1",
                      background: isDarkMode
                        ? "rgba(30, 41, 59, 0.5)"
                        : "#ffffff",
                      color: isDarkMode ? "#e2e8f0" : "#0f172a",
                    }}
                  />
                </div>
                <Form.Text
                  style={{
                    fontSize: "0.75rem",
                    color: isDarkMode ? "#64748b" : "#94a3b8",
                  }}
                >
                  Necesario para notificaciones
                  {title === "Nuevo Cliente" ? " y gestión del cliente" : ""}
                </Form.Text>
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        color: isDarkMode ? "#cbd5e1" : "#475569",
                      }}
                    >
                      <FaCalendarAlt
                        className="me-1"
                        style={{ fontSize: "0.75rem" }}
                      />
                      Fecha de Inicio
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaInicio"
                      value={formatearFechaParaInputFn(formData.fechaInicio)}
                      onChange={handleFormChange}
                      style={{
                        borderColor: isDarkMode
                          ? "rgba(148, 163, 184, 0.2)"
                          : "#cbd5e1",
                        background: isDarkMode
                          ? "rgba(30, 41, 59, 0.5)"
                          : "#ffffff",
                        color: isDarkMode ? "#e2e8f0" : "#0f172a",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        color: isDarkMode ? "#cbd5e1" : "#475569",
                      }}
                    >
                      <FaCalendarAlt
                        className="me-1"
                        style={{ fontSize: "0.75rem" }}
                      />
                      Vencimiento
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="vencimiento"
                      value={formatearFechaParaInputFn(formData.vencimiento)}
                      readOnly
                      style={{
                        background: isDarkMode
                          ? "rgba(30, 41, 59, 0.3)"
                          : "#f1f5f9",
                        color: isDarkMode ? "#94a3b8" : "#475569",
                        borderColor: isDarkMode
                          ? "rgba(148, 163, 184, 0.15)"
                          : "#cbd5e1",
                        fontWeight: isDarkMode ? "normal" : "500",
                      }}
                    />
                    <Form.Text
                      style={{
                        fontSize: "0.6875rem",
                        color: isDarkMode ? "#64748b" : "#94a3b8",
                      }}
                    >
                      30 días después del inicio
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    color: isDarkMode ? "#cbd5e1" : "#475569",
                  }}
                >
                  <FaDollarSign
                    className="me-1"
                    style={{ fontSize: "0.75rem" }}
                  />
                  Precio de Membresía
                </Form.Label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#10b981",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    $
                  </span>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleFormChange}
                    style={{
                      paddingLeft: "36px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "#059669",
                      borderColor: "#10b981",
                      background: isDarkMode
                        ? "rgba(30, 41, 59, 0.5)"
                        : "#f0fdf4",
                    }}
                  />
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer
            style={{
              borderTop: "none",
              paddingTop: "0",
              background: isDarkMode ? "#0f172a" : "#f8f9fa",
            }}
          >
            <Button
              variant="light"
              onClick={onHide}
              style={{
                borderRadius: "8px",
                fontWeight: 500,
                background: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#f1f5f9",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid #e2e8f0",
                color: isDarkMode ? "#e2e8f0" : "#475569",
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              style={{
                borderRadius: "8px",
                background: "#2563eb",
                border: "none",
                fontWeight: 600,
                padding: "8px 20px",
              }}
            >
              <FaPlus className="me-2" size={12} />
              {saveLabel}
            </Button>
          </Modal.Footer>
        </Modal>
      ))}

      <Modal
        show={showModalEliminar}
        onHide={() => setShowModalEliminar(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
          <p className="fw-bold">{clienteAEliminar?.nombre}</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalEliminar(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminarCliente}>
            Eliminar
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

      <Modal show={showModalRenovar} onHide={() => setShowModalRenovar(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renovar Membresía</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas renovar la membresía de este cliente?
          </p>
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
          <Button
            variant="secondary"
            onClick={() => setShowModalRenovar(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={() => renovarMembresia(clienteARenovar)}
          >
            <FaCheckCircle className="me-2" />
            Confirmar Renovación
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminClientes;
