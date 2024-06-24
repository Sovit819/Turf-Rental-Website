// TurfBooking.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomDatePicker from '../Utils/CustomDatePicker';

function TurfBooking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);

    const handleBooking = (e) => {
        e.preventDefault();
        const newSlot = { start: selectedStartTime, end: selectedEndTime, date: selectedDate };
        setBookedSlots([...bookedSlots, newSlot]);
        navigate(`/turf/${id}/payment`); // Navigate to payment after booking
    };

    const isSlotAvailable = (start, end, date) => {
        return !bookedSlots.some(slot =>
            slot.date === date &&
            ((start >= slot.start && start < slot.end) ||
                (end > slot.start && end <= slot.end))
        );
    };

    return (
        <div className="container">
            <form onSubmit={handleBooking} className="container-without-background shadow-lg mt-2 p-3">
                <div className="form-group mb-2">
                    <label>Select Date: </label>
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

                <div className='text-center'>
                <button
                    type="submit"
                    className="btn btn-primary btn-block  mt-3 mb-2 "
                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                    disabled={!selectedDate || !selectedStartTime || !selectedEndTime || !isSlotAvailable(selectedStartTime, selectedEndTime, selectedDate)}
                >
                    Book Now
                </button>
                </div>
            </form>

        </div>
    );
}

export default TurfBooking;
