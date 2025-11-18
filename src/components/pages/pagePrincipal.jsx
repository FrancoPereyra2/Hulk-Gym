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
  Badge,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser, FaSearch, FaCheckCircle, FaTimesCircle, FaBars, FaTimes, FaDumbbell, FaMoon, FaSun, FaUserCheck, FaCalendarAlt, FaIdCard, FaHome, FaUsers, FaCog, FaChartBar } from "react-icons/fa";
import { useTheme } from './admin.jsx';

const PagePrincipal = () => {
  const navigate = useNavigate();
  const { isDarkMode, alternarTema } = useTheme();

  // Obtener tipo de usuario
  const [userType, setUserType] = useState(() => localStorage.getItem('userType'));

  // Verificación más robusta de usuario
  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!storedUserType) {
      navigate('/login');
    } else {
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
    }
  }, [navigate]);

  // Inicializar clientes desde localStorage
  const [clientes, setClientes] = useState(() => {
    const savedClientes = localStorage.getItem('clientes');
    return savedClientes ? JSON.parse(savedClientes) : [];
  });

  const [searchDNI, setSearchDNI] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Función para determinar si la membresía está vencida
  const calcularEstado = (vencimiento) => {
    if (!vencimiento) return "Vencida";
    const hoy = new Date();
    // Suponiendo formato DD/MM/YYYY
    const [dia, mes, anio] = vencimiento.split("/");
    const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
    return fechaVencimiento >= hoy ? "Activo" : "Vencida";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Si el campo está vacío, limpiar la búsqueda
    if (!searchDNI.trim()) {
      setClienteEncontrado(null);
      setBusquedaRealizada(false);
      return;
    }
    
    const cliente = clientes.find(
      (cliente) => cliente.dni === searchDNI.trim()
    );

    // Si se encuentra, calcular el estado actualizado
    if (cliente) {
      setClienteEncontrado({
        ...cliente,
        estado: calcularEstado(cliente.vencimiento)
      });
    } else {
      setClienteEncontrado(null);
    }
    setBusquedaRealizada(true);
   };

  // Función para limpiar la búsqueda cuando se borra el input
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchDNI(value);
    
    // Si el campo se vacía, limpiar la búsqueda
    if (!value.trim()) {
      setClienteEncontrado(null);
      setBusquedaRealizada(false);
    }
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
          <h3 className={`fw-bold text-center ${isDarkMode ? 'text-success' : 'text-primary'}`}>HULK GYM</h3>
          <Nav className="flex-column w-100 mt-4">
            {/* Opciones de navegación */}
            <Nav.Link 
              className={`d-flex align-items-center text-center mb-2 ${isDarkMode ? 'text-info' : 'text-primary'}`}
              style={{
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px',
                backgroundColor: isDarkMode ? 'rgba(13, 202, 240, 0.1)' : 'rgba(0, 123, 255, 0.1)'
              }}
              onClick={() => navigate(userType === 'admin' ? '/admin' : '/principal')}
            >
              <FaUsers className="me-2" />
              <span>Gestión de Clientes</span>
            </Nav.Link>
            
            <Nav.Link 
              className={`d-flex align-items-center text-center mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`}
              style={{
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/rutinas')}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                e.target.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <FaDumbbell className="me-2" />
              <span>Rutinas</span>
            </Nav.Link>

            {/* Separador */}
            <hr style={{
              borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              margin: '20px 0'
            }} />

            {/* Botón de Cerrar Sesión */}
            <Nav.Link 
              className="d-flex align-items-center text-center text-danger mt-auto mb-3"
              onClick={handleLogout}
              style={{
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

  return (
    <Container fluid className="d-flex flex-column p-0" style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%)',
      minHeight: '100vh'
    }}>
      <Row className="flex-grow-1 m-0" style={{ minHeight: '100vh' }}>
        {/* Sidebar para pantallas medianas y grandes */}
        <Col xs={2} md={2} lg={2} className="d-none d-md-block p-0" style={{
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          {renderSidebar()}
        </Col>

        {/* Offcanvas para móviles */}
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          className="w-75"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            backdropFilter: 'blur(15px)'
          }}
          placement="start"
        >
          <Offcanvas.Header closeButton style={{
            background: 'transparent',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: isDarkMode ? 'white' : 'dark'
          }}>
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            {renderSidebar()}
          </Offcanvas.Body>
        </Offcanvas>

        {/* Contenedor principal */}
        <Col xs={12} md={10} lg={10} className="p-0 d-flex flex-column" style={{ minHeight: '100vh' }}>
          {/* Navbar para móviles */}
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

          {/* Contenido de la página */}
          <Container fluid className="p-3 flex-grow-1">
            {/* Header con botón de tema */}
            <Row className="mb-3">
              <Col className="d-flex justify-content-end">
                {/* Oculto en móviles: ya existe el botón de tema en la navbar móvil */}
                <Button 
                  variant={isDarkMode ? "outline-light" : "outline-dark"}
                   size="sm"
                   onClick={alternarTema}
                  className="d-none d-md-flex align-items-center border-0"
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
               </Col>
            </Row>

            <Row>
              <Col xs={12}>
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
                    GESTIÓN DE CLIENTES
                  </h1>
                  <p className={`lead ${isDarkMode ? 'text-light' : 'text-muted'}`} style={{
                    fontSize: '1.1rem',
                    fontWeight: '300',
                    transition: 'color 0.3s ease'
                  }}>
                    Busca y consulta el estado de las membresías
                  </p>
                </div>
               </Col>

               {/* Sección de búsqueda */}
               <Col xs={12} className="mb-4">
                <Card className="border-0 shadow-lg h-100" style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: '20px'
                }}>
                  <Card.Header className="border-0 bg-transparent">
                    <h5 className={`mb-0 d-flex align-items-center ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                      <FaSearch className="me-2 text-primary" />
                      Buscar Cliente
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleSearch}>
                      <InputGroup size="lg" style={{ borderRadius: '15px' }}>
                        <Form.Control
                          type="text"
                          placeholder="Ingresa el DNI del cliente..."
                          value={searchDNI}
                          onChange={handleSearchInputChange}
                          style={{
                            borderRadius: '15px 0 0 15px',
                            border: 'none',
                            background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                            color: isDarkMode ? 'white' : 'dark',
                            fontSize: '1.1rem',
                            padding: '12px 20px'
                          }}
                        />
                        <Button 
                          variant="primary" 
                          type="submit"
                          style={{
                            borderRadius: '0 15px 15px 0',
                            background: 'linear-gradient(45deg, #007bff, #0056b3)',
                            border: 'none',
                            padding: '12px 25px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <FaSearch size={18} />
                        </Button>
                      </InputGroup>
                    </Form>
                  </Card.Body>
                </Card>
               </Col>

               {/* Tabla de resultados */}
               <Col xs={12} className="mb-5 d-flex justify-content-center">
                <Card className="border-0 shadow-lg w-100" style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: '20px',
                  maxWidth: '1000px'
                }}>
                  <Card.Header className="border-0 bg-transparent">
                    <h5 className={`mb-0 d-flex align-items-center justify-content-center ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                      <FaUserCheck className="me-2 text-success" />
                      Resultados de Búsqueda
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table hover className="mb-0" style={{
                        borderRadius: '15px',
                        overflow: 'hidden'
                      }}>
                        <thead style={{
                          background: isDarkMode 
                            ? 'linear-gradient(90deg, #374151, #4b5563)'
                            : 'linear-gradient(90deg, #f8fafc, #e2e8f0)'
                        }}>
                          <tr>
                            <th style={{ 
                              padding: '20px', 
                              fontWeight: '600',
                              color: isDarkMode ? '#e5e7eb' : '#374151',
                              fontSize: '1rem'
                            }}>Nombre</th>
                            <th style={{ 
                              padding: '20px', 
                              fontWeight: '600',
                              color: isDarkMode ? '#e5e7eb' : '#374151',
                              fontSize: '1rem'
                            }}>DNI</th>
                            <th style={{ 
                              padding: '20px', 
                              fontWeight: '600',
                              color: isDarkMode ? '#e5e7eb' : '#374151',
                              fontSize: '1rem'
                            }}>Vencimiento</th>
                            <th style={{ 
                              padding: '20px', 
                              fontWeight: '600',
                              color: isDarkMode ? '#e5e7eb' : '#374151',
                              fontSize: '1rem'
                            }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                           {busquedaRealizada ? (
                             clienteEncontrado ? (
                              <tr style={{
                                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
                                transition: 'all 0.3s ease'
                              }}>
                                <td style={{ 
                                  padding: '20px', 
                                  fontWeight: '500',
                                  color: isDarkMode ? '#f3f4f6' : '#374151',
                                  fontSize: '1rem'
                                }}>{clienteEncontrado.nombre}</td>
                                <td style={{ 
                                  padding: '20px',
                                  color: isDarkMode ? '#f3f4f6' : '#374151',
                                  fontSize: '1rem'
                                }}>{clienteEncontrado.dni}</td>
                                <td style={{ 
                                  padding: '20px',
                                  color: isDarkMode ? '#f3f4f6' : '#374151',
                                  fontSize: '1rem'
                                }}>
                                  <FaCalendarAlt className="me-2 text-muted" />
                                  {clienteEncontrado.vencimiento}
                                </td>
                                <td style={{ padding: '20px' }}>
                                   {clienteEncontrado.estado === "Activo" ? (
                                    <Badge 
                                      bg="success" 
                                      pill 
                                      style={{ 
                                        fontSize: '0.9rem',
                                        padding: '8px 15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        maxWidth: '120px'
                                      }}
                                     >
                                      <FaCheckCircle className="me-1" /> Activo
                                    </Badge>
                                    ) : (
                                    <Badge 
                                      bg="danger" 
                                      pill 
                                      style={{ 
                                        fontSize: '0.9rem',
                                        padding: '8px 15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        maxWidth: '120px'
                                      }}
                                     >
                                      <FaTimesCircle className="me-1" /> Vencida
                                    </Badge>
                                    )}
                                  </td>
                                </tr>
                              ) : (
                                <tr style={{
                                  background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)'
                                }}>
                                  <td colSpan="4" className="text-center" style={{ 
                                    padding: '40px 20px',
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    fontSize: '1.1rem'
                                  }}>
                                    <FaTimesCircle className="me-2 text-danger" size={20} />
                                    No se encontraron resultados para el DNI ingresado
                                   </td>
                                 </tr>
                               )
                             ) : (
                              <tr style={{
                                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)'
                              }}>
                                <td colSpan="4" className="text-center" style={{ 
                                  padding: '40px 20px',
                                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                                  fontSize: '1.1rem'
                                }}>
                                  <FaSearch className="me-2 text-info" size={20} />
                                  Ingresa un DNI para conocer el estado de cuenta
                                 </td>
                               </tr>
                             )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
               </Col>

               {/* Información del cliente */}
               {clienteEncontrado && (
                 <Col xs={12} className="d-flex justify-content-center">
                  <Card className="border-0 shadow-lg w-100" style={{
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '20px',
                    maxWidth: '1000px'
                  }}>
                    <Card.Header className="border-0 bg-transparent text-center py-4">
                      <h3 className={`mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`} style={{
                        fontFamily: '"Fjalla One", sans-serif',
                        letterSpacing: '1px'
                      }}>
                        INFORMACIÓN DETALLADA DEL CLIENTE
                      </h3>
                    </Card.Header>
                    <Card.Body className="p-4 p-md-5">
                       <Row className="mb-4">
                         <Col xs={12} className="text-center mb-4">
                          <Card.Title as="h4" className={isDarkMode ? 'text-light' : 'text-dark'} style={{
                            fontWeight: '600',
                            fontSize: '1.8rem'
                          }}>
                            <FaUser className="me-3 text-primary" />
                             {clienteEncontrado.nombre}
                           </Card.Title>
                         </Col>
                       </Row>
                       {/* Mostrar estado de la cuenta */}
                       <Row className="justify-content-center mb-4">
                         <Col xs={12} className="text-center">
                           {clienteEncontrado.estado === "Activo" ? (
                             <Badge bg="success" pill style={{
                               fontSize: '1.1rem',
                               padding: '10px 20px'
                             }}>
                               <FaCheckCircle className="me-2" /> Cuenta Activa
                             </Badge>
                           ) : (
                             <Badge bg="danger" pill style={{
                               fontSize: '1.1rem',
                               padding: '10px 20px'
                             }}>
                               <FaTimesCircle className="me-2" /> Cuenta Vencida
                             </Badge>
                           )}
                         </Col>
                       </Row>
                       <Row className="justify-content-center">
                         <Col xs={12} md={5} className="mb-3">
                           <Form.Group className="mb-4">
                            <Form.Label className={`fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'} d-flex align-items-center justify-content-center`} style={{
                              fontSize: '1.1rem',
                              marginBottom: '15px'
                            }}>
                              <FaUser className="me-2 text-primary" />
                               Nombre Completo
                             </Form.Label>
                             <Form.Control
                               plaintext
                               readOnly
                               defaultValue={clienteEncontrado.nombre}
                               className="text-center"
                              style={{
                                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                                border: 'none',
                                borderRadius: '15px',
                                padding: '15px 20px',
                                color: isDarkMode ? 'white' : 'dark',
                                fontSize: '1.2rem',
                                fontWeight: '500'
                              }}
                             />
                           </Form.Group>
                         </Col>
                         
                         <Col xs={12} md={2} className="d-none d-md-flex align-items-center justify-content-center mb-3">
                           <div style={{
                             width: '2px',
                             height: '80px',
                             background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                             borderRadius: '1px'
                           }}></div>
                         </Col>
                         
                         <Col xs={12} md={5} className="mb-3">
                           <Form.Group className="mb-4">
                            <Form.Label className={`fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'} d-flex align-items-center justify-content-center`} style={{
                              fontSize: '1.1rem',
                              marginBottom: '15px'
                            }}>
                              <FaIdCard className="me-2 text-info" />
                               DNI
                             </Form.Label>
                             <Form.Control
                               plaintext
                               readOnly
                               defaultValue={clienteEncontrado.dni}
                               className="text-center"
                              style={{
                                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                                border: 'none',
                                borderRadius: '15px',
                                padding: '15px 20px',
                                color: isDarkMode ? 'white' : 'dark',
                                fontSize: '1.2rem',
                                fontWeight: '500'
                              }}
                             />
                           </Form.Group>
                         </Col>
                       </Row>
                       <Row className="justify-content-center mt-4">
                         <Col xs={12} md={6}>
                           <Form.Group className="text-center">
                            <Form.Label className={`fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'} d-flex align-items-center justify-content-center`} style={{
                              fontSize: '1.1rem',
                              marginBottom: '15px'
                            }}>
                              <FaCalendarAlt className="me-2 text-warning" />
                               Fecha de Inicio
                             </Form.Label>
                             <Form.Control
                               plaintext
                               readOnly
                               defaultValue={
                                 clienteEncontrado.fechaInicio ||
                                 "No disponible"
                               }
                               className="text-center"
                              style={{
                                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                                border: 'none',
                                borderRadius: '15px',
                                padding: '15px 20px',
                                color: isDarkMode ? 'white' : 'dark',
                                fontSize: '1.2rem',
                                fontWeight: '500'
                              }}
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
