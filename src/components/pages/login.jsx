import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const HulkGymLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('danger');
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trim básico - quitar espacios
    const usuarioSinEspacios = username.trim();
    const passwordSinEspacios = password.trim();

    // Validación simple
    if (!usuarioSinEspacios || !passwordSinEspacios) {
      setAlertVariant('danger');
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    // Credenciales fijas
    if (usuarioSinEspacios === 'admin' && passwordSinEspacios === 'admin123') {
      // Es un administrador
      localStorage.setItem('userType', 'admin');
      setAlertVariant('success');
      setAlertMessage('¡Bienvenido Administrador!');
      setShowAlert(true);
      navigate('/admin');
    } 
    else if (usuarioSinEspacios === 'cliente' && passwordSinEspacios === 'cliente123') {
      // Es un cliente
      localStorage.setItem('userType', 'cliente');
      setAlertVariant('success');
      setAlertMessage('¡Bienvenido Cliente!');
      setShowAlert(true);
      navigate('/principal');
    }
    else {
      // Credenciales incorrectas
      setAlertVariant('danger');
      setAlertMessage('Usuario o contraseña incorrectos');
      setShowAlert(true);
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center vh-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h1 className="text-success fw-bold">HULK GYM</h1>
                <p className="text-muted">Inicia sesión para continuar</p>
              </div>
              
              {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                  {alertMessage}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                
                <Button variant="success" type="submit" className="w-100 py-2">
                  INGRESAR
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HulkGymLogin;