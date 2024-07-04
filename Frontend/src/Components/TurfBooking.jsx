import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import CustomDatePicker from '../Utils/CustomDatePicker';
import AuthContext from '../Context/AuthContext'; // Assuming you have an AuthContext for user authentication

function TurfBooking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Access user details from context (assuming you have this context)

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [loading, setLoading] = useState(false); // To manage loading state
    const [errorMessage, setErrorMessage] = useState(''); // To display error message

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        const formattedDate = selectedDate ? formatDate(selectedDate) : null;

        // Check availability before proceeding with booking
        const availabilityCheckData = {
            turf: id,
            date: formattedDate,
            start_time: selectedStartTime,
            end_time: selectedEndTime
        };

        try {
            setLoading(true); // Set loading state while waiting for response
            setErrorMessage(''); // Clear previous error message

            const availabilityResponse = await axios.post('http://127.0.0.1:8000/api/availability/', availabilityCheckData);

            if (availabilityResponse.status === 200) {
                // Proceed with saving the booking
                const bookingData = {
                    user: user.id, // Assuming user.id is available from context
                    phone_number: user.phone_number, // Assuming user.phone_number is available from context
                    turf: id,
                    date: formattedDate,
                    start_time: selectedStartTime,
                    end_time: selectedEndTime
                };
                console.log(bookingData);

                const saveBookingResponse = await axios.post('http://127.0.0.1:8000/api/bookings/', bookingData);

                if (saveBookingResponse.status === 201) {
                    // Successfully saved booking
                    navigate(`/turf/${id}/payment`);
                } else {
                    // Handle booking save failure
                    alert('Failed to save booking. Please try again.');
                }
            } else {
                // Handle availability check failure
                setErrorMessage('Slot not available. Please choose another time.');
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                console.error('Error booking:', error);
                alert('An error occurred while booking. Please try again.');
            }
        } finally {
            setLoading(false); // Reset loading state after request completes
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleBooking} className="container-without-background shadow-lg mt-2 p-3">
                <div className="form-group mb-2">
                    <label>Select Date:</label>
                    <CustomDatePicker
                        selectedDate={selectedDate}
                        onChange={date => setSelectedDate(date)}
                    />
                </div>
                <div className="form-group mb-2">
                    <label>From:</label>
                    <input
                        type="time"
                        className="form-control"
                        value={selectedStartTime}
                        placeholder="HH:mm (e.g., 4:00, 4:15, 4:30, 4:45)"
                        onChange={(e) => setSelectedStartTime(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>To:</label>
                    <input
                        type="time"
                        className="form-control"
                        value={selectedEndTime}
                        placeholder="HH:mm (e.g., 4:00, 4:15, 4:30, 4:45)"
                        onChange={(e) => setSelectedEndTime(e.target.value)}
                    />
                </div>

                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}

                <div className='text-center'>
                    <button
                        type="submit"
                        className="btn btn-primary btn-block mt-3 mb-2"
                        style={{ backgroundColor: 'green', borderColor: 'green' }}
                        disabled={!selectedDate || !selectedStartTime || !selectedEndTime || loading} // Disable button during loading
                    >
                        {loading ? 'Booking...' : 'Book Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TurfBooking;
