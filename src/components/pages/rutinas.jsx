import React, { useState } from "react";
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
} from "react-bootstrap";
import { FaUsers, FaDumbbell, FaTimes, FaBars, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from './admin.jsx';

const Rutinas = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);

  const [rutinas, setRutinas] = useState([
    {
      id: 1,
      nombre: "Fuerza",
      nivel: "Intermedio",
      objetivo: "Fuerza",
    },
    {
      id: 2,
      nombre: "Hipertrofia",
      nivel: "Avanzado",
      objetivo: "Hipertrofia",
    },
    {
      id: 3,
      nombre: "Cardio",
      nivel: "Principiante",
      objetivo: "Cardio",
    },
  ]);

  const [rutinaSeleccionada, setRutinaSeleccionada] = useState({
    nombre: "Fuerza",
    nivel: "Intermedio",
    objetivo: "Fuerza",
    duracion: "45 minutos",
    ejercicios: [
      {
        ejercicio: "Press de banca",
        series: 4,
        repeticiones: 8,
        peso: "80 kg",
        descanso: "60 sec",
      },
      {
        ejercicio: "Sentadillas",
        series: 3,
        repeticiones: 10,
        peso: "100 kg",
        descanso: "90 sec",
      },
      {
        ejercicio: "Remo con barra",
        series: 4,
        repeticiones: 8,
        peso: "60 kg",
        descanso: "60 sec",
      },
      {
        ejercicio: "Press militar",
        series: 3,
        repeticiones: 10,
        peso: "40 kg",
        descanso: "90 sec",
      },
    ],
  });

  const handleAgregarRutina = () => {
    console.log("Agregar nueva rutina");
  };

  const handleEditarRutina = (id) => {
    console.log("Editar rutina:", id);
  };

  const handleEliminarRutina = (id) => {
    setRutinas(rutinas.filter((rutina) => rutina.id !== id));
  };

  const handleSeleccionarRutina = (rutina) => {
    setRutinaSeleccionada(rutina);
  };

  const handleIrARutinas = () => {
    navigate("/rutinas");
  };

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const getNivelVariant = (nivel) => {
    switch (nivel) {
      case "Principiante":
        return "success";
      case "Intermedio":
        return "warning";
      case "Avanzado":
        return "danger";
      default:
        return "secondary";
    }
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
            <Nav.Link 
              className="d-flex align-items-center px-0 text-primary"
              onClick={() => navigate('/admin')}
            >
              <FaUsers className="me-2" />
              <span>Todos los Clientes</span>
            </Nav.Link>

            <Nav.Link 
              className="d-flex align-items-center px-0 text-warning"
              onClick={() => navigate('/rutinas')}
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

            <Row className="mb-4">
              <Col>
                <div className="d-flex justify-content-center align-items-center">
                  <h1 className="display-4 fw-bold mb-0">RUTINAS</h1>
                </div>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col>
                <div className="mb-4">
                  <Row>
                    <Col className="d-flex justify-content-end gap-2">
                      <Button onClick={handleAgregarRutina}>
                        Agregar Rutina
                      </Button>
                      <Button onClick={() => {navigate("/admin")}}>Volver al Inicio</Button>
                    </Col>
                  </Row>
                </div>
                <Card>
                  <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Nombre</th>
                          <th>Nivel</th>
                          <th>Objetivo</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutinas.map((rutina) => (
                          <tr
                            key={rutina.id}
                            onClick={() => handleSeleccionarRutina(rutina)}
                            className="cursor-pointer"
                          >
                            <td className="fw-semibold">{rutina.nombre}</td>
                            <td>
                              <Badge bg={getNivelVariant(rutina.nivel)}>
                                {rutina.nivel}
                              </Badge>
                            </td>
                            <td>{rutina.objetivo}</td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditarRutina(rutina.id);
                                }}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEliminarRutina(rutina.id);
                                }}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col>
                <Card>
                  <Card.Header className="bg-primary text-white">
                    <h3 className="mb-0">{rutinaSeleccionada.nombre}</h3>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={4}>
                        <div className="text-center">
                          <h6 className="text-muted mb-1">Nivel</h6>
                          <Badge
                            bg={getNivelVariant(rutinaSeleccionada.nivel)}
                            className="fs-6"
                          >
                            {rutinaSeleccionada.nivel}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center">
                          <h6 className="text-muted mb-1">Objetivo</h6>
                          <p className="mb-0 fw-semibold">
                            {rutinaSeleccionada.objetivo}
                          </p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center">
                          <h6 className="text-muted mb-1">Duración</h6>
                          <p className="mb-0 fw-semibold">
                            {rutinaSeleccionada.duracion}
                          </p>
                        </div>
                      </Col>
                    </Row>

                    <h5 className="mb-3">Ejercicios</h5>
                    <Table striped bordered hover responsive>
                      <thead className="table-dark">
                        <tr>
                          <th>Ejercicio</th>
                          <th>Series</th>
                          <th>Repeticiones</th>
                          <th>Peso</th>
                          <th>Descanso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutinaSeleccionada.ejercicios?.map((ejercicio, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{ejercicio.ejercicio}</td>
                            <td className="text-center">
                              <Badge bg="info">{ejercicio.series}</Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="info">{ejercicio.repeticiones}</Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="secondary">{ejercicio.peso}</Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="warning" text="dark">
                                {ejercicio.descanso}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <div className="d-flex gap-2 justify-content-end mt-4">
                      <Button variant="outline-primary">Editar</Button>
                      <Button variant="outline-danger">Eliminar</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Rutinas;
