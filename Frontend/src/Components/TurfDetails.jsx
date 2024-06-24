import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Modal, Carousel } from 'react-bootstrap';
import TurfBooking from './TurfBooking'; // Adjust the import path as needed

const TurfDetails = () => {
  const { id } = useParams();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/turfsDetails/${id}/`);
        setTurf(response.data);
        setLoading(false);
      } catch (error) {
        setError('Turf details not found.');
        setLoading(false);
      }
    };

    fetchTurf();
  }, [id]);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!turf) {
    return <div>No turf details available</div>;
  }

  return (
    <div className="container text-center mt-4">
      <div className="carousel-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <Carousel fade>
          {turf.turf_images.map((imageObj, index) => (
            <Carousel.Item key={index}>
              <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
                <img
                  src={imageObj.image.startsWith('http') ? imageObj.image : `http://127.0.0.1:8000${imageObj.image}`}
                  className="d-block w-100"
                  alt={`Slide ${index}`}
                  style={{ height: '100%', objectFit: 'cover' }}
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      <div className="container-without-background mb-4" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <h2>{turf.name}</h2>
        <p>{turf.description}</p>
        <p>Price: {turf.price}</p>
        <Button variant="primary" onClick={handleShow}>
          Select the Slot
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
