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
  Stack,
  Offcanvas,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser, FaSearch, FaCheckCircle, FaTimesCircle, FaBars, FaTimes } from "react-icons/fa";

const PagePrincipal = () => {
  const navigate = useNavigate();

  // Verificación más robusta de usuario
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userType) {
      navigate('/login');
    } else {
      // Verificación adicional contra la base de usuarios
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const currentUser = users.find(u => u.username === userEmail);
        if (!currentUser) {
          localStorage.removeItem("userType");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          navigate("/login");
        }
      }
    }
  }, [navigate]);

  // Inicializar clientes desde localStorage
  const [clientes, setClientes] = useState(() => {
    const savedClientes = localStorage.getItem('clientes');
    return savedClientes ? JSON.parse(savedClientes) : [];
  });

  const [searchDNI, setSearchDNI] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const clienteEncontrado = clientes.find(
      (cliente) => cliente.dni === searchDNI
    );
    setClienteSeleccionado(clienteEncontrado || null);
    setMostrarResultados(true);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // Sidebar para dispositivos móviles
  const renderSidebar = () => (
    <Navbar bg="dark" variant="dark" className="d-flex flex-column h-100">
      <Container fluid className="d-flex flex-column h-100 p-0">
        <Navbar.Brand className="p-3 w-100">
          <h3 className="fw-bold text-success">HULK GYM</h3>
          <Nav className="flex-column w-100 mt-4">
            <Nav.Link className="text-primary d-flex align-items-center px-0">
              <FaUser className="me-2" />
              <span>Clientes</span>
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
              
              {/* Botón cerrar sesión en navbar móvil */}
              <Button
                variant="outline-danger"
                onClick={handleLogout}
                size="sm"
              >
                <FaTimes /> Salir
              </Button>
            </Container>
          </Navbar>

          {/* Contenido de la página */}
          <Container fluid className="p-3 p-md-4">
            <Row>
              <Col xs={12}>
                <h2 className="mb-3 mb-md-4">Gestión de Clientes</h2>
              </Col>

              {/* Sección de búsqueda y filtros */}
              <Col xs={12} lg={6} className="mb-3">
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por DNI"
                      value={searchDNI}
                      onChange={(e) => setSearchDNI(e.target.value)}
                    />
                    <Button variant="primary" type="submit">
                      <FaSearch />
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              <Col xs={6} lg={3} className="mb-3">
                <Form.Select>
                  <option>Nombre</option>
                </Form.Select>
              </Col>
              <Col xs={6} lg={3} className="mb-3">
                <Form.Select>
                  <option>Tipo de membresía</option>
                </Form.Select>
              </Col>

              {/* Tabla de resultados */}
              <Col xs={12} className="mb-3 mb-md-4">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>DNI</th>
                        <th>Membresía</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mostrarResultados ? (
                        clienteSeleccionado ? (
                          <tr>
                            <td>{clienteSeleccionado.nombre}</td>
                            <td>{clienteSeleccionado.dni}</td>
                            <td>{clienteSeleccionado.membresia}</td>
                            <td>{clienteSeleccionado.vencimiento}</td>
                            <td>
                              {clienteSeleccionado.estado === "Activo" ? (
                                <Stack
                                  direction="horizontal"
                                  gap={1}
                                  className="text-success"
                                >
                                  <FaCheckCircle /> <span>Activo</span>
                                </Stack>
                              ) : (
                                <Stack
                                  direction="horizontal"
                                  gap={1}
                                  className="text-danger"
                                >
                                  <FaTimesCircle /> <span>Vencida</span>
                                </Stack>
                              )}
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">
                              No se encontraron resultados para el DNI ingresado.
                            </td>
                          </tr>
                        )
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            Ingresa un DNI para conocer el estado de cuenta
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>

              {/* Información del cliente */}
              {clienteSeleccionado && (
                <Col xs={12}>
                  <Card border="0" className="shadow-sm">
                    <Card.Body className="p-3 p-md-4">
                      <Row className="mb-3">
                        <Col xs={12} md={6} className="mb-2 mb-md-0">
                          <Card.Title as="h4">
                            {clienteSeleccionado.nombre}
                          </Card.Title>
                        </Col>
                        <Col
                          xs={12}
                          md={6}
                          className="text-start text-md-end"
                        >
                          <Card.Title as="h4">
                            Información de membresía
                          </Card.Title>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12} md={6} className="mb-3 mb-md-0">
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">
                              Nombre
                            </Form.Label>
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
                        <Col xs={12} md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">
                              Membresía
                            </Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.membresia}
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="text-muted">
                              Fecha de inicio
                            </Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={
                                clienteSeleccionado.fechaInicio ||
                                "No disponible"
                              }
                            />
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

export default PagePrincipal;
