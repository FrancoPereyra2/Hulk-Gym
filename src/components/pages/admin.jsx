import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
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
  FaEnvelope,
} from "react-icons/fa";
import Swal from 'sweetalert2';

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
    <Card.Body className="p-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          <p className={`small mb-1 ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
            {title}
          </p>
          <h3 className={`fw-bold mb-0 text-${color}`} style={{ fontSize: '1.5rem' }}>
            {value}
          </h3>
        </div>
        <div 
          className={`rounded-circle d-flex align-items-center justify-content-center bg-${color} bg-opacity-10 flex-shrink-0`}
          style={{ width: '48px', height: '48px', minWidth: '48px' }}
        >
          <Icon className={`text-${color}`} size={20} />
        </div>
      </div>
    </Card.Body>
  </Card>
));

const ClienteRow = memo(({ cliente, membership, progreso, isDarkMode, onSelect, onDelete, onRenovar, onTogglePago }) => (
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
      {/* NUEVO: Indicador de pago del mes */}
      {cliente.pagoMesActual && (
        <Badge bg="success" className="mt-1">
          <FaDollarSign className="me-1" size={10} />
          Pagado
        </Badge>
      )}
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
      <div className="d-flex gap-1">
        {/* NUEVO: Botón de renovar solo si está expirada */}
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
        
        {/* NUEVO: Botón de pago del mes */}
        <Button 
          variant={cliente.pagoMesActual ? "success" : "outline-warning"} 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); onTogglePago(cliente); }}
          className="border-0"
          title={cliente.pagoMesActual ? "Marcar como no pagado" : "Marcar como pagado"}
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
));

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

  const detalleClienteRef = useRef(null);
  const tablaClientesRef = useRef(null);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const userEmail = localStorage.getItem("userEmail");
    
    if (userType !== "admin") {
      navigate("/login");
    } else {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  const [showModalRenovar, setShowModalRenovar] = useState(false);
  const [clienteARenovar, setClienteARenovar] = useState(null);

  const [clientes, setClientes] = useState(() => {
    const savedClientes = localStorage.getItem('clientes');
    return savedClientes ? JSON.parse(savedClientes) : [];
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState(() => {
    const savedHistory = localStorage.getItem('emailHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [cuentasVencidas, setCuentasVencidas] = useState([]);

  const [tokensActivacion, setTokensActivacion] = useState(() => {
    const savedTokens = localStorage.getItem('tokensActivacion');
    return savedTokens ? JSON.parse(savedTokens) : [];
  });

  useEffect(() => {
    localStorage.setItem('tokensActivacion', JSON.stringify(tokensActivacion));
  }, [tokensActivacion]);

  const verificarCuentasVencidas = useCallback(() => {
    const hoy = new Date();
    const vencidas = clientes.filter(cliente => {
      if (!cliente.vencimiento || !cliente.email || cliente.email.trim() === '') return false;
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
  }, [clientes]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const [hoveredBar, setHoveredBar] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const [verificandoEmails, setVerificandoEmails] = useState(false);
  const [ultimaVerificacion, setUltimaVerificacion] = useState(() => {
    const saved = localStorage.getItem('ultimaVerificacionEmails');
    return saved ? new Date(saved) : null;
  });

  const getEstadoMembresia = useCallback((cliente) => {
    try {
      const partes = (cliente?.vencimiento || "").split("/");
      if (partes.length !== 3) return "Activo";
      const d = Number(partes[0]), m = Number(partes[1]) - 1, y = Number(partes[2]);
      const venc = new Date(y, m, d);
      if (isNaN(venc.getTime())) return "Activo";
      return venc < new Date() ? "Expirada" : "Activo";
    } catch (e) {
      return "Activo";
    }
  }, []);

  const estadisticas = useMemo(() => {
    const clientesConEmail = clientes.filter(cliente => {
      const email = cliente.email || '';
      return email.trim() !== '';
    });
    
    const activos = clientesConEmail.filter(cliente => getEstadoMembresia(cliente) === "Activo").length;
    const expiradas = clientesConEmail.filter(cliente => getEstadoMembresia(cliente) === "Expirada").length;
    const ingresos = clientesConEmail
      .filter(cliente => getEstadoMembresia(cliente) === "Activo")
      .reduce((total, cliente) => total + (cliente.precio || 0), 0);
    
    return {
      clientesActivos: activos,
      membresiasVencidas: expiradas,
      ingresosMes: `$${ingresos.toLocaleString()}`,
      totalClientes: clientesConEmail.length
    };
  }, [clientes, getEstadoMembresia]);

  const datosIngresos = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const ingresosMensuales = Array(12).fill(0);

    const clientesConEmail = clientes.filter(cliente => {
      const email = cliente.email || '';
      return email.trim() !== '';
    });

    clientesConEmail.forEach((cliente) => {
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

  const valorMaximo = useMemo(() => 
    Math.max(...(datosIngresos.length > 0 ? datosIngresos.map((item) => item.valor) : [0])) || 10000
  , [datosIngresos]);


  const clientesFiltrados = useMemo(() => {
    
    const clientesConEmail = clientes.filter(cliente => {
      const email = cliente.email || '';
      const tieneEmail = email.trim() !== '';
      return tieneEmail;
    });

    const clientesFiltradosFinales = clientesConEmail.filter((cliente) => {
      const nombre = (cliente.nombre || "").toLowerCase();
      const dni = String(cliente.dni || "");
      const termino = debouncedSearchTerm || "";
      const coincideTermino = nombre.includes(termino.toLowerCase()) || dni.includes(termino);

      if (filtroActivo === "activos") {
        return coincideTermino && getEstadoMembresia(cliente) === "Activo";
      } else if (filtroActivo === "vencidos") {
        return coincideTermino && getEstadoMembresia(cliente) === "Expirada";
      }

      return coincideTermino;
    });

    return clientesFiltradosFinales;
  }, [clientes, debouncedSearchTerm, filtroActivo, getEstadoMembresia]);

  const clientesPaginados = useMemo(() => {
    const clientesPorPagina = 10;
    const indiceInicial = (paginaActual - 1) * clientesPorPagina;
    return {
      clientes: clientesFiltrados.slice(indiceInicial, indiceInicial + clientesPorPagina),
      totalPaginas: Math.ceil(clientesFiltrados.length / clientesPorPagina)
    };
  }, [clientesFiltrados, paginaActual]);

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('clientes', JSON.stringify(clientes));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [clientes]);

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
    
    setTimeout(() => {
      requestAnimationFrame(() => {
        const detalleElement = detalleClienteRef.current || document.getElementById('detalle-cliente');
        
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
              
              const easeInOutQuart = progress < 0.5
                ? 8 * progress * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 4) / 2;
              
              window.scrollTo(0, startPosition + distance * easeInOutQuart);
              
              if (timeElapsed < duration) {
                requestAnimationFrame(animation);
              }
            };

            requestAnimationFrame(animation);
          } else {
            setTimeout(() => {
              const retryElement = detalleClienteRef.current || document.getElementById('detalle-cliente');
              if (retryElement) {
                retryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }
        }
      });
    }, 100); 
  }, []);

  const cancelarSeleccion = useCallback(() => {
    const tablaElement = tablaClientesRef.current || document.getElementById('tabla-clientes');
    
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
        
        const easeInOutQuart = progress < 0.5
          ? 8 * progress * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 4) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOutQuart);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          setClienteSeleccionado(null);
        }
      };

      requestAnimationFrame(animation);
    } else {
      setClienteSeleccionado(null);
    }
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
      email: "",
      fechaInicio: fechaHoyFormateada,
      vencimiento: vencimientoFormateado,
      estado: "Activo",
      estadoCuenta: "Activo",
      precio: 10000,
    });
    setShowModalNuevo(true);
  }, []);

  const guardarNuevoCliente = useCallback(async () => {
    if (!formData.email || formData.email.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Email obligatorio',
        text: 'El email es obligatorio para registrar un cliente.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!formData.dni || formData.dni.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'DNI obligatorio',
        text: 'El DNI es obligatorio para registrar un cliente.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (!formData.nombre || formData.nombre.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Nombre obligatorio',
        text: 'El nombre es obligatorio para registrar un cliente.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    const emailExistente = clientes.find(c => c.email.toLowerCase() === formData.email.trim().toLowerCase());
    if (emailExistente) {
      Swal.fire({
        icon: 'warning',
        title: 'Email duplicado',
        text: `Ya existe un cliente registrado con el email ${formData.email.trim()}`,
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const dniExistente = clientes.find(c => c.dni === formData.dni.trim());
    if (dniExistente) {
      Swal.fire({
        icon: 'warning',
        title: 'DNI duplicado',
        text: `Ya existe un cliente registrado con el DNI ${formData.dni.trim()}`,
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    setShowModalNuevo(false);

    try {
      Swal.fire({
        title: 'Registrando cliente...',
        html: 'Por favor espera mientras se envía el email de activación',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const nuevoCliente = {
        id: clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) + 1 : 1,
        ...formData,
        email: formData.email.trim().toLowerCase(),
        dni: formData.dni.trim(),
        nombre: formData.nombre.trim(),
        precio: Number(formData.precio),
        cuentaActivada: false,
        fechaCreacion: new Date().toISOString()
      };


      if (!nuevoCliente.estadoCuenta) nuevoCliente.estadoCuenta = "Activo";

      const { generarTokenActivacion, enviarEmailActivacion } = await import('../../services/emailService');
      
      const token = generarTokenActivacion();
      
      const tokenData = {
        token: token,
        clienteId: nuevoCliente.id,
        clienteDNI: nuevoCliente.dni,
        clienteEmail: nuevoCliente.email,
        fechaCreacion: new Date().toISOString(),
        usado: false,
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setTokensActivacion(prev => [...prev, tokenData]);

      setClientes(prev => [...prev, nuevoCliente]);

      setFormData({
        nombre: "",
        dni: "",
        email: "",
        fechaInicio: "",
        vencimiento: "",
        estado: "Activo",
        estadoCuenta: "Activo",
        precio: 10000,
      });

      const resultadoEmail = await enviarEmailActivacion(nuevoCliente, token);
      

      
      
      if (resultadoEmail.success) {
        
        const nuevoEmailHistorial = {
          id: Date.now(),
          clienteNombre: nuevoCliente.nombre,
          clienteDNI: nuevoCliente.dni,
          clienteEmail: nuevoCliente.email,
          tipo: 'activacion',
          fechaEnvio: new Date().toLocaleString('es-AR'),
          estado: 'Enviado',
          error: null,
          asunto: 'Activa tu cuenta - HULK GYM',
          token: token
        };

        setEmailHistory(prev => {
          const nuevoHistorial = [...prev, nuevoEmailHistorial];
          localStorage.setItem('emailHistory', JSON.stringify(nuevoHistorial));
          return nuevoHistorial;
        });

        await Swal.fire({
          icon: 'success',
          title: '¡Cliente registrado!',
          html: `
            <div style="text-align: left;">
              <p><strong>Cliente:</strong> ${nuevoCliente.nombre}</p>
              <p><strong>DNI:</strong> ${nuevoCliente.dni}</p>
              <p><strong>Email:</strong> ${nuevoCliente.email}</p>
              <p style="color: #28a745; margin-top: 15px;">
                <i class="fas fa-check-circle"></i> 
                Se ha enviado un email de activación exitosamente
              </p>
            </div>
          `,
          confirmButtonColor: '#28a745',
          timer: 4000,
          timerProgressBar: true
        });

      } else {
        console.error('❌ Error al enviar email:', resultadoEmail.error);

        await Swal.fire({
          icon: 'warning',
          title: 'Cliente registrado con advertencia',
          html: `
            <div style="text-align: left;">
              <p><strong>Cliente:</strong> ${nuevoCliente.nombre}</p>
              <p><strong>DNI:</strong> ${nuevoCliente.dni}</p>
              <p style="color: #ffc107; margin-top: 15px;">
                <i class="fas fa-exclamation-triangle"></i> 
                Hubo un error al enviar el email de activación
              </p>
              <p style="font-size: 0.9em; color: #6c757d;">
                ${resultadoEmail.error}
              </p>
            </div>
          `,
          confirmButtonColor: '#ffc107'
        });
      }

    } catch (error) {
      console.error('❌ Error al guardar cliente:', error);
      
      setFormData({
        nombre: "",
        dni: "",
        email: "",
        fechaInicio: "",
        vencimiento: "",
        estado: "Activo",
        estadoCuenta: "Activo",
        precio: 10000,
      });

      await Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: 'Error al registrar el cliente: ' + error.message,
        confirmButtonColor: '#dc3545'
      });
    }
  }, [clientes, formData]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");

  const handleCloseAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  const handleEliminarEmail = useCallback((emailId) => {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: '¿Estás seguro de que deseas eliminar este registro del historial?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevoHistorial = emailHistory.filter(email => email.id !== emailId);
        setEmailHistory(nuevoHistorial);
        localStorage.setItem('emailHistory', JSON.stringify(nuevoHistorial));
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El registro ha sido eliminado del historial',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }, [emailHistory]);

  const handleVerificarEmails = useCallback(async () => {
    setVerificandoEmails(true);
    
    try {
      
      Swal.fire({
        title: 'Verificando emails...',
        html: 'Por favor espera mientras verificamos las cuentas vencidas',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const { verificarYNotificarExpiraciones } = await import('../../services/emailService');
      
      const resultado = await verificarYNotificarExpiraciones();
      
      
      if (resultado.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error en la verificación',
          text: resultado.error.message,
          confirmButtonColor: '#dc3545'
        });
      } else {
        let icon = 'success';
        if (resultado.clientesVencidos === 0) {
          icon = 'info';
        } else if (resultado.errores > 0 && resultado.emailsEnviados === 0) {
          icon = 'error';
        } else if (resultado.errores > 0) {
          icon = 'warning';
        }

        Swal.fire({
          icon: icon,
          title: 'Verificación completada',
          html: `
            <div style="text-align: left; padding: 10px;">
              <div style="margin-bottom: 15px;">
                <h5 style="color: #6c757d; font-size: 1.1em; margin-bottom: 10px;">
                  📊 Resumen de verificación
                </h5>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="margin: 8px 0;">
                  <strong>Clientes verificados:</strong> 
                  <span style="color: #0d6efd;">${resultado.totalVerificados}</span>
                </p>
                  <strong>Errores:</strong> 
                  <span style="color: ${resultado.errores > 0 ? '#ffc107' : '#6c757d'};">${resultado.errores}</span>
                </p>
              </div>

              ${resultado.emailsEnviados > 0 
                ? `<div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 6px; border-left: 4px solid #28a745;">
                    <small>
                      <i class="fas fa-check-circle"></i> 
                      ¡Revisa tu bandeja de entrada de Gmail para confirmar los envíos!
                    </small>
                  </div>` 
                : `<div style="background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 6px; border-left: 4px solid #17a2b8;">
                    <small>
                      <i class="fas fa-info-circle"></i> 
                      No se enviaron emails (no hay cuentas vencidas con email válido)
                    </small>
                  </div>`
              }
            </div>
          `,
          confirmButtonColor: '#0d6efd',
          confirmButtonText: 'Entendido',
          width: '600px'
        });
        
        const ahora = new Date();
        setUltimaVerificacion(ahora);
        localStorage.setItem('ultimaVerificacionEmails', ahora.toISOString());
      }
      
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: error.message,
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setVerificandoEmails(false);
    }
  }, []);

  const verificarVencimientosAutomaticos = useCallback(async () => {
    try {

      
      const { verificarVencimientosAutomaticos } = await import('../../services/emailService');
      
      const resultado = await verificarVencimientosAutomaticos();

      
      if (resultado.emailsEnviados > 0) {
        const historialStr = localStorage.getItem('emailHistory');
        const nuevoHistorial = historialStr ? JSON.parse(historialStr) : [];
        setEmailHistory(nuevoHistorial);
        
      }
      
    } catch (error) {
      console.error('❌ Error en verificación automática:', error);
    }
  }, []);

  useEffect(() => {
    verificarVencimientosAutomaticos();
    
    const intervalo = setInterval(() => {
      verificarVencimientosAutomaticos();
    }, 3600000); 
    
    return () => clearInterval(intervalo);
  }, [verificarVencimientosAutomaticos]);

  const verificarYResetearPagosMensuales = useCallback(() => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const anioActual = fechaActual.getFullYear();
    
    const ultimaVerificacionPagos = localStorage.getItem('ultimaVerificacionPagos');
    let debeResetear = false;
    
    if (!ultimaVerificacionPagos) {
      debeResetear = true;
    } else {
      const fechaUltimaVerificacion = new Date(ultimaVerificacionPagos);
      const mesVerificacion = fechaUltimaVerificacion.getMonth();
      const anioVerificacion = fechaUltimaVerificacion.getFullYear();
      
      if (mesActual !== mesVerificacion || anioActual !== anioVerificacion) {
        debeResetear = true;
      }
    }
    
    if (debeResetear) {
      
      setClientes(prev => {
        const clientesActualizados = prev.map(cliente => ({
          ...cliente,
          pagoMesActual: false
        }));
        
        localStorage.setItem('clientes', JSON.stringify(clientesActualizados));
        
        return clientesActualizados;
      });
      
      localStorage.setItem('ultimaVerificacionPagos', fechaActual.toISOString());
      
    }
  }, []);

  useEffect(() => {
    verificarYResetearPagosMensuales();
  }, [verificarYResetearPagosMensuales]);

  const togglePagoMes = useCallback((cliente) => {
    const accion = cliente.pagoMesActual ? 'marcar como NO pagado' : 'marcar como pagado';
    const textoConfirmacion = cliente.pagoMesActual 
      ? `¿Estás seguro de que deseas marcar el pago del mes actual de <strong>${cliente.nombre}</strong> como <strong>NO PAGADO</strong>?<br><br>Esto indicará que el cliente debe el mes actual.`
      : `¿Confirmar que <strong>${cliente.nombre}</strong> ha <strong>PAGADO</strong> el mes actual?<br><br>Esto actualizará el registro del cliente.`;
    
    Swal.fire({
      title: cliente.pagoMesActual ? '¿Marcar como NO pagado?' : '¿Confirmar pago?',
      html: textoConfirmacion,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: cliente.pagoMesActual ? '#dc3545' : '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: cliente.pagoMesActual ? 'Sí, marcar NO pagado' : 'Sí, confirmar pago',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const clienteActualizado = {
          ...cliente,
          pagoMesActual: !cliente.pagoMesActual,
          fechaUltimoPago: !cliente.pagoMesActual ? new Date().toISOString() : cliente.fechaUltimoPago
        };
        
        setClientes(prev => prev.map((c) =>
          c.id === cliente.id ? clienteActualizado : c
        ));
        
        if (clienteSeleccionado && clienteSeleccionado.id === cliente.id) {
          setClienteSeleccionado(clienteActualizado);
        }

        Swal.fire({
          icon: 'success',
          title: clienteActualizado.pagoMesActual ? '¡Pago confirmado!' : 'Marcado como pendiente',
          text: clienteActualizado.pagoMesActual 
            ? `El pago de ${cliente.nombre} ha sido registrado correctamente.`
            : `${cliente.nombre} ahora aparece con pago pendiente.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }, [clienteSeleccionado]);

  const formatearFechaParaInput = (fechaString) => {
    if (!fechaString) return "";
    const partes = fechaString.split("/");
    if (partes.length !== 3) return "";
    const dia = partes[0].padStart(2, "0");
    const mes = partes[1].padStart(2, "0");
    const año = partes[2];
    return `${año}-${mes}-${dia}`;
  };

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

    const chartHeight = isMobile ? 180 : 240;
    const gap = isMobile ? 4 : 12;
    const indexMax = datosIngresos.reduce((acc, cur, i) => (cur.valor > (datosIngresos[acc]?.valor || 0) ? i : acc), 0);
    
    return (
      <Card className="shadow-sm mb-3">
        <Card.Body style={{ background: isDarkMode ? 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' : 'linear-gradient(180deg, rgba(59,130,246,0.03), transparent)' }}>
          <Card.Title as={isMobile ? "h6" : "h6"} className="mb-3">
            Ingresos por mes basados en clientes registrados
          </Card.Title>

          <div style={{ padding: isMobile ? '0.25rem' : '1rem' }}>
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
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: isMobile ? 20 : 28 }}>
                      <div style={{ height: chartHeight - heightPx }} />
                      <div
                        role="button"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{
                          width: isMobile ? '90%' : '70%',
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
                        {(hoveredBar === index || (!isMobile && isMax)) && valor > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: -26,
                            background: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)',
                            color: isDarkMode ? '#fff' : '#111',
                            padding: '3px 8px',
                            borderRadius: 8,
                            fontSize: isMobile ? 9 : 12,
                            fontWeight: 700,
                            boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
                            whiteSpace: 'nowrap'
                          }}>
                            ${valor.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ height: 6 }} />
                      <div style={{ 
                        fontSize: isMobile ? 9 : 12, 
                        color: isDarkMode ? '#e6eef8' : '#374151', 
                        fontWeight: 600, 
                        textAlign: 'center',
                        lineHeight: 1.2
                      }}>
                        {item.mes}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 8, textAlign: 'right', fontSize: isMobile ? 9 : 11, color: isDarkMode ? '#9fb4ff' : '#6b7280' }}>
                Datos basados en clientes activos — año actual
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

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
              : undefined,
            WebkitBackgroundClip: isDarkMode ? 'text' : undefined,
            WebkitTextFillColor: isDarkMode ? 'transparent' : undefined,
            color: isDarkMode ? undefined : '#222',
            fontFamily: '"Fjalla One", sans-serif'
          }}>HULK GYM</h3>
          <p className={`text-center small mb-4 ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`} style={{
            color: isDarkMode ? undefined : '#222',
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

            <Nav.Link 
              className={`d-flex align-items-center mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`}
              style={{
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer'
              }}
              onClick={() => setShowEmailModal(true)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                e.target.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <FaEnvelope className="me-2" />
              <span>Historial de Emails</span>
              {cuentasVencidas.length > 0 && (
                <Badge bg="danger" className="ms-2">{cuentasVencidas.length}</Badge>
              )}
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

  const guardarClienteEditado = useCallback(() => {
    if (!formData.email || formData.email.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Email obligatorio',
        text: 'El email es obligatorio para el cliente.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    const emailExistente = clientes.find(c => 
      c.id !== formData.id && 
      c.email.toLowerCase() === formData.email.trim().toLowerCase()
    );
    
    if (emailExistente) {
      Swal.fire({
        icon: 'warning',
        title: 'Email duplicado',
        text: `Ya existe otro cliente registrado con el email ${formData.email.trim()}`,
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const formDataActualizado = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      precio: Number(formData.precio)
    };
    
    setClientes(prev => prev.map((c) =>
      c.id === formData.id ? { ...c, ...formDataActualizado } : c
    ));

    if (clienteSeleccionado && clienteSeleccionado.id === formData.id) {
      setClienteSeleccionado(prev => prev ? { ...prev, ...formDataActualizado } : formDataActualizado);
    }

    setShowModalEditar(false);
  }, [formData, clienteSeleccionado, clientes]);

  const confirmarEliminarCliente = useCallback(() => {
    setClientes(prev => prev.filter((c) => c.id !== clienteAEliminar.id));

    const savedUsers = localStorage.getItem('users');
    if (savedUsers && clienteAEliminar.email) {
      const users = JSON.parse(savedUsers);
      const updatedUsers = users.filter(u => 
        u.username !== clienteAEliminar.email || u.role === 'admin'
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    const savedTokens = localStorage.getItem('tokensActivacion');
    if (savedTokens && clienteAEliminar.id) {
      const tokens = JSON.parse(savedTokens);
      const updatedTokens = tokens.filter(t => t.clienteId !== clienteAEliminar.id);
      localStorage.setItem('tokensActivacion', JSON.stringify(updatedTokens));
    }

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

  const handleSearch = useCallback((e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      setPaginaActual(1);
    }
    return false;
  }, [searchTerm]);

  const renovarMembresia = useCallback((cliente) => {
    try {
      const fechaHoy = new Date();
      const fechaVencimiento = new Date(fechaHoy);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
      
      const vencimientoFormateado = `${fechaVencimiento.getDate().toString().padStart(2, '0')}/${(fechaVencimiento.getMonth() + 1).toString().padStart(2, '0')}/${fechaVencimiento.getFullYear()}`;
      
      const clienteActualizado = {
        ...cliente,
        vencimiento: vencimientoFormateado,
        estado: "Activo",
        estadoCuenta: "Activo",
        pagoMesActual: true,
        fechaUltimoPago: new Date().toISOString()
      };
      
      setClientes(prev => prev.map((c) =>
        c.id === cliente.id ? clienteActualizado : c
      ));
      
      if (clienteSeleccionado && clienteSeleccionado.id === cliente.id) {
        setClienteSeleccionado(clienteActualizado);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Membresía renovada',
        text: `Nueva fecha de vencimiento: ${vencimientoFormateado}`,
        confirmButtonColor: '#28a745'
      });
      
      setShowModalRenovar(false);
      
    } catch (error) {
      console.error('Error al renovar membresía:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al renovar la membresía',
        confirmButtonColor: '#dc3545'
      });
    }
  }, [clienteSeleccionado]);

  useEffect(() => {
    verificarCuentasVencidas();
  }, [verificarCuentasVencidas]);

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
                {
                <h1 className={`${isMobile ? 'h3' : 'display-4'} fw-bold mb-2`} style={{
                  background: isDarkMode 
                    ? 'linear-gradient(45deg, #60a5fa, #34d399, #fbbf24)'
                    : undefined,
                  WebkitBackgroundClip: isDarkMode ? 'text' : undefined,
                  WebkitTextFillColor: isDarkMode ? 'transparent' : undefined,
                  color: isDarkMode ? undefined : '#222',
                  fontFamily: '"Fjalla One", sans-serif',
                  letterSpacing: isMobile ? '1px' : '2px',
                  transition: 'all 0.3s ease'
                }}>
                  PANEL DE ADMINISTRACIÓN
                </h1>
}
{/* MODIFICADO: Subtítulo más pequeño en móvil */}
                <p className={`${isMobile ? 'small' : 'lead'} ${isDarkMode ? 'text-light' : 'text-muted'}`} style={{
                  fontSize: isMobile ? '0.9rem' : '1.1rem',
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
                  color={estadisticas.membresiasVencidas > 0 ? "warning" : "secondary"}
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
            <div className="d-flex flex-column flex-md-row flex-wrap gap-2 mb-4">
              <Button
                variant="primary"
                size={isMobile ? "sm" : "md"}
                onClick={abrirModalNuevo}
                className="d-flex align-items-center justify-content-center px-3 py-2 shadow-sm border-0"
                style={{ borderRadius: '10px', fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                <FaPlus className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Agregar Cliente</div>
                  {!isMobile && <small className="opacity-75">Registrar nuevo miembro</small>}
                </div>
              </Button>
              
              <Button 
                variant="outline-success"
                size={isMobile ? "sm" : "md"}
                onClick={handleNuevoAdmin}
                className="d-flex align-items-center justify-content-center px-3 py-2 border-2"
                style={{ borderRadius: '10px', fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                <FaUserShield className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">Nuevo Admin</div>
                  {!isMobile && <small className="opacity-75">Crear administrador</small>}
                </div>
              </Button>

              <Button 
                variant="outline-warning"
                size={isMobile ? "sm" : "md"}
                onClick={handleVerificarEmails}
                disabled={verificandoEmails}
                className="d-flex align-items-center justify-content-center px-3 py-2 border-2"
                style={{ borderRadius: '10px', fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                <FaEnvelope className="me-2" />
                <div className="text-start">
                  <div className="fw-bold">
                    {verificandoEmails ? 'Verificando...' : 'Verificar Emails'}
                  </div>
                  {!isMobile && <small className="opacity-75">Notificar membresías expiradas</small>}
                </div>
              </Button>
            </div>

            {/* Mostrar información de última verificación */}
            {ultimaVerificacion && (
              <Alert variant="info" className="mb-4">
                <small>
                  Última verificación de emails: {ultimaVerificacion.toLocaleString()}
                </small>
              </Alert>
            )}

            {/* Sección de gestión de clientes optimizada */}
            <Card 
              ref={tablaClientesRef}
              id="tabla-clientes"
              className="border-0 shadow-lg" 
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px'
              }}
            >
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
                <Row className="g-2 mb-4">
                  <Col xs={12} md={8}>
                    <Form onSubmit={handleSearch} noValidate>
                      <InputGroup size={isMobile ? "sm" : "md"}>
                        <InputGroup.Text className={isDarkMode ? 'bg-secondary border-secondary' : 'bg-light border-light'}>
                          <FaSearch className={isDarkMode ? 'text-light' : 'text-muted'} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder={isMobile ? "Buscar DNI..." : "Buscar por DNI..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`border-start-0 ${isDarkMode ? 'bg-dark text-white' : ''}`}
                          style={{ borderRadius: '0 8px 8px 0' }}
                        />
                      </InputGroup>
                    </Form>
                  </Col>
                  
                  <Col xs={12} md={4}>
                    <ButtonGroup size={isMobile ? "sm" : "md"} className="w-100">
                      <Button
                        variant={filtroActivo === "todos" ? "primary" : "outline-primary"}
                        onClick={() => setFiltroActivo("todos")}
                        className="flex-fill"
                        style={{ fontSize: isMobile ? '0.75rem' : '1rem' }}
                      >
                        Todos
                      </Button>
                      <Button
                        variant={filtroActivo === "activos" ? "success" : "outline-success"}
                        onClick={() => setFiltroActivo("activos")}
                        className="flex-fill"
                        style={{ fontSize: isMobile ? '0.75rem' : '1rem' }}
                      >
                        Activos
                      </Button>
                      <Button
                        variant={filtroActivo === "vencidos" ? "danger" : "outline-danger"}
                        onClick={() => setFiltroActivo("vencidos")}
                        className="flex-fill"
                        style={{ fontSize: isMobile ? '0.75rem' : '1rem' }}
                      >
                        Expirados
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>

                {/* Tabla optimizada con componentes memoizados */}
                {!isMobile ? (
                  <div className="table-responsive">
                    {/* Debug info temporal */
                    /* <div className="mb-3 p-2 bg-info text-white rounded">
                      <small>
                        Debug: Total clientes: {clientes.length} | 
                        Con email: {clientes.filter(c => c.email && c.email.trim()).length} | 
                        Filtrados: {clientesFiltrados.length} | 
                        Paginados: {clientesPaginados.clientes.length}
                      </small>
                    </div> */}
                    
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
                            onRenovar={abrirModalRenovar}
                            onTogglePago={togglePagoMes}
                          />
                        )) : (
                          <tr>
                            <td colSpan="6" className="text-center py-5">
                              <div className={isDarkMode ? 'text-light opacity-50' : 'text-muted'}>
                                <FaUsers size={48} className="mb-3 d-block mx-auto" />

                                <p>No se encontraron clientes con email registrado</p>
                                <small>
                                  Total clientes: {clientes.length} | 
                                  Con email: {clientes.filter(c => c.email && c.email.trim()).length}
                                </small>
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
                          className="border-0 shadow-sm"
                          role="button" 
                          onClick={() => seleccionarCliente(cliente)}
                          style={{ 
                            transition: 'all 0.3s ease',
                            borderRadius: '12px',
                            background: isDarkMode 
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(255,255,255,0.95)'
                          }}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex align-items-center mb-2">
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

                {/* Paginación optimizada */
                clientesFiltrados.length > 10 && (
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
              <Card 
                ref={detalleClienteRef}
                id="detalle-cliente" 
                className={`mt-5 border-0 shadow-lg overflow-hidden ${isDarkMode ? 'bg-dark' : 'bg-white'}`}
              >
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
                          size="md"
                          className="d-flex align-items-center px-4 fw-bold"
                          onClick={() => abrirModalEditar(clienteSeleccionado)}
                          style={{ borderRadius: '12px 0 0 12px' }}
                        >
                          <FaEdit className="me-2" /> Editar
                        </Button>
                        <Button
                          variant="outline-light"
                          size="md"
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
                              <tr>
                                <td className="fw-bold text-muted ps-0">Email:</td>
                                <td className="fs-6">
                                  <div className="d-flex align-items-center">
                                    <FaEnvelope className={`me-2 ${isDarkMode ? 'text-light' : 'text-dark'}`} size={14} />
                                    <span>{clienteSeleccionado.email || 'No registrado'}</span>
                                  </div>
                                </td>
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
                              className={`rounded-circle d-flex alignitems-center justify-content-center ${
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
                            <Col md={4}>
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
                            
                            <Col md={4}>
                              <div className={`p-3 rounded-3 mb-3 ${isDarkMode ? 'bg-dark bg-opacity-50' : 'bg-light'}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-1 text-muted">Estado de Membresía</p>
                                    <h4 className={`fw-bold mb-0 ${getEstadoMembresia(clienteSeleccionado) === "Activo" ? "text-success" : "text-danger"}`}>
                                      {getEstadoMembresia(clienteSeleccionado)}
                                    </h4>
                                  </div>
                                  <div 
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                                      getEstadoMembresia(clienteSeleccionado) === "Activo" ? 
                                      (isDarkMode ? 'bg-success bg-opacity-25' : 'bg-success bg-opacity-10') : 
                                      (isDarkMode ? 'bg-danger bg-opacity-25' : 'bg-danger bg-opacity-10')
                                    } p-3`}
                                  >
                                    {getEstadoMembresia(clienteSeleccionado) === "Activo" ? 
                                      <FaCheckCircle size={24} className="text-success" /> : 
                                      <FaTimesCircle size={24} className="text-danger" />
                                    }
                                  </div>
                                </div>
                              </div>
                            </Col>
                            
                            {/* NUEVO: Estado de pago del mes actual */}
                            <Col md={4}>
                              <div className={`p-3 rounded-3 mb-3 ${isDarkMode ? 'bg-dark bg-opacity-50' : 'bg-light'}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-1 text-muted">Pago Mes Actual</p>
                                    <h4 className={`fw-bold mb-0 ${clienteSeleccionado.pagoMesActual ? "text-success" : "text-warning"}`}>
                                      {clienteSeleccionado.pagoMesActual ? "Pagado" : "Pendiente"}
                                    </h4>
                                  </div>
                                  <Button
                                    variant={clienteSeleccionado.pagoMesActual ? "success" : "warning"}
                                    className="rounded-circle p-3"
                                    onClick={() => togglePagoMes(clienteSeleccionado)}
                                  >
                                    <FaDollarSign size={24} />
                                  </Button>
                                </div>
                              </div>
                            </Col>
                          </Row>
                          
                          {/* NUEVO: Botón de renovar si está expirada */}
                          {getEstadoMembresia(clienteSeleccionado) === "Expirada" && (
                            <Alert variant="danger" className="mt-3 d-flex justify-content-between align-items-center">
                              <div>
                                <strong>Membresía Expirada</strong>
                                <p className="mb-0 small">Esta membresía ha vencido. Renuévala para reactivar el acceso.</p>
                              </div>
                              <Button 
                                variant="success" 
                                onClick={() => abrirModalRenovar(clienteSeleccionado)}
                                className="ms-3"
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
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
              <Form.Text className="text-muted">
                <strong>Campo obligatorio</strong> - Necesario para notificaciones y gestión del cliente
              </Form.Text>
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
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
              <Form.Text className="text-muted">
                <strong>Campo obligatorio</strong> - Necesario para notificaciones
              </Form.Text>
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
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
          <p className="fw-bold">{clienteAEliminar?.nombre}</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminarCliente}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para historial de emails - corregir estructura del modal */}
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
              ? 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(90deg, #ffffff 0%, #f8faff 100%)',
            color: isDarkMode ? 'white' : 'dark'
          }}
        >
          <Modal.Title>
            <FaEnvelope className="me-2" />
            Historial de Emails Enviados
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          color: isDarkMode ? 'white' : 'dark'
        }}>
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FaTimesCircle className="me-2 text-warning" />
                Cuentas Vencidas Actuales: <Badge bg="danger">{cuentasVencidas.length}</Badge>
              </h6>
              <Button 
                variant="warning" 
                size="sm" 
                onClick={handleVerificarEmails}
                disabled={cuentasVencidas.length === 0 || verificandoEmails}
              >
                <FaEnvelope className="me-1" />
                {verificandoEmails ? 'Verificando...' : 'Verificar Emails'}
              </Button>
            </Col>
          </Row>
          
          {emailHistory.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaEnvelope size={40} className="mb-2" />
              <p className="mb-0">No se han enviado emails aún</p>
            </Alert>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {emailHistory
                .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))
                .map((email) => (
                  <Card 
                    key={email.id}
                    className="mb-2"
                    style={{
                      background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                      color: isDarkMode ? 'white' : 'dark',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            <FaUser className="me-2 text-primary" />
                            {email.clienteNombre}
                          </h6>
                          <p className="mb-1 small">
                            <FaUser className="me-1 text-muted" />
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
                        <div className="text-end d-flex flex-column align-items-end gap-2">
                          <div>
                            <Badge 
                              bg={email.tipo === 'vencimiento' ? 'danger' : email.tipo === 'activacion' ? 'info' : 'warning'}
                              className="mb-2"
                            >
                              {email.tipo === 'vencimiento' ? 'Vencida' : email.tipo === 'activacion' ? 'Activación' : 'Recordatorio'}
                            </Badge>
                            <br />
                            <Badge bg={
                              email.estado === 'Enviado' ? 'success' : 
                              email.estado === 'Simulado' ? 'warning' : 'danger'
                            }>
                              {email.estado === 'Enviado' ? (
                                <>
                                  <FaCheckCircle className="me-1" />
                                  Enviado
                                </>
                              ) : email.estado === 'Simulado' ? (
                                <>
                                  <FaEnvelope className="me-1" />
                                  Simulado
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle className="me-1" />
                                  Error
                                </>
                              )}
                            </Badge>
                            {email.error && (
                              <div className="mt-1">
                                <small className="text-muted" title={email.error}>
                                  {email.error.substring(0, 30)}...
                                </small>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleEliminarEmail(email.id)}
                            className="border-0"
                            title="Eliminar registro"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{
          background: isDarkMode 
            ? 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(90deg, #ffffff 0%, #f8faff 100%)'
        }}>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* NUEVO: Modal para confirmar renovación */}
      <Modal
        show={showModalRenovar}
        onHide={() => setShowModalRenovar(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Renovar Membresía</Modal.Title>
        </Modal.Header>
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
          <Button variant="secondary" onClick={() => setShowModalRenovar(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={() => renovarMembresia(clienteARenovar)}>
            <FaCheckCircle className="me-2" />
            Confirmar Renovación
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminClientes;