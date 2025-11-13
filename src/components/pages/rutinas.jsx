import React, { useState, useEffect } from "react";
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
  // Modal,
  // Form,
} from "react-bootstrap";
import { FaUsers, FaDumbbell, FaTimes, FaBars, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from './admin.jsx';
import "bootstrap-icons/font/bootstrap-icons.css";

// util
const capitalizarPrimeraLetra = (texto) => {
  if (!texto) return '';
  return texto
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
};

const Rutinas = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const [rutinas, setRutinas] = useState(() => {
    const saved = localStorage.getItem('rutinas');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rutinas', JSON.stringify(rutinas));
  }, [rutinas]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sidebar
  const renderSidebar = () => (
    <Navbar bg="dark" variant="dark" className="d-flex flex-column h-100">
      <Container fluid className="d-flex flex-column h-100">
        <Navbar.Brand className="p-3 w-100">
          <Card.Title as="h3" className="fw-bold text-success">HULK GYM</Card.Title>
          <Nav className="flex-column w-100 mt-4">
            <Nav.Link className="d-flex align-items-center px-0 text-primary" onClick={() => navigate('/admin')}>
              <FaUsers className="me-2" /> <span>Todos los Clientes</span>
            </Nav.Link>
            <Nav.Link className="d-flex align-items-center px-0 text-warning" onClick={() => navigate('/rutinas')}>
              <FaDumbbell className="me-2" /> <span>Rutinas</span>
            </Nav.Link>
            <Nav.Link className="d-flex align-items-center px-0 text-danger mt-3" onClick={handleLogout}>
              <FaTimes className="me-2" /> <span>Cerrar Sesión</span>
            </Nav.Link>
          </Nav>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );

  const cardStyle = { transition: "all 0.3s ease", borderRadius: "12px", overflow: "hidden" };
  const cardHeaderStyle = { fontFamily: "'Fjalla One', sans-serif", letterSpacing: "1px", textTransform: "uppercase" };

  // paletas vía link
  const PALETTES_URL = 'https://raw.githubusercontent.com/tu-usuario/tu-repo/main/palettes.json';
  const [palettes, setPalettes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PALETTES_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length) setPalettes(data);
      } catch (e) {
        // silent
      }
    })();
  }, []);

  const getCardGradientByIndex = (index) => {
    if (!palettes || palettes.length === 0) return 'linear-gradient(135deg, #0c60cfff 0%, #c7d2fe 100%)';
    const p = palettes[index % palettes.length].gradient;
    return `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 100%)`;
  };

  const getRandomCardColorByIndex = (index) => {
    if (!palettes || palettes.length === 0) return '#6b7280';
    return palettes[index % palettes.length].accent;
  };

  const getRutinaIndexById = (id) => {
    const idx = rutinas.findIndex(r => r.id === id);
    return idx >= 0 ? idx : 0;
  };

  // índice de la rutina seleccionada para detalle
  const selIndex = rutinaSeleccionada ? getRutinaIndexById(rutinaSeleccionada.id) : 0;

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      <Row className="flex-grow-1 m-0">
        <Col xs={2} md={3} lg={2} xl={2} className="d-none d-md-block p-0 h-100">{renderSidebar()}</Col>

        <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="w-75" placement="start">
          <Offcanvas.Header closeButton className="bg-dark text-white"><Offcanvas.Title>Menú</Offcanvas.Title></Offcanvas.Header>
          <Offcanvas.Body className="p-0">{renderSidebar()}</Offcanvas.Body>
        </Offcanvas>

        <Col xs={12} md={9} lg={10} xl={10} className="h-100 p-0">
          <Navbar bg="dark" variant="dark" className="d-md-none">
            <Container fluid>
              <Button variant="outline-light" onClick={() => setShowSidebar(true)} className="me-2"><FaBars /></Button>
              <Navbar.Brand className="fw-bold text-success">HULK GYM</Navbar.Brand>
              <div className="d-flex align-items-center gap-2">
                <Button variant="outline-info" onClick={alternarTema} size="sm">{isDarkMode ? <FaSun /> : <FaMoon />}</Button>
                <Button variant="outline-danger" onClick={handleLogout} size="sm"><FaTimes /> Salir</Button>
              </div>
            </Container>
          </Navbar>

          <Container fluid className="p-3">
            <Row className="mb-3">
              <Col className="d-flex justify-content-end">
                {!isMobile && (
                  <Button variant="outline-secondary" size="sm" onClick={alternarTema} className="d-flex align-items-center">
                    {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
                  </Button>
                )}
              </Col>
            </Row>

            <Row className="mb-4">
              <Col><div className="d-flex justify-content-center align-items-center"><h1 className="display-4 mb-0" style={{ fontFamily: "'Roboto Slab', serif" }}>RUTINAS</h1></div></Col>
            </Row>

            <Row className="mb-4">
              <Col>
                {/* Botón de agregar rutina oculto */}
                {/* <div className="mb-4">
                  <Row>
                    <Col className="d-flex justify-content-end gap-2">
                      <Button onClick={handleAgregarRutina} className="d-flex align-items-center border-0 bg-transparent fs-3">
                        <i className={`bi bi-plus-square ${isDarkMode ? 'text-light' : 'text-dark'}`}></i>
                      </Button>
                    </Col>
                  </Row>
                </div> */}

                <Row xs={1} md={2} lg={3} className="g-4">
                  {rutinas.length > 0 ? rutinas.map((rutina, index) => (
                    <Col key={rutina.id}>
                      <Card className="h-100 shadow" style={cardStyle}>
                        <Card.Header
                          className={`${isDarkMode ? 'text-white' : 'text-dark'} text-center py-3 fs-3`}
                          style={{fontFamily:'"Stack Sans Headline", sans-serif', ...cardHeaderStyle }}
                        >
                          {rutina.nombre}
                        </Card.Header>
                        <Card.Body className="p-0">
                          <div className="p-3">
                            {rutina.ejercicios && rutina.ejercicios.length > 0 ? (
                              <div className="exercise-list">
                                {rutina.ejercicios.slice(0, 3).map((ejercicio, idx) => (
                                  <div key={idx} className="mb-3" style={{ borderRadius: "8px", padding: "12px", background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-center mb-2 fs-4">
                                        <span style={{ fontWeight: '600' }}>{ejercicio.ejercicio}</span>
                                        <FaDumbbell size={14} style={{ color: getRandomCardColorByIndex(index), opacity: 0.7 }} />
                                      </div>
                                      <div className="d-flex gap-2 align-items-center">
                                        <Badge bg="transparent" text={isDarkMode ? "light" : "dark"} pill style={{ border: `1px solid ${getRandomCardColorByIndex(index)}`, fontSize: '0.9rem', opacity: 0.9 }}>
                                          <span className="fw-bold">{ejercicio.series}</span> series
                                        </Badge>
                                        <span className="text-muted mx-1">•</span>
                                        <Badge bg="transparent" text={isDarkMode ? "light" : "dark"} pill style={{ border: `1px solid ${getRandomCardColorByIndex(index)}`, fontSize: '0.8rem', opacity: 0.9 }}>
                                          <span className="fw-bold">{ejercicio.repeticiones}</span> reps
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {rutina.ejercicios.length > 3 && (
                                  <div className="text-center mt-2">
                                    <Badge
                                      pill
                                      style={{
                                        background: 'transparent',
                                        color: isDarkMode ? '#e6eef8' : '#374151',
                                        padding: '0.45rem 0.9rem',
                                        fontSize: '0.85rem',
                                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                        boxShadow: 'none'
                                      }}
                                    >
                                      +{rutina.ejercicios.length - 3} ejercicios más
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <FaDumbbell size={24} className="mb-3 text-muted" />
                                <p className="text-muted mb-0">No hay ejercicios en esta rutina</p>
                              </div>
                            )}
                          </div>
                        </Card.Body>
                        {/* Footer con botones de editar/eliminar oculto */}
                        {/* <Card.Footer className="bg-transparent d-flex justify-content-between py-3 border-0">
                          <Button variant="outline-primary" size="sm" className="px-3" onClick={(e) => { e.stopPropagation(); handleEditarRutina(rutina.id); }}>
                            <FaEdit className="me-2" /> Editar
                          </Button>
                          <Button variant="outline-danger" size="sm" className="px-3" onClick={(e) => abrirModalEliminar(rutina, e)}>
                            <FaTrash className="me-2" /> Eliminar
                          </Button>
                        </Card.Footer> */}
                      </Card>
                    </Col>
                  )) : (
                    <Col xs={12}>
                      <Card className="text-center p-5 border-0 shadow-sm">
                        <Card.Body>
                          <FaDumbbell size={48} className="mb-3 text-muted" />
                          <h4>No hay rutinas disponibles</h4>
                          <p className="text-muted">Agrega una nueva rutina haciendo clic en el botón +</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </Row>

                {/* Botón flotante de agregar rutina oculto */}
                {/* <div className="position-fixed bottom-0 end-0 mb-4 me-4 d-md-none">
                  <Button onClick={handleAgregarRutina} className="rounded-circle shadow" style={{ width: "60px", height: "60px" }} variant="primary">
                    <FaPlus size={24} />
                  </Button>
                </div> */}
              </Col>
            </Row>

            {/* Detalle de rutina y modales ocultos */}
            {/* ... */}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Rutinas;
