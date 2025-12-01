import React, { useState, useEffect, useCallback } from "react";
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
  Alert
} from "react-bootstrap";
import { FaUsers, FaDumbbell, FaTimes, FaBars, FaMoon, FaSun, FaPlus, FaTrash, FaEdit, FaSearch, FaEnvelope, FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from './admin.jsx';
import Swal from 'sweetalert2';
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

  // Verificar tipo de usuario
  const [userType, setUserType] = useState(() => localStorage.getItem('userType'));
  const isReadOnly = userType === 'cliente';

  // modales y rutinas
  const [showModalNuevaRutina, setShowModalNuevaRutina] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalEditarRutina, setShowModalEditarRutina] = useState(false);
  const [rutinaAEliminar, setRutinaAEliminar] = useState(null);

  const [rutinas, setRutinas] = useState(() => {
    const saved = localStorage.getItem('rutinas');
    return saved ? JSON.parse(saved) : [];
  });

  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // formularios
  const [formDataRutina, setFormDataRutina] = useState({ nombre: "", ejercicios: [] });
  const [formDataEjercicio, setFormDataEjercicio] = useState({ ejercicio: "", series: "", repeticiones: "" });
  const [formDataEdicion, setFormDataEdicion] = useState({ id: null, nombre: "", ejercicios: [] });
  const [formDataEjercicioEdicion, setFormDataEjercicioEdicion] = useState({ ejercicio: "", series: "", repeticiones: "" });
  const [ejercicioEnEdicion, setEjercicioEnEdicion] = useState(null);
  const [indexEjercicioEdicion, setIndexEjercicioEdicion] = useState(null);

  // Nuevos estados para el sistema de emails
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState(() => {
    const savedHistory = localStorage.getItem('emailHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [cuentasVencidas, setCuentasVencidas] = useState([]);

  // Función para verificar cuentas vencidas
  const verificarCuentasVencidas = useCallback(() => {
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
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
  }, []);

  // Verificar cuentas vencidas al cargar
  useEffect(() => {
    verificarCuentasVencidas();
  }, [verificarCuentasVencidas]);

  useEffect(() => {
    localStorage.setItem('rutinas', JSON.stringify(rutinas));
  }, [rutinas]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!storedUserType) {
      navigate('/login');
      return;
    }

    setUserType(storedUserType);

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
  }, [navigate]);

  // manejo rutinas
  const handleAgregarRutina = () => {
    setFormDataRutina({ nombre: "", ejercicios: [] });
    setShowModalNuevaRutina(true);
  };

  const handleFormRutinaChange = (e) => {
    const { name, value } = e.target;
    setFormDataRutina(prev => ({ ...prev, [name]: value }));
  };

  const handleFormEjercicioChange = (e) => {
    const { name, value } = e.target;
    setFormDataEjercicio(prev => ({ ...prev, [name]: value }));
  };

  const agregarEjercicio = () => {
    if (!formDataEjercicio.ejercicio.trim()) return;
    const nuevo = {
      ejercicio: capitalizarPrimeraLetra(formDataEjercicio.ejercicio.trim()),
      series: parseInt(formDataEjercicio.series) || 0,
      repeticiones: parseInt(formDataEjercicio.repeticiones) || 0
    };
    setFormDataRutina(prev => ({ ...prev, ejercicios: [...prev.ejercicios, nuevo] }));
    setFormDataEjercicio({ ejercicio: "", series: "", repeticiones: "" });
  };

  const eliminarEjercicio = (index) => {
    setFormDataRutina(prev => ({ ...prev, ejercicios: prev.ejercicios.filter((_, i) => i !== index) }));
  };

  const guardarNuevaRutina = () => {
    if (!formDataRutina.nombre.trim()) return;
    const nuevaRutina = {
      id: rutinas.length > 0 ? Math.max(...rutinas.map(r => r.id)) + 1 : 1,
      nombre: capitalizarPrimeraLetra(formDataRutina.nombre.trim()),
      ejercicios: formDataRutina.ejercicios
    };
    setRutinas(prev => [...prev, nuevaRutina]);
    setShowModalNuevaRutina(false);
  };

  const handleEditarRutina = (id) => {
    const rutina = rutinas.find(r => r.id === id);
    if (!rutina) return;
    setFormDataEdicion({ id: rutina.id, nombre: rutina.nombre, ejercicios: [...rutina.ejercicios] });
    setShowModalEditarRutina(true);
  };

  const handleFormEdicionChange = (e) => {
    const { name, value } = e.target;
    setFormDataEdicion(prev => ({ ...prev, [name]: value }));
  };

  const handleFormEjercicioEdicionChange = (e) => {
    const { name, value } = e.target;
    setFormDataEjercicioEdicion(prev => ({ ...prev, [name]: value }));
  };

  const agregarEjercicioEdicion = () => {
    if (!formDataEjercicioEdicion.ejercicio.trim()) return;
    const nuevo = {
      ejercicio: capitalizarPrimeraLetra(formDataEjercicioEdicion.ejercicio.trim()),
      series: parseInt(formDataEjercicioEdicion.series) || 0,
      repeticiones: parseInt(formDataEjercicioEdicion.repeticiones) || 0
    };
    setFormDataEdicion(prev => ({ ...prev, ejercicios: [...prev.ejercicios, nuevo] }));
    setFormDataEjercicioEdicion({ ejercicio: "", series: "", repeticiones: "" });
  };

  const eliminarEjercicioEdicion = (index) => {
    setFormDataEdicion(prev => ({ ...prev, ejercicios: prev.ejercicios.filter((_, i) => i !== index) }));
  };

  const guardarEdicionRutina = () => {
    if (!formDataEdicion.nombre.trim()) return;
    const actualizadas = rutinas.map(r =>
      r.id === formDataEdicion.id ? { ...r, nombre: capitalizarPrimeraLetra(formDataEdicion.nombre.trim()), ejercicios: formDataEdicion.ejercicios } : r
    );
    setRutinas(actualizadas);
    if (rutinaSeleccionada && rutinaSeleccionada.id === formDataEdicion.id) {
      setRutinaSeleccionada({ ...rutinaSeleccionada, nombre: capitalizarPrimeraLetra(formDataEdicion.nombre.trim()), ejercicios: formDataEdicion.ejercicios });
    }
    setShowModalEditarRutina(false);
    setModoEdicion(false);
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
    setRutinas(prev => prev.filter(r => r.id !== rutinaAEliminar.id));
    if (rutinaSeleccionada && rutinaSeleccionada.id === rutinaAEliminar.id) setRutinaSeleccionada(null);
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

  // editar ejercicio
  const iniciarEdicionEjercicio = (ejercicio, index) => {
    setEjercicioEnEdicion(ejercicio);
    setIndexEjercicioEdicion(index);
    setFormDataEjercicioEdicion({ ejercicio: ejercicio.ejercicio, series: ejercicio.series, repeticiones: ejercicio.repeticiones });
  };

  const guardarEjercicioEditado = () => {
    if (!formDataEjercicioEdicion.ejercicio.trim()) return;
    const actualizado = {
      ejercicio: capitalizarPrimeraLetra(formDataEjercicioEdicion.ejercicio.trim()),
      series: parseInt(formDataEjercicioEdicion.series) || 0,
      repeticiones: parseInt(formDataEjercicioEdicion.repeticiones) || 0
    };
    const ejerciciosAct = [...formDataEdicion.ejercicios];
    ejerciciosAct[indexEjercicioEdicion] = actualizado;
    setFormDataEdicion(prev => ({ ...prev, ejercicios: ejerciciosAct }));
    cancelarEdicionEjercicio();
  };

  const cancelarEdicionEjercicio = () => {
    setEjercicioEnEdicion(null);
    setIndexEjercicioEdicion(null);
    setFormDataEjercicioEdicion({ ejercicio: "", series: "", repeticiones: "" });
  };

  // NUEVO: Función para eliminar un email del historial
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

  // Sidebar
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
            {isReadOnly ? 'Panel de Cliente' : 'Panel Administrativo'}
          </p>
          
          <Nav className="flex-column w-100">
            <Nav.Link 
              className={`d-flex align-items-center mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`}
              onClick={() => navigate(userType === 'admin' ? '/admin' : '/principal')}
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
              <FaUsers className="me-2" />
              <span>{isReadOnly ? 'Mi Información' : 'Gestión de Clientes'}</span>
            </Nav.Link>
            
            <Nav.Link 
              className={`d-flex align-items-center mb-2 ${isDarkMode ? 'text-info' : 'text-primary'}`}
              style={{
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px',
                backgroundColor: isDarkMode ? 'rgba(13, 202, 240, 0.1)' : 'rgba(0, 123, 255, 0.1)'
              }}
            >
              <FaDumbbell className="me-2" />
              <span>Rutinas</span>
            </Nav.Link>

            {/* Solo mostrar historial de emails si es admin */}
            {!isReadOnly && (
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
            )}

            <hr style={{
              borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              margin: '20px 0'
            }} />

            {/* Botón de Cerrar Sesión */}
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
    <Container fluid className="d-flex flex-column p-0" style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%)',
      minHeight: '100vh'
    }}>
      <Row className="flex-grow-1 m-0" style={{ minHeight: '100vh' }}>
        <Col xs={2} md={2} lg={2} className="d-none d-md-block p-0" style={{
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>{renderSidebar()}</Col>

        <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="w-75" placement="start" style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          backdropFilter: 'blur(15px)'
        }}>
          <Offcanvas.Header closeButton style={{
            background: 'transparent',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: isDarkMode ? 'white' : 'dark'
          }}>
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">{renderSidebar()}</Offcanvas.Body>
        </Offcanvas>

        <Col xs={12} md={10} lg={10} className="p-0 d-flex flex-column" style={{ minHeight: '100vh' }}>
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

          <Container fluid className="p-3 flex-grow-1">
            <Row className="mb-3">
              <Col className="d-flex justify-content-end">
                {!isMobile && (
                  <Button 
                    variant={isDarkMode ? "outline-light" : "outline-dark"}
                    size="sm" 
                    onClick={alternarTema} 
                    className="d-flex align-items-center border-0"
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
                )}
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <div className="text-center mb-5" key={isDarkMode ? 'dark' : 'light'}>
                  <h1 className="display-4 fw-bold mb-2" style={{
                    background: isDarkMode 
                      ? 'linear-gradient(45deg, #60a5fa, #34d399, #fbbf24)'
                      : 'linear-gradient(45deg, #1e40af, #059669, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Fjalla One", sans-serif',
                    letterSpacing: '2px',
                    transition: 'all 0.3s ease'
                  }}>
                    RUTINAS
                  </h1>
                  <p className={`lead ${isDarkMode ? 'text-light' : 'text-muted'}`} style={{
                    fontSize: '1.1rem',
                    fontWeight: '300',
                    transition: 'color 0.3s ease'
                  }}>
                    {isReadOnly ? 'Consulta las rutinas de entrenamiento disponibles' : 'Gestiona y crea rutinas de entrenamiento'}
                  </p>
                </div>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <div className="mb-4">
                  <Row>
                    <Col className="d-flex justify-content-end gap-2">
                      {/* Solo mostrar botón de nueva rutina si NO es cliente Y NO es móvil */}
                      {!isReadOnly && !isMobile && (
                        <Button
                          onClick={handleAgregarRutina}
                          className="d-flex align-items-center border-0 shadow-lg"
                          style={{
                            background: isDarkMode 
                              ? 'linear-gradient(45deg, #60a5fa, #34d399)'
                              : 'linear-gradient(45deg, #1e40af, #059669)',
                            borderRadius: '15px',
                            padding: '12px 25px',
                            fontSize: '1.1rem',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <FaPlus className="me-2" />
                          Nueva Rutina
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>

                <Row xs={1} md={2} lg={3} className="g-4">
                  {rutinas.length > 0 ? rutinas.map((rutina, index) => (
                    <Col key={rutina.id}>
                      <Card className="h-100 shadow-lg border-0" style={{
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                        backdropFilter: 'blur(15px)',
                        borderRadius: '20px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSeleccionarRutina(rutina)}
                      >
                        <Card.Header
                          className={`${isDarkMode ? 'text-white' : 'text-dark'} text-center py-3 border-0 bg-transparent`}
                          style={{
                            fontFamily:'"Fjalla One", sans-serif',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            letterSpacing: '1px'
                          }}
                        >
                          {rutina.nombre}
                        </Card.Header>
                        <Card.Body className="p-0">
                          <div className="p-3">
                            {rutina.ejercicios && rutina.ejercicios.length > 0 ? (
                              <div className="exercise-list">
                                {rutina.ejercicios.slice(0, 3).map((ejercicio, idx) => (
                                  <div key={idx} className="mb-3" style={{ 
                                    borderRadius: "12px", 
                                    padding: "15px", 
                                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                                  }}>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>{ejercicio.ejercicio}</span>
                                        <FaDumbbell size={14} style={{ color: getRandomCardColorByIndex(index), opacity: 0.7 }} />
                                      </div>
                                      <div className="d-flex gap-2 align-items-center">
                                        <Badge bg="transparent" text={isDarkMode ? "light" : "dark"} pill style={{ 
                                          border: `1px solid ${getRandomCardColorByIndex(index)}`, 
                                          fontSize: '0.85rem', 
                                          opacity: 0.9,
                                          padding: '5px 12px'
                                        }}>
                                          <span className="fw-bold">{ejercicio.series}</span> series
                                        </Badge>
                                        <span className="text-muted mx-1">•</span>
                                        <Badge bg="transparent" text={isDarkMode ? "light" : "dark"} pill style={{ 
                                          border: `1px solid ${getRandomCardColorByIndex(index)}`, 
                                          fontSize: '0.85rem', 
                                          opacity: 0.9,
                                          padding: '5px 12px'
                                        }}>
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
                                        padding: '0.6rem 1.2rem',
                                        fontSize: '0.9rem',
                                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
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
                        <Card.Footer className="bg-transparent d-flex justify-content-between py-3 border-0">
                          {/* Solo mostrar botones de editar/eliminar si NO es cliente */}
                          {!isReadOnly ? (
                            <>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="px-3 border-0"
                                onClick={(e) => { e.stopPropagation(); handleEditarRutina(rutina.id); }}
                                style={{
                                  borderRadius: '10px',
                                  backdropFilter: 'blur(10px)',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <FaEdit className="me-2" /> Editar
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="px-3 border-0"
                                onClick={(e) => abrirModalEliminar(rutina, e)}
                                style={{
                                  borderRadius: '10px',
                                  backdropFilter: 'blur(10px)',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <FaTrash className="me-2" /> Eliminar
                              </Button>
                            </>
                          ) : (
                            <div className="w-100 text-center">
                              <small className="text-muted">
                                <i className="bi bi-eye me-1"></i>
                                Haz clic para ver detalles
                              </small>
                            </div>
                          )}
                        </Card.Footer>
                      </Card>
                    </Col>
                  )) : (
                    <Col xs={12}>
                      <Card className="text-center p-5 border-0 shadow-lg" style={{
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                        backdropFilter: 'blur(15px)',
                        borderRadius: '20px'
                      }}>
                        <Card.Body>
                          <FaDumbbell size={48} className="mb-3 text-muted" />
                          <h4>No hay rutinas disponibles</h4>
                          <p className="text-muted">Agrega una nueva rutina haciendo clic en el botón "Nueva Rutina"</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </Row>

                {/* Solo mostrar botón flotante si NO es cliente */}
                {!isReadOnly && (
                  <div className="position-fixed bottom-0 end-0 mb-4 me-4 d-md-none">
                    <Button 
                      onClick={handleAgregarRutina} 
                      className="rounded-circle shadow-lg border-0" 
                      style={{ 
                        width: "60px", 
                        height: "60px",
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        transition: 'all 0.3s ease'
                      }} 
                    >
                      <FaPlus size={24} />
                    </Button>
                  </div>
                )}
              </Col>
            </Row>

            {rutinaSeleccionada && (
              <Row className="mt-4">
                <Col>
                  <Card className="border-0 shadow-lg" style={{
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '20px'
                  }}>
                    <Card.Header
                      className={`${isDarkMode ? 'text-white' : 'text-dark'} text-center py-3 bg-transparent border-0`}
                      style={{ fontSize: '1.5rem', fontFamily: '"Fjalla One", sans-serif', padding: '1rem 1.5rem' }}
                    >
                      <h3 className="mb-0">{rutinaSeleccionada.nombre}</h3>
                    </Card.Header>
                    <Card.Body>
                      <h5 className="mb-4">Ejercicios</h5>
                      <div className="table-responsive">
                        <Table striped hover responsive className={isDarkMode ? 'table-dark' : ''}>
                          <thead>
                            <tr style={{ background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                              <th width="60%">Ejercicio</th>
                              <th className="text-center">Series</th>
                              <th className="text-center">Repeticiones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rutinaSeleccionada.ejercicios && rutinaSeleccionada.ejercicios.length > 0 ? rutinaSeleccionada.ejercicios.map((ejercicio, i) => (
                              <tr key={i}>
                                <td className="fs-5" style={{ fontFamily: "'Fjalla One', sans-serif", fontWeight: 300 }}>{ejercicio.ejercicio}</td>
                                <td className="text-center align-middle">
                                  <Badge pill bg={isDarkMode ? "dark" : "light"} text={isDarkMode ? "light" : "dark"} className="fs-6 px-3" style={{ border: `1px solid ${getRandomCardColorByIndex(selIndex + i)}` }}>
                                    {ejercicio.series}
                                  </Badge>
                                </td>
                                <td className="text-center align-middle">
                                  <Badge pill bg={isDarkMode ? "dark" : "light"} text={isDarkMode ? "light" : "dark"} className="fs-6 px-3" style={{ border: `1px solid ${getRandomCardColorByIndex(selIndex + i)}` }}>
                                    {ejercicio.repeticiones}
                                  </Badge>
                                </td>
                              </tr>
                            )) : (
                              <tr><td colSpan="3" className="text-center py-3"><FaDumbbell className="me-2" /> No hay ejercicios en esta rutina.</td></tr>
                            )}
                          </tbody>
                        </Table>
                      </div>

                      <div className="d-flex gap-2 justify-content-end mt-4">
                        {/* Solo mostrar botón de editar si NO es cliente */}
                        {!isReadOnly && (
                          <Button 
                            variant="primary" 
                            onClick={() => handleEditarRutina(rutinaSeleccionada.id)} 
                            className="px-4 border-0"
                            style={{
                              borderRadius: '12px',
                              background: 'linear-gradient(45deg, #007bff, #0056b3)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <FaEdit className="me-2" /> Editar
                          </Button>
                        )}
                        <Button 
                          variant="secondary" 
                          onClick={handleCancelarEdicion} 
                          className="px-4"
                          style={{
                            borderRadius: '12px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Cerrar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Solo mostrar modales si NO es cliente */}
            {!isReadOnly && (
              <>
                {/* Modal Nueva Rutina */}
                <Modal show={showModalNuevaRutina} onHide={() => setShowModalNuevaRutina(false)} size="lg">
                  <Modal.Header closeButton>
                    <Modal.Title>Nueva Rutina</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre de la Rutina</Form.Label>
                        <Form.Control type="text" name="nombre" placeholder="Ej: Rutina de Fuerza" value={formDataRutina.nombre} onChange={handleFormRutinaChange} />
                      </Form.Group>

                      <h5 className="mb-3">Ejercicios</h5>
                      <Card className="mb-3">
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Ejercicio</Form.Label>
                                <Form.Control type="text" name="ejercicio" placeholder="Ej: Press de banca" value={formDataEjercicio.ejercicio} onChange={handleFormEjercicioChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group className="mb-3">
                                <Form.Label>Series</Form.Label>
                                <Form.Control type="number" name="series" placeholder="3" min="1" value={formDataEjercicio.series} onChange={handleFormEjercicioChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group className="mb-3">
                                <Form.Label>Repeticiones</Form.Label>
                                <Form.Control type="number" name="repeticiones" placeholder="10" min="1" value={formDataEjercicio.repeticiones} onChange={handleFormEjercicioChange} />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Button variant="outline-primary" onClick={agregarEjercicio} className="w-100"><FaPlus className="me-2" /> Agregar Ejercicio</Button>
                        </Card.Body>
                      </Card>

                      {formDataRutina.ejercicios.length > 0 && (
                        <Card>
                          <Card.Header><h6 className="mb-0">Ejercicios en la rutina ({formDataRutina.ejercicios.length})</h6></Card.Header>
                          <Card.Body className="p-0">
                            <Table responsive className="mb-0">
                              <thead className="table-light">
                                <tr><th>Ejercicio</th><th>Series</th><th>Repeticiones</th><th className="text-center">Acción</th></tr>
                              </thead>
                              <tbody>
                                {formDataRutina.ejercicios.map((ej, idx) => (
                                  <tr key={idx}>
                                    <td className="fw-semibold fs-6">{ej.ejercicio}</td>
                                    <td><Badge bg="transparent fs-6">{ej.series}</Badge></td>
                                    <td><Badge bg="transparent fs-6">{ej.repeticiones}</Badge></td>
                                    <td className="text-center">
                                      <Button variant="outline-danger" size="sm" onClick={() => eliminarEjercicio(idx)}><FaTrash /></Button>
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
                    <Button variant="secondary" onClick={() => setShowModalNuevaRutina(false)}>Cancelar</Button>
                    <Button variant="success" onClick={guardarNuevaRutina} disabled={!formDataRutina.nombre.trim()}>Guardar Rutina</Button>
                  </Modal.Footer>
                </Modal>

                {/* Modal Editar Rutina */}
                <Modal show={showModalEditarRutina} onHide={() => { setShowModalEditarRutina(false); cancelarEdicionEjercicio(); }} size="lg">
                  <Modal.Header closeButton><Modal.Title>Editar Rutina</Modal.Title></Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre de la Rutina</Form.Label>
                        <Form.Control type="text" name="nombre" placeholder="Ej: Rutina de Fuerza" value={formDataEdicion.nombre} onChange={handleFormEdicionChange} />
                      </Form.Group>

                      <h5 className="mb-3">Ejercicios</h5>
                      <Card className="mb-3">
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Ejercicio</Form.Label>
                                <Form.Control type="text" name="ejercicio" placeholder="Ej: Press de banca" value={formDataEjercicioEdicion.ejercicio} onChange={handleFormEjercicioEdicionChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group className="mb-3">
                                <Form.Label>Series</Form.Label>
                                <Form.Control type="number" name="series" placeholder="3" min="1" value={formDataEjercicioEdicion.series} onChange={handleFormEjercicioEdicionChange} />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group className="mb-3">
                                <Form.Label>Repeticiones</Form.Label>
                                <Form.Control type="number" name="repeticiones" placeholder="10" min="1" value={formDataEjercicioEdicion.repeticiones} onChange={handleFormEjercicioEdicionChange} />
                              </Form.Group>
                            </Col>
                          </Row>

                          {ejercicioEnEdicion ? (
                            <div className="d-flex gap-2">
                              <Button variant="success" onClick={guardarEjercicioEditado} className="flex-grow-1"><FaEdit className="me-2" /> Guardar cambios en ejercicio</Button>
                              <Button variant="secondary" onClick={cancelarEdicionEjercicio} className="flex-grow-1">Cancelar edición</Button>
                            </div>
                          ) : (
                            <Button variant="outline-primary" onClick={agregarEjercicioEdicion} className="w-100"><FaPlus className="me-2" /> Agregar Ejercicio</Button>
                          )}
                        </Card.Body>
                      </Card>

                      {formDataEdicion.ejercicios.length > 0 && (
                        <Card>
                          <Card.Header><h6 className="mb-0">Ejercicios en la rutina ({formDataEdicion.ejercicios.length})</h6></Card.Header>
                          <Card.Body className="p-0">
                            <Table responsive className="mb-0">
                              <thead className="table-light">
                                <tr><th>Ejercicio</th><th>Series</th><th>Repeticiones</th><th className="text-center">Acciones</th></tr>
                              </thead>
                              <tbody>
                                {formDataEdicion.ejercicios.map((ej, idx) => (
                                  <tr key={idx} className={indexEjercicioEdicion === idx ? "table-primary" : ""}>
                                    <td className="fw-semibold fs-6">{ej.ejercicio}</td>
                                    <td><Badge bg="transparent fs-6">{ej.series}</Badge></td>
                                    <td><Badge bg="transparent fs-6">{ej.repeticiones}</Badge></td>
                                    <td className="text-center">
                                      <Button variant="outline-primary" size="sm" onClick={() => iniciarEdicionEjercicio(ej, idx)} className="me-1" disabled={ejercicioEnEdicion !== null}><FaEdit /></Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => eliminarEjercicioEdicion(idx)}><FaTrash /></Button>
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
                    <Button variant="secondary" onClick={() => { setShowModalEditarRutina(false); cancelarEdicionEjercicio(); }}>Cancelar</Button>
                    <Button variant="success" onClick={guardarEdicionRutina} disabled={!formDataEdicion.nombre.trim() || ejercicioEnEdicion !== null}>Guardar Cambios</Button>
                  </Modal.Footer>
                </Modal>

                {/* Modal Eliminar */}
                <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)}>
                  <Modal.Header closeButton><Modal.Title>Confirmar Eliminación</Modal.Title></Modal.Header>
                  <Modal.Body>¿Está seguro que desea eliminar la rutina "{rutinaAEliminar?.nombre}"? Esta acción no se puede deshacer.</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmarEliminarRutina}>Eliminar</Button>
                  </Modal.Footer>
                </Modal>
              </>
            )}

            {/* Modal para historial de emails */}
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

          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Rutinas;
