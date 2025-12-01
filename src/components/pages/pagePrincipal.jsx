import React, { useState, useEffect, useCallback } from "react";
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
  Offcanvas,
  Badge,
  Modal,
  Alert,
  ListGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser, FaSearch, FaCheckCircle, FaTimesCircle, FaBars, FaTimes, FaDumbbell, FaMoon, FaSun, FaUserCheck, FaCalendarAlt, FaIdCard, FaUsers, FaEnvelope, FaBell, FaHistory, FaExclamationTriangle, FaDollarSign } from "react-icons/fa";
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

  // Nuevos estados para el sistema de notificaciones
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailHistory, setEmailHistory] = useState(() => {
    const savedHistory = localStorage.getItem('emailHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [cuentasVencidas, setCuentasVencidas] = useState([]);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);

  // Nuevo estado para información del cliente logueado
  const [clienteLogueado, setClienteLogueado] = useState(null);

  // Nuevo estado para tokens de activación
  const [tokensActivacion, setTokensActivacion] = useState(() => {
    const savedTokens = localStorage.getItem('tokensActivacion');
    return savedTokens ? JSON.parse(savedTokens) : [];
  });

  // Función para determinar si la membresía está vencida
  const calcularEstado = (vencimiento) => {
    if (!vencimiento) return "Expirada";
    const hoy = new Date();
    // Suponiendo formato DD/MM/YYYY
    const [dia, mes, anio] = vencimiento.split("/");
    const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
    return fechaVencimiento >= hoy ? "Activo" : "Expirada";
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

  // Función mejorada para envío de email real
  const enviarEmail = async (cliente, tipo = 'vencimiento') => {
    try {
      console.log('🚀 Iniciando simulación de envío de email a:', cliente.nombre);
      
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nuevoEmail = {
        id: Date.now(),
        clienteNombre: cliente.nombre,
        clienteDNI: cliente.dni,
        clienteEmail: cliente.email || `${cliente.dni}@gmail.com`,
        tipo: tipo,
        fechaEnvio: new Date().toLocaleString('es-AR'),
        estado: 'Simulado',
        error: null,
        asunto: tipo === 'vencimiento' ? 'Membresía Vencida - HULK GYM' : 'Recordatorio de Vencimiento - HULK GYM',
        metodo: 'Simulación'
      };

      const nuevoHistorial = [...emailHistory, nuevoEmail];
      setEmailHistory(nuevoHistorial);
      localStorage.setItem('emailHistory', JSON.stringify(nuevoHistorial));
      
      return nuevoEmail;
    } catch (error) {
      console.error('❌ Error en envío de email:', error);
      
      const emailError = {
        id: Date.now(),
        clienteNombre: cliente.nombre,
        clienteDNI: cliente.dni,
        clienteEmail: cliente.email || `${cliente.dni}@gmail.com`,
        tipo: tipo,
        fechaEnvio: new Date().toLocaleString('es-AR'),
        estado: 'Error',
        error: error.message,
        asunto: tipo === 'vencimiento' ? 'Membresía Vencida - HULK GYM' : 'Recordatorio de Vencimiento - HULK GYM',
        metodo: 'Error'
      };

      const nuevoHistorial = [...emailHistory, emailError];
      setEmailHistory(nuevoHistorial);
      localStorage.setItem('emailHistory', JSON.stringify(nuevoHistorial));
      
      return emailError;
    }
  };

  // Función para verificar cuentas vencidas
  const verificarCuentasVencidas = () => {
    const hoy = new Date();
    const vencidas = clientes.filter(cliente => {
      if (!cliente.vencimiento) return true;
      const [dia, mes, anio] = cliente.vencimiento.split("/");
      const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
      return fechaVencimiento < hoy;
    });
    
    setCuentasVencidas(vencidas);
    return vencidas;
  };

  // Función mejorada para enviar notificaciones masivas REALES
  const enviarNotificacionesMasivas = async () => {
    const vencidas = verificarCuentasVencidas();
    
    if (vencidas.length === 0) {
      alert('No hay cuentas vencidas para notificar.');
      return;
    }

    const confirmar = window.confirm(
      `📧 ¿Enviar notificaciones a ${vencidas.length} clientes con cuentas vencidas?\n\n⚠️ Esto es una simulación.`
    );

    if (!confirmar) return;

    alert('🚀 Iniciando envío de notificaciones...');

    setShowNotificationAlert(true);
    
    try {
      // Filtrar clientes que no han recibido email en 24h
      const clientesParaNotificar = [];
      const ahora = new Date();
      const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
      
      for (const cliente of vencidas) {
        const ultimoEmail = emailHistory
          .filter(email => email.clienteDNI === cliente.dni && (email.estado === 'Enviado' || email.estado === 'Simulado'))
          .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))[0];
        
        if (!ultimoEmail || new Date(ultimoEmail.fechaEnvio) < hace24h) {
          clientesParaNotificar.push(cliente);
        }
      }

      if (clientesParaNotificar.length === 0) {
        alert('Todos los clientes ya fueron notificados en las últimas 24 horas.');
        setShowNotificationAlert(false);
        return;
      }

      let exitosos = 0;
      let errores = 0;

      // Enviar emails con progreso
      for (let i = 0; i < clientesParaNotificar.length; i++) {
        const cliente = clientesParaNotificar[i];
        try {
          console.log(`📧 Enviando ${i + 1}/${clientesParaNotificar.length}: ${cliente.nombre}`);
          
          const resultado = await enviarEmail(cliente, 'vencimiento');
          
          if (resultado.estado === 'Simulado') {
            exitosos++;
            console.log(`✅ Enviado a ${cliente.nombre}`);
          } else {
            errores++;
            console.log(`❌ Error enviando a ${cliente.nombre}`);
          }
          
          // Delay entre emails
          if (i < clientesParaNotificar.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error('❌ Error enviando a:', cliente.nombre, error);
          errores++;
        }
      }
      
      const mensaje = `🎉 PROCESO COMPLETADO:\n\n✅ ${exitosos} notificaciones enviadas\n❌ ${errores} errores`;
      
      alert(mensaje);
      
    } catch (error) {
      console.error('❌ Error en notificaciones masivas:', error);
      alert('❌ Error en el proceso. Ver consola para detalles.');
    }
    
    setTimeout(() => setShowNotificationAlert(false), 2000);
  };

  // Función para reenviar email de activación
  const reenviarEmailActivacion = useCallback(async (cliente) => {
    if (cliente.cuentaActivada) {
      alert('Esta cuenta ya está activada.');
      return;
    }

    try {
      // Generar nuevo token simulado
      const nuevoToken = Math.random().toString(36).substring(2, 15);
      const tokenData = {
        token: nuevoToken,
        clienteId: cliente.id,
        clienteDNI: cliente.dni,
        clienteEmail: cliente.email,
        fechaCreacion: new Date().toISOString(),
        usado: false,
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Marcar tokens anteriores como expirados
      setTokensActivacion(prev => prev.map(t => 
        t.clienteId === cliente.id ? { ...t, usado: true } : t
      ));

      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTokensActivacion(prev => [...prev, tokenData]);
      alert(`Email de activación simulado enviado a ${cliente.email}`);

    } catch (error) {
      console.error('Error al reenviar email:', error);
      alert('Error al reenviar el email de activación.');
    }
  }, []);

  // Verificar cuentas vencidas al cargar el componente
  useEffect(() => {
    verificarCuentasVencidas();
  }, [clientes]);

  // Cargar información del cliente si es tipo 'cliente'
  useEffect(() => {
    if (userType === 'cliente') {
      const userEmail = localStorage.getItem('userEmail');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === userEmail && u.role === 'cliente');
      
      if (user && user.clienteId) {
        const savedClientes = localStorage.getItem('clientes');
        if (savedClientes) {
          const clientes = JSON.parse(savedClientes);
          const cliente = clientes.find(c => c.id === user.clienteId && c.cuentaActivada);
          if (cliente) {
            setClienteLogueado(cliente);
          }
        }
      }
    }
  }, [userType]);

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
            {userType === 'cliente' ? 'Panel de Cliente' : 'Panel Administrativo'}
          </p>
          
          <Nav className="flex-column w-100">
            {/* Opciones de navegación */}
            <Nav.Link 
              className={`d-flex align-items-center mb-2 ${isDarkMode ? 'text-info' : 'text-primary'}`}
              style={{
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                padding: '12px 16px',
                backgroundColor: isDarkMode ? 'rgba(13, 202, 240, 0.1)' : 'rgba(0, 123, 255, 0.1)'
              }}
              onClick={() => navigate(userType === 'admin' ? '/admin' : '/principal')}
            >
              <FaUsers className="me-2" />
              <span>{userType === 'cliente' ? 'Mi Estado de Cuenta' : 'Consultar Clientes'}</span>
            </Nav.Link>
            
            <Nav.Link 
              className={`d-flex align-items-center mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`}
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

  return (
    <Container fluid className="d-flex flex-column p-0" style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%)',
      minHeight: '100vh'
    }}>
      {/* Alerta de notificaciones */}
      {showNotificationAlert && (
        <Alert 
          variant="success" 
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 9999, width: 'auto' }}
        >
          <FaBell className="me-2" />
          Enviando notificaciones a cuentas vencidas...
        </Alert>
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
            <FaHistory className="me-2" />
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
                <FaExclamationTriangle className="me-2 text-warning" />
                Cuentas Vencidas Actuales: <Badge bg="danger">{cuentasVencidas.length}</Badge>
              </h6>
              <Button 
                variant="warning" 
                size="sm" 
                onClick={enviarNotificacionesMasivas}
                disabled={cuentasVencidas.length === 0}
              >
                <FaBell className="me-1" />
                Notificar Vencidas
              </Button>
            </Col>
          </Row>
          
          {emailHistory.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaEnvelope size={40} className="mb-2" />
              <p className="mb-0">No se han enviado emails aún</p>
            </Alert>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <ListGroup>
                {emailHistory
                  .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))
                  .map((email) => (
                    <ListGroup.Item 
                      key={email.id}
                      style={{
                        background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                        color: isDarkMode ? 'white' : 'dark',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <FaUser className="me-2 text-primary" />
                            {email.clienteNombre}
                          </h6>
                          <p className="mb-1 small">
                            <FaIdCard className="me-1 text-muted" />
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
                        <div className="text-end">
                          <Badge 
                            bg={email.tipo === 'vencimiento' ? 'danger' : 'warning'}
                            className="mb-2"
                          >
                            {email.tipo === 'vencimiento' ? 'Vencida' : 'Recordatorio'}
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
                                <FaBell className="me-1" />
                                Simulado
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="me-1" />
                                Error
                              </>
                            )}
                          </Badge>
                          {email.metodo && (
                            <div className="mt-1">
                              <small className="text-muted">
                                Método: {email.metodo}
                              </small>
                            </div>
                          )}
                          {email.error && (
                            <div className="mt-1">
                              <small className="text-muted" title={email.error}>
                                {email.error.substring(0, 30)}...
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
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
              </div>
            </Container>
          </Navbar>

          {/* Contenido de la página */}
          <Container fluid className="p-3 p-lg-5" style={{ minHeight: '100vh' }}> {/* Más padding en desktop */}
            {/* Header con botón de tema - MÁS GRANDE EN DESKTOP */}
            <Row className="mb-3 mb-lg-4">
              <Col className="d-flex justify-content-end">
                <Button 
                  variant={isDarkMode ? "outline-light" : "outline-dark"}
                  size="sm"
                  onClick={alternarTema}
                  className="d-none d-md-flex align-items-center border-0"
                  style={{
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    padding: '10px 20px' // Más padding en desktop
                  }}
                >
                  {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
                </Button>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                {/* HEADER MÁS GRANDE EN DESKTOP */}
                <div className="text-center mb-4 mb-lg-5">
                  <h1 className="fw-bold mb-2 mb-lg-3" style={{
                    background: isDarkMode 
                      ? 'linear-gradient(45deg, #60a5fa, #34d399, #fbbf24)'
                      : 'linear-gradient(45deg, #1e40af, #059669, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Fjalla One", sans-serif',
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' // Responsivo
                  }}>
                    {userType === 'cliente' && clienteLogueado ? 'MI ESTADO DE CUENTA' : 'GESTIÓN DE CLIENTES'}
                  </h1>
                  <p className={`mb-0 ${isDarkMode ? 'text-light opacity-75' : 'text-muted'}`} style={{
                    fontSize: 'clamp(0.9rem, 2vw, 1.2rem)' // Responsivo
                  }}>
                    {userType === 'cliente' && clienteLogueado 
                      ? `Bienvenido ${clienteLogueado.nombre}` 
                      : 'Busca y consulta el estado de las membresías'}
                  </p>
                </div>
              </Col>

              {/* Vista para cliente logueado - DISEÑO MEJORADO */}
              {userType === 'cliente' && clienteLogueado ? (
                <Col xs={12} lg={10} xl={9} className="mx-auto mb-4">
                  <Card className="border-0 shadow-lg overflow-hidden" style={{
                    background: isDarkMode 
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px'
                  }}>
                    {/* Header sin gradiente violeta - diseño limpio */}
                    <div style={{
                      background: isDarkMode
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.02)',
                      padding: '3rem 2rem',
                      borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                      <Row className="align-items-center">
                        <Col xs={12} md={8}>
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white shadow-lg" 
                              style={{ 
                                width: "100px",
                                height: "100px",
                                fontWeight: 700, 
                                fontSize: '2.5rem'
                              }}
                            >
                              {clienteLogueado.nombre ? clienteLogueado.nombre.charAt(0).toUpperCase() : <FaUser />}
                            </div>
                            <div className="ms-4">
                              <h2 className={`${isDarkMode ? 'text-light' : 'text-dark'} fw-bold mb-2`} style={{
                                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)'
                              }}>
                                {clienteLogueado.nombre}
                              </h2>
                              <p className={`${isDarkMode ? 'text-light' : 'text-muted'} mb-0`} style={{
                                fontSize: '1.1rem'
                              }}>
                                DNI: {clienteLogueado.dni}
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
                          {calcularEstado(clienteLogueado.vencimiento) === "Activo" ? (
                            <Badge bg="success" pill className="px-4 py-3 shadow" style={{ 
                              fontSize: '1.1rem',
                              fontWeight: '600'
                            }}>
                              <FaCheckCircle className="me-2" size={18} /> 
                              Membresía Activa
                            </Badge>
                          ) : (
                            <Badge bg="danger" pill className="px-4 py-3 shadow" style={{ 
                              fontSize: '1.1rem',
                              fontWeight: '600'
                            }}>
                              <FaTimesCircle className="me-2" size={18} /> 
                              Membresía Expirada
                            </Badge>
                          )}
                        </Col>
                      </Row>
                    </div>

                    <Card.Body className="p-4 p-lg-5">
                      {/* Grid de información con diseño mejorado y mejor espaciado */}
                      <Row className="g-3 g-lg-4 mb-4">
                        {/* Email */}
                        <Col xs={12} md={6}>
                          <div 
                            className={`h-100 p-4 rounded-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}
                            style={{
                              transition: 'all 0.3s ease',
                              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-8px)';
                              e.currentTarget.style.boxShadow = isDarkMode 
                                ? '0 12px 24px rgba(0,0,0,0.4)' 
                                : '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                <FaEnvelope className="text-info" size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">Email</p>
                                <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.95rem' }}>
                                  {clienteLogueado.email || 'No registrado'}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        {/* Fecha de Inicio */}
                        <Col xs={12} md={6}>
                          <div 
                            className={`h-100 p-4 rounded-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}
                            style={{
                              transition: 'all 0.3s ease',
                              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-8px)';
                              e.currentTarget.style.boxShadow = isDarkMode 
                                ? '0 12px 24px rgba(0,0,0,0.4)' 
                                : '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                <FaCalendarAlt className="text-success" size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">Fecha de Inicio</p>
                                <h6 className="mb-0 fw-bold">
                                  {clienteLogueado.fechaInicio || "N/A"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        {/* Fecha de Vencimiento */}
                        <Col xs={12} md={6}>
                          <div 
                            className={`h-100 p-4 rounded-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}
                            style={{
                              transition: 'all 0.3s ease',
                              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-8px)';
                              e.currentTarget.style.boxShadow = isDarkMode 
                                ? '0 12px 24px rgba(0,0,0,0.4)' 
                                : '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                <FaCalendarAlt className="text-warning" size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">Vencimiento</p>
                                <h6 className="mb-0 fw-bold">
                                  {clienteLogueado.vencimiento || "N/A"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        {/* Estado de Cuenta */}
                        <Col xs={12} md={6}>
                          <div 
                            className={`h-100 p-4 rounded-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}
                            style={{
                              transition: 'all 0.3s ease',
                              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-8px)';
                              e.currentTarget.style.boxShadow = isDarkMode 
                                ? '0 12px 24px rgba(0,0,0,0.4)' 
                                : '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                <FaUserCheck className="text-info" size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">Estado de Cuenta</p>
                                <h6 className="mb-0 fw-bold">
                                  {clienteLogueado.estadoCuenta || "Activo"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>

                        {/* Días Restantes */}
                        <Col xs={12}>
                          <div 
                            className={`h-100 p-4 rounded-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}
                            style={{
                              transition: 'all 0.3s ease',
                              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-8px)';
                              e.currentTarget.style.boxShadow = isDarkMode 
                                ? '0 12px 24px rgba(0,0,0,0.4)' 
                                : '0 12px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div className={`rounded-circle ${
                                (() => {
                                  if (!clienteLogueado.vencimiento) return 'bg-secondary';
                                  try {
                                    const [dia, mes, anio] = clienteLogueado.vencimiento.split("/");
                                    const fechaVenc = new Date(anio, mes - 1, dia);
                                    const hoy = new Date();
                                    const diff = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
                                    if (diff > 7) return 'bg-success';
                                    if (diff > 0) return 'bg-warning';
                                    return 'bg-danger';
                                  } catch {
                                    return 'bg-secondary';
                                  }
                                })()
                              } bg-opacity-10 p-3 me-3`}>
                                <FaCalendarAlt className={
                                  (() => {
                                    if (!clienteLogueado.vencimiento) return 'text-secondary';
                                    try {
                                      const [dia, mes, anio] = clienteLogueado.vencimiento.split("/");
                                      const fechaVenc = new Date(anio, mes - 1, dia);
                                      const hoy = new Date();
                                      const diff = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
                                      if (diff > 7) return 'text-success';
                                      if (diff > 0) return 'text-warning';
                                      return 'text-danger';
                                    } catch {
                                      return 'text-secondary';
                                    }
                                  })()
                                } size={24} />
                              </div>
                              <div className="flex-grow-1">
                                <p className="text-muted mb-1 small">Días Restantes</p>
                                <h6 className="mb-0 fw-bold">
                                  {(() => {
                                    if (!clienteLogueado.vencimiento) return 'N/A';
                                    try {
                                      const [dia, mes, anio] = clienteLogueado.vencimiento.split("/");
                                      const fechaVenc = new Date(anio, mes - 1, dia);
                                      const hoy = new Date();
                                      const diff = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
                                      return diff > 0 ? `${diff} días` : 'Expirada';
                                    } catch {
                                      return 'N/A';
                                    }
                                  })()}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Alerta de estado mejorada */}
                      <Alert 
                        variant={calcularEstado(clienteLogueado.vencimiento) === "Activo" ? "success" : "danger"}
                        className="mb-0 border-0 shadow-sm"
                        style={{
                          borderRadius: '16px',
                          background: calcularEstado(clienteLogueado.vencimiento) === "Activo"
                            ? isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)'
                            : isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        <div className="d-flex align-items-start">
                          {calcularEstado(clienteLogueado.vencimiento) === "Activo" ? 
                            <FaCheckCircle size={28} className="me-3 text-success flex-shrink-0" /> : 
                            <FaTimesCircle size={28} className="me-3 text-danger flex-shrink-0" />
                          }
                          <div>
                            <h5 className="mb-2 fw-bold">
                              {calcularEstado(clienteLogueado.vencimiento) === "Activo" 
                                ? "¡Tu membresía está activa!" 
                                : "Tu membresía ha expirado"}
                            </h5>
                            <p className="mb-0">
                              {calcularEstado(clienteLogueado.vencimiento) === "Activo" 
                                ? "Continúa disfrutando de todos nuestros servicios y mantente en forma. ¡Sigue así!" 
                                : "Contacta al gimnasio para renovar tu membresía y seguir entrenando con nosotros."}
                            </p>
                          </div>
                        </div>
                      </Alert>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
                // Vista original para admin y búsqueda - TAMBIÉN MEJORADA
                <>
                  <Col xs={12} lg={10} xl={8} className="mx-auto"> {/* Centrado en desktop */}
                    {/* Sección de búsqueda - MÁS GRANDE */}
                    <Card className="border-0 shadow-lg mb-4" style={{
                      background: isDarkMode 
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(255,255,255,0.98)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '24px'
                    }}>
                      <Card.Body className="p-4 p-lg-5">
                        <h4 className={`mb-4 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                          <FaSearch className="me-2" />
                          Buscar Cliente
                        </h4>
                        <Form onSubmit={handleSearch}>
                          <InputGroup size="lg">
                            <InputGroup.Text className={isDarkMode ? 'bg-dark border-0 text-light' : 'bg-white border-0'}>
                              <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Ingresa el DNI del cliente..."
                              value={searchDNI}
                              onChange={handleSearchInputChange}
                              className={isDarkMode ? 'bg-dark border-0 text-light' : 'border-0'}
                              style={{
                                fontSize: '1.1rem',
                                padding: '15px'
                              }}
                            />
                            <Button 
                              variant="primary" 
                              type="submit"
                              style={{ 
                                border: 'none',
                                padding: '0 30px',
                                fontSize: '1.1rem'
                              }}
                            >
                              Buscar
                            </Button>
                          </InputGroup>
                        </Form>
                      </Card.Body>
                    </Card>

                    {/* Tabla de resultados - MÁS ESPACIOSA */}
                    <Card className="border-0 shadow-lg mb-4" style={{
                      background: isDarkMode 
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(255,255,255,0.98)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '24px'
                    }}>
                      <Card.Body className="p-4 p-lg-5">
                        <h4 className={`mb-4 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                          <FaUserCheck className="me-2" />
                          Resultados
                        </h4>
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead style={{
                              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                            }}>
                              <tr>
                                <th className="p-3 fs-6">Nombre</th>
                                <th className="p-3 fs-6">DNI</th>
                                <th className="p-3 fs-6 d-none d-md-table-cell">Vencimiento</th>
                                <th className="p-3 fs-6">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {busquedaRealizada ? (
                                clienteEncontrado ? (
                                  <tr>
                                    <td className="p-3">{clienteEncontrado.nombre}</td>
                                    <td className="p-3">{clienteEncontrado.dni}</td>
                                    <td className="p-3 d-none d-md-table-cell">
                                      {clienteEncontrado.vencimiento}
                                    </td>
                                    <td className="p-3">
                                      <Badge 
                                        bg={clienteEncontrado.estado === "Activo" ? "success" : "danger"}
                                        pill
                                        className="px-3 py-2"
                                      >
                                        {clienteEncontrado.estado === "Activo" ? "Activo" : "Expirada"}
                                      </Badge>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr>
                                    <td colSpan="4" className="text-center p-5 text-muted">
                                      <FaTimesCircle size={48} className="mb-3" />
                                      <p className="mb-0 fs-5">No se encontraron resultados</p>
                                    </td>
                                  </tr>
                                )
                              ) : (
                                <tr>
                                  <td colSpan="4" className="text-center p-5 text-muted">
                                    <FaSearch size={48} className="mb-3" />
                                    <p className="mb-0 fs-5">Ingresa un DNI para buscar</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>

                    {/* Información del cliente encontrado - MÁS ESPACIOSA */}
                    {clienteEncontrado && (
                      <Card className="border-0 shadow-lg" style={{
                        background: isDarkMode 
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(255,255,255,0.98)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px'
                      }}>
                        <Card.Body className="p-4 p-lg-5">
                          <h3 className={`mb-4 text-center ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                            {clienteEncontrado.nombre}
                          </h3>
                          
                          <Row className="g-3 g-lg-4">
                            <Col xs={6} md={4}>
                              <div className={`p-3 p-lg-4 rounded-3 text-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
                                <FaIdCard className="text-primary mb-2" size={28} />
                                <small className="text-muted d-block mb-1">DNI</small>
                                <strong className="fs-5">{clienteEncontrado.dni}</strong>
                              </div>
                            </Col>
                            <Col xs={6} md={4}>
                              <div className={`p-3 p-lg-4 rounded-3 text-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
                                <FaEnvelope className="text-info mb-2" size={28} />
                                <small className="text-muted d-block mb-1">Email</small>
                                <strong className="fs-6">{clienteEncontrado.email || 'N/A'}</strong>
                              </div>
                            </Col>
                            <Col xs={6} md={4}>
                              <div className={`p-3 p-lg-4 rounded-3 text-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
                                <FaCalendarAlt className="text-success mb-2" size={28} />
                                <small className="text-muted d-block mb-1">Inicio</small>
                                <strong className="fs-6">{clienteEncontrado.fechaInicio || 'N/A'}</strong>
                              </div>
                            </Col>
                            <Col xs={6} md={4}>
                              <div className={`p-3 p-lg-4 rounded-3 text-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
                                <FaCalendarAlt className="text-warning mb-2" size={28} />
                                <small className="text-muted d-block mb-1">Vencimiento</small>
                                <strong className="fs-6">{clienteEncontrado.vencimiento}</strong>
                              </div>
                            </Col>
                            <Col xs={6} md={4}>
                              <div className={`p-3 p-lg-4 rounded-3 text-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
                                <small className="text-muted d-block mb-2">Estado</small>
                                <Badge bg={clienteEncontrado.estado === "Activo" ? "success" : "danger"} className="px-3 py-2 fs-6">
                                  {clienteEncontrado.estado}
                                </Badge>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                </>
              )}
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default PagePrincipal;
