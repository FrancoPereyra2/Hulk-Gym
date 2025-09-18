import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="d-flex align-items-center justify-content-center vh-100 bg-light p-3 overflow-hidden">
      <Card className="shadow border-0 rounded-3" style={{ maxWidth: '600px', width: '100%' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h1 className="fw-bold text-success" style={{ letterSpacing: '1px' }}>HULK GYM</h1>
            <p className="text-muted fs-5">Registro de nuevo usuario</p>
          </div>
          
          <Form>
            {/* Formulario de registro */}
            <Button 
              variant="secondary" 
              className="mt-3"
              onClick={() => navigate('/')}
            >
              Volver al login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Registro;
