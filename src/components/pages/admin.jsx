import React, { useState, useEffect } from "react";
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

  // Cargar clientes de localStorage o inicializar vacío
  const [clientes, setClientes] = useState(() => {
    const savedClientes = localStorage.getItem('clientes');
    return savedClientes ? JSON.parse(savedClientes) : [];
  });

  // Form para nuevo/editar cliente
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    fechaInicio: "",
    vencimiento: "",
    estado: "Activo", // estado de la membresía (Activo / Vencida)
    estadoCuenta: "Activo", // nuevo: estado de la cuenta (Activo / Suspendida / Bloqueada)
    precio: 10000,
  });

  // Guardar clientes en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  // Calcular datos del dashboard basados en la lista de clientes actual
  // Derivar estado de membresía a partir de la fecha de vencimiento
  const getEstadoMembresia = (cliente) => {
    try {
      const partes = (cliente?.vencimiento || "").split("/");
      if (partes.length !== 3) return "Activo"; // fallback
      const d = Number(partes[0]), m = Number(partes[1]) - 1, y = Number(partes[2]);
      const venc = new Date(y, m, d);
      if (isNaN(venc.getTime())) return "Activo";
      return venc < new Date() ? "Vencida" : "Activo";
    } catch (e) {
      return "Activo";
    }
  };

  const clientesActivos = clientes.filter(
    (cliente) => getEstadoMembresia(cliente) === "Activo"
  ).length;
  const membresiasVencidas = clientes.filter(
    (cliente) => getEstadoMembresia(cliente) === "Vencida"
  ).length;

  // Simular ingresos basados en clientes (usando el precio real de cada cliente)
  const ingresosMes = `$${clientes
    .filter((cliente) => getEstadoMembresia(cliente) === "Activo")
    .reduce((total, cliente) => total + (cliente.precio || 0), 0)
    .toLocaleString()}`;

  // Número de clases hoy (simulado - en un caso real podrías tener una lista de clases)
  const clasesHoy = 5;

  // Generar datos de ingresos basados en los clientes registrados
  const calcularIngresosAnuales = (clientesParam = clientes) => {
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

    // Inicializar array de ingresos mensuales
    const ingresosMensuales = Array(12).fill(0);

    // Calcular ingresos por cliente según su fecha de inicio
    clientesParam.forEach((cliente) => {
      try {
        // Convertir la fecha de formato DD/MM/YYYY a un objeto Date
        if (!cliente.fechaInicio) return;

        const partes = cliente.fechaInicio.split("/");
        if (partes.length !== 3) return;

        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Los meses en JS son 0-11
        const año = parseInt(partes[2], 10);

        // Verificación más segura para fechas
        if (isNaN(dia) || isNaN(mes) || isNaN(año)) return;

        // Solo considerar clientes activos
        if (cliente.estado !== "Activo") return;

        // Considerar todos los clientes, no solo los del año actual
        // Esto es para que el gráfico muestre datos históricos también
        const precio = Number(cliente.precio) || 0;

        // Agregar ingreso al mes correspondiente
        if (año === currentYear) {
          ingresosMensuales[mes] += precio;
        }
      } catch (error) {
        console.error("Error al procesar fecha:", cliente.fechaInicio, error);
      }
    });

    // Añadir logs para depuración
    console.log("Ingresos mensuales calculados:", ingresosMensuales);

    // Crear el array de objetos para el gráfico
    return meses.map((mes, index) => ({
      mes,
      valor: ingresosMensuales[index],
    }));
  };

  // Cuando se monta el componente, calcular los datos del gráfico
  useEffect(() => {
    const datos = calcularIngresosAnuales();
    console.log("Datos iniciales del gráfico:", datos);
    setDatosIngresos(datos);
  }, []); // Solo se ejecuta al montar el componente

  // Cambiar de useState con valor inicial a useState mutable:
  const [datosIngresos, setDatosIngresos] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null); // <-- nuevo estado
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // listener para detectar cambios de tamaño y adaptar vista móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const valorMaximo =
    Math.max(...(datosIngresos.length > 0 ? datosIngresos.map((item) => item.valor) : [0])) || 10000;

  // Manejo del formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Si la fecha de inicio cambia, calcular automáticamente la fecha de vencimiento (30 días después)
    if (name === "fechaInicio" && value) {
      // Convertir la fecha YYYY-MM-DD del selector a un objeto Date
      const fechaInicio = new Date(value);
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
      
      // Formatear la fecha para guardar en estado como DD/MM/YYYY
      const inicioFormateado = `${fechaInicio.getDate().toString().padStart(2, '0')}/${(fechaInicio.getMonth() + 1).toString().padStart(2, '0')}/${fechaInicio.getFullYear()}`;
      const vencimientoFormateado = `${fechaVencimiento.getDate().toString().padStart(2, '0')}/${(fechaVencimiento.getMonth() + 1).toString().padStart(2, '0')}/${fechaVencimiento.getFullYear()}`;
      
      setFormData({
        ...formData,
        fechaInicio: inicioFormateado,
        vencimiento: vencimientoFormateado,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Filtrar y buscar clientes (usa estado derivado por fecha)
  const clientesFiltrados = clientes.filter((cliente) => {
    // Búsqueda segura
    const nombre = (cliente.nombre || "").toLowerCase();
    const dni = String(cliente.dni || "");
    const termino = searchTerm || "";
    const coincideTermino =
      nombre.includes(termino.toLowerCase()) || dni.includes(termino);

    // Filtro por estado usando la función derivada
    if (filtroActivo === "activos") {
      return coincideTermino && getEstadoMembresia(cliente) === "Activo";
    } else if (filtroActivo === "vencidos") {
      return coincideTermino && getEstadoMembresia(cliente) === "Vencida";
    }

    return coincideTermino;
  });

  // Paginación
  const clientesPorPagina = 10;
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicial = (paginaActual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(
    indiceInicial,
    indiceInicial + clientesPorPagina
  );

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPaginaActual(1); // Volver a la primera página al buscar
  };

  // Función para cancelar la selección del cliente
  const cancelarSeleccion = () => {
    setClienteSeleccionado(null);
  };

  // Funciones para manejar modal nuevo cliente
  const abrirModalNuevo = () => {
    const fechaHoy = new Date();
    const fechaHoyFormateada = `${fechaHoy.getDate()
      .toString()
      .padStart(2, "0")}/${(fechaHoy.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${fechaHoy.getFullYear()}`;

    const fechaVencimiento = new Date(fechaHoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const vencimientoFormateado = `${fechaVencimiento.getDate()
      .toString()
      .padStart(2, "0")}/${(fechaVencimiento.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${fechaVencimiento.getFullYear()}`;

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
  };

  const guardarNuevoCliente = () => {
    // Asegurarse de que precio sea un número
    const nuevoCliente = {
      id: clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) + 1 : 1,
      ...formData,
      precio: Number(formData.precio)
    };

    // Compatibilidad: si un cliente anterior no trae estadoCuenta, asignarlo
    if (!nuevoCliente.estadoCuenta) nuevoCliente.estadoCuenta = "Activo";

    // Actualizar la lista de clientes
    const nuevosClientes = [...clientes, nuevoCliente];
    setClientes(nuevosClientes);

    // Recalcular los datos del gráfico con el nuevo cliente
    console.log("Guardando nuevo cliente:", nuevoCliente);
    const nuevosIngresos = calcularIngresosAnuales(nuevosClientes);
    setDatosIngresos(nuevosIngresos);

    setShowModalNuevo(false);
  };

  // Funciones para manejar modal editar cliente
  const abrirModalEditar = (cliente, e) => {
    if (e) e.stopPropagation();
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre,
      dni: cliente.dni,
      fechaInicio: cliente.fechaInicio,
      vencimiento: cliente.vencimiento,
      // Nota: la membresía se calcula por fecha; no la almacenamos/edita manualmente aquí.
      estadoCuenta: cliente.estadoCuenta || "Activo", // estado de la cuenta editable
      precio: cliente.precio,
    });
    setShowModalEditar(true);
  };

  const guardarClienteEditado = () => {
    // Asegurarse de que precio sea un número
    const formDataActualizado = {
      ...formData,
      precio: Number(formData.precio)
    };
    
    // Merge para no eliminar campos que existían (p.ej. estructura antigua con `estado`)
    const clientesActualizados = clientes.map((c) =>
      c.id === formData.id ? { ...c, ...formDataActualizado } : c
    );

    setClientes(clientesActualizados);

    // Actualizar datos del gráfico
    console.log("Cliente editado:", formDataActualizado);
    const nuevosIngresos = calcularIngresosAnuales(clientesActualizados);
    setDatosIngresos(nuevosIngresos);

    if (clienteSeleccionado && clienteSeleccionado.id === formData.id) {
      // actualizar el seleccionado mezclando los valores nuevos
      setClienteSeleccionado(prev => prev ? { ...prev, ...formDataActualizado } : formDataActualizado);
    }

    setShowModalEditar(false);
  };

  // Funciones para manejar eliminación
  const abrirModalEliminar = (cliente, e) => {
    if (e) e.stopPropagation();
    setClienteAEliminar(cliente);
    setShowModalEliminar(true);
  };

  const confirmarEliminarCliente = () => {
    const clientesActualizados = clientes.filter(
      (c) => c.id !== clienteAEliminar.id
    );

    setClientes(clientesActualizados);

    // Actualizar datos del gráfico
    setDatosIngresos(calcularIngresosAnuales(clientesActualizados));

    if (clienteSeleccionado && clienteSeleccionado.id === clienteAEliminar.id) {
      setClienteSeleccionado(null);
    }

    setShowModalEliminar(false);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

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
    <Navbar bg="dark" variant="dark" className="d-flex flex-column h-100">
      <Container fluid className="d-flex flex-column h-100">
        <Navbar.Brand className="p-3 w-100">
          <Card.Title as="h3" className="fw-bold text-success">
            HULK GYM
          </Card.Title>
          <Nav className="flex-column w-100 mt-4">
            <Nav.Link className="d-flex align-items-center px-0 text-primary">
              <FaUsers className="me-2" />
              <span>Todos los Clientes</span>
            </Nav.Link>

            <Nav.Link 
              className="d-flex align-items-center px-0 text-warning"
              onClick={() => navigate('/rutinas')}
              style={{ cursor: 'pointer' }}
            >
              <FaDumbbell className="me-2" />
              <span>Rutinas</span>
            </Nav.Link>

            {/* Botón cerrar sesión en el sidebar */}
            <Nav.Link
              className="d-flex align-items-center px-0 text-danger mt-3"
              onClick={handleLogout}
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

  const parseFecha = (fechaString) => {
    if (!fechaString) return null;
    const partes = fechaString.split('/');
    if (partes.length !== 3) return null;
    const d = Number(partes[0]), m = Number(partes[1]) - 1, y = Number(partes[2]);
    const fecha = new Date(y, m, d);
    return isNaN(fecha.getTime()) ? null : fecha;
  };

  const calcularProgresoMembresia = (cliente) => {
    const inicio = parseFecha(cliente.fechaInicio);
    const venc = parseFecha(cliente.vencimiento);
    const ahora = new Date();
    if (!inicio || !venc) return { pct: 0, diasRestantes: null, vencido: false };

    const totalMs = venc - inicio;
    const restanteMs = venc - ahora;
    const vencido = restanteMs <= 0;
    // Si inicio en el futuro, mostrar 0% cumplido
    const transcurridoMs = ahora > inicio ? Math.min(Math.max(0, ahora - inicio), totalMs) : 0;
    const pct = totalMs > 0 ? Math.round((transcurridoMs / totalMs) * 100) : 100;
    const diasRestantes = vencido ? 0 : Math.ceil(remainingOrZero(restanteMs) / (1000 * 60 * 60 * 24));
    return { pct: Math.max(0, Math.min(100, pct)), diasRestantes, vencido };
  };

  const remainingOrZero = (ms) => (ms > 0 ? ms : 0);

  // Función para redirigir al formulario de registro con permisos de admin
  const handleNuevoAdmin = () => {
    // Guardar en localStorage que estamos creando un admin para que el formulario lo detecte
    localStorage.setItem('creandoAdmin', 'true');
    navigate('/registro');
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      <Row className="flex-grow-1 m-0">
        {/* Sidebar para pantallas medianas y grandes */}
        <Col
          xs={2}
          md={3}
          lg={2}
          xl={2}
          className="d-none d-md-block p-0 h-100"
        >
          {renderSidebar()}
        </Col>

        {/* Offcanvas para móviles */}
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          className="w-75"
          placement="start"
        >
          <Offcanvas.Header closeButton className="bg-dark text-white">
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">{renderSidebar()}</Offcanvas.Body>
        </Offcanvas>

        {/* Contenedor principal */}
        <Col xs={12} md={9} lg={10} xl={10} className="h-100 p-0">
          {/* Navbar para móviles */}
          <Navbar bg="dark" variant="dark" className="d-md-none">
            <Container fluid>
              <Button
                variant="outline-light"
                onClick={() => setShowSidebar(true)}
                className="me-2"
              >
                <FaBars />
              </Button>
              <Navbar.Brand className="fw-bold text-success">
                HULK GYM
              </Navbar.Brand>

              <div className="d-flex align-items-center gap-2">
                <Button 
                  variant="outline-info" 
                  onClick={alternarTema} 
                  size="sm"
                >
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </Button>
                <Button variant="outline-danger" onClick={handleLogout} size="sm">
                  <FaTimes /> Salir
                </Button>
              </div>
            </Container>
          </Navbar>

          {/* Contenido de la página */}
          <Container fluid className="p-3">
            {/* Header con botón de tema */}
            <Row className="mb-3">
              <Col className="d-flex justify-content-end d-none d-md-flex">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={alternarTema}
                  className="d-flex align-items-center"
                >
                  {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
                </Button>
              </Col>
            </Row>

            {/* Tarjetas de resumen */}
            <Row className="mb-4 d-flex justify-content-center">
              <Col xs={6} md={3} className="mb-3 mb-md-0">
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h2" className="mb-0">
                      {clientesActivos}
                    </Card.Title>
                    <Card.Text className="text-muted mb-0 small">
                      Clientes activos
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3} className="mb-3 mb-md-0">
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h2" className="mb-0">
                      {membresiasVencidas}
                    </Card.Title>
                    <Card.Text className="text-muted mb-0 small">
                      Membresías vencidas
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h2" className="mb-0">
                      {ingresosMes}
                    </Card.Title>
                    <Card.Text className="text-muted mb-0 small">
                      Ingresos anuales
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Gráfico de ingresos usando componentes de React Bootstrap */}
            <Row className="mb-4">
              <Col xs={12}>{renderBarChart()}</Col>
            </Row>

            {/* Botones de acción */}
            <Row className="mb-4">
              <Col>
                <Button
                  variant="primary"
                  onClick={abrirModalNuevo}
                  className="me-2"
                >
                  <FaPlus className="me-2" /> Agregar Cliente
                </Button>
                <Button 
                  variant="outline-success"
                  onClick={handleNuevoAdmin}
                >
                  <FaUser className="me-2" /> Nuevo Admin
                </Button>
              </Col>
            </Row>

            {/* Título sección de administración de clientes */}
            <Row className="mb-3">
              <Col>
                <h2>Administración de Clientes</h2>
              </Col>
            </Row>

            {/* Barra de filtros y búsqueda */}
            <Row className="mb-3">
              <Col sm={12} lg={6} className="mb-2 mb-lg-0">
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por nombre o DNI"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="primary" type="submit">
                      <FaSearch />
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              <Col sm={12} lg={6}>
                <div className="d-flex">
                  <Button
                    variant={
                      filtroActivo === "todos" ? "primary" : "outline-primary"
                    }
                    onClick={() => setFiltroActivo("todos")}
                    size="sm"
                    className="flex-grow-1 me-2"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={
                      filtroActivo === "activos" ? "success" : "outline-success"
                    }
                    onClick={() => setFiltroActivo("activos")}
                    size="sm"
                    className="flex-grow-1 me-2"
                  >
                    Activos
                  </Button>
                  <Button
                    variant={
                      filtroActivo === "vencidos" ? "danger" : "outline-danger"
                    }
                    onClick={() => setFiltroActivo("vencidos")}
                    size="sm"
                    className="flex-grow-1"
                  >
                    Vencidos
                  </Button>
                </div>
              </Col>
            </Row>

            {/* Tarjetas de clientes para móvil (sin scroll horizontal) */}
            {isMobile ? (
              <div className="d-flex flex-column gap-2 mb-3">
                {clientesPaginados.length > 0 ? clientesPaginados.map(cliente => {
                  const membership = getEstadoMembresia(cliente);
                  return (
                    <Card key={cliente.id} className="shadow-sm" role="button" onClick={() => seleccionarCliente(cliente)}>
                      <Card.Body className="p-2">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-secondary text-white me-3" style={{ width: 46, height: 46, fontWeight: 700 }}>
                            {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : <FaUser />}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: 14 }}>{cliente.nombre}</div>
                            <div className="text-muted small">DNI: {cliente.dni}</div>
                            <div className="small mt-1">
                              <Badge bg={membership === "Activo" ? "success" : "danger"} className="me-2">
                                {membership}
                              </Badge>
                              <span className="text-success fw-bold">${(Number(cliente.precio) || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        {/* Botón de borrar centrado debajo de la info (no interfiere con el click en la tarjeta) */}
                        <div className="d-flex justify-content-center mt-2">
                          <Button aria-label={`Eliminar ${cliente.nombre}`} size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); abrirModalEliminar(cliente, e); }}>
                            <FaTrash />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                }) : (
                  <div className="text-center text-muted py-3">No se encontraron clientes con los criterios de búsqueda.</div>
                )}
              </div>
            ) : (
              // Tabla de clientes para escritorio
              <Table responsive hover size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}></th>
                    <th>Cliente</th>
                    <th className="d-none d-md-table-cell">Membresía</th>
                    <th>Estado</th>
                    <th>Precio</th>
                    <th style={{ width: "110px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesPaginados.length > 0 ? clientesPaginados.map((cliente) => {
                    const membership = getEstadoMembresia(cliente);
                    const variant = membership === "Activo" ? "success" : "danger";
                    return (
                      <tr key={cliente.id} onClick={() => seleccionarCliente(cliente)} style={{ cursor: "pointer" }}>
                        <td className="align-middle">
                          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-secondary text-white" style={{ width: 44, height: 44, fontWeight: 700 }}>
                            {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : <FaUser />}
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="fw-bold">{cliente.nombre}</div>
                          <div className="text-muted small">DNI: {cliente.dni}</div>
                        </td>
                        <td className="align-middle d-none d-md-table-cell" style={{ minWidth: 220 }}>
                          <div className="mb-1 small text-muted">Vence: {cliente.vencimiento || "—"}</div>
                          <div className={`small fw-bold ${membership === 'Activo' ? 'text-success' : 'text-danger'}`}>{membership}</div>
                        </td>
                        <td className="align-middle">
                          <Badge bg={variant} pill className="d-inline-flex align-items-center" title={`Membresía: ${membership}`} style={{ padding: "0.28rem 0.6rem", fontSize: 13 }}>
                            {membership === "Activo" ? <FaCheckCircle className="me-1" /> : <FaTimesCircle className="me-1" />}
                            <span style={{ marginLeft: 4 }}>Membresía: {membership}</span>
                          </Badge>
                        </td>
                        <td className="align-middle">
                          <div className="fw-bold text-success">${(Number(cliente.precio) || 0).toLocaleString()}</div>
                          <div className="small text-muted">mensual</div>
                        </td>
                        <td className="align-middle">
                          {/* centrar botón de borrar en la celda de acciones */}
                          <div className="d-flex justify-content-center">
                            <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); abrirModalEliminar(cliente, e); }}><FaTrash /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">No se encontraron clientes con los criterios de búsqueda.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
 
            {/* Paginación */}
            {clientesFiltrados.length > clientesPorPagina && (
              <Row className="mb-3">
                <Col className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.Prev
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      disabled={paginaActual === 1}
                    />

                    {[...Array(totalPaginas).keys()].map((numero) => (
                      <Pagination.Item
                        key={numero + 1}
                        active={numero + 1 === paginaActual}
                        onClick={() => setPaginaActual(numero + 1)}
                      >
                        {numero + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                    />
                  </Pagination>
                </Col>
              </Row>
            )}

            {/* Información detallada del cliente seleccionado */}
            {clienteSeleccionado && (
              <Card className="mb-4 shadow-lg border-0 overflow-hidden">
                {/* Cabecera con degradado */}
                <div 
                  className="position-relative py-4 px-4" 
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(45deg, #1e3a8a 0%, #1e40af 100%)' 
                      : 'linear-gradient(45deg, #3b82f6 0%, #2563eb 100%)',
                    minHeight: '140px'
                  }}
                >
                  {/* Botones de acción reposicionados debajo del contenido principal */}
                  <Row className="align-items-center">
                    <Col xs={12} md={8} className="text-white">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle bg-white d-flex align-items-center justify-content-center me-3"
                          style={{width: "60px", height: "60px"}}
                        >
                          <FaUser size={30} color="#3b82f6" />
                        </div>
                        <div>
                          <h3 className="mb-0 fw-bold">{clienteSeleccionado.nombre}</h3>
                          <p className="mb-0 text-white text-opacity-75">Cliente #{clienteSeleccionado.id}</p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
                      <div className="d-flex justify-content-end align-items-end">
                        {/* Badge de membresía más compacta */}
                        <Badge
                          bg={getEstadoMembresia(clienteSeleccionado) === "Activo" ? "success" : "danger"}
                          className="d-inline-flex align-items-center"
                          title={getEstadoMembresia(clienteSeleccionado) === "Activo" ? "Membresía: Activa" : "Membresía: Vencida"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.28rem 0.6rem",
                            fontSize: 13,
                            maxWidth: 220,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {getEstadoMembresia(clienteSeleccionado) === "Activo" ? <FaCheckCircle className="me-1" /> : <FaTimesCircle className="me-1" />}
                          <span style={{ marginLeft: 4 }}>
                            Membresía: {getEstadoMembresia(clienteSeleccionado)}
                          </span>
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                  
                  {/* Botones reposicionados debajo del resto del contenido con mayor tamaño */}
                  <Row className="mt-4">
                    <Col xs={12} className="d-flex justify-content-end">
                      <ButtonGroup>
                        <Button
                          variant="light"
                          className="d-flex align-items-center fs-6"
                          onClick={() => abrirModalEditar(clienteSeleccionado)}
                        >
                          <FaEdit className="me-2" /> <span>Editar</span>
                        </Button>
                        <Button
                          variant="outline-light"
                          className="d-flex align-items-center fs-6"
                          onClick={cancelarSeleccion}
                        >
                          <FaTimes className="me-2" /> <span>Cerrar</span>
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
          </Container>
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
