import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../Navigation/Sidebar/Sidebar';
import BookingModal from '../Booking/BookingModal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import NoteList from './NoteList';
import { useUser } from '../../Contexts/UserContext';

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/bookings':
      return 'Bookings';
    case '/vehicles':
      return 'Vehicles';
    case '/customers':
      return 'Customers';
    case '/reports':
      return 'Reports';
    case '/settings':
      return 'Settings';
    default:
      return 'Dashboard';
  }
};

const Dashboard = () => {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalDate, setBookingModalDate] = useState(null);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [availableCars, setAvailableCars] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userAvatars, setUserAvatars] = useState({});
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const itemsPerPage = 5;
  const location = useLocation();

  const fetchUserAvatars = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const avatars = {};
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      avatars[doc.id] = data.photoURL;
    });
    setUserAvatars(avatars);
  };

  const fetchDashboardData = async (page) => {
    // Fetch all bookings
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const bookings = bookingsSnapshot.docs.map((doc) => doc.data());

    // Filter Today's Bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysBookingsCount = bookings.filter((booking) => {
      const rentDate = new Date(booking.bookingDetails.rentDate);
      return rentDate >= today && rentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length;
    setTodaysBookings(todaysBookingsCount);

    // Calculate Available Cars
    const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
    const vehicleNames = vehiclesSnapshot.docs.map((doc) => doc.data().name);
    const bookedCarsCount = bookings.filter((booking) => {
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
      .map((booking) => ({
        ...booking,
        status: 'Confirmed',
        rentDateTime: new Date(booking.bookingDetails.rentDate).toLocaleString(),
        returnDateTime: new Date(booking.bookingDetails.returnDate).toLocaleString(),
      }));
    setTotalPages(Math.ceil(recentBookingsData.length / itemsPerPage));
    const startIndex = (page - 1) * itemsPerPage;
    setRecentBookings(recentBookingsData.slice(startIndex, startIndex + itemsPerPage));
  };

  useEffect(() => {
    fetchUserAvatars();
    fetchDashboardData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchDashboardData(1);
  }, [location]);

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    // Reset top bar data when a new user is logged in
    if (user) {
      setUserAvatars({});
      fetchUserAvatars();
    }
  }, [user]);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openBookingModal = (date) => {
    setBookingModalDate(date);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingModalDate(null);
  };

  return (
    <div className="dashboard">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <header className="top-bar">
          <h2>{pageTitle}</h2>
          <div className="user-menu">
            {user?.photoURL && (
              <img 
                src={user.photoURL} 
                alt="User Avatar" 
                className="avatar" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
            </div>
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
                <NoteList />
              </div>

              <div className="recent-bookings">
                <h3>Recent Bookings</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Rent Date & Time</th>
                      <th>Return Date & Time</th>
                      <th>Status</th>
                      <th>Booked by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.bookingID}>
                        <td>{booking.bookingID}</td>
                        <td>{booking.renterDetails.name}</td>
                        <td>{booking.bookingDetails.vehicle}</td>
                        <td>{booking.rentDateTime}</td>
                        <td>{booking.returnDateTime}</td>
                        <td><span className="status confirmed">{booking.status}</span></td>
                        <td>
                          {userAvatars[booking.savedBy?.email] && (
                            <img 
                              src={userAvatars[booking.savedBy.email]} 
                              alt={`Booked by ${booking.savedBy?.email || 'Unknown'}`} 
                              className="booker-avatar"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </td>
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