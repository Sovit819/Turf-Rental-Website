import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import turfs from '../data/turfs';

function TurfDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const turf = turfs.find(t => t.id === parseInt(id));

  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleBooking = (e) => {
    e.preventDefault();
    const newSlot = { start: selectedStartTime, end: selectedEndTime };
    setBookedSlots([...bookedSlots, newSlot]);
    navigate('/payment'); 
  };

  const isSlotAvailable = (start, end) => {
    return !bookedSlots.some(slot => 
      (start >= slot.start && start < slot.end) || 
      (end > slot.start && end <= slot.end)
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((currentImageIndex - 1 + turf.images.length) % turf.images.length);
  };

  const nextImage = () => {
    setCurrentImageIndex((currentImageIndex + 1) % turf.images.length);
  };

  return (
    <div className="container text-center mt-4">
      {/* Small Container for Carousel */}
      <div className="carousel-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Bootstrap Carousel */}
        <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
          <div className="carousel-inner">
            {turf.images.map((image, index) => (
              <div key={index} className={`carousel-item ${index === currentImageIndex ? 'active' : ''}`}>
                <img src={image} className="d-block w-100" alt={`Slide ${index}`} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            ))}
          </div>
          <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev" onClick={prevImage}>
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="sr-only">Previous</span>
          </a>
          <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next" onClick={nextImage}>
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="sr-only">Next</span>
          </a>
        </div>
      </div>

      <h2>{turf.name}</h2>
      <p>{turf.description}</p>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>From:</label>
              <input type="time" className="form-control" value={selectedStartTime} onChange={(e) => setSelectedStartTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label>To:</label>
              <input type="time" className="form-control" value={selectedEndTime} onChange={(e) => setSelectedEndTime(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block mb-4" disabled={!selectedStartTime || !selectedEndTime || !isSlotAvailable(selectedStartTime, selectedEndTime)}>
              Book Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TurfDetails;
