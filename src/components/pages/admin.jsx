import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
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
  ProgressBar,
  ButtonGroup,
  Stack,
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
  FaCrown,
} from "react-icons/fa";

// Hook personalizado para el tema
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const temaGuardado = localStorage.getItem('tema');
    return temaGuardado === 'oscuro';
  });

  useEffect(() => {
    localStorage.setItem('tema', isDarkMode ? 'oscuro' : 'claro');
    document.body.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const alternarTema = () => {
    setIsDarkMode(!isDarkMode);
  };

  return { isDarkMode, alternarTema };
};

// Componente memoizado para tarjetas de estadísticas
const StatCard = memo(({ title, value, icon: Icon, color, isDarkMode }) => (
  <Card 
    className="h-100 border-0 shadow-lg"
    style={{ 
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      backdropFilter: 'blur(15px)',
      borderRadius: '20px',
      transition: 'all 0.3s ease'
    }}
  >
    <Card.Body className="p-4">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <p className={`small mb-1 ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`}>
            {title}
          </p>
          <h2 className={`fw-bold mb-0 text-${color}`}>
            {value}
          </h2>
        </div>
        <div 
          className={`rounded-circle d-flex align-items-center justify-content-center bg-${color} bg-opacity-10`}
          style={{ width: '60px', height: '60px' }}
        >
          <Icon className={`text-${color}`} size={24} />
        </div>
      </div>
    </Card.Body>
  </Card>
));

// Componente memoizado para filas de tabla
const ClienteRow = memo(({ cliente, membership, progreso, isDarkMode, onSelect, onDelete }) => (
  <tr 
    onClick={() => onSelect(cliente)} 
    style={{ cursor: "pointer" }}
    className="align-middle"
  >
    <td>
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow-sm" 
        style={{ width: 48, height: 48, fontWeight: 700 }}
      >
        {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : <FaUser />}
      </div>
    </td>
    <td>
      <div className={`fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
        {cliente.nombre}
      </div>
      <div className={`small ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`}>
        DNI: {cliente.dni}
      </div>
    </td>
    <td className="d-none d-lg-table-cell" style={{ minWidth: 200 }}>
      <div className={`small mb-1 ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`}>
        Vence: {cliente.vencimiento || "—"}
      </div>
      {/* Barra de progreso eliminada */}
      {/* 
      {!progreso.vencido && (
        <div>
          <ProgressBar 
            now={progreso.pct} 
            variant={progreso.pct > 70 ? "danger" : progreso.pct > 40 ? "warning" : "success"}
            style={{ height: '4px' }}
          />
          <small className={`${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`}>
            {progreso.diasRestantes} días restantes
          </small>
        </div>
      )}
      */}
    </td>
    <td>
      <Badge 
        bg={membership === "Activo" ? "success" : "danger"} 
        className="d-inline-flex align-items-center px-3 py-2"
        style={{ borderRadius: '8px' }}
      >
        {membership === "Activo" ? 
          <FaCheckCircle className="me-2" /> : 
          <FaTimesCircle className="me-2" />
        }
        {membership}
      </Badge>
    </td>
    <td>
      <div className="fw-bold text-success fs-5">
        ${(Number(cliente.precio) || 0).toLocaleString()}
      </div>
      <small className={isDarkMode ? 'text-light opacity-75' : 'text-muted'}>
        mensual
      </small>
    </td>
    <td>
      <Button 
        variant="outline-danger" 
        size="sm" 
        onClick={(e) => { e.stopPropagation(); onDelete(cliente, e); }}
        className="border-0"
      >
        <FaTrash />
      </Button>
    </td>
  </tr>
));

// Hook de debounce optimizado
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdminClientes = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();

  // Verificación más robusta de usuario administrador
  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const userEmail = localStorage.getItem("userEmail");
    
    if (userType !== "admin") {
      navigate("/login");
    } else {
      // Verificación adicional contra la base de usuarios
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const currentUser = users.find(u => u.username === userEmail && u.role === 'admin');
        if (!currentUser) {
          localStorage.removeItem("userType");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          navigate("/login");
        }
      }
    }
  }, [navigate]);

  // Estados optimizados
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados para modales
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  // Cargar clientes con lazy loading
  const [clientes, setClientes] = useState(() => {
    const savedClientes = localStorage.getItem('clientes');
    return savedClientes ? JSON.parse(savedClientes) : [];
  });

  // Debounce para búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Form para nuevo/editar cliente
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    fechaInicio: "",
    vencimiento: "",
    estado: "Activo",
    estadoCuenta: "Activo",
    precio: 10000,
  });

  // Estados del gráfico
  const [hoveredBar, setHoveredBar] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // Función memoizada para calcular estado de membresía
  const getEstadoMembresia = useCallback((cliente) => {
    try {
      const partes = (cliente?.vencimiento || "").split("/");
      if (partes.length !== 3) return "Activo";
      const d = Number(partes[0]), m = Number(partes[1]) - 1, y = Number(partes[2]);
      const venc = new Date(y, m, d);
      if (isNaN(venc.getTime())) return "Activo";
      return venc < new Date() ? "Vencida" : "Activo";
    } catch (e) {
      return "Activo";
    }
  }, []);

  // Estadísticas memoizadas
  const estadisticas = useMemo(() => {
    const activos = clientes.filter(cliente => getEstadoMembresia(cliente) === "Activo").length;
    const vencidas = clientes.filter(cliente => getEstadoMembresia(cliente) === "Vencida").length;
    const ingresos = clientes
      .filter(cliente => getEstadoMembresia(cliente) === "Activo")
      .reduce((total, cliente) => total + (cliente.precio || 0), 0);
    
    return {
      clientesActivos: activos,
      membresiasVencidas: vencidas,
      ingresosMes: `$${ingresos.toLocaleString()}`,
      totalClientes: clientes.length
    };
  }, [clientes, getEstadoMembresia]);

  // Datos del gráfico memoizados
  const datosIngresos = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const ingresosMensuales = Array(12).fill(0);

    clientes.forEach((cliente) => {
      try {
        if (!cliente.fechaInicio) return;
        const partes = cliente.fechaInicio.split("/");
        if (partes.length !== 3) return;

        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const año = parseInt(partes[2], 10);

        if (isNaN(dia) || isNaN(mes) || isNaN(año)) return;
        if (cliente.estado !== "Activo") return;

        const precio = Number(cliente.precio) || 0;
        if (año === currentYear) {
          ingresosMensuales[mes] += precio;
        }
      } catch (error) {
        console.error("Error al procesar fecha:", cliente.fechaInicio, error);
      }
    });

    return meses.map((mes, index) => ({
      mes,
      valor: ingresosMensuales[index],
    }));
  }, [clientes]);

  // Valor máximo del gráfico memoizado
  const valorMaximo = useMemo(() => 
    Math.max(...(datosIngresos.length > 0 ? datosIngresos.map((item) => item.valor) : [0])) || 10000
  , [datosIngresos]);

  // Filtrado y búsqueda optimizados con debounce
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const nombre = (cliente.nombre || "").toLowerCase();
      const dni = String(cliente.dni || "");
      const termino = debouncedSearchTerm || "";
      const coincideTermino = nombre.includes(termino.toLowerCase()) || dni.includes(termino);

      if (filtroActivo === "activos") {
        return coincideTermino && getEstadoMembresia(cliente) === "Activo";
      } else if (filtroActivo === "vencidos") {
        return coincideTermino && getEstadoMembresia(cliente) === "Vencida";
      }

      return coincideTermino;
    });
  }, [clientes, debouncedSearchTerm, filtroActivo, getEstadoMembresia]);

  // Paginación optimizada
  const clientesPaginados = useMemo(() => {
    const clientesPorPagina = 10;
    const indiceInicial = (paginaActual - 1) * clientesPorPagina;
    return {
      clientes: clientesFiltrados.slice(indiceInicial, indiceInicial + clientesPorPagina),
      totalPaginas: Math.ceil(clientesFiltrados.length / clientesPorPagina)
    };
  }, [clientesFiltrados, paginaActual]);

  // Función de progreso memoizada
  const calcularProgresoMembresia = useCallback((cliente) => {
    const parseFecha = (fechaString) => {
      if (!fechaString) return null;
      const partes = fechaString.split('/');
      if (partes.length !== 3) return null;
      const d = Number(partes[0]), m = Number(partes[1]) - 1, y = Number(partes[2]);
      const fecha = new Date(y, m, d);
      return isNaN(fecha.getTime()) ? null : fecha;
    };

    const inicio = parseFecha(cliente.fechaInicio);
    const venc = parseFecha(cliente.vencimiento);
    const ahora = new Date();
    
    if (!inicio || !venc) return { pct: 0, diasRestantes: null, vencido: false };

    const totalMs = venc - inicio;
    const restanteMs = venc - ahora;
    const vencido = restanteMs <= 0;
    const transcurridoMs = ahora > inicio ? Math.min(Math.max(0, ahora - inicio), totalMs) : 0;
    const pct = totalMs > 0 ? Math.round((transcurridoMs / totalMs) * 100) : 100;
    const diasRestantes = vencido ? 0 : Math.ceil(Math.max(0, restanteMs) / (1000 * 60 * 60 * 24));
    
    return { pct: Math.max(0, Math.min(100, pct)), diasRestantes, vencido };
  }, []);

  // Optimizar listeners
  useEffect(() => {
    let timeoutId;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Guardar clientes optimizado con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('clientes', JSON.stringify(clientes));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [clientes]);

  // Callbacks optimizados
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "fechaInicio" && value) {
      const fechaInicio = new Date(value);
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
      
      const inicioFormateado = `${fechaInicio.getDate().toString().padStart(2, '0')}/${(fechaInicio.getMonth() + 1).toString().padStart(2, '0')}/${fechaInicio.getFullYear()}`;
      const vencimientoFormateado = `${fechaVencimiento.getDate().toString().padStart(2, '0')}/${(fechaVencimiento.getMonth() + 1).toString().padStart(2, '0')}/${fechaVencimiento.getFullYear()}`;
      
      setFormData(prev => ({
        ...prev,
        fechaInicio: inicioFormateado,
        vencimiento: vencimientoFormateado,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const seleccionarCliente = useCallback((cliente) => {
    setClienteSeleccionado(cliente);
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPaginaActual(1);
  }, []);

  const cancelarSeleccion = useCallback(() => {
    setClienteSeleccionado(null);
  }, []);

  const abrirModalNuevo = useCallback(() => {
    const fechaHoy = new Date();
    const fechaHoyFormateada = `${fechaHoy.getDate().toString().padStart(2, "0")}/${(fechaHoy.getMonth() + 1).toString().padStart(2, "0")}/${fechaHoy.getFullYear()}`;

    const fechaVencimiento = new Date(fechaHoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const vencimientoFormateado = `${fechaVencimiento.getDate().toString().padStart(2, "0")}/${(fechaVencimiento.getMonth() + 1).toString().padStart(2, "0")}/${fechaVencimiento.getFullYear()}`;

    setFormData({
      nombre: "",
      dni: "",
      fechaInicio: fechaHoyFormateada,
      vencimiento: vencimientoFormateado,
      estado: "Activo",
      estadoCuenta: "Activo",
      precio: 10000,
    });
    setShowModalNuevo(true);
  }, []);

  const guardarNuevoCliente = useCallback(() => {
    const nuevoCliente = {
      id: clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) + 1 : 1,
      ...formData,
      precio: Number(formData.precio)
    };

    if (!nuevoCliente.estadoCuenta) nuevoCliente.estadoCuenta = "Activo";

    setClientes(prev => [...prev, nuevoCliente]);
    setShowModalNuevo(false);
  }, [clientes.length, formData]);

  const abrirModalEditar = useCallback((cliente, e) => {
    if (e) e.stopPropagation();
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre,
      dni: cliente.dni,
      fechaInicio: cliente.fechaInicio,
      vencimiento: cliente.vencimiento,
      estadoCuenta: cliente.estadoCuenta || "Activo",
      precio: cliente.precio,
    });
    setShowModalEditar(true);
  }, []);

  const guardarClienteEditado = useCallback(() => {
    const formDataActualizado = {
      ...formData,
      precio: Number(formData.precio)
    };
    
    setClientes(prev => prev.map((c) =>
      c.id === formData.id ? { ...c, ...formDataActualizado } : c
    ));

    if (clienteSeleccionado && clienteSeleccionado.id === formData.id) {
      setClienteSeleccionado(prev => prev ? { ...prev, ...formDataActualizado } : formDataActualizado);
    }

    setShowModalEditar(false);
  }, [formData, clienteSeleccionado]);

  const abrirModalEliminar = useCallback((cliente, e) => {
    if (e) e.stopPropagation();
    setClienteAEliminar(cliente);
    setShowModalEliminar(true);
  }, []);

  const confirmarEliminarCliente = useCallback(() => {
    setClientes(prev => prev.filter((c) => c.id !== clienteAEliminar.id));

    if (clienteSeleccionado && clienteSeleccionado.id === clienteAEliminar.id) {
      setClienteSeleccionado(null);
    }

    setShowModalEliminar(false);
  }, [clienteAEliminar, clienteSeleccionado]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  }, [navigate]);

  const handleNuevoAdmin = useCallback(() => {
    localStorage.setItem('creandoAdmin', 'true');
    navigate('/registro');
  }, [navigate]);

  // Gráfico de barras usando componentes de React Bootstrap
  const renderBarChart = () => {
    const hayDatos = datosIngresos.some(item => item.valor > 0);
    if (!hayDatos) {
      return (
        <Card className="shadow-sm mb-3">
          <Card.Body className="text-center py-4">
            <Card.Title as="h5" className="mb-2">Ingresos por mes basados en clientes registrados</Card.Title>
            <p className="text-muted small">No hay datos de ingresos para mostrar en el gráfico.</p>
          </Card.Body>
        </Card>
      );
    }

    const chartHeight = isMobile ? 140 : 240;
    const gap = isMobile ? 8 : 12;
    const indexMax = datosIngresos.reduce((acc, cur, i) => (cur.valor > (datosIngresos[acc]?.valor || 0) ? i : acc), 0);

    // qué etiquetas de mes mostrar en móvil (antes mostraba cada 2 meses)
    // Mostrar siempre todas las etiquetas de mes (compactadas por tamaño en móvil)
    const mostrarEtiqueta = () => true;
    
    return (
      <Card className="shadow-sm mb-3">
        <Card.Body style={{ background: isDarkMode ? 'linear-gradient(180deg, rgba(30,58,138,0.03), transparent)' : 'linear-gradient(180deg, rgba(59,130,246,0.03), transparent)' }}>
          <Card.Title as="h6" className="mb-3">Ingresos por mes basados en clientes registrados</Card.Title>

          <div style={{ padding: isMobile ? '0.5rem' : '1rem' }}>
            <div style={{ height: chartHeight + 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: gap, height: chartHeight }}>
                {datosIngresos.map((item, index) => {
                  const valor = item.valor || 0;
                  const heightPx = valorMaximo > 0 ? Math.max((valor / valorMaximo) * chartHeight, valor > 0 ? 6 : 2) : 0;
                  const hue = 200 - Math.floor((index / datosIngresos.length) * 70);
                  const colorStart = `hsl(${hue} 90% 55%)`;
                  const colorEnd = `hsl(${Math.max(hue - 12, 160)} 80% 40%)`;
                  const isMax = index === indexMax;

                  return (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: isMobile ? 18 : 28 }}>
                      <div style={{ height: chartHeight - heightPx }} />
                      <div
                        role="button"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{
                          width: '70%',
                          height: heightPx,
                          background: `linear-gradient(180deg, ${colorStart}, ${colorEnd})`,
                          borderRadius: isMax ? 10 : 6,
                          boxShadow: hoveredBar === index ? '0 8px 20px rgba(0,0,0,0.2)' : '0 4px 10px rgba(0,0,0,0.08)',
                          transition: 'transform 120ms ease, box-shadow 120ms ease',
                          transform: hoveredBar === index ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* mostrar valor sólo cuando se hace hover o para la barra máxima en desktop */}
                        {(hoveredBar === index || (!isMobile && isMax)) && valor > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: -26,
                            background: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)',
                            color: isDarkMode ? '#fff' : '#111',
                            padding: '3px 8px',
                            borderRadius: 8,
                            fontSize: isMobile ? 10 : 12,
                            fontWeight: 700,
                            boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
                          }}>
                            ${valor.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ height: 8 }} />
                      <div style={{ fontSize: isMobile ? 10 : 12, color: isDarkMode ? '#e6eef8' : '#374151', fontWeight: 600, textAlign: 'center' }}>
                        {mostrarEtiqueta(index) ? item.mes : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* nota de contexto más compacta */}
              <div style={{ marginTop: 8, textAlign: 'right', fontSize: 11, color: isDarkMode ? '#9fb4ff' : '#6b7280' }}>
                Datos basados en clientes activos — año actual
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };
 
  // Sidebar para dispositivos móviles
  const renderSidebar = () => (
    <Navbar 
      className="d-flex flex-column h-100"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
        borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}
    >
      <Container fluid className="d-flex flex-column h-100 p-0">
        <Navbar.Brand className="p-3 w-100">
          <h3 className={`fw-bold text-center ${isDarkMode ? 'text-success' : 'text-primary'}`} style={{
            background: isDarkMode 
              ? 'linear-gradient(45deg, #60a5fa, #34d399)'
              : undefined, // Solo degradado en modo oscuro
          WebkitBackgroundClip: isDarkMode ? 'text' : undefined,
          WebkitTextFillColor: isDarkMode ? 'transparent' : undefined,
          color: isDarkMode ? undefined : '#222', // Texto oscuro en modo claro
          fontFamily: '"Fjalla One", sans-serif'
          }}>HULK GYM</h3>
          <p className={`text-center small mb-4 ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`} style={{
            color: isDarkMode ? undefined : '#222', // Texto oscuro en modo claro
            fontWeight: 500
          }}>
            Panel Administrativo
          </p>
          
          <Nav className="flex-column w-100">
            <Nav.Link 
              className={`d-flex align-items-center mb-2 ${isDarkMode ? 'text-info' : 'text-primary'}`}
              style={{
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px',
                backgroundColor: isDarkMode ? 'rgba(13, 202, 240, 0.1)' : 'rgba(0, 123, 255, 0.1)'
              }}
            >
              <FaUsers className="me-2" />
              <span>Gestión de Clientes</span>
            </Nav.Link>

            <Nav.Link 
              className={`d-flex align-items-center mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`}
              onClick={() => navigate('/rutinas')}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                e.target.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <FaDumbbell className="me-2" />
              <span>Rutinas</span>
            </Nav.Link>

            <hr style={{
              borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              margin: '20px 0'
            }} />

            <Nav.Link
              className="d-flex align-items-center text-danger mt-auto mb-3"
              onClick={handleLogout}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                e.target.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateX(0)';
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

  // --- Nuevos helpers para mostrar progreso y días hasta vencimiento ---
  // Convierte "DD/MM/YYYY" -> "YYYY-MM-DD" para inputs type="date"
  const formatearFechaParaInput = (fechaString) => {
    if (!fechaString) return "";
    const partes = fechaString.split("/");
    if (partes.length !== 3) return "";
    const dia = partes[0].padStart(2, "0");
    const mes = partes[1].padStart(2, "0");
    const año = partes[2];
    return `${año}-${mes}-${dia}`;
  };

  return (
    <Container fluid className="min-vh-100 d-flex flex-column p-0" style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%)',
      minHeight: '100vh'
    }}>
      <Row className="flex-grow-1 g-0">
        {/* Sidebar para pantallas medianas y grandes */}
        <Col
          xs={2}
          md={2}
          lg={2}
          className="d-none d-md-block p-0"
          style={{
            minHeight: '100vh',
            backdropFilter: 'blur(10px)',
            borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          {renderSidebar()}
        </Col>

        {/* Offcanvas para móviles */}
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          className="w-75"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            backdropFilter: 'blur(15px)'
          }}
          placement="start"
        >
          <Offcanvas.Header closeButton style={{
            background: 'transparent',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: isDarkMode ? 'white' : 'dark'
          }}>
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">{renderSidebar()}</Offcanvas.Body>
        </Offcanvas>

        {/* Contenedor principal */}
        <Col xs={12} md={10} lg={10} className="p-0">
          {/* Navbar para móviles */}
          <Navbar className="d-md-none" style={{
            background: isDarkMode 
              ? 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(90deg, #ffffff 0%, #f8faff 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: isDarkMode 
              ? '0 2px 20px rgba(0,0,0,0.3)' 
              : '0 2px 20px rgba(0,0,0,0.1)'
          }} variant={isDarkMode ? "dark" : "light"}>
            <Container fluid>
              <Button
                variant={isDarkMode ? "outline-light" : "outline-dark"}
                onClick={() => setShowSidebar(true)}
                className="me-2 border-0"
                style={{
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <FaBars />
              </Button>
              <Navbar.Brand className="fw-bold" style={{
                background: 'linear-gradient(45deg, #28a745, #20c997)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.8rem',
                fontFamily: '"Fjalla One", sans-serif'
              }}>
                HULK GYM
              </Navbar.Brand>

              <div className="d-flex align-items-center gap-2">
                <Button 
                  variant={isDarkMode ? "outline-info" : "outline-primary"}
                  onClick={alternarTema} 
                  size="sm"
                  style={{
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </Button>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout} 
                  size="sm"
                  style={{
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <FaTimes /> Salir
                </Button>
              </div>
            </Container>
          </Navbar>

          {/* Contenido de la página */}
          <div className="p-4" style={{ minHeight: '100vh' }}>
            {/* Header con saludo y botón de tema */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="text-center mb-4" style={{ flexGrow: 1 }}>
                <h1 className="display-4 fw-bold mb-2" style={{
                  background: isDarkMode 
                    ? 'linear-gradient(45deg, #60a5fa, #34d399, #fbbf24)'
                    : undefined, // Solo degradado en modo oscuro
                  WebkitBackgroundClip: isDarkMode ? 'text' : undefined,
                  WebkitTextFillColor: isDarkMode ? 'transparent' : undefined,
                  color: isDarkMode ? undefined : '#222', // Texto oscuro en modo claro
                  fontFamily: '"Fjalla One", sans-serif',
                  letterSpacing: '2px',
                  transition: 'all 0.3s ease'
                }}>
                  PANEL DE ADMINISTRACIÓN
                </h1>
                <p className={`lead ${isDarkMode ? 'text-light' : 'text-muted'}`} style={{
                  fontSize: '1.1rem',
                  fontWeight: '300',
                  transition: 'color 0.3s ease'
                }}>
                  Gestiona tu gimnasio de manera eficiente
                </p>
              </div>
              <Button 
                variant={isDarkMode ? 'outline-light' : 'outline-dark'} 
                onClick={alternarTema}
                className="d-none d-md-flex align-items-center border-0"
                style={{
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isDarkMode 
                    ? '0 4px 15px rgba(255,255,255,0.1)' 
                    : '0 4px 15px rgba(0,0,0,0.1)'
                }}
              >
                {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
              </Button>
            </div>

            {/* Tarjetas de resumen optimizadas */}
            <Row className="g-4 mb-5">
              <Col xs={12} sm={6} lg={3}>
                <StatCard 
                  title="Clientes Activos"
                  value={estadisticas.clientesActivos}
                  icon={FaUsers}
                  color="success"
                  isDarkMode={isDarkMode}
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard 
                  title="Membresías Vencidas"
                  value={estadisticas.membresiasVencidas}
                  icon={FaTimesCircle}
                  color={estadisticas.membresiasVencidas > 0 ? "warning" : "secondary"}
                  isDarkMode={isDarkMode}
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard 
                  title="Ingresos Anuales"
                  value={estadisticas.ingresosMes}
                  icon={FaDollarSign}
                  color={isDarkMode ? "info" : "primary"}
                  isDarkMode={isDarkMode}
                />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <StatCard 
                  title="Total Clientes"
                  value={estadisticas.totalClientes}
                  icon={FaChartLine}
                  color="secondary"
                  isDarkMode={isDarkMode}
                />
              </Col>
            </Row>

            {/* Gráfico de ingresos mejorado */}
            <Card className="shadow-lg border-0 mb-5" style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(15px)',
              borderRadius: '20px'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${
                      isDarkMode ? 'bg-info bg-opacity-10' : 'bg-primary bg-opacity-10'
                    }`}
                    style={{ width: '50px', height: '50px' }}
                  >
                    <FaChartLine className={isDarkMode ? 'text-info' : 'text-primary'} />
                  </div>
                  <div>
                    <h4 className={`mb-0 fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                      Análisis de Ingresos
                    </h4>
                    <p className={`mb-0 small ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`}>
                      Ingresos mensuales basados en clientes registrados
                    </p>
                  </div>
                </div>
                {renderBarChart()}
              </Card.Body>
            </Card>

            {/* Botones de acción mejorados */}
            <div className="d-flex flex-wrap gap-3 mb-4 ">
              <Button
                variant="primary"
                size="md" // Cambiado de "lg" a "md"
                onClick={abrirModalNuevo}
                className="d-flex align-items-center px-3 py-2 shadow-sm border-0" // padding reducido
                style={{ borderRadius: '10px', fontSize: '1rem' }} // radio y fuente más pequeños
              >
                <FaPlus className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Agregar Cliente</div>
                  <small className="opacity-75">Registrar nuevo miembro</small>
                </div>
              </Button>
              
              <Button 
                variant="outline-success"
                size="md" // Cambiado de "lg" a "md"
                onClick={handleNuevoAdmin}
                className="d-flex align-items-center px-3 py-2 border-2"
                style={{ borderRadius: '10px', fontSize: '1rem' }} // radio y fuente más pequeños
              >
                <FaUserShield className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Nuevo Admin</div>
                  <small className="opacity-75">Crear administrador</small>
                </div>
              </Button>
            </div>

            {/* Sección de gestión de clientes optimizada */}
            <Card className="border-0 shadow-lg" style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(15px)',
              borderRadius: '20px'
            }}>
              <Card.Header className="border-0 bg-transparent py-4">
                <div className="d-flex align-items-center">
                  <div 
                    className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${
                      isDarkMode ? 'bg-success bg-opacity-10' : 'bg-success bg-opacity-10'
                    }`}
                    style={{ width: '50px', height: '50px' }}
                  >
                    <FaUsers className="text-success" />
                  </div>
                  <div>
                    <h3 className={`mb-0 fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                      Gestión de Clientes
                    </h3>
                    <p className={`mb-0 small ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`}>
                      Administra la información de todos los miembros
                    </p>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body className="p-4">
                {/* Barra de filtros y búsqueda mejorada */}
                <Row className="g-3 mb-4">
                  <Col md={8}>
                    <Form onSubmit={handleSearch}>
                      <InputGroup size="md">
                        <InputGroup.Text className={isDarkMode ? 'bg-secondary border-secondary' : 'bg-light border-light'}>
                          <FaSearch className={isDarkMode ? 'text-light' : 'text-muted'} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Buscar por DNI..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`border-start-0 ${isDarkMode ? 'bg-dark text-white' : ''}`}
                          style={{ borderRadius: '0 8px 8px 0' }}
                        />
                      </InputGroup>
                    </Form>
                  </Col>
                  
                  <Col md={4}>
                    <ButtonGroup size="md" className="w-100">
                      <Button
                        variant={filtroActivo === "todos" ? "primary" : "outline-primary"}
                        onClick={() => setFiltroActivo("todos")}
                        className="flex-fill"
                      >
                        Todos
                      </Button>
                      <Button
                        variant={filtroActivo === "activos" ? "success" : "outline-success"}
                        onClick={() => setFiltroActivo("activos")}
                        className="flex-fill"
                      >
                        Activos
                      </Button>
                      <Button
                        variant={filtroActivo === "vencidos" ? "danger" : "outline-danger"}
                        onClick={() => setFiltroActivo("vencidos")}
                        className="flex-fill"
                      >
                        Vencidos
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>

                {/* Tabla optimizada con componentes memoizados */}
                {!isMobile ? (
                  <div className="table-responsive">
                    <Table hover className={`mb-4 ${isDarkMode ? 'table-dark' : ''}`}>
                      <thead className={isDarkMode ? 'table-secondary' : 'table-light'}>
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
                        {clientesPaginados.clientes.length > 0 ? clientesPaginados.clientes.map((cliente) => (
                          <ClienteRow
                            key={cliente.id}
                            cliente={cliente}
                            membership={getEstadoMembresia(cliente)}
                            progreso={calcularProgresoMembresia(cliente)}
                            isDarkMode={isDarkMode}
                            onSelect={seleccionarCliente}
                            onDelete={abrirModalEliminar}
                          />
                        )) : (
                          <tr>
                            <td colSpan="6" className="text-center py-5">
                              <div className={isDarkMode ? 'text-light opacity-50' : 'text-muted'}>
                                <FaUsers size={48} className="mb-3 d-block mx-auto" />
                                <p>No se encontraron clientes con los criterios de búsqueda</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  /* Vista móvil optimizada */
                  <div className="d-flex flex-column gap-3 mb-4">
                    {clientesPaginados.clientes.length > 0 ? clientesPaginados.clientes.map(cliente => {
                      const membership = getEstadoMembresia(cliente);
                      const progreso = calcularProgresoMembresia(cliente);
                      
                      return (
                        <Card 
                          key={cliente.id} 
                          className={`border-0 shadow-sm ${isDarkMode ? 'bg-secondary' : 'bg-white'}`}
                          role="button" 
                          onClick={() => seleccionarCliente(cliente)}
                          style={{ 
                            transition: 'all 0.3s ease',
                            borderRadius: '12px'
                          }}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex align-items-center mb-3">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-3 shadow-sm" 
                                style={{ width: '50px', height: '50px', fontWeight: 700 }}
                              >
                                {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : <FaUser />}
                              </div>
                              <div className="flex-grow-1">
                                <div className={`fw-bold mb-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                                  {cliente.nombre}
                                </div>
                                <div className={`small ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`}>
                                  DNI: {cliente.dni}
                                </div>
                                <div className="mt-2">
                                  <Badge 
                                    bg={membership === "Activo" ? "success" : "danger"} 
                                    className="me-2 px-3 py-2"
                                    style={{ borderRadius: '8px' }}
                                  >
                                    {membership}
                                  </Badge>
                                  <span className="text-success fw-bold">
                                    ${(Number(cliente.precio) || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {!progreso.vencido && (
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <small className={isDarkMode ? 'text-light opacity-75' : 'text-muted'}>
                                    Progreso de membresía
                                  </small>
                                  <small className={isDarkMode ? 'text-light opacity-75' : 'text-muted'}>
                                    {progreso.diasRestantes} días restantes
                                  </small>
                                </div>
                                <ProgressBar 
                                  now={progreso.pct} 
                                  variant={progreso.pct > 70 ? "danger" : progreso.pct > 40 ? "warning" : "success"}
                                  style={{ height: '6px', borderRadius: '3px' }}
                                />
                              </div>
                            )}
                            
                            <div className="d-flex justify-content-end">
                              <Button 
                                size="sm" 
                                variant="danger"
                                onClick={(e) => { e.stopPropagation(); abrirModalEliminar(cliente, e); }}
                                className="border-0 px-3"
                                style={{ borderRadius: '8px' }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    }) : (
                      <Alert variant={isDarkMode ? "dark" : "light"} className="text-center py-4 border-0 shadow-sm">
                        <FaUsers size={48} className={`mb-3 ${isDarkMode ? 'text-light opacity-50' : 'text-muted'}`} />
                        <p className={`mb-0 ${isDarkMode ? 'text-light' : 'text-muted'}`}>
                          No se encontraron clientes con los criterios de búsqueda
                        </p>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Paginación optimizada */}
                {clientesFiltrados.length > 10 && (
                  <div className="d-flex justify-content-center">
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                        disabled={paginaActual === 1}
                      />
                      {[...Array(clientesPaginados.totalPaginas).keys()].map((numero) => (
                        <Pagination.Item
                          key={numero + 1}
                          active={numero + 1 === paginaActual}
                          onClick={() => setPaginaActual(numero + 1)}
                        >
                          {numero + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => setPaginaActual(prev => Math.min(clientesPaginados.totalPaginas, prev + 1))}
                        disabled={paginaActual === clientesPaginados.totalPaginas}
                      />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Información detallada del cliente seleccionado */}
            {clienteSeleccionado && (
              <Card className={`mt-5 border-0 shadow-lg overflow-hidden ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
                {/* Cabecera con degradado mejorado */}
                <div 
                  className="position-relative py-5 px-4" 
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    minHeight: '180px'
                  }}
                >
                  <Row className="align-items-center">
                    <Col xs={12} md={8} className="text-white">
                      <div className="d-flex align-items-center mb-4">
                        <div 
                          className="rounded-circle bg-white d-flex align-items-center justify-content-center me-4 shadow-lg"
                          style={{width: "80px", height: "80px"}}
                        >
                          <FaUser size={40} color="#3b82f6" />
                        </div>
                        <div>
                          <h2 className="mb-2 fw-bold">{clienteSeleccionado.nombre}</h2>
                          <p className="mb-0 text-white text-opacity-75 fs-5">
                            Cliente #{clienteSeleccionado.id} • DNI: {clienteSeleccionado.dni}
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} md={4} className="text-md-end">
                      <Badge
                        bg={getEstadoMembresia(clienteSeleccionado) === "Activo" ? "success" : "danger"}
                        className="d-inline-flex align-items-center fs-6 px-4 py-2 mb-3"
                        style={{ borderRadius: '12px' }}
                      >
                        {getEstadoMembresia(clienteSeleccionado) === "Activo" ? 
                          <FaCheckCircle className="me-2" /> : 
                          <FaTimesCircle className="me-2" />
                        }
                        Membresía: {getEstadoMembresia(clienteSeleccionado)}
                      </Badge>
                    </Col>
                  </Row>
                  
                  <Row className="mt-4">
                    <Col xs={12} className="d-flex justify-content-end">
                      <ButtonGroup>
                        <Button
                          variant="light"
                          size="lg"
                          className="d-flex align-items-center px-4 fw-bold"
                          onClick={() => abrirModalEditar(clienteSeleccionado)}
                          style={{ borderRadius: '12px 0 0 12px' }}
                        >
                          <FaEdit className="me-2" /> Editar
                        </Button>
                        <Button
                          variant="outline-light"
                          size="lg"
                          className="d-flex align-items-center px-4 fw-bold"
                          onClick={cancelarSeleccion}
                          style={{ borderRadius: '0 12px 12px 0' }}
                        >
                          <FaTimes className="me-2" /> Cerrar
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>
                </div>
                
                {/* Contenido con tarjetas de información */}
                <Card.Body className="p-4">
                  <Row className="g-4">
                    <Col xs={12} md={6}>
                      <Card className={`h-100 border-0 ${isDarkMode ? 'bg-dark' : 'bg-light'} shadow-sm`}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div 
                              className={`rounded-circle d-flex align-items-center justify-content-center ${
                                isDarkMode ? 'bg-info bg-opacity-25' : 'bg-primary bg-opacity-10'
                              } p-2 me-3`}
                            >
                              <FaUser size={18} className={isDarkMode ? "text-info" : "text-primary"} />
                            </div>
                            <h5 className="mb-0 fw-bold">Información Personal</h5>
                          </div>
                          
                          <Table borderless className={`mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
                            <tbody>
                              <tr>
                                <td width="40%" className="fw-bold text-muted ps-0">Nombre Completo:</td>
                                <td className="fs-6">{clienteSeleccionado.nombre}</td>
                              </tr>
                              <tr>
                                <td className="fw-bold text-muted ps-0">DNI:</td>
                                <td className="fs-6">{clienteSeleccionado.dni}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col xs={12} md={6}>
                      <Card className={`h-100 border-0 ${isDarkMode ? 'bg-dark' : 'bg-light'} shadow-sm`}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div 
                              className={`rounded-circle d-flex align-items-center justify-content-center ${
                                isDarkMode ? 'bg-success bg-opacity-25' : 'bg-success bg-opacity-10'
                              } p-2 me-3`}
                            >
                              <FaDollarSign size={18} className={isDarkMode ? "text-success" : "text-success"} />
                            </div>
                            <h5 className="mb-0 fw-bold">Detalles de Membresía</h5>
                          </div>
                          
                          <Table borderless className={`mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
                            <tbody>
                              <tr>
                                <td width="40%" className="fw-bold text-muted ps-0">Inicio:</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <FaCalendarAlt className={`me-2 ${isDarkMode ? 'text-light' : 'text-dark'}`} size={14} />
                                    <span>{clienteSeleccionado.fechaInicio || "No disponible"}</span>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-bold text-muted ps-0">Vencimiento:</td>
                                <td>
                                  <Badge 
                                    bg={clienteSeleccionado.estado === "Activo" ? "success" : "danger"} 
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
                      <Card className={`border-0 ${isDarkMode ? 'bg-dark' : 'bg-light'} shadow-sm`}>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div 
                              className={`rounded-circle d-flex align-items-center justify-content-center ${
                                isDarkMode ? 'bg-warning bg-opacity-25' : 'bg-warning bg-opacity-10'
                              } p-2 me-3`}
                            >
                              <FaDollarSign size={18} className="text-warning" />
                            </div>
                            <h5 className="mb-0 fw-bold">Información de Pago</h5>
                          </div>
                          
                          <Row>
                            <Col md={6}>
                              <div className={`p-3 rounded-3 mb-3 ${isDarkMode ? 'bg-dark bg-opacity-50' : 'bg-light'}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-1 text-muted">Precio de Membresía</p>
                                    <h2 className="text-success fw-bold mb-0">
                                      ${clienteSeleccionado.precio?.toLocaleString()}
                                    </h2>
                                  </div>
                                  <div 
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                                      isDarkMode ? 'bg-success bg-opacity-25' : 'bg-success bg-opacity-10'
                                    } p-3`}
                                  >
                                    <FaDollarSign size={24} className="text-success" />
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className={`p-3 rounded-3 mb-3 ${isDarkMode ? 'bg-dark bg-opacity-50' : 'bg-light'}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-1 text-muted">Estado</p>
                                    <h4 className={`fw-bold mb-0 ${clienteSeleccionado.estado === "Activo" ? "text-success" : "text-danger"}`}>
                                      {clienteSeleccionado.estado}
                                    </h4>
                                  </div>
                                  <div 
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                                      clienteSeleccionado.estado === "Activo" ? 
                                      (isDarkMode ? 'bg-success bg-opacity-25' : 'bg-success bg-opacity-10') : 
                                      (isDarkMode ? 'bg-danger bg-opacity-25' : 'bg-danger bg-opacity-10')
                                    } p-3`}
                                  >
                                    {clienteSeleccionado.estado === "Activo" ? 
                                      <FaCheckCircle size={24} className="text-success" /> : 
                                      <FaTimesCircle size={24} className="text-danger" />
                                    }
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
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

      {/* Modal para Nuevo Cliente */}
      <Modal
        show={showModalNuevo}
        onHide={() => setShowModalNuevo(false)}
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>DNI</Form.Label>
              <Form.Control
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fechaInicio"
                value={formatearFechaParaInput(formData.fechaInicio)}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                value={formatearFechaParaInput(formData.vencimiento)}
                readOnly
              />
              <Form.Text>
                Se calcula automáticamente (30 días después del inicio)
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleFormChange}
                />
              </InputGroup>
            </Form.Group>
            {/* Campo de estado eliminado en el formulario de nuevo cliente */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalNuevo(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarNuevoCliente}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Editar Cliente */}
      <Modal
        show={showModalEditar}
        onHide={() => setShowModalEditar(false)}
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>DNI</Form.Label>
              <Form.Control
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fechaInicio"
                value={formatearFechaParaInput(formData.fechaInicio)}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                value={formatearFechaParaInput(formData.vencimiento)}
                readOnly
              />
              <Form.Text>
                Se calcula automáticamente (30 días después del inicio)
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleFormChange}
                />
              </InputGroup>
            </Form.Group>
            {/* Estado de la membresía se calcula por fecha; solo editar estado de la cuenta */}
            <Form.Group className="mb-3">
              <Form.Label>Estado de la Cuenta</Form.Label>
              <Form.Select
                name="estadoCuenta"
                value={formData.estadoCuenta}
                onChange={handleFormChange}
              >
                <option value="Activo">Activo</option>
                <option value="Suspendida">Suspendida</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEditar(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarClienteEditado}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal para confirmar eliminación */}
      <Modal
        show={showModalEliminar}
        onHide={() => setShowModalEliminar(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar al cliente {clienteAEliminar?.nombre}?
          Esta acción no se puede deshacer.
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
    </Container>
  );
};

export default AdminClientes;
