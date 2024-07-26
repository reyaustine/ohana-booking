import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../Navigation/Sidebar/Sidebar';
import BookingModal from '../Booking/BookingModal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import NoteList from './NoteList'; // Ensure you import the NoteList component

const Dashboard = ({ currentUser }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalDate, setBookingModalDate] = useState(null);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [availableCars, setAvailableCars] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const location = useLocation();

  const fetchDashboardData = async (page) => {
    // Fetch all bookings
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const bookings = bookingsSnapshot.docs.map(doc => doc.data());

    // Filter Today's Bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysBookingsCount = bookings.filter(booking => {
      const rentDate = new Date(booking.bookingDetails.rentDate);
      return rentDate >= today && rentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length;
    setTodaysBookings(todaysBookingsCount);

    // Calculate Available Cars
    const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
    const vehicleNames = vehiclesSnapshot.docs.map(doc => doc.data().name);
    const bookedCarsCount = bookings.filter(booking => {
      const rentDate = new Date(booking.bookingDetails.rentDate);
      const returnDate = new Date(booking.bookingDetails.returnDate);
      return rentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000) && returnDate >= today;
    }).length;
    setAvailableCars(vehicleNames.length - bookedCarsCount);

    // Calculate Total Revenue
    const totalRevenueSum = bookings.reduce((sum, booking) => {
      return sum + parseFloat(booking.bookingDetails.totalFee || 0);
    }, 0);
    setTotalRevenue(totalRevenueSum);

    // Get Recent Bookings
    const recentBookingsData = bookings
      .sort((a, b) => new Date(b.bookingDetails.rentDate) - new Date(a.bookingDetails.rentDate))
      .map(booking => ({ ...booking, status: 'Confirmed' }));
    setTotalPages(Math.ceil(recentBookingsData.length / itemsPerPage));
    const startIndex = (page - 1) * itemsPerPage;
    setRecentBookings(recentBookingsData.slice(startIndex, startIndex + itemsPerPage));
  };

  useEffect(() => {
    fetchDashboardData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchDashboardData(1); // Reset to first page when location changes to ensure data is always fresh
  }, [location]);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const openBookingModal = (date) => {
    setBookingModalDate(date);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingModalDate(null);
  };

  const user = currentUser || { name: 'User' };

  return (
    <div className="dashboard">
      <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="top-bar">
          <h2>Dashboard</h2>
          <div className="user-menu">
            <img src="user-avatar.jpg" alt="User Avatar" className="avatar" />
            <span>{user.name}</span>
          </div>
        </header>

        <section className="dashboard-content">
          {location.pathname === '/' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Today's Bookings</h3>
                  <p className="stat-value">{todaysBookings}</p>
                </div>
                <div className="stat-card">
                  <h3>Available Cars</h3>
                  <p className="stat-value">{availableCars}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${totalRevenue}</p>
                </div>
                <NoteList /> {/* Add the NoteList component */}
              </div>

              <div className="recent-bookings">
                <h3>Recent Bookings</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(booking => (
                      <tr key={booking.bookingID}>
                        <td>{booking.bookingID}</td>
                        <td>{booking.renterDetails.name}</td>
                        <td>{booking.bookingDetails.vehicle}</td>
                        <td>{new Date(booking.bookingDetails.rentDate).toLocaleDateString()}</td>
                        <td><span className="status confirmed">{booking.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                  <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
          <Outlet />
        </section>
      </main>

      <button className="fab" onClick={() => openBookingModal(null)}>
        <i className="fas fa-plus"></i>
        <span>Book</span>
      </button>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        currentUser={user}
        selectedDate={bookingModalDate}
        refreshBookings={() => fetchDashboardData(currentPage)}
      />
    </div>
  );
};

export default Dashboard;