import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../services/adminService';
import { functionHallService } from '../services/functionHallService';
import { eventService } from '../services/eventService';
import { locationService } from '../services/locationService';
import { bookingService } from '../services/bookingService';
import { venueService } from '../services/venueService';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || 'overview'); // overview, halls, events, locations, bookings, users, reviews
  const [toastMessage, setToastMessage] = useState(null);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('All');

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const [stats, setStats] = useState(null);
  const [halls, setHalls] = useState([]);
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hall Modal (Add / Edit)
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [hallForm, setHallForm] = useState({
    name: '',
    description: '',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    area: 'Vijayawada',
    fullAddress: '',
    capacity: 1000,
    price: 50000,
    type: 'Banquet Hall',
    acType: 'Central AC',
    parking: '150+ Cars',
    stage: '40x25 ft Grand Stage',
    catering: 'In-House & Outside Allowed',
    images: '',
    availableTimeSlots: 'Morning Slot (08:00 AM - 02:00 PM), Evening Slot (04:00 PM - 10:00 PM), Full Day Slot (08:00 AM - 11:00 PM)',
    facilities: 'Central Air Conditioning, 24x7 Power Backup, Grand Stage, Valet Parking, Green Rooms',
  });

  // Event Modal (Add / Edit)
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    organizer: 'Event Pro Management',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    venue: '',
    location: '',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    area: 'Vijayawada',
    capacity: 500,
    price: 499,
    registrationDeadline: new Date().toISOString().split('T')[0],
    contactEmail: 'admin@eventpro.com',
    image: '',
  });

  // Location Form
  const [locForm, setLocForm] = useState({
    state: '',
    district: '',
    areas: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, hallsRes, eventsRes, locRes, bookRes, usersRes, venuesRes] = await Promise.all([
        adminService.getStats(),
        functionHallService.getFunctionHalls({ limit: 100 }),
        eventService.getEvents({ limit: 100 }),
        locationService.getHierarchy(),
        bookingService.getAllBookings({ limit: 100 }),
        adminService.getUsers(),
        venueService.getMyVenues(),
      ]);

      setStats(statsRes.data);
      setHalls(hallsRes.data || []);
      setEvents(eventsRes.data || []);
      setLocations(locRes.raw || []);
      setBookings(bookRes.data || []);
      setUsers(usersRes.data || []);
      setVenues(venuesRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hall Handlers
  const handleOpenHallModal = (hall = null) => {
    if (hall) {
      setEditingHall(hall);
      setHallForm({
        name: hall.name,
        description: hall.description,
        state: hall.state,
        district: hall.district,
        area: hall.area,
        fullAddress: hall.fullAddress,
        capacity: hall.capacity,
        price: hall.price,
        type: hall.type,
        acType: hall.acType,
        parking: hall.parking || '',
        stage: hall.stage || '',
        catering: hall.catering || '',
        images: hall.images?.join(', ') || '',
        availableTimeSlots: hall.availableTimeSlots?.join(', ') || '',
        facilities: hall.facilities?.join(', ') || '',
      });
    } else {
      setEditingHall(null);
      setHallForm({
        name: '',
        description: '',
        state: 'Andhra Pradesh',
        district: 'Krishna',
        area: 'Vijayawada',
        fullAddress: '',
        capacity: 1000,
        price: 50000,
        type: 'Banquet Hall',
        acType: 'Central AC',
        parking: '150+ Cars',
        stage: '40x25 ft Grand Stage',
        catering: 'In-House & Outside Allowed',
        images: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        availableTimeSlots: 'Morning Slot (08:00 AM - 02:00 PM), Evening Slot (04:00 PM - 10:00 PM), Full Day Slot (08:00 AM - 11:00 PM)',
        facilities: 'Central Air Conditioning, 24x7 Power Backup, Grand Stage, Valet Parking, Green Rooms',
      });
    }
    setHallModalOpen(true);
  };

  const handleSaveHall = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...hallForm,
        capacity: Number(hallForm.capacity),
        price: Number(hallForm.price),
        images: hallForm.images.split(',').map((s) => s.trim()).filter(Boolean),
        availableTimeSlots: hallForm.availableTimeSlots.split(',').map((s) => s.trim()).filter(Boolean),
        facilities: hallForm.facilities.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingHall) {
        await functionHallService.updateFunctionHall(editingHall._id, payload);
      } else {
        await functionHallService.createFunctionHall(payload);
      }

      setHallModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save function hall');
    }
  };

  const handleDeleteHall = async (id) => {
    if (window.confirm('Are you sure you want to delete this function hall?')) {
      try {
        await functionHallService.deleteFunctionHall(id);
        fetchInitialData();
      } catch (err) {
        alert('Failed to delete function hall');
      }
    }
  };

  // Event Handlers
  const handleOpenEventModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description,
        category: event.category,
        organizer: event.organizer || 'Event Pro',
        date: new Date(event.date).toISOString().split('T')[0],
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '18:00',
        timeSlots: event.timeSlots && event.timeSlots.length > 0 ? event.timeSlots.join(', ') : 'Morning Session (09:00 AM - 01:00 PM), Afternoon Session (02:00 PM - 06:00 PM)',
        venue: event.venue,
        location: event.location || '',
        state: event.state || 'Andhra Pradesh',
        district: event.district || 'Krishna',
        area: event.area || 'Vijayawada',
        capacity: event.capacity || 500,
        availableSlots: event.availableSlots !== undefined ? event.availableSlots : (event.capacity || 500),
        price: event.price || 0,
        registrationDeadline: event.registrationDeadline
          ? new Date(event.registrationDeadline).toISOString().split('T')[0]
          : new Date(event.date).toISOString().split('T')[0],
        contactEmail: event.contactEmail || 'admin@eventpro.com',
        contactPhone: event.contactPhone || '',
        image: event.image || '',
        status: event.status || 'Published',
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        description: '',
        category: 'Technical',
        organizer: 'Event Pro',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '18:00',
        timeSlots: 'Morning Session (09:00 AM - 01:00 PM), Afternoon Session (02:00 PM - 06:00 PM)',
        venue: '',
        location: '',
        state: 'Andhra Pradesh',
        district: 'Krishna',
        area: 'Vijayawada',
        capacity: 500,
        availableSlots: 500,
        price: 499,
        registrationDeadline: new Date().toISOString().split('T')[0],
        contactEmail: 'admin@eventpro.com',
        contactPhone: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        status: 'Published',
      });
    }
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...eventForm,
        capacity: Number(eventForm.capacity),
        price: Number(eventForm.price) || 0,
        availableSlots: Number(eventForm.availableSlots) || Number(eventForm.capacity),
        timeSlots: eventForm.timeSlots
          ? eventForm.timeSlots.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, payload);
        setToastMessage({ type: 'success', text: `Event "${payload.title}" updated successfully!` });
      } else {
        await eventService.createEvent(payload);
        setToastMessage({ type: 'success', text: `Dynamic Event "${payload.title}" created successfully!` });
      }

      setEventModalOpen(false);
      setEditingEvent(null);
      fetchInitialData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setToastMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save event' });
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(id);
        setToastMessage({ type: 'success', text: 'Event deleted successfully.' });
        fetchInitialData();
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err) {
        setToastMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete event' });
      }
    }
  };

  // Location Handlers
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      await locationService.createLocation(locForm);
      setLocForm({ state: '', district: '', areas: '' });
      fetchInitialData();
    } catch (err) {
      alert('Failed to save location data');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Delete this location node?')) {
      try {
        await locationService.deleteLocation(id);
        fetchInitialData();
      } catch (err) {
        alert('Failed to delete location');
      }
    }
  };

  // Booking Status Handler
  const handleUpdateBookingStatus = async (id, bookingStatus) => {
    try {
      await bookingService.updateBookingStatus(id, { bookingStatus });
      fetchInitialData();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  // Delete Review Handler
  const handleDeleteReview = async (hallId, reviewId) => {
    if (window.confirm('Delete this customer review?')) {
      try {
        await adminService.deleteReview(hallId, reviewId);
        fetchInitialData();
      } catch (err) {
        alert('Failed to delete review');
      }
    }
  };

  const handleVenueApproval = async (venueId, approvalStatus) => {
    try {
      await venueService.updateVenueStatus(venueId, approvalStatus);
      setToastMessage({
        type: 'success',
        text: `Venue ${approvalStatus.toLowerCase()} successfully.`,
      });
      await fetchInitialData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update venue approval status.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                👑 Super Admin
              </span>
              <span className="text-xs text-gray-400">Event Pro Control Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
              Admin Platform Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage function halls, events, hierarchical locations, bookings, users &amp; reviews
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleOpenHallModal()} className="bg-blue-600 hover:bg-blue-700 text-xs font-bold">
              + Add Function Hall
            </Button>
            <Button onClick={() => handleOpenEventModal()} className="bg-purple-600 hover:bg-purple-700 text-xs font-bold">
              + Add Event
            </Button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl text-xs font-bold shadow-md flex items-center justify-between ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-rose-600 text-white shadow-rose-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white font-black text-sm">
              ✕
            </button>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'overview', label: '📊 Overview & Stats' },
            { id: 'halls', label: `🏛️ Function Halls (${halls.length})` },
            { id: 'venue-approvals', label: `✅ Venue Approvals (${venues.filter((venue) => venue.approvalStatus === 'PENDING').length})` },
            { id: 'events', label: `🎟️ Events (${events.length})` },
            { id: 'bookings', label: `📋 Bookings (${bookings.length})` },
            { id: 'locations', label: `📍 Locations (${locations.length})` },
            { id: 'users', label: `👥 Users (${users.length})` },
            { id: 'reviews', label: '⭐ Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? tab.id === 'halls'
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : tab.id === 'halls'
                    ? 'border border-white/40 bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= 1. Overview Tab ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                  <span className="text-2xl font-black text-green-600 mt-1 block">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Bookings</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">
                    {stats.totalBookings}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Confirmed</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    {stats.confirmedBookings}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Function Halls</span>
                  <span className="text-2xl font-black text-purple-600 mt-1 block">
                    {stats.totalHalls}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Events</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">
                    {stats.totalEvents}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Users</span>
                  <span className="text-2xl font-black text-pink-600 mt-1 block">
                    {stats.totalUsers}
                  </span>
                </div>
              </div>
            )}

            {/* Live Events Quick Management on Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🎟️</span> Platform Dynamic Events ({events.length})
                  </h3>
                  <p className="text-xs text-gray-400">Manage or edit events directly from your dashboard</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleOpenEventModal()} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold">
                    + Add Event
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleTabChange('events')} className="text-xs font-bold">
                    View All Events →
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-400">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Venue / Location</th>
                      <th className="p-3">Slots</th>
                      <th className="p-3">Price</th>
                      <th className="p-3 text-right">Quick Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {events.slice(0, 5).map((ev) => (
                      <tr key={ev._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{ev.title}</td>
                        <td className="p-3 font-semibold text-purple-600">{ev.category}</td>
                        <td className="p-3 text-gray-500">{new Date(ev.date).toLocaleDateString()}</td>
                        <td className="p-3 text-gray-500">{ev.venue}, {ev.area || ev.district}</td>
                        <td className="p-3 font-bold">{ev.availableSlots} / {ev.capacity}</td>
                        <td className="p-3 font-black text-green-600">{ev.price ? `₹${ev.price.toLocaleString()}` : 'Free'}</td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleOpenEventModal(ev)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1"
                          >
                            ✏️ Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Bookings Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Platform Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-400">
                    <tr>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Venue / Event</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stats?.recentBookings?.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 font-mono font-bold text-blue-600">{b.bookingId}</td>
                        <td className="p-3 font-medium">{b.user?.name || b.contactName}</td>
                        <td className="p-3">{b.hall?.name || b.event?.title}</td>
                        <td className="p-3 font-bold">₹{b.totalPrice.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. Function Halls Management Tab ================= */}
        {activeTab === 'halls' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Manage Function Halls</h3>
              <Button size="sm" onClick={() => handleOpenHallModal()}>+ Add New Hall</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-400">
                  <tr>
                    <th className="p-3">Hall Name</th>
                    <th className="p-3">Location (Area, State)</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Price / Day</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {halls.map((hall) => (
                    <tr key={hall._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{hall.name}</td>
                      <td className="p-3 text-gray-500">{hall.area}, {hall.district}, {hall.state}</td>
                      <td className="p-3 font-semibold">{hall.capacity.toLocaleString()} Pax</td>
                      <td className="p-3 font-black text-blue-600">₹{hall.price.toLocaleString()}</td>
                      <td className="p-3">⭐ {hall.rating}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                          {hall.availability}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenHallModal(hall)}
                          className="px-2 py-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHall(hall._id)}
                          className="px-2 py-1 text-xs font-bold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 3. Venue Owner Approval Tab ================= */}
        {activeTab === 'venue-approvals' && (
          <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Review Venue Owner Submissions</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Approve venues before they become visible to customers.
                </p>
              </div>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-200">
                {venues.filter((venue) => venue.approvalStatus === 'PENDING').length} pending
              </span>
            </div>

            {venues.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                No venue owner submissions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {venues.map((venue) => (
                  <div key={venue._id} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900/30">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                      <div className="flex gap-4">
                        <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-900">
                          {venue.images?.[0] ? (
                            <img src={venue.images[0]} alt={venue.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-3xl">🏛️</div>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">{venue.name}</h4>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              venue.approvalStatus === 'APPROVED'
                                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200'
                                : venue.approvalStatus === 'REJECTED'
                                  ? 'border-rose-400/30 bg-rose-400/10 text-rose-700 dark:text-rose-200'
                                  : 'border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-200'
                            }`}>{venue.approvalStatus}</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{venue.venueType} · {venue.city}, {venue.state}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Capacity: {venue.capacity || 0} · Price: ₹{Number(venue.price || 0).toLocaleString()}</p>
                          <p className="mt-2 max-w-2xl text-xs text-gray-600 dark:text-gray-300">{venue.description}</p>
                        </div>
                      </div>

                      {venue.approvalStatus === 'PENDING' && (
                        <div className="flex flex-shrink-0 items-center gap-2 lg:self-center">
                          <Button size="sm" onClick={() => handleVenueApproval(venue._id, 'APPROVED')}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleVenueApproval(venue._id, 'REJECTED')}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 4. Events Management Tab ================= */}
        {activeTab === 'events' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            {/* Header & Main Creation Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                    👑 Dynamic Events Suite
                  </span>
                  <span className="text-xs text-gray-400">Total Live Events: {events.length}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
                  Manage Dynamic Events
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Create, modify, or publish events dynamically across any Indian state, district, or area with custom time slots.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => handleOpenEventModal()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
                >
                  ✨ + Quick Add Event (Modal)
                </Button>
                <Link to="/admin/events/new">
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-bold text-xs"
                  >
                    📝 Full-Page Creator
                  </Button>
                </Link>
                <Link to="/events?tab=events">
                  <Button variant="outline" className="text-xs font-bold">
                    🌐 Public View →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl">
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  placeholder="Search events by title, organizer, category, venue, or area..."
                  className="w-full sm:max-w-md px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white"
                />
                {eventSearchQuery && (
                  <button
                    onClick={() => setEventSearchQuery('')}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">Category:</span>
                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                >
                  <option value="All">All Categories</option>
                  <option value="Technical">Technical</option>
                  <option value="Business">Business</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Educational">Educational</option>
                  <option value="Social">Social</option>
                  <option value="Health">Health</option>
                </select>
              </div>
            </div>

            {/* Events List / Table */}
            {events.filter((ev) => {
              const matchesCat = eventCategoryFilter === 'All' || ev.category?.toLowerCase() === eventCategoryFilter.toLowerCase();
              const q = eventSearchQuery.toLowerCase().trim();
              const matchesQ =
                !q ||
                ev.title?.toLowerCase().includes(q) ||
                ev.category?.toLowerCase().includes(q) ||
                ev.venue?.toLowerCase().includes(q) ||
                ev.area?.toLowerCase().includes(q) ||
                ev.district?.toLowerCase().includes(q) ||
                ev.state?.toLowerCase().includes(q) ||
                ev.organizer?.toLowerCase().includes(q);
              return matchesCat && matchesQ;
            }).length === 0 ? (
              <div className="py-16 text-center text-gray-400 space-y-3">
                <span className="text-4xl block">🎟️</span>
                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                  No dynamic events found matching your filter criteria.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEventSearchQuery('');
                      setEventCategoryFilter('All');
                    }}
                    className="text-xs"
                  >
                    Reset Filters
                  </Button>
                  <Button size="sm" onClick={() => handleOpenEventModal()} className="bg-purple-600 text-white font-bold text-xs">
                    + Create Event Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-400 font-bold">
                    <tr>
                      <th className="p-3.5">Event Details</th>
                      <th className="p-3.5">Category &amp; Organizer</th>
                      <th className="p-3.5">Date &amp; Time</th>
                      <th className="p-3.5">Venue &amp; Location</th>
                      <th className="p-3.5">Slots / Capacity</th>
                      <th className="p-3.5">Ticket Price</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {events
                      .filter((ev) => {
                        const matchesCat = eventCategoryFilter === 'All' || ev.category?.toLowerCase() === eventCategoryFilter.toLowerCase();
                        const q = eventSearchQuery.toLowerCase().trim();
                        const matchesQ =
                          !q ||
                          ev.title?.toLowerCase().includes(q) ||
                          ev.category?.toLowerCase().includes(q) ||
                          ev.venue?.toLowerCase().includes(q) ||
                          ev.area?.toLowerCase().includes(q) ||
                          ev.district?.toLowerCase().includes(q) ||
                          ev.state?.toLowerCase().includes(q) ||
                          ev.organizer?.toLowerCase().includes(q);
                        return matchesCat && matchesQ;
                      })
                      .map((ev) => {
                        const thumb =
                          ev.image ||
                          (ev.images && ev.images[0]) ||
                          'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80';

                        return (
                          <tr key={ev._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={thumb}
                                  alt={ev.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-xs flex-shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-gray-900 dark:text-white block max-w-xs line-clamp-1">
                                    {ev.title}
                                  </span>
                                  <span className="text-[10px] text-gray-400 block truncate max-w-xs">
                                    ID: {ev._id.slice(-6)}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-extrabold text-[10px] inline-block mb-1">
                                {ev.category}
                              </span>
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">
                                {ev.organizer || 'Event Pro'}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-bold text-gray-900 dark:text-white block">
                                📅 {new Date(ev.date).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-gray-400 block">
                                ⏰ {ev.startTime || '09:00'} - {ev.endTime || '18:00'}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-gray-900 dark:text-white block truncate max-w-[180px]">
                                🏛️ {ev.venue}
                              </span>
                              <span className="text-[10px] text-gray-400 block truncate max-w-[180px]">
                                📍 {ev.area || ''}, {ev.district || ''}, {ev.state || ''}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-black text-gray-900 dark:text-white block">
                                {ev.availableSlots !== undefined ? ev.availableSlots : ev.capacity} / {ev.capacity}
                              </span>
                              <span className="text-[10px] text-gray-400 block">Available Slots</span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-black text-green-600 text-sm block">
                                {ev.price ? `₹${ev.price.toLocaleString()}` : 'Free Entry'}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  ev.status === 'Published'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                    : ev.status === 'Draft'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                }`}
                              >
                                ● {ev.status || 'Published'}
                              </span>
                            </td>

                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenEventModal(ev)}
                                  className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 shadow-xs"
                                >
                                  ✏️ Edit
                                </Button>
                                <Link to={`/admin/events/${ev._id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-[11px] font-bold text-gray-700 dark:text-gray-300 px-2 py-1"
                                    title="Open Full Page Editor"
                                  >
                                    📄
                                  </Button>
                                </Link>
                                <button
                                  onClick={() => handleDeleteEvent(ev._id)}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                  title="Delete Event"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= 4. Bookings Management Tab ================= */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Platform Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-400">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Venue / Event</th>
                    <th className="p-3">Date &amp; Slot</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 font-mono font-bold text-blue-600">{b.bookingId}</td>
                      <td className="p-3 uppercase font-semibold">{b.bookingType}</td>
                      <td className="p-3">
                        <p className="font-bold">{b.user?.name || b.contactName}</p>
                        <p className="text-[10px] text-gray-400">{b.user?.email || b.contactEmail}</p>
                      </td>
                      <td className="p-3 font-medium">{b.hall?.name || b.event?.title}</td>
                      <td className="p-3">
                        {new Date(b.date).toLocaleDateString()}
                        <span className="block text-[10px] text-gray-400">{b.timeSlot}</span>
                      </td>
                      <td className="p-3 font-black text-green-600">₹{b.totalPrice.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : b.bookingStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {b.bookingStatus !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                            className="px-2 py-1 text-[11px] font-bold rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                          >
                            Approve
                          </button>
                        )}
                        {b.bookingStatus !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                            className="px-2 py-1 text-[11px] font-bold rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 5. Locations Management Tab ================= */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Add New State / District / Area Entry
              </h3>
              <form onSubmit={handleSaveLocation} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="State (e.g. Telangana)"
                  value={locForm.state}
                  onChange={(e) => setLocForm({ ...locForm, state: e.target.value })}
                  required
                  className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
                <input
                  type="text"
                  placeholder="District (e.g. Hyderabad)"
                  value={locForm.district}
                  onChange={(e) => setLocForm({ ...locForm, district: e.target.value })}
                  required
                  className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
                <input
                  type="text"
                  placeholder="Areas comma separated (e.g. Hitec City, Madhapur)"
                  value={locForm.areas}
                  onChange={(e) => setLocForm({ ...locForm, areas: e.target.value })}
                  required
                  className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
                <Button type="submit" size="sm" className="bg-blue-600 font-bold">
                  + Add Location
                </Button>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Existing Hierarchical Locations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-400">
                    <tr>
                      <th className="p-3">State</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Localities / Areas</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {locations.map((loc) => (
                      <tr key={loc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{loc.state}</td>
                        <td className="p-3 font-semibold text-blue-600">{loc.district}</td>
                        <td className="p-3 text-gray-500">
                          {loc.areas?.join(', ')}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteLocation(loc._id)}
                            className="text-xs text-red-600 hover:underline font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. Users Management Tab ================= */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registered Platform Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-400">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Total Bookings</th>
                    <th className="p-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{u.name}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                      <td className="p-3 text-gray-500">{u.phone || '—'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{u.bookingCount || 0}</td>
                      <td className="p-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 7. Reviews Management Tab ================= */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Reviews &amp; Moderation</h3>
            <div className="space-y-3">
              {halls.flatMap((h) =>
                (h.reviews || []).map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-blue-600 block mb-0.5">{h.name}</span>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">"{rev.comment}"</p>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        By {rev.name} • Rating: {'★'.repeat(rev.rating)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(h._id, rev._id)}
                      className="px-3 py-1.5 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 text-xs font-bold"
                    >
                      Delete Review
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ================= Function Hall Add/Edit Modal ================= */}
      <AnimatePresence>
        {hallModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingHall ? 'Edit Function Hall' : 'Add New Function Hall'}
                </h3>
                <button onClick={() => setHallModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveHall} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Hall Name *</label>
                  <input
                    type="text"
                    value={hallForm.name}
                    onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea
                    rows={2}
                    value={hallForm.description}
                    onChange={(e) => setHallForm({ ...hallForm, description: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">State *</label>
                    <input
                      type="text"
                      value={hallForm.state}
                      onChange={(e) => setHallForm({ ...hallForm, state: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">District *</label>
                    <input
                      type="text"
                      value={hallForm.district}
                      onChange={(e) => setHallForm({ ...hallForm, district: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Area *</label>
                    <input
                      type="text"
                      value={hallForm.area}
                      onChange={(e) => setHallForm({ ...hallForm, area: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Address *</label>
                  <input
                    type="text"
                    value={hallForm.fullAddress}
                    onChange={(e) => setHallForm({ ...hallForm, fullAddress: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Capacity *</label>
                    <input
                      type="number"
                      value={hallForm.capacity}
                      onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Base Price / Day (₹) *</label>
                    <input
                      type="number"
                      value={hallForm.price}
                      onChange={(e) => setHallForm({ ...hallForm, price: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Available Time Slots (Comma Separated)</label>
                  <input
                    type="text"
                    value={hallForm.availableTimeSlots}
                    onChange={(e) => setHallForm({ ...hallForm, availableTimeSlots: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Facilities (Comma Separated)</label>
                  <input
                    type="text"
                    value={hallForm.facilities}
                    onChange={(e) => setHallForm({ ...hallForm, facilities: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={hallForm.images}
                    onChange={(e) => setHallForm({ ...hallForm, images: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setHallModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold">
                    Save Function Hall
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Event Add/Edit Modal ================= */}
      <AnimatePresence>
        {eventModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button onClick={() => setEventModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea
                    rows={2}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                    <input
                      type="text"
                      list="event-categories"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      placeholder="e.g. Technical, Business, Cultural, Sports..."
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                    <datalist id="event-categories">
                      <option value="Technical" />
                      <option value="Business" />
                      <option value="Cultural" />
                      <option value="Social" />
                      <option value="Music" />
                      <option value="Sports" />
                      <option value="Educational" />
                      <option value="Health" />
                      <option value="Arts" />
                      <option value="Festival" />
                      <option value="Exhibition" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Organizer Name</label>
                    <input
                      type="text"
                      value={eventForm.organizer}
                      onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                      placeholder="e.g. Event Pro or Organization"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Event Date *</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      placeholder="09:00"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                    <input
                      type="text"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      placeholder="18:00"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Time Slots (Comma separated sessions)
                  </label>
                  <input
                    type="text"
                    value={eventForm.timeSlots}
                    onChange={(e) => setEventForm({ ...eventForm, timeSlots: e.target.value })}
                    placeholder="Morning Session (09:00 AM - 01:00 PM), Afternoon Session (02:00 PM - 06:00 PM)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">State *</label>
                    <input
                      type="text"
                      value={eventForm.state}
                      onChange={(e) => setEventForm({ ...eventForm, state: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">District *</label>
                    <input
                      type="text"
                      value={eventForm.district}
                      onChange={(e) => setEventForm({ ...eventForm, district: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Area *</label>
                    <input
                      type="text"
                      value={eventForm.area}
                      onChange={(e) => setEventForm({ ...eventForm, area: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Venue Name *</label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Ticket Price (₹)</label>
                    <input
                      type="number"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Total Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Available Slots</label>
                    <input
                      type="number"
                      min="0"
                      value={eventForm.availableSlots}
                      onChange={(e) => setEventForm({ ...eventForm, availableSlots: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Registration Deadline</label>
                    <input
                      type="date"
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={eventForm.contactEmail}
                      onChange={(e) => setEventForm({ ...eventForm, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Event Banner Image URL</label>
                  <input
                    type="url"
                    value={eventForm.image}
                    onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setEventModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold">
                    Save Event
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
