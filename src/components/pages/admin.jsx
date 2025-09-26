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
  Modal
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
  
  // Estados para modales
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  // Datos de ejemplo
  const [clientes, setClientes] = useState([
    { id: 1, nombre: "Juan Pérez", dni: "12345678", vencimiento: "15/12/2023", estado: "Activo", fechaInicio: "15/01/2023" },
    { id: 2, nombre: "María López", dni: "87654321", vencimiento: "02/11/2023", estado: "Vencida", fechaInicio: "02/05/2023" },
    { id: 3, nombre: "Carlos Rodríguez", dni: "45678912", vencimiento: "30/01/2024", estado: "Activo", fechaInicio: "30/07/2023" },
    { id: 4, nombre: "Ana García", dni: "78912345", vencimiento: "10/12/2023", estado: "Activo", fechaInicio: "10/08/2023" },
    { id: 5, nombre: "Roberto Sánchez", dni: "32165498", vencimiento: "05/10/2023", estado: "Vencida", fechaInicio: "05/04/2023" },
  ]);

  // Form para nuevo/editar cliente
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    fechaInicio: "",
    vencimiento: "",
    estado: "Activo"
  });

  // Manejo del formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Si la fecha de inicio cambia, calcular automáticamente la fecha de vencimiento (30 días después)
    if (name === "fechaInicio" && value) {
      const fechaInicio = new Date(value);
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
      
      // Formatear la fecha de vencimiento como YYYY-MM-DD para el campo date
      const vencimientoFormateado = fechaVencimiento.toISOString().split('T')[0];
      
      setFormData({
        ...formData,
        fechaInicio: value,
        vencimiento: vencimientoFormateado
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
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
    setPaginaActual(1); // Volver a la primera página al buscar
  };

  // Función para cancelar la selección del cliente
  const cancelarSeleccion = () => {
    setClienteSeleccionado(null);
  };

  // Funciones para manejar modal nuevo cliente
  const abrirModalNuevo = () => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const vencimientoFormateado = fechaVencimiento.toISOString().split('T')[0];
    
    setFormData({
      nombre: "",
      dni: "",
      fechaInicio: fechaHoy,
      vencimiento: vencimientoFormateado,
      estado: "Activo"
    });
    setShowModalNuevo(true);
  };

  const guardarNuevoCliente = () => {
    const nuevoCliente = {
      id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
      ...formData
    };
    setClientes([...clientes, nuevoCliente]);
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
      estado: cliente.estado
    });
    setShowModalEditar(true);
  };

  const guardarClienteEditado = () => {
    const clientesActualizados = clientes.map(c => 
      c.id === formData.id ? formData : c
    );
    setClientes(clientesActualizados);
    
    if (clienteSeleccionado && clienteSeleccionado.id === formData.id) {
      setClienteSeleccionado(formData);
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
    const clientesActualizados = clientes.filter(c => c.id !== clienteAEliminar.id);
    setClientes(clientesActualizados);
    
    if (clienteSeleccionado && clienteSeleccionado.id === clienteAEliminar.id) {
      setClienteSeleccionado(null);
    }
    
    setShowModalEliminar(false);
  };

  // Sidebar para dispositivos móviles
  const renderSidebar = () => (
    <Navbar bg="dark" variant="dark" className="d-flex flex-column h-100">
      <Container fluid className="d-flex flex-column h-100">
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
                <Button 
                  variant="success" 
                  className="d-flex align-items-center"
                  onClick={abrirModalNuevo}
                >
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
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={(e) => abrirModalEditar(cliente, e)}
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
                              </div>
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
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="me-2 d-flex align-items-center"
                            onClick={() => abrirModalEditar(clienteSeleccionado)}
                          >
                            <FaEdit className="me-1" /> Editar
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
                          <h5 className="mb-3">Información de Cuenta</h5>
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

      {/* Modal para Nuevo Cliente */}
      <Modal show={showModalNuevo} onHide={() => setShowModalNuevo(false)}>
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
                value={formData.fechaInicio}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                value={formData.vencimiento}
                onChange={handleFormChange}
                readOnly
              />
              <Form.Text className="text-muted">
                La fecha de vencimiento se calcula automáticamente (30 días después del inicio)
              </Form.Text>
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
      <Modal show={showModalEditar} onHide={() => setShowModalEditar(false)}>
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
                value={formData.fechaInicio}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                value={formData.vencimiento}
                onChange={handleFormChange}
                readOnly
              />
              <Form.Text className="text-muted">
                La fecha de vencimiento se calcula automáticamente (30 días después del inicio)
              </Form.Text>
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
      <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar al cliente {clienteAEliminar?.nombre}?
          Esta acción no se puede deshacer.
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
    </Container>
  );
};

export default AdminClientes;
