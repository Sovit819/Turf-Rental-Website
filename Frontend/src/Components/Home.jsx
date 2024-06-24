import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/turfsDetails/');
        setTurfs(response.data); 
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch turfs. Please try again later.');
        setLoading(false);
      }
    };

    fetchTurfs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!Array.isArray(turfs) || turfs.length === 0) {
    return <div>No turfs available</div>;
  }

  return (
    <div className="container mt-4" style={{ marginTop: '80px' }}>
      <h2>Turfs</h2>
      <div className="row">
        {turfs.map(turf => (
          <div key={turf.id} className="col-md-4 mb-4">
            <div className="card h-100">
              {turf.turf_images.length > 0 && (
                <img
                  src={turf.turf_images[0].image.startsWith('http') ? turf.turf_images[0].image : `http://127.0.0.1:8000${turf.turf_images[0].image}`}
                  alt={turf.name}
                  className='card-img-top'
                />
              )}
              <div className="card-body">
                <h3 className="card-title text-center">{turf.name}</h3>
                <p className="card-text">{turf.description}</p>
                <Link to={`/turf/${turf.id}`} className="btn btn-primary w-100">
                  See Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
