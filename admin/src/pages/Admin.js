import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import MenuBar from '../components/MenuBar';

const Admin = () => {
  return (
    <Container>
        <Row className='mt-2'>
          <Col md={3}>
            <MenuBar />
          </Col>
          <Col md={9}>
            
          </Col>
        </Row>
    </Container>
  );
}

export default Admin;