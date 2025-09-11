import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
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
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="justify-content-center">
        <Col xs={12}>
          <Card className="shadow border-0 mx-5" style={{ maxWidth: 900, width: '100%', borderRadius: '18px' }}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h1 className="fw-bold mb-3" style={{ color: '#228B22', fontSize: '2rem', letterSpacing: '1px' }}>
                  HULK GYM
                </h1>
                <p className="text-muted mb-0">Bienvenido a Hulk Gym</p>
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
                  <Form.Label className="fw-medium mb-2">Usuario</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="hulkgym@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '12px', borderRadius: '8px' }}
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium mb-2">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '12px', borderRadius: '8px' }}
                  />
                </Form.Group>
                <div className="d-flex justify-content-around gap-3">
                  <Button
                    variant="success"
                    type="submit"
                    className="fw-bold py-2"
                    style={{
                      backgroundColor: '#228B22',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    INGRESAR
                  </Button>
                  <Button
                    variant="success"
                    type="button"
                    className="fw-bold py-2"
                    style={{
                      backgroundColor: '#228B22',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    REGISTRARSE
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HulkGymLogin;