import { Container, Row, Col } from "react-bootstrap";

export default function AuthLayout({ children }) {
  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">

      <Row className="w-100">

        <Col
          xs={12}
          sm={10}
          md={6}
          lg={4}
          className="mx-auto bg-white p-4 rounded shadow-sm"
        >
          {children}
        </Col>

      </Row>

    </Container>
  );
}