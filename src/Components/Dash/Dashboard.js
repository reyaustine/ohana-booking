import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../Navigation/Sidebar/Sidebar';
import BookingModal from '../Booking/BookingModal';
import BookingDetailsModal from '../Booking/BookingDetailsModal';
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
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userAvatars, setUserAvatars] = useState({});
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const itemsPerPage = 5;
  const location = useLocation();
  const [sortConfig, setSortConfig] = useState({ key: 'bookingID', direction: 'descending' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);

  const fetchUserAvatars = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const avatars = {};
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      avatars[doc.id] = data.photoURL;
    });
    setUserAvatars(avatars);
  };

  const fetchDashboardData = async () => {
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const bookings = bookingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter out inactive bookings
    const activeBookings = bookings.filter(booking => booking.active !== 'NO');

    setAllBookings(activeBookings);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysBookingsCount = activeBookings.filter((booking) => {
      const rentDate = new Date(booking.bookingDetails.rentDate);
      return rentDate >= today && rentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length;
    setTodaysBookings(todaysBookingsCount);

    const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
    const vehicleNames = vehiclesSnapshot.docs.map((doc) => doc.data().name);
    const bookedCarsCount = activeBookings.filter((booking) => {
      const rentDate = new Date(booking.bookingDetails.rentDate);
      const returnDate = new Date(booking.bookingDetails.returnDate);
      return rentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000) && returnDate >= today;
    }).length;
    setAvailableCars(vehicleNames.length - bookedCarsCount);

    const totalRevenueSum = activeBookings.reduce((sum, booking) => {
      return sum + parseFloat(booking.bookingDetails.totalFee || 0);
    }, 0);
    setTotalRevenue(totalRevenueSum);

    applySortingAndPagination(activeBookings);
  };

  const applySortingAndPagination = (bookings) => {
    const sortedBookings = [...bookings].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setTotalPages(Math.ceil(sortedBookings.length / itemsPerPage));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage);

    const formattedBookings = paginatedBookings.map((booking) => ({
      ...booking,
      rentDateTime: new Date(booking.bookingDetails.rentDate).toLocaleString(),
      returnDateTime: new Date(booking.bookingDetails.returnDate).toLocaleString(),
    }));

    setRecentBookings(formattedBookings);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value[key], obj);
  };

  useEffect(() => {
    fetchUserAvatars();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    applySortingAndPagination(allBookings);
  }, [currentPage, sortConfig]);

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
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

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsBookingDetailsModalOpen(true);
  };

  const closeBookingDetailsModal = () => {
    setIsBookingDetailsModalOpen(false);
    setSelectedBooking(null);
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
                      <th onClick={() => requestSort('bookingID')}>Booking ID</th>
                      <th onClick={() => requestSort('renterDetails.name')}>Customer</th>
                      <th onClick={() => requestSort('bookingDetails.vehicle')}>Vehicle</th>
                      <th onClick={() => requestSort('bookingDetails.rentDate')}>Rent Date & Time</th>
                      <th onClick={() => requestSort('bookingDetails.returnDate')}>Return Date & Time</th>
                      <th onClick={() => requestSort('status')}>Status</th>
                      <th>Booked by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => {
                      const status = booking.status || 'Unknown';

                      return (
                        <tr key={booking.bookingID} onClick={() => handleBookingClick(booking)}>
                          <td>{booking.bookingID}</td>
                          <td>{booking.renterDetails.name}</td>
                          <td>{booking.bookingDetails.vehicle}</td>
                          <td>{booking.rentDateTime}</td>
                          <td>{booking.returnDateTime}</td>
                          <td>
                            <span className={`status ${status.toLowerCase()}`}>
                              {status}
                            </span>
                          </td>
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
                      );
                    })}
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
        refreshBookings={fetchDashboardData}
      />

      <BookingDetailsModal
        isOpen={isBookingDetailsModalOpen}
        onClose={closeBookingDetailsModal}
        booking={selectedBooking}
        refreshBookings={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;