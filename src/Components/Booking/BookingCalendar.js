import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import BookingDetailsModal from './BookingDetailsModal';
import BookingModal from '../Booking/BookingModal';
import './BookingCalendar.css'; // We will convert this to Tailwind.

const localizer = momentLocalizer(moment);

const BookingCalendar = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchBookedDays = async () => {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookedDays = querySnapshot.docs
      .map(doc => {
        const booking = doc.data();

        // Check if the booking is active (ignore if 'active' is NO, No, or no)
        if (booking.active && ['NO', 'No', 'no'].includes(booking.active)) {
          return null; // Exclude the booking if it's not active
        }

        const rentTime = moment(booking.bookingDetails.rentDate).format('HH:mm');
        const returnTime = moment(booking.bookingDetails.returnDate).format('HH:mm');
        return {
          id: doc.id,
          title: `${booking.bookingDetails.vehicle} - ${rentTime} | ${returnTime}`,
          start: new Date(booking.bookingDetails.rentDate),
          end: new Date(booking.bookingDetails.returnDate),
          bookingData: booking // Store booking data here
        };
      })
      .filter(booking => booking !== null); // Filter out null (inactive) bookings

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
    const backgroundColor = isPastEvent ? '#F87171' : '#3B82F6'; // Red for past events, blue for upcoming
    return {
      style: {
        backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        fontSize: '0.875rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        whiteSpace: 'normal', // Allow wrapping of event titles
        textOverflow: 'clip', // Prevent text clipping
        overflow: 'visible',  // Make sure text flows outside the container if needed
        wordWrap: 'break-word', // Ensure long titles wrap to the next line
      },
    };
  };

  return (
    <div className="p-4 max-w-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '700px', borderRadius: '0.75rem', maxWidth: '100%' }} // Tailwind 'rounded-lg'
        views={['month', 'week', 'day']}
        defaultView="month"
        onSelectEvent={handleSelectEvent}
        onDoubleClickEvent={handleDoubleClickSlot}
        eventPropGetter={eventPropGetter}
        firstDay={1}  // Start the week on Monday
        popup={true} // Enable popup when there are too many events
      />
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          onClose={handleCloseModal}
          booking={selectedBooking.bookingData}
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