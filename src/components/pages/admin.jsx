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
    estado: "Activo",
    precio: 10000,
  });

  // Guardar clientes en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  // Calcular datos del dashboard basados en la lista de clientes actual
  const clientesActivos = clientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;
  const membresiasVencidas = clientes.filter(
    (cliente) => cliente.estado === "Vencida"
  ).length;

  // Simular ingresos basados en clientes (usando el precio real de cada cliente)
  const ingresosMes = `$${clientes
    .filter((cliente) => cliente.estado === "Activo")
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

  // Filtrar y buscar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    // Filtro por búsqueda
    const coincideTermino =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.dni.includes(searchTerm);

    // Filtro por estado
    if (filtroActivo === "activos") {
      return coincideTermino && cliente.estado === "Activo";
    } else if (filtroActivo === "vencidos") {
      return coincideTermino && cliente.estado === "Vencida";
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
      estado: cliente.estado,
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
    
    const clientesActualizados = clientes.map((c) =>
      c.id === formData.id ? formDataActualizado : c
    );

    setClientes(clientesActualizados);

    // Actualizar datos del gráfico
    console.log("Cliente editado:", formDataActualizado);
    const nuevosIngresos = calcularIngresosAnuales(clientesActualizados);
    setDatosIngresos(nuevosIngresos);

    if (clienteSeleccionado && clienteSeleccionado.id === formData.id) {
      setClienteSeleccionado(formDataActualizado);
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
    // Verificar si hay datos para mostrar
    const hayDatos = datosIngresos.some(item => item.valor > 0);
    
    if (!hayDatos) {
      return (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <Card.Title as="h5" className="mb-3">
              Ingresos por mes basados en clientes registrados
            </Card.Title>
            <p className="text-muted">No hay datos de ingresos para mostrar en el gráfico.</p>
            <p className="small">Agregue clientes activos con precios para ver los ingresos mensuales.</p>
          </Card.Body>
        </Card>
      );
    }
    
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title as="h5" className="mb-3">
            Ingresos por mes basados en clientes registrados
          </Card.Title>
          <Container fluid className="p-0">
            <Row className="align-items-end g-0" style={{ height: "300px" }}>
              {datosIngresos.map((item, index) => (
                <Col key={index}>
                  <Stack className="align-items-center">
                    <div
                      className="bg-primary rounded-top"
                      style={{
                        width: "80%",
                        height:
                          valorMaximo > 0
                            ? `${(item.valor / valorMaximo) * 200}px`
                            : "0",
                        minHeight: item.valor > 0 ? "20px" : "0",
                      }}
                    />
                    <small className="mt-1">{item.mes}</small>
                    <small className="text-muted">
                      ${item.valor.toLocaleString()}
                    </small>
                  </Stack>
                </Col>
              ))}
            </Row>
          </Container>
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

  // Helper para convertir formato de fecha DD/MM/YYYY a YYYY-MM-DD para inputs de tipo date
  const formatearFechaParaInput = (fechaString) => {
    if (!fechaString) return '';
    
    const partes = fechaString.split('/');
    if (partes.length !== 3) return '';
    
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  };

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
              <Col className="d-flex justify-content-end">
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
                      Ingresos del mes
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

            {/* Tabla de clientes */}
            <Table responsive hover size="sm" className="mb-3">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th className="d-none d-xl-table-cell">Vencimiento</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th style={{ width: "100px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.length > 0 ? (
                  clientesPaginados.map((cliente) => (
                    <tr
                      key={cliente.id}
                      onClick={() => seleccionarCliente(cliente)}
                    >
                      <td>{cliente.nombre}</td>
                      <td>{cliente.dni}</td>
                      <td className="d-none d-xl-table-cell">
                        {cliente.vencimiento}
                      </td>
                      <td>
                        <Badge
                          bg={
                            cliente.estado === "Activo" ? "success" : "danger"
                          }
                        >
                          {cliente.estado}
                        </Badge>
                      </td>
                      <td>${cliente.precio?.toLocaleString() || "0"}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => abrirModalEditar(cliente, e)}
                          className="me-1"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => abrirModalEliminar(cliente, e)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      No se encontraron clientes con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

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
              <Card className="mb-3">
                <Card.Header className="bg-light">
                  <Row>
                    <Col xs={12} sm={6}>
                      <Card.Title as="h4" className="mb-0">
                        Detalles del Cliente
                      </Card.Title>
                    </Col>
                    <Col xs={12} sm={6} className="text-sm-end mt-2 mt-sm-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => abrirModalEditar(clienteSeleccionado)}
                        className="me-2"
                      >
                        <FaEdit className="me-1 d-none d-sm-inline" /> Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelarSeleccion}
                      >
                        <FaTimes className="me-1 d-none d-sm-inline" /> Cerrar
                      </Button>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col xs={12} xl={6} className="mb-4 mb-xl-0">
                      <Card.Subtitle as="h5">Información Personal</Card.Subtitle>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre Completo</Form.Label>
                        <Form.Control
                          plaintext
                          readOnly
                          defaultValue={clienteSeleccionado.nombre}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>DNI</Form.Label>
                        <Form.Control
                          plaintext
                          readOnly
                          defaultValue={clienteSeleccionado.dni}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} xl={6}>
                      <Card.Subtitle as="h5">Información de Cuenta</Card.Subtitle>
                      <Form.Group className="mb-3">
                        <Form.Label>Fecha de Inicio</Form.Label>
                        <Form.Control
                          plaintext
                          readOnly
                          defaultValue={clienteSeleccionado.fechaInicio}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Fecha de Vencimiento</Form.Label>
                        <Form.Control
                          plaintext
                          readOnly
                          defaultValue={clienteSeleccionado.vencimiento}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Precio</Form.Label>
                        <Form.Control
                          plaintext
                          readOnly
                          defaultValue={`$${clienteSeleccionado.precio?.toLocaleString()}`}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Estado</Form.Label>
                        <div>
                          <Badge
                            bg={
                              clienteSeleccionado.estado === "Activo"
                                ? "success"
                                : "danger"
                            }
                          >
                            {clienteSeleccionado.estado}
                          </Badge>
                        </div>
                      </Form.Group>
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
                // Convertir DD/MM/YYYY a YYYY-MM-DD para el input date
                value={formatearFechaParaInput(formData.fechaInicio)}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                // Convertir DD/MM/YYYY a YYYY-MM-DD para el input date
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
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                value={formData.estado}
                onChange={handleFormChange}
              >
                <option value="Activo">Activo</option>
                <option value="Vencida">Vencida</option>
              </Form.Select>
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
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fechaInicio"
                // Convertir DD/MM/YYYY a YYYY-MM-DD para el input date
                value={formatearFechaParaInput(formData.fechaInicio)}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                // Convertir DD/MM/YYYY a YYYY-MM-DD para el input date
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
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                value={formData.estado}
                onChange={handleFormChange}
              >
                <option value="Activo">Activo</option>
                <option value="Vencida">Vencida</option>
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
