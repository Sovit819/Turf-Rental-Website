import React from 'react'
import { Link } from 'react-router-dom'
import turfs from '../data/turfs'

const Home = () => {
  return (
    <div className="container text-center mt-4">
      <h2>Turf Booking</h2>
      <div className="row">

        {turfs.map(turf => (
          <div key={turf.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img src={turf.images[0]} alt={turf.name} className="card-img-top" />
              <div className="card-body">
                <h3 className="card-title">{turf.name}</h3>
                <p className="card-text">{turf.description}</p>
                <p className="font-weight-bold mt-2">{turf.price}</p>
                <Link to={`/turf/${turf.id}`}>
                  <button className="btn btn-primary w-100">Book Now</button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
