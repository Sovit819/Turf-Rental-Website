import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal, Carousel } from 'react-bootstrap';
import turfs from '../data/turfs';
import TurfBooking from './TurfBooking'; // Adjust the import path as needed

function TurfDetails() {
    const { id } = useParams();
    const turf = turfs.find(t => t.id === parseInt(id));

    const [showModal, setShowModal] = useState(false);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    return (
        <div className="container text-center mt-4">
            <div className="carousel-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
                {/* Using React Bootstrap Carousel for smoother transitions */}
                <Carousel fade>
          {turf.images.map((image, index) => (
            <Carousel.Item key={index}>
              <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
                <img
                  src={image}
                  className="d-block w-100"
                  alt={`Slide ${index}`}
                  style={{height: '100%', objectFit:'cover'}}
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
            </div>

            <div className="container-without-background" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <h2>{turf.name}</h2>
                <p>{turf.description}</p>
                <p>Price: ${turf.price}</p>
                <Button variant="primary" onClick={handleShow}>
                    Select Time Slot
                </Button>
            </div>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Book Your Slot</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TurfBooking handleClose={handleClose} />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default TurfDetails;
