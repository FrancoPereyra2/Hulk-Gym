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
import { FaUsers, FaDumbbell, FaTimes, FaBars, FaMoon, FaSun, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from './admin.jsx';
import "bootstrap-icons/font/bootstrap-icons.css";
import { FaTrashCan } from "react-icons/fa6";

const Rutinas = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);

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

  // Guardar rutinas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('rutinas', JSON.stringify(rutinas));
  }, [rutinas]);

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
        ejercicio: formDataEjercicio.ejercicio.trim(),
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
        nombre: formDataRutina.nombre.trim(),
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
        ejercicio: formDataEjercicioEdicion.ejercicio.trim(),
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
              nombre: formDataEdicion.nombre.trim(),
              ejercicios: formDataEdicion.ejercicios
            }
          : rutina
      );

      setRutinas(rutinasActualizadas);
      
      // Actualizar rutina seleccionada si es la misma que se está editando
      if (rutinaSeleccionada && rutinaSeleccionada.id === formDataEdicion.id) {
        setRutinaSeleccionada({
          ...formDataEdicion,
          nombre: formDataEdicion.nombre.trim()
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
                        <i class="bi bi-plus-square"></i>
                      </Button>
                    </Col>
                  </Row>
                </div>
                <Card>
                  <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Nombre</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutinas.length > 0 ? (
                          rutinas.map((rutina) => (
                            <tr
                              key={rutina.id}
                              onClick={() => handleSeleccionarRutina(rutina)}
                              className="cursor-pointer"
                            >
                              <td className="fw-semibold">{rutina.nombre}</td>
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
                                  onClick={(e) => abrirModalEliminar(rutina, e)}
                                >
                                  Eliminar
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center py-4">
                              No hay rutinas disponibles. Agrega una nueva rutina.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {rutinaSeleccionada && (
              <Row>
                <Col>
                  <Card>
                    <Card.Header className="bg-primary text-white">
                      <h3 className="mb-0">{rutinaSeleccionada.nombre}</h3>
                    </Card.Header>
                    <Card.Body>
                      <h5 className="mb-3">Ejercicios</h5>
                      <Table striped bordered hover responsive>
                        <thead className="table-dark">
                          <tr>
                            <th>Ejercicio</th>
                            <th>Series</th>
                            <th>Repeticiones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rutinaSeleccionada.ejercicios && rutinaSeleccionada.ejercicios.length > 0 ? (
                            rutinaSeleccionada.ejercicios.map((ejercicio, index) => (
                              <tr key={index}>
                                <td className="fw-semibold fs-5">{ejercicio.ejercicio}</td>
                                <td className="text-center">
                                  <Badge bg="transparent" className="fs-6">{ejercicio.series}</Badge>
                                </td>
                                <td className="text-center">
                                  <Badge bg="transparent" className="fs-6">{ejercicio.repeticiones}</Badge>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center py-3">
                                No hay ejercicios en esta rutina.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>

                      <div className="d-flex gap-2 justify-content-end mt-4">
                        <Button 
                          variant="outline-primary"
                          onClick={() => handleEditarRutina(rutinaSeleccionada.id)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline-secondary"
                          onClick={handleCancelarEdicion}
                        >
                          Cancelar
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
                <Button 
                  variant="outline-primary" 
                  onClick={agregarEjercicioEdicion}
                  className="w-100"
                >
                  <FaPlus className="me-2" />
                  Agregar Ejercicio
                </Button>
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
                        <th className="text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formDataEdicion.ejercicios.map((ejercicio, index) => (
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
          <Button variant="secondary" onClick={() => setShowModalEditarRutina(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={guardarEdicionRutina}
            disabled={!formDataEdicion.nombre.trim()}
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

export default Rutinas;
