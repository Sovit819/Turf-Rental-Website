import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import CustomDatePicker from '../Utils/CustomDatePicker';
import AuthContext from '../Context/AuthContext';

function TurfBooking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('esewa');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [message, setMessage] = useState('');

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        const formattedDate = selectedDate ? formatDate(selectedDate) : null;

        const availabilityCheckData = {
            turf: id,
            date: formattedDate,
            start_time: selectedStartTime,
            end_time: selectedEndTime
        };

        try {
            setLoading(true);
            setErrorMessage('');

            const availabilityResponse = await axios.post('http://127.0.0.1:8000/api/availability/', availabilityCheckData);

            if (availabilityResponse.status === 200) {
                const bookingData = {
                    user_id: user.id,
                    phone_number: user.phone_number,
                    turf_id: id,
                    date: formattedDate,
                    start_time: selectedStartTime,
                    end_time: selectedEndTime,
                    payment_method: paymentMethod
                };

                if (paymentMethod === 'cash') {
                    const cashPaymentResponse = await axios.post('http://127.0.0.1:8000/api/initiate-payment/', bookingData);

                    if (cashPaymentResponse.status === 201) {
                        setMessage('Booking Successful with Cash Payment');
                        navigate(`/user/${user.id}/bookingHistory`);
                    } else {
                        setErrorMessage('Failed to book with cash payment. Please try again.');
                    }
                } 
                
                else if(paymentMethod === 'esewa') {
                    const initiatePaymentResponse = await axios.post('http://127.0.0.1:8000/api/initiate-payment/', bookingData);

                    if (initiatePaymentResponse.status === 200) {
                        const esewaRedirectUrl = initiatePaymentResponse.data.redirectUrl;
                        window.location.href = esewaRedirectUrl; 
                        
                    } else {
                        setErrorMessage('Failed to initiate payment with Esewa. Please try again.');
                    }
                }
            } else {
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
            setLoading(false);
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

                <div className="form-group mb-2">
                    <label>Payment Method:</label>
                    <select
                        className="form-control"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="esewa">eSewa</option>
                        <option value="cash">Cash</option>
                    </select>
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
                        disabled={!selectedDate || !selectedStartTime || !selectedEndTime || loading}
                    >
                        {loading ? 'Processing...' : 'Book Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TurfBooking;
