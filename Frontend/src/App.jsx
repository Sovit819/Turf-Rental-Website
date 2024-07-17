import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './Context/AuthContext';

import PrivateRoute from './Utils/PrivateRoute';

import Header from './Components/layout/Header';
import Signup from './Components/user/Signup';
import Signin from './Components/user/Signin';
import Home from './Components/Home';
import Footer from './Components/layout/Footer';
import TurfDetails from './Components/TurfDetails';
import TurfBooking from './Components/TurfBooking';
import BookingHistory from './Components/BookingHistory';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path='/signin' element={<Signin />} />
              <Route path='/signup' element={<Signup />} />
              <Route path='/' element={<Home />} />
              <Route path='/turf/:id' element={<TurfDetails />} />
              <Route path="/turf/:id/booking"
                element={<PrivateRoute element={<TurfBooking />} />}
              />
              
              <Route path ='/user/:id/bookingHistory'
                element ={<PrivateRoute element={<BookingHistory/>}/>}
              />
              
              
            </Routes>
          </main>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
