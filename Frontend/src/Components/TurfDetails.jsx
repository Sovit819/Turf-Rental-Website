import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
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
            <div className="carousel-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Your Carousel Component */}
                <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
                    <div className="carousel-inner">
                        {turf.images.map((image, index) => (
                            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                <img src={image} className="d-block w-100" alt={`Slide ${index}`} style={{ maxWidth: '100%', height: 'auto' }} />
                            </div>
                        ))}
                    </div>
                    {/* Carousel Controls */}
                    <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="sr-only">Previous</span>
                    </a>
                    <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="sr-only">Next</span>
                    </a>
                </div>
            </div>

            <div className="container-without-background" style={{ maxWidth: '900px', margin: '0 auto' }}>
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
