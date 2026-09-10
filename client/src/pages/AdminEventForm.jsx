import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventService } from '../services/eventService';
import { Button } from '../components/common/Button';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const AdminEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(!!id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    organizer: 'Event Pro',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    timeSlots: 'Morning Session (09:00 AM - 01:00 PM), Afternoon Session (02:00 PM - 06:00 PM)',
    venue: '',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    area: 'Vijayawada',
    capacity: 500,
    availableSlots: 500,
    price: 499,
    registrationDeadline: new Date().toISOString().split('T')[0],
    eligibility: 'All',
    contactEmail: 'admin@eventpro.com',
    contactPhone: '+91 98765 43210',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchEvent();
    }
  }, [id, isEdit]);

  const fetchEvent = async () => {
    try {
      const response = await eventService.getEventById(id);
      const ev = response.data;
      setFormData({
        title: ev.title || '',
        description: ev.description || '',
        category: ev.category || 'Technical',
        organizer: ev.organizer || 'Event Pro',
        date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
        startTime: ev.startTime || '09:00',
        endTime: ev.endTime || '18:00',
        timeSlots: ev.timeSlots && ev.timeSlots.length > 0 ? ev.timeSlots.join(', ') : '',
        venue: ev.venue || '',
        state: ev.state || 'Andhra Pradesh',
        district: ev.district || 'Krishna',
        area: ev.area || 'Vijayawada',
        capacity: ev.capacity || 500,
        availableSlots: ev.availableSlots !== undefined ? ev.availableSlots : ev.capacity || 500,
        price: ev.price || 0,
        registrationDeadline: ev.registrationDeadline
          ? new Date(ev.registrationDeadline).toISOString().split('T')[0]
          : '',
        eligibility: ev.eligibility || 'All',
        contactEmail: ev.contactEmail || 'admin@eventpro.com',
        contactPhone: ev.contactPhone || '',
        image: ev.image || '',
        status: ev.status || 'Published',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load event details' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        price: Number(formData.price) || 0,
        availableSlots: Number(formData.availableSlots) || Number(formData.capacity),
        timeSlots: formData.timeSlots
          ? formData.timeSlots.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      };

      if (isEdit) {
        await eventService.updateEvent(id, payload);
        setMessage({ type: 'success', text: 'Event updated successfully! Redirecting...' });
      } else {
        await eventService.createEvent(payload);
        setMessage({ type: 'success', text: 'Event created dynamically! Redirecting...' });
      }
      setTimeout(() => navigate('/admin?tab=events'), 1200);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save event' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/admin" className="hover:text-blue-600 font-bold">Admin Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {isEdit ? 'Edit Event' : 'Create Dynamic Event'}
            </span>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="text-xs">← Back to Admin</Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
              👑 Admin Dynamic Control
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-2">
              {isEdit ? 'Edit Event Details' : 'Create New Dynamic Event'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Configure event category, dates, capacity, location, pricing, and slots dynamically without hardcoded limits.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl mb-6 text-xs font-bold ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. India AI & Tech Conclave 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Comprehensive description of the event, agenda, speakers, etc."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  list="admin-event-categories"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="Type or pick any dynamic category"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
                <datalist id="admin-event-categories">
                  <option value="Technical" />
                  <option value="Business" />
                  <option value="Cultural" />
                  <option value="Social" />
                  <option value="Music" />
                  <option value="Sports" />
                  <option value="Educational" />
                  <option value="Festival" />
                  <option value="Exhibition" />
                  <option value="Health" />
                  <option value="Arts" />
                </datalist>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Organizer</label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Event Pro / Organization"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Event Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                <input
                  type="text"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  placeholder="09:00"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                <input
                  type="text"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  placeholder="18:00"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Dynamic Time Slots (Comma-separated sessions)
              </label>
              <input
                type="text"
                name="timeSlots"
                value={formData.timeSlots}
                onChange={handleChange}
                placeholder="Morning Session (09:00 AM - 01:00 PM), Afternoon Session (02:00 PM - 06:00 PM)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Andhra Pradesh"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">District *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Krishna"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Area / Locality *</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Vijayawada"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Venue Name *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Grand Convention Center"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Ticket Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Total Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Available Slots</label>
                <input
                  type="number"
                  name="availableSlots"
                  min="0"
                  value={formData.availableSlots}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Registration Deadline</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Banner Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold"
              >
                {isEdit ? 'Update Event' : 'Create Dynamic Event'}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminEventForm;
