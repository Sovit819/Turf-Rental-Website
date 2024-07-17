import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../Context/AuthContext';
import Pagination from 'react-bootstrap/Pagination';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10); // Number of bookings per page
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchBookingHistory = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/booking-history/?user_id=${user.id}&ordering=-date`);
                console.log('API response:', response.data);

                if (Array.isArray(response.data)) {
                    setBookings(response.data);
                } else {
                    setError('Unexpected response format');
                }
            } catch (error) {
                setError('Error fetching booking history');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, [user.id]);

    // Pagination logic
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-5" style={{ color: 'red' }}>{error}</div>;
    }

    if (!Array.isArray(bookings) || bookings.length === 0) {
        return <div className="text-center mt-5">No bookings available</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Booking History</h2>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Serial No.</th>
                        <th>Turf ID</th>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Amount</th>
                        <th>Payment Status</th>
                        <th>Booking Date</th>
                    </tr>
                </thead>
                <tbody>
                    {currentBookings.map((booking, index) => (
                        <tr key={booking.id}>
                            <td>{indexOfFirstBooking + index + 1}</td>
                            <td>{booking.turf}</td>
                            <td>{booking.date}</td>
                            <td>{booking.start_time}</td>
                            <td>{booking.end_time}</td>
                            <td>{booking.amount}</td>
                            <td>{booking.payment_status}</td>
                            <td>{booking.booking_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                <Pagination>
                    {Array.from({ length: Math.ceil(bookings.length / bookingsPerPage) }, (_, index) => (
                        <Pagination.Item key={index + 1} onClick={() => paginate(index + 1)} active={index + 1 === currentPage}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
        </div>
    );
};

export default BookingHistory;
