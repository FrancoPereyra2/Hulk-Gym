import React, { useState } from "react";
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
  FaTimes
} from "react-icons/fa";

const AdminClientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  // Datos de ejemplo
  const clientes = [
    { id: 1, nombre: "Juan Pérez", dni: "12345678", membresia: "Premium", vencimiento: "15/12/2023", estado: "Activo", fechaInicio: "15/01/2023" },
    { id: 2, nombre: "María López", dni: "87654321", membresia: "Básica", vencimiento: "02/11/2023", estado: "Vencida", fechaInicio: "02/05/2023" },
    { id: 3, nombre: "Carlos Rodríguez", dni: "45678912", membresia: "Premium", vencimiento: "30/01/2024", estado: "Activo", fechaInicio: "30/07/2023" },
    { id: 4, nombre: "Ana García", dni: "78912345", membresia: "Completa", vencimiento: "10/12/2023", estado: "Activo", fechaInicio: "10/08/2023" },
    { id: 5, nombre: "Roberto Sánchez", dni: "32165498", membresia: "Básica", vencimiento: "05/10/2023", estado: "Vencida", fechaInicio: "05/04/2023" },
  ];

  // Filtrar y buscar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    // Filtro por búsqueda
    const coincideTermino = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
  const clientesPaginados = clientesFiltrados.slice(indiceInicial, indiceInicial + clientesPorPagina);
  
  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda se hace automáticamente con el estado
    setPaginaActual(1); // Volver a la primera página al buscar
  };

  // Función para cancelar la selección del cliente
  const cancelarSeleccion = () => {
    setClienteSeleccionado(null);
  };

  // Sidebar para dispositivos móviles
  const renderSidebar = () => (
    <Navbar bg="dark" variant="dark" className="d-flex flex-column h-100">
      <Container fluid className="d-flex flex-column h-100 p-0">
        <Navbar.Brand className="p-3 w-100">
          <h3 className="fw-bold text-success">HULK GYM</h3>
          <Nav className="flex-column w-100 mt-4">
            <Nav.Link className="d-flex align-items-center px-0 text-primary">
              <FaUsers className="me-2" />
              <span>Todos los Clientes</span>
            </Nav.Link>
          </Nav>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      <Row className="flex-grow-1 m-0">
        {/* Sidebar para pantallas medianas y grandes */}
        <Col xs={2} md={2} lg={2} className="d-none d-md-block p-0 h-100">
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
          <Offcanvas.Body className="p-0">
            {renderSidebar()}
          </Offcanvas.Body>
        </Offcanvas>

        {/* Contenedor principal */}
        <Col xs={12} md={10} lg={10} className="h-100 p-0">
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
              <Navbar.Brand className="fw-bold text-success">HULK GYM</Navbar.Brand>
            </Container>
          </Navbar>

          {/* Contenido de la página */}
          <Container fluid className="p-3 p-md-4">
            <Row>
              <Col xs={12} className="d-flex justify-content-between align-items-center mb-4">
                <h2>Administración de Clientes</h2>
                <Button variant="success" className="d-flex align-items-center">
                  <FaPlus className="me-2" /> Nuevo Cliente
                </Button>
              </Col>

              {/* Barra de filtros y búsqueda */}
              <Col xs={12} className="mb-4">
                <Row>
                  <Col xs={12} md={6} className="mb-3 mb-md-0">
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
                  <Col xs={12} md={6}>
                    <div className="d-flex gap-2">
                      <Button 
                        variant={filtroActivo === "todos" ? "primary" : "outline-primary"} 
                        onClick={() => setFiltroActivo("todos")}
                        className="flex-grow-1"
                      >
                        Todos
                      </Button>
                      <Button 
                        variant={filtroActivo === "activos" ? "success" : "outline-success"}
                        onClick={() => setFiltroActivo("activos")}
                        className="flex-grow-1"
                      >
                        Activos
                      </Button>
                      <Button 
                        variant={filtroActivo === "vencidos" ? "danger" : "outline-danger"}
                        onClick={() => setFiltroActivo("vencidos")}
                        className="flex-grow-1"
                      >
                        Vencidos
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Col>

              {/* Tabla de clientes */}
              <Col xs={12} className="mb-4">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Nombre</th>
                        <th>DNI</th>
                        <th>Membresía</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesPaginados.length > 0 ? (
                        clientesPaginados.map((cliente) => (
                          <tr key={cliente.id} onClick={() => seleccionarCliente(cliente)}>
                            <td>{cliente.nombre}</td>
                            <td>{cliente.dni}</td>
                            <td>{cliente.membresia}</td>
                            <td>{cliente.vencimiento}</td>
                            <td>
                              {cliente.estado === "Activo" ? (
                                <Badge bg="success" pill className="d-inline-flex align-items-center">
                                  <FaCheckCircle className="me-1" /> Activo
                                </Badge>
                              ) : (
                                <Badge bg="danger" pill className="d-inline-flex align-items-center">
                                  <FaTimesCircle className="me-1" /> Vencida
                                </Badge>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button variant="primary" size="sm">
                                  <FaEdit />
                                </Button>
                                <Button variant="danger" size="sm">
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-3">
                            No se encontraron clientes con los criterios de búsqueda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>
              
              {/* Paginación */}
              {clientesFiltrados.length > clientesPorPagina && (
                <Col xs={12} className="d-flex justify-content-center mb-4">
                  <Pagination>
                    <Pagination.First onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} />
                    <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
                    
                    {[...Array(totalPaginas).keys()].map((numero) => (
                      <Pagination.Item 
                        key={numero + 1} 
                        active={numero + 1 === paginaActual}
                        onClick={() => setPaginaActual(numero + 1)}
                      >
                        {numero + 1}
                      </Pagination.Item>
                    ))}
                    
                    <Pagination.Next onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} />
                    <Pagination.Last onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas} />
                  </Pagination>
                </Col>
              )}

              {/* Información detallada del cliente seleccionado */}
              {clienteSeleccionado && (
                <Col xs={12}>
                  <Card border="0" className="shadow-sm">
                    <Card.Header className="bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Detalles del Cliente</h4>
                        <div className="d-flex">
                          <Button variant="primary" size="sm" className="me-2 d-flex align-items-center">
                            <FaEdit className="me-1" /> Editar
                          </Button>
                          <Button variant="success" size="sm" className="me-2 d-flex align-items-center">
                            Renovar Membresía
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={cancelarSeleccion}
                            className="d-flex align-items-center"
                          >
                            <FaTimes className="me-1" /> Cerrar
                          </Button>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row>
                        <Col xs={12} lg={6} className="mb-4 mb-lg-0">
                          <h5 className="mb-3">Información Personal</h5>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Nombre Completo</Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.nombre}
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="text-muted">DNI</Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.dni}
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12} lg={6}>
                          <h5 className="mb-3">Información de Membresía</h5>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Tipo de Membresía</Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.membresia}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Fecha de Inicio</Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.fechaInicio}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">Fecha de Vencimiento</Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.vencimiento}
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="text-muted">Estado</Form.Label>
                            <div>
                              {clienteSeleccionado.estado === "Activo" ? (
                                <Badge bg="success" className="d-inline-flex align-items-center fs-6 px-2 py-1">
                                  <FaCheckCircle className="me-1" /> Activo
                                </Badge>
                              ) : (
                                <Badge bg="danger" className="d-inline-flex align-items-center fs-6 px-2 py-1">
                                  <FaTimesCircle className="me-1" /> Vencida
                                </Badge>
                              )}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
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

export default AdminClientes;
