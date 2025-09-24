import React, { useState } from "react";
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
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser, FaSearch, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const PagePrincipal = () => {
  const [searchDNI, setSearchDNI] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const clienteEncontrado = clientes.find(
      (cliente) => cliente.dni === searchDNI
    );
    setClienteSeleccionado(clienteEncontrado || null);
    setMostrarResultados(true);
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column">
      <Row className="flex-grow-1">
        <Col xs={2} className="h-100 p-0 ">
          <Navbar bg="dark" variant="dark" className="d-flex flex-column h-100">
            <Container fluid className="d-flex flex-column h-100">
              <Navbar.Brand className="p-3 w-100">
                <h3 className="fw-bold text-success">HULK GYM</h3>
                <Nav className="flex-column w-100 mt-4">
                  <Nav.Link className="text-primary d-flex align-items-center px-0">
                    <FaUser className="me-2" />
                    <span>Clientes</span>
                  </Nav.Link>
                </Nav>
              </Navbar.Brand>
            </Container>
          </Navbar>
        </Col>

        <Col className="h-100 text-center">
          <Container fluid className="w- p-4">
            <Row>
              <Col xs={12}>
                <h2 className="mb-4">Gestión de Clientes</h2>
              </Col>

              <Col xs={12} lg={6} className="mb-3">
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por DNI"
                      value={searchDNI}
                      onChange={(e) => setSearchDNI(e.target.value)}
                    />
                    <Button variant="primary" type="submit">
                      <FaSearch />
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              <Col xs={6} lg={3} className="mb-3">
                <Form.Select>
                  <option>Nombre</option>
                </Form.Select>
              </Col>
              <Col xs={6} lg={3} className="mb-3">
                <Form.Select>
                  <option>Tipo de membresía</option>
                </Form.Select>
              </Col>

              <Col xs={12} className="mb-4">
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Membresía</th>
                      <th>Vencimiento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostrarResultados ? (
                      clienteSeleccionado ? (
                        <tr>
                          <td>{clienteSeleccionado.nombre}</td>
                          <td>{clienteSeleccionado.dni}</td>
                          <td>{clienteSeleccionado.membresia}</td>
                          <td>{clienteSeleccionado.vencimiento}</td>
                          <td>
                            {clienteSeleccionado.estado === "Activo" ? (
                              <Stack
                                direction="horizontal"
                                gap={1}
                                className="text-success"
                              >
                                <FaCheckCircle /> <span>Activo</span>
                              </Stack>
                            ) : (
                              <Stack
                                direction="horizontal"
                                gap={1}
                                className="text-danger"
                              >
                                <FaTimesCircle /> <span>Vencida</span>
                              </Stack>
                            )}
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No se encontraron resultados para el DNI ingresado.
                          </td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Ingresa un DNI para conocer el estado de cuenta
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>

              {clienteSeleccionado && (
                <Col xs={12}>
                  <Card border="0" className="shadow-sm">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Card.Title as="h4">
                            {clienteSeleccionado.nombre}
                          </Card.Title>
                        </Col>
                        <Col md={6} className="text-md-end">
                          <Card.Title as="h4">
                            Información de membresía
                          </Card.Title>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">
                              Nombre
                            </Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.nombre}
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="text-muted">DNI</Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.dni}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted">
                              Membresía
                            </Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={clienteSeleccionado.membresia}
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="text-muted">
                              Fecha de inicio
                            </Form.Label>
                            <Form.Control
                              plaintext
                              readOnly
                              defaultValue={
                                clienteSeleccionado.fechaInicio ||
                                "No disponible"
                              }
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
