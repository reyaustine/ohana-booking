import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './BookingCalendar.css';
import BookingDetailsModal from './BookingDetailsModal';
import BookingModal from '../Booking/BookingModal';

const localizer = momentLocalizer(moment);

const BookingCalendar = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchBookedDays = async () => {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookedDays = querySnapshot.docs.map(doc => {
      const booking = doc.data();
      const rentTime = moment(booking.bookingDetails.rentDate).format('HH:mm');
      const returnTime = moment(booking.bookingDetails.returnDate).format('HH:mm');
      return {
        id: doc.id,
        title: `Time: ${rentTime} | Return: ${returnTime} ${booking.renterDetails.name} ${booking.bookingDetails.vehicle}`,
        start: new Date(booking.bookingDetails.rentDate),
        end: new Date(booking.bookingDetails.returnDate),
        bookingData: booking // Store booking data here
      };
    });
    setEvents(bookedDays);
  };

  useEffect(() => {
    fetchBookedDays();
  }, []);

  const refreshBookings = () => {
    fetchBookedDays();
  };

  const handleSelectEvent = (event) => {
    const booking = events.find(booking => booking.id === event.id);
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const handleDoubleClickSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setIsBookingModalOpen(true);
  };

  const handleBookingModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedDate(null);
  };

  const eventPropGetter = (event) => {
    const isPastEvent = moment(event.end).isBefore(moment());
    const backgroundColor = isPastEvent ? '#d9534f' : '#3174ad'; // Red for past events, blue for upcoming and current events
    return {
      style: {
        backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        fontSize: '0.8em',
        padding: '2px 5px',
      },
    };
  };

  return (
    <div className="booking-calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '700px' }}
        views={['month', 'week', 'day']}
        defaultView="month"
        onSelectEvent={handleSelectEvent}
        onDoubleClickEvent={handleDoubleClickSlot}
        eventPropGetter={eventPropGetter}
        firstDay={1}  // Start the week on Monday
      />
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          onClose={handleCloseModal}
          booking={selectedBooking.bookingData} // Pass booking data to the modal
          refreshBookings={refreshBookings}
          currentUser={currentUser}
        />
      )}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleBookingModalClose}
        currentUser={currentUser}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default BookingCalendar;
