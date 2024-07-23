// src/Components/Booking/BookingCalendar.js

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookingCalendar.css';

const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch booked days from an API or static data
    const bookedDays = [
      {
        title: 'Booked',
        start: new Date(2024, 6, 20),
        end: new Date(2024, 6, 20),
      },
      {
        title: 'Booked',
        start: new Date(2024, 6, 22),
        end: new Date(2024, 6, 23),
      },
    ];
    setEvents(bookedDays);
  }, []);

  return (
    <div className="booking-calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </div>
  );
};

export default BookingCalendar;
