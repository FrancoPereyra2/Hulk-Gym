import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const HulkGymLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setAlertMessage('Por favor, completa todos los campos');
      setShowAlert(true);
      return;
    }

    setAlertMessage('¡Inicio de sesión exitoso! Redirigiendo...');
    setShowAlert(true);
    setEmail('');
    setPassword('');
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100 px-3 px-sm-4">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4}>
          <Card className="shadow border-0 rounded-3 w-100 bg-white">
            <Card.Body className="p-3 p-sm-4 p-md-5 d-flex flex-column justify-content-center">
              <div className="text-center mb-4">
                <h1 className="fw-bold text-success lh-1">HULK GYM</h1>
                <p className="text-muted fs-5">Bienvenido a Hulk Gym</p>
              </div>
              
              {showAlert && (
                <Alert
                  variant={alertMessage.includes('éxito') ? 'success' : 'danger'}
                  dismissible
                  onClose={() => setShowAlert(false)}
                  className="mb-3"
                >
                  {alertMessage}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium mb-2 fs-5">Usuario</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="hulkgym@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium mb-2 fs-5">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                <Row className="justify-content-center">
                  <Col xs={12} sm={10} md={8}>
                    <Button
                      variant="success"
                      type="submit"
                      className="w-100 fw-bold py-2 text-nowrap d-flex justify-content-center align-items-center"
                      size="lg"
                    >
                      INGRESAR
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HulkGymLogin;