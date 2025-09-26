import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const HulkGymLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación simple
    if (!username || !password) {
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    // Credenciales fijas
    if (username === 'admin' && password === 'admin123') {
      // Es un administrador
      localStorage.setItem('userType', 'admin');
      setAlertMessage('¡Bienvenido Administrador!');
      setShowAlert(true);
      setTimeout(() => navigate('/admin'), 1000);
    } 
    else if (username === 'cliente' && password === 'cliente123') {
      // Es un cliente
      localStorage.setItem('userType', 'cliente');
      setAlertMessage('¡Bienvenido Cliente!');
      setShowAlert(true);
      setTimeout(() => navigate('/principal'), 1000);
    }
    else {
      // Credenciales incorrectas
      setAlertMessage('Usuario o contraseña incorrectos');
      setShowAlert(true);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100 ">
      <Card className='w-25 border-0 shadow p-3'>
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="text-success">HULK GYM</h1>
            <p>Inicia sesión para continuar</p>
          </div>
          
          {showAlert && (
            <Alert variant={alertMessage.includes('Bienvenido') ? 'success' : 'danger'}>
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
            
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            
            <Button variant="success" type="submit" className="w-100">
              INGRESAR
            </Button>
            
            <div className="mt-3 text-center">
              <small className="text-muted">
                Admin: admin / admin123<br/>
                Cliente: cliente / cliente123
              </small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HulkGymLogin;