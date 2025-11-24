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
  Modal,
  Alert,
  ListGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser, FaSearch, FaCheckCircle, FaTimesCircle, FaBars, FaTimes, FaDumbbell, FaMoon, FaSun, FaUserCheck, FaCalendarAlt, FaIdCard, FaHome, FaUsers, FaCog, FaChartBar, FaEnvelope, FaBell, FaHistory, FaExclamationTriangle } from "react-icons/fa";
import { useTheme } from './admin.jsx';
import { enviarEmailReal, isEmailConfigured } from '../../services/emailService.js';

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
      console.log('🚀 Iniciando envío de email REAL a:', cliente.nombre);
      const resultadoReal = await enviarEmailReal(cliente, tipo);
      
      const nuevoEmail = {
        id: Date.now(),
        clienteNombre: cliente.nombre,
        clienteDNI: cliente.dni,
        clienteEmail: cliente.email || `${cliente.dni}@gmail.com`,
        tipo: tipo,
        fechaEnvio: new Date().toLocaleString('es-AR'),
        estado: resultadoReal.success ? 'Enviado' : 'Error',
        error: resultadoReal.error || null,
        asunto: tipo === 'vencimiento' ? 'Membresía Vencida - HULK GYM' : 'Recordatorio de Vencimiento - HULK GYM',
        metodo: resultadoReal.success ? 'EmailJS-Real' : 'Error',
        messageId: resultadoReal.messageId || null
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

    // Verificar configuración
    const configured = isEmailConfigured();
    if (!configured) {
      alert('⚠️ EmailJS NO está configurado.\n\nPara enviar emails REALES:\n1. Ejecuta: npm install @emailjs/browser\n2. Crea cuenta en emailjs.com\n3. Configura tus credenciales en src/services/emailService.js');
      return;
    }

    const confirmar = window.confirm(
      `📧 ¿Enviar emails REALES a ${vencidas.length} clientes con cuentas vencidas?\n\n⚠️ Esto enviará emails reales a las direcciones de correo registradas.`
    );

    if (!confirmar) return;

    alert('🚀 Iniciando envío de emails REALES...\nEsto puede tomar varios minutos. Revisa la consola para ver el progreso.');

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

      // Enviar emails REALES con progreso
      for (let i = 0; i < clientesParaNotificar.length; i++) {
        const cliente = clientesParaNotificar[i];
        try {
          console.log(`📧 Enviando ${i + 1}/${clientesParaNotificar.length}: ${cliente.nombre}`);
          
          const resultado = await enviarEmail(cliente, 'vencimiento');
          
          if (resultado.estado === 'Enviado') {
            exitosos++;
            console.log(`✅ Enviado a ${cliente.nombre}`);
          } else {
            errores++;
            console.log(`❌ Error enviando a ${cliente.nombre}`);
          }
          
          // Delay más largo para emails reales
          if (i < clientesParaNotificar.length - 1) {
            console.log('⏳ Esperando 4 segundos antes del siguiente email...');
            await new Promise(resolve => setTimeout(resolve, 4000));
          }
        } catch (error) {
          console.error('❌ Error enviando a:', cliente.nombre, error);
          errores++;
        }
      }
      
      const mensaje = `🎉 PROCESO COMPLETADO:\n\n✅ ${exitosos} emails REALES enviados\n❌ ${errores} errores\n\nRevisa la bandeja de entrada de los clientes y tu consola EmailJS para confirmar la entrega.`;
      
      alert(mensaje);
      
    } catch (error) {
      console.error('❌ Error en notificaciones masivas:', error);
      alert('❌ Error en el proceso. Ver consola para detalles.');
    }
    
    setTimeout(() => setShowNotificationAlert(false), 2000);
  };

  // Verificar cuentas vencidas al cargar el componente
  useEffect(() => {
    verificarCuentasVencidas();
  }, [clientes]);

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

            <Nav.Link 
              className={`d-flex align-items-center text-center mb-2 ${isDarkMode ? 'text-light' : 'text-dark'}`}
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
                  variant="outline-warning"
                  size="sm"
                  onClick={() => setShowEmailModal(true)}
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
                  <FaEnvelope size={14} className="me-1" />
                  Emails
                  {cuentasVencidas.length > 0 && (
                    <Badge bg="danger" className="ms-1">{cuentasVencidas.length}</Badge>
                  )}
                </Button>
                
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
                                      <FaTimesCircle className="me-1" /> Expirada
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
                               <FaTimesCircle className="me-2" /> Cuenta Expirada
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
