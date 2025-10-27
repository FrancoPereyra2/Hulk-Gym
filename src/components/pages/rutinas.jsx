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
  Modal,
  Form,
} from "react-bootstrap";
import { FaUsers, FaDumbbell, FaTimes, FaBars, FaMoon, FaSun, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from './admin.jsx';
import "bootstrap-icons/font/bootstrap-icons.css";
import { FaTrashCan } from "react-icons/fa6";

// Función utilitaria para capitalizar la primera letra de cada palabra
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

  // Estados para modales
  const [showModalNuevaRutina, setShowModalNuevaRutina] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalEditarRutina, setShowModalEditarRutina] = useState(false);
  const [rutinaAEliminar, setRutinaAEliminar] = useState(null);

  // Cargar rutinas desde localStorage
  const [rutinas, setRutinas] = useState(() => {
    const savedRutinas = localStorage.getItem('rutinas');
    return savedRutinas ? JSON.parse(savedRutinas) : [];
  });

  // Estado inicial para rutina seleccionada
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);

  // Estado para modo edición
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para el formulario de nueva rutina
  const [formDataRutina, setFormDataRutina] = useState({
    nombre: "",
    ejercicios: []
  });

  // Estado para el formulario de nuevo ejercicio
  const [formDataEjercicio, setFormDataEjercicio] = useState({
    ejercicio: "",
    series: "",
    repeticiones: ""
  });

  // Estado para el formulario de edición
  const [formDataEdicion, setFormDataEdicion] = useState({
    nombre: "",
    ejercicios: []
  });

  // Estado para el formulario de nuevo ejercicio en edición
  const [formDataEjercicioEdicion, setFormDataEjercicioEdicion] = useState({
    ejercicio: "",
    series: "",
    repeticiones: ""
  });

  // Estado para ejercicio en edición
  const [ejercicioEnEdicion, setEjercicioEnEdicion] = useState(null);
  const [indexEjercicioEdicion, setIndexEjercicioEdicion] = useState(null);

  // Guardar rutinas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('rutinas', JSON.stringify(rutinas));
  }, [rutinas]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleAgregarRutina = () => {
    setFormDataRutina({
      nombre: "",
      ejercicios: []
    });
    setShowModalNuevaRutina(true);
  };

  const handleFormRutinaChange = (e) => {
    const { name, value } = e.target;
    setFormDataRutina({
      ...formDataRutina,
      [name]: value
    });
  };

  const handleFormEjercicioChange = (e) => {
    const { name, value } = e.target;
    setFormDataEjercicio({
      ...formDataEjercicio,
      [name]: value
    });
  };

  const agregarEjercicio = () => {
    if (formDataEjercicio.ejercicio.trim() && formDataEjercicio.series && formDataEjercicio.repeticiones) {
      const nuevoEjercicio = {
        ejercicio: capitalizarPrimeraLetra(formDataEjercicio.ejercicio.trim()),
        series: parseInt(formDataEjercicio.series),
        repeticiones: parseInt(formDataEjercicio.repeticiones)
      };

      setFormDataRutina({
        ...formDataRutina,
        ejercicios: [...formDataRutina.ejercicios, nuevoEjercicio]
      });

      // Limpiar formulario de ejercicio
      setFormDataEjercicio({
        ejercicio: "",
        series: "",
        repeticiones: ""
      });
    }
  };

  const eliminarEjercicio = (index) => {
    const nuevosEjercicios = formDataRutina.ejercicios.filter((_, i) => i !== index);
    setFormDataRutina({
      ...formDataRutina,
      ejercicios: nuevosEjercicios
    });
  };

  const guardarNuevaRutina = () => {
    if (formDataRutina.nombre.trim()) {
      const nuevaRutina = {
        id: rutinas.length > 0 ? Math.max(...rutinas.map(r => r.id)) + 1 : 1,
        nombre: capitalizarPrimeraLetra(formDataRutina.nombre.trim()),
        ejercicios: formDataRutina.ejercicios
      };

      setRutinas([...rutinas, nuevaRutina]);
      setShowModalNuevaRutina(false);
    }
  };

  const handleEditarRutina = (id) => {
    const rutina = rutinas.find(r => r.id === id);
    if (rutina) {
      setFormDataEdicion({
        id: rutina.id,
        nombre: rutina.nombre,
        ejercicios: [...rutina.ejercicios]
      });
      setShowModalEditarRutina(true);
    }
  };

  const handleFormEdicionChange = (e) => {
    const { name, value } = e.target;
    setFormDataEdicion({
      ...formDataEdicion,
      [name]: value
    });
  };

  const handleFormEjercicioEdicionChange = (e) => {
    const { name, value } = e.target;
    setFormDataEjercicioEdicion({
      ...formDataEjercicioEdicion,
      [name]: value
    });
  };

  const agregarEjercicioEdicion = () => {
    if (formDataEjercicioEdicion.ejercicio.trim() && formDataEjercicioEdicion.series && formDataEjercicioEdicion.repeticiones) {
      const nuevoEjercicio = {
        ejercicio: capitalizarPrimeraLetra(formDataEjercicioEdicion.ejercicio.trim()),
        series: parseInt(formDataEjercicioEdicion.series),
        repeticiones: parseInt(formDataEjercicioEdicion.repeticiones)
      };

      setFormDataEdicion({
        ...formDataEdicion,
        ejercicios: [...formDataEdicion.ejercicios, nuevoEjercicio]
      });

      // Limpiar formulario de ejercicio
      setFormDataEjercicioEdicion({
        ejercicio: "",
        series: "",
        repeticiones: ""
      });
    }
  };

  const eliminarEjercicioEdicion = (index) => {
    const nuevosEjercicios = formDataEdicion.ejercicios.filter((_, i) => i !== index);
    setFormDataEdicion({
      ...formDataEdicion,
      ejercicios: nuevosEjercicios
    });
  };

  const guardarEdicionRutina = () => {
    if (formDataEdicion.nombre.trim()) {
      const rutinasActualizadas = rutinas.map(rutina =>
        rutina.id === formDataEdicion.id
          ? {
              ...rutina,
              nombre: capitalizarPrimeraLetra(formDataEdicion.nombre.trim()),
              ejercicios: formDataEdicion.ejercicios
            }
          : rutina
      );

      setRutinas(rutinasActualizadas);
      
      // Actualizar rutina seleccionada si es la misma que se está editando
      if (rutinaSeleccionada && rutinaSeleccionada.id === formDataEdicion.id) {
        setRutinaSeleccionada({
          ...formDataEdicion,
          nombre: capitalizarPrimeraLetra(formDataEdicion.nombre.trim())
        });
      }
      
      setShowModalEditarRutina(false);
      setModoEdicion(false);
    }
  };

  const handleCancelarEdicion = () => {
    setModoEdicion(false);
    setRutinaSeleccionada(null);
  };

  const abrirModalEliminar = (rutina, e) => {
    if (e) e.stopPropagation();
    setRutinaAEliminar(rutina);
    setShowModalEliminar(true);
  };

  const confirmarEliminarRutina = () => {
    setRutinas(rutinas.filter((rutina) => rutina.id !== rutinaAEliminar.id));
    
    if (rutinaSeleccionada && rutinaSeleccionada.id === rutinaAEliminar.id) {
      setRutinaSeleccionada(null);
    }
    
    setShowModalEliminar(false);
    setRutinaAEliminar(null);
  };

  const handleSeleccionarRutina = (rutina) => {
    setRutinaSeleccionada(rutina);
  };

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  // Función para iniciar la edición de un ejercicio
  const iniciarEdicionEjercicio = (ejercicio, index) => {
    setEjercicioEnEdicion(ejercicio);
    setIndexEjercicioEdicion(index);
    setFormDataEjercicioEdicion({
      ejercicio: ejercicio.ejercicio,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones
    });
  };

  // Función para guardar el ejercicio editado
  const guardarEjercicioEditado = () => {
    if (
      formDataEjercicioEdicion.ejercicio.trim() && 
      formDataEjercicioEdicion.series && 
      formDataEjercicioEdicion.repeticiones
    ) {
      const ejercicioActualizado = {
        ejercicio: capitalizarPrimeraLetra(formDataEjercicioEdicion.ejercicio.trim()),
        series: parseInt(formDataEjercicioEdicion.series),
        repeticiones: parseInt(formDataEjercicioEdicion.repeticiones)
      };

      // Actualizar el ejercicio en el array
      const ejerciciosActualizados = [...formDataEdicion.ejercicios];
      ejerciciosActualizados[indexEjercicioEdicion] = ejercicioActualizado;

      setFormDataEdicion({
        ...formDataEdicion,
        ejercicios: ejerciciosActualizados
      });

      // Limpiar estado de edición
      cancelarEdicionEjercicio();
    }
  };

  // Función para cancelar la edición de un ejercicio
  const cancelarEdicionEjercicio = () => {
    setEjercicioEnEdicion(null);
    setIndexEjercicioEdicion(null);
    setFormDataEjercicioEdicion({
      ejercicio: "",
      series: "",
      repeticiones: ""
    });
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

  // Dentro del componente Rutinas, añade estos estilos:
  const cardStyle = {
    transition: "all 0.3s ease",
    borderRadius: "12px",
    overflow: "hidden"
  };

  const cardHeaderStyle = {
    fontFamily: "'Fjalla One', sans-serif",
    letterSpacing: "1px",
    textTransform: "uppercase"
  };

  // Función para generar un estilo de gradiente para cada tarjeta
  const getCardGradient = (id) => {
    const colors = [
      ['#4285f4', '#1a73e8'], // Azules
      ['#34a853', '#1e8e3e'], // Verdes
      ['#fbbc05', '#f29900'], // Amarillos
      ['#ea4335', '#d93025'], // Rojos
      ['#8e44ad', '#6c3483'], // Púrpuras
      ['#f39c12', '#e67e22'], // Naranjas
      ['#16a085', '#1abc9c'], // Verde azulado
      ['#e74c3c', '#c0392b'], // Rojo más claro
      ['#3498db', '#2980b9'], // Azul más claro
      ['#2c3e50', '#1a2530']  // Azul oscuro
    ];
    
    const colorPair = colors[id % colors.length];
    return `linear-gradient(135deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`;
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
                {/* Ocultar botón de tema en la pantalla principal para móviles (ya existe en la navbar móvil) */}
                {!isMobile && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={alternarTema}
                    className="d-flex align-items-center"
                  >
                    {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
                  </Button>
                )}
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <div className="d-flex justify-content-center align-items-center">
                  <h1 className="display-4 mb-0" style={{fontFamily: "'Roboto Slab', serif"}}>RUTINAS</h1>
                </div>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col>
                <div className="mb-4">
                  <Row>
                    <Col className="d-flex justify-content-end gap-2">
                      <Button 
                        onClick={handleAgregarRutina}
                        className="d-flex align-items-center border-0 bg-transparent fs-3"
                      >
                        <i className={`bi bi-plus-square ${isDarkMode ? 'text-light' : 'text-dark'}`}></i>
                      </Button>
                    </Col>
                  </Row>
                </div>

                {/* Reemplazar la tabla por tarjetas de rutinas */}
                <Row xs={1} md={2} lg={3} className="g-4">
                  {rutinas.length > 0 ? (
                    rutinas.map((rutina) => (
                      <Col key={rutina.id}>
                        <Card 
                          className="h-100 shadow"
                          style={cardStyle}
                        >
                           <Card.Header 
                             className="text-white text-center py-3 border-0"
                             style={{ 
                               background: getCardGradient(rutina.id),
                               fontSize: '1.3rem',
                               ...cardHeaderStyle
                             }}
                           >
                             {rutina.nombre}
                           </Card.Header> 
                          <Card.Body className="p-0">
                            <div className="p-3">
                              {rutina.ejercicios && rutina.ejercicios.length > 0 ? (
                                <div className="exercise-list">
                                  {rutina.ejercicios.slice(0, 3).map((ejercicio, index) => (
                                    <div 
                                      key={index} 
                                      className="mb-3"
                                      style={{
                                        borderRadius: "8px",
                                        padding: "12px",
                                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                      }}
                                    >
                                      <div className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-2 fs-4">
                                          <span
                                            style={{ 
                                              fontWeight: '600',
                                            }}
                                          >
                                            {ejercicio.ejercicio}
                                          </span>
                                          <FaDumbbell size={14} style={{ color: getRandomCardColor(rutina.id), opacity: 0.7 }} />
                                        </div>
                                        <div className="d-flex gap-2 align-items-center">
                                          <Badge 
                                            bg="transparent" 
                                            text= {isDarkMode ? "light" : "dark"} 
                                            pill 
                                            style={{ 
                                              border: `1px solid ${getRandomCardColor(rutina.id)}`,
                                              fontSize: '0.9rem',
                                              opacity: 0.9
                                            }}
                                          >
                                            <span className="fw-bold">{ejercicio.series}</span> series
                                          </Badge>
                                          <span className="text-muted mx-1">•</span>
                                          <Badge 
                                            bg="transparent" 
                                            text= {isDarkMode ? "light" : "dark"}
                                            pill
                                            style={{ 
                                              border: `1px solid ${getRandomCardColor(rutina.id)}`,
                                              fontSize: '0.8rem',
                                              opacity: 0.9
                                            }}
                                          >
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
                                          background: getCardGradient(rutina.id),
                                          color: 'white',
                                          padding: '0.5rem 1rem',
                                          fontSize: '0.85rem',
                                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
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
                                  <p className="text-muted mb-0">
                                    No hay ejercicios en esta rutina
                                  </p>
                                </div>
                              )}
                            </div>
                          </Card.Body>
                          <Card.Footer className="bg-transparent d-flex justify-content-between py-3 border-0">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditarRutina(rutina.id);
                              }}
                            >
                              <FaEdit className="me-2" /> Editar
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="px-3"
                              onClick={(e) => abrirModalEliminar(rutina, e)}
                            >
                              <FaTrash className="me-2" /> Eliminar
                            </Button>
                          </Card.Footer>
                        </Card>
                      </Col>
                    ))
                  ) : (
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
                
                {/* Botón para agregar rutina en vista móvil */}
                <div className="position-fixed bottom-0 end-0 mb-4 me-4 d-md-none">
                  <Button 
                    onClick={handleAgregarRutina}
                    className="rounded-circle shadow"
                    style={{ width: "60px", height: "60px" }}
                    variant="primary"
                  >
                    <FaPlus size={24} />
                  </Button>
                </div>
              </Col>
            </Row>

            {/* Detalle de rutina seleccionada */}
            {rutinaSeleccionada && (
              <Row className="mt-4">
                <Col>
                  <Card className="border-0 shadow">
                    <Card.Header 
                      className="text-white"
                      style={{ 
                        background: getCardGradient(rutinaSeleccionada.id),
                        fontSize: '1.5rem',
                        ...cardHeaderStyle,
                        padding: '1rem 1.5rem'
                      }}
                    >
                      <h3 className="mb-0">{rutinaSeleccionada.nombre}</h3>
                    </Card.Header>
                    <Card.Body>
                      <h5 className="mb-4" >Ejercicios</h5>
                      <div className="table-responsive">
                        <Table striped hover responsive>
                          <thead>
                            <tr style={{background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}}>
                              <th width="60%">Ejercicio</th>
                              <th className="text-center">Series</th>
                              <th className="text-center">Repeticiones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rutinaSeleccionada.ejercicios && rutinaSeleccionada.ejercicios.length > 0 ? (
                              rutinaSeleccionada.ejercicios.map((ejercicio, index) => (
                                <tr key={index}>
                                  <td 
                                    className=" fs-5"
                                    style={{ 
                                      fontFamily: "'Fjalla One', sans-serif", 
                                      fontWeight: 300 
                                    }}
                                  >
                                    {ejercicio.ejercicio}
                                  </td>
                                  <td className="text-center align-middle">
                                    <Badge 
                                      pill 
                                      bg={isDarkMode ? "dark" : "light"}
                                      text={isDarkMode ? "light" : "dark"}
                                      className="fs-6 px-3"
                                      style={{border: `1px solid ${getRandomCardColor(rutinaSeleccionada.id + index)}`}}
                                    >
                                      {ejercicio.series}
                                    </Badge>
                                  </td>
                                  <td className="text-center align-middle">
                                    <Badge 
                                      pill 
                                      bg={isDarkMode ? "dark" : "light"}
                                      text={isDarkMode ? "light" : "dark"}
                                      className="fs-6 px-3"
                                      style={{border: `1px solid ${getRandomCardColor(rutinaSeleccionada.id + index)}`}}
                                    >
                                      {ejercicio.repeticiones}
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="text-center py-3">
                                  <FaDumbbell className="me-2" /> No hay ejercicios en esta rutina.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>

                      <div className="d-flex gap-2 justify-content-end mt-4">
                        <Button 
                          variant="primary"
                          onClick={() => handleEditarRutina(rutinaSeleccionada.id)}
                          className="px-4"
                        >
                          <FaEdit className="me-2" /> Editar
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={handleCancelarEdicion}
                          className="px-4"
                        >
                          Cerrar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Container>
        </Col>
      </Row>

      {/* Modal para Nueva Rutina */}
      <Modal
        show={showModalNuevaRutina}
        onHide={() => setShowModalNuevaRutina(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Nueva Rutina</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Rutina</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                placeholder="Ej: Rutina de Fuerza"
                value={formDataRutina.nombre}
                onChange={handleFormRutinaChange}
              />
            </Form.Group>
            <h5 className="mb-3">Ejercicios</h5>
            {/* Formulario para agregar ejercicios */}
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ejercicio</Form.Label>
                      <Form.Control
                        type="text"
                        name="ejercicio"
                        placeholder="Ej: Press de banca"
                        value={formDataEjercicio.ejercicio}
                        onChange={handleFormEjercicioChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Series</Form.Label>
                      <Form.Control
                        type="number"
                        name="series"
                        placeholder="3"
                        min="1"
                        value={formDataEjercicio.series}
                        onChange={handleFormEjercicioChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Repeticiones</Form.Label>
                      <Form.Control
                        type="number"
                        name="repeticiones"
                        placeholder="10"
                        min="1"
                        value={formDataEjercicio.repeticiones}
                        onChange={handleFormEjercicioChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button 
                  variant="outline-primary" 
                  onClick={agregarEjercicio}
                  className="w-100"
                >
                  <FaPlus className="me-2" />
                  Agregar Ejercicio
                </Button>
              </Card.Body>
            </Card>

            {/* Lista de ejercicios agregados */}
            {formDataRutina.ejercicios.length > 0 && (
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Ejercicios en la rutina ({formDataRutina.ejercicios.length})</h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Ejercicio</th>
                        <th>Series</th>
                        <th>Repeticiones</th>
                        <th className="text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formDataRutina.ejercicios.map((ejercicio, index) => (
                        <tr key={index}>
                          <td className="fw-semibold fs-6">{ejercicio.ejercicio}</td>
                          <td>
                            <Badge bg="transparent fs-6">{ejercicio.series}</Badge>
                          </td>
                          <td>
                            <Badge bg="transparent fs-6">{ejercicio.repeticiones}</Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => eliminarEjercicio(index)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalNuevaRutina(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={guardarNuevaRutina}
            disabled={!formDataRutina.nombre.trim()}
          >
            Guardar Rutina
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Editar Rutina */}
      <Modal
        show={showModalEditarRutina}
        onHide={() => setShowModalEditarRutina(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Rutina</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Rutina</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                placeholder="Ej: Rutina de Fuerza"
                value={formDataEdicion.nombre}
                onChange={handleFormEdicionChange}
              />
            </Form.Group>
            <h5 className="mb-3">Ejercicios</h5>
            {/* Formulario para editar o agregar ejercicios */}
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ejercicio</Form.Label>
                      <Form.Control
                        type="text"
                        name="ejercicio"
                        placeholder="Ej: Press de banca"
                        value={formDataEjercicioEdicion.ejercicio}
                        onChange={handleFormEjercicioEdicionChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Series</Form.Label>
                      <Form.Control
                        type="number"
                        name="series"
                        placeholder="3"
                        min="1"
                        value={formDataEjercicioEdicion.series}
                        onChange={handleFormEjercicioEdicionChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Repeticiones</Form.Label>
                      <Form.Control
                        type="number"
                        name="repeticiones"
                        placeholder="10"
                        min="1"
                        value={formDataEjercicioEdicion.repeticiones}
                        onChange={handleFormEjercicioEdicionChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Botones para agregar nuevo o guardar editado */}
                {ejercicioEnEdicion ? (
                  <div className="d-flex gap-2">
                    <Button 
                      variant="success" 
                      onClick={guardarEjercicioEditado}
                      className="flex-grow-1"
                    >
                      <FaEdit className="me-2" />
                      Guardar cambios en ejercicio
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={cancelarEdicionEjercicio}
                      className="flex-grow-1"
                    >
                      Cancelar edición
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline-primary" 
                    onClick={agregarEjercicioEdicion}
                    className="w-100"
                  >
                    <FaPlus className="me-2" />
                    Agregar Ejercicio
                  </Button>
                )}
              </Card.Body>
            </Card>

            {/* Lista de ejercicios agregados */}
            {formDataEdicion.ejercicios.length > 0 && (
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Ejercicios en la rutina ({formDataEdicion.ejercicios.length})</h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Ejercicio</th>
                        <th>Series</th>
                        <th>Repeticiones</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formDataEdicion.ejercicios.map((ejercicio, index) => (
                        <tr key={index} className={indexEjercicioEdicion === index ? "table-primary" : ""}>
                          <td className="fw-semibold fs-6">{ejercicio.ejercicio}</td>
                          <td>
                            <Badge bg="transparent fs-6">{ejercicio.series}</Badge>
                          </td>
                          <td>
                            <Badge bg="transparent fs-6">{ejercicio.repeticiones}</Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => iniciarEdicionEjercicio(ejercicio, index)}
                              className="me-1"
                              disabled={ejercicioEnEdicion !== null}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => eliminarEjercicioEdicion(index)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModalEditarRutina(false);
            cancelarEdicionEjercicio(); // Asegurarse de limpiar estados de edición
          }}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={guardarEdicionRutina}
            disabled={!formDataEdicion.nombre.trim() || ejercicioEnEdicion !== null}
          >
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
          ¿Está seguro que desea eliminar la rutina "{rutinaAEliminar?.nombre}"?
          Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalEliminar(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminarRutina}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Función para generar colores aleatorios pero consistentes basados en el ID
function getRandomCardColor(id) {
  const colors = [
    '#4285f4', // Azul
    '#34a853', // Verde
    '#fbbc05', // Amarillo
    '#ea4335', // Rojo
    '#8e44ad', // Púrpura
    '#f39c12', // Naranja
    '#16a085', // Verde azulado
    '#e74c3c', // Rojo más claro
    '#3498db', // Azul más claro
    '#2c3e50'  // Azul oscuro
  ];
  
  // Usamos el ID como semilla para obtener un color consistente
  return colors[id % colors.length];
}

export default Rutinas;
