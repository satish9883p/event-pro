import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { venueService } from '../services/venueService';
import { useAuth } from '../hooks/useAuth';

const initialForm = {
  name: '',
  venueType: 'Banquet Hall',
  description: '',
  address: '',
  city: '',
  state: '',
  district: '',
  area: '',
  pincode: '',
  capacity: '',
  price: '',
  amenities: '',
  images: '',
  googleMapUrl: '',
  latitude: '',
  longitude: '',
};

const statusStyles = {
  PENDING: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  APPROVED: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  REJECTED: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  ACCEPTED: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
};

export const VenueOwnerDashboard = () => {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const [venueResponse, requestResponse] = await Promise.all([
        venueService.getMyVenues(),
        venueService.getOwnerBookingRequests(),
      ]);
      setVenues(venueResponse.data || []);
      setRequests(requestResponse.data || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load your venue workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  const handleFormChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleCreateVenue = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity) || 0,
        price: Number(form.price) || 0,
        amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
        googleMapUrl: form.googleMapUrl.trim(),
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
      };
      if (editingVenue) {
        await venueService.updateVenue(editingVenue._id, payload);
      } else {
        await venueService.createVenue(payload);
      }
      setForm(initialForm);
      setEditingVenue(null);
      setShowForm(false);
      await loadOwnerData();
    } catch (createError) {
      setError(createError.response?.data?.message || 'Unable to submit this venue.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditVenue = (venue) => {
    setEditingVenue(venue);
    setForm({
      name: venue.name || '',
      venueType: venue.venueType || 'Banquet Hall',
      description: venue.description || '',
      address: venue.address || '',
      city: venue.city || '',
      state: venue.state || '',
      district: venue.district || '',
      area: venue.area || '',
      pincode: venue.pincode || '',
      capacity: venue.capacity || '',
      price: venue.price || '',
      amenities: (venue.amenities || []).join(', '),
      images: (venue.images || []).join(', '),
      googleMapUrl: venue.googleMapUrl || '',
      latitude: venue.latitude || '',
      longitude: venue.longitude || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestStatus = async (id, status) => {
    try {
      await venueService.updateBookingRequestStatus(id, status);
      await loadOwnerData();
    } catch (statusError) {
      setError(statusError.response?.data?.message || 'Unable to update this request.');
    }
  };

  const pendingRequests = requests.filter((request) => request.status === 'PENDING');
  const approvedVenues = venues.filter((venue) => venue.approvalStatus === 'APPROVED');

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#ff5a5f]/25 bg-gradient-to-br from-[#271115] via-[#11151d] to-[#07090d] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#ff9a9e]">Venue owner workspace</span>
              <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">Manage your venues, {user?.name || 'owner'}.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">Submit venues for approval, keep your listings organized, and respond to customer booking requests from one place.</p>
            </div>
            <Button onClick={() => { setEditingVenue(null); setForm(initialForm); setShowForm((current) => !current); }}>{showForm ? 'Close form' : '+ Add venue'}</Button>
          </div>
        </motion.section>

        {error && <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ['Your venues', venues.length, '🏛️'],
            ['Approved listings', approvedVenues.length, '✓'],
            ['Pending requests', pendingRequests.length, '📋'],
          ].map(([label, value, icon]) => (
            <div key={label} className="premium-card p-6">
              <span className="text-2xl">{icon}</span>
              <span className="mt-4 block text-3xl font-black text-white">{value}</span>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span>
            </div>
          ))}
        </section>

        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleCreateVenue} className="premium-card grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="text-xl font-bold text-white">{editingVenue ? 'Edit venue' : 'Submit a new venue'}</h2><p className="mt-1 text-sm text-slate-400">{editingVenue ? 'Changes to an approved venue will be sent back for admin review.' : 'New listings remain pending until an admin approves them.'}</p></div>
            {[
              ['name', 'Venue name', 'e.g. Riverside Convention Hall'],
              ['venueType', 'Venue type', 'Banquet Hall'],
              ['city', 'City', 'City'],
              ['state', 'State', 'State'],
              ['district', 'District', 'District'],
              ['area', 'Area / Locality', 'Area or locality'],
              ['pincode', 'Pincode', 'Pincode'],
              ['capacity', 'Guest capacity', '500'],
              ['price', 'Price per booking', '0'],
              ['amenities', 'Amenities', 'Parking, AC, Catering'],
              ['images', 'Venue image URLs', 'https://example.com/venue-image.jpg, https://example.com/venue-image-2.jpg'],
              ['googleMapUrl', 'Google Maps link', 'https://maps.google.com/?q=venue-address'],
              ['latitude', 'Latitude (optional)', '17.3850'],
              ['longitude', 'Longitude (optional)', '78.4867'],
            ].map(([name, label, placeholder]) => (
              <label key={name} className="text-sm font-semibold text-slate-300">{label}<input name={name} value={form[name]} onChange={handleFormChange} placeholder={placeholder} required={['name', 'city', 'state'].includes(name)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-3 text-white outline-none focus:border-[#ff5a5f]" /></label>
            ))}
            <label className="text-sm font-semibold text-slate-300 md:col-span-2">Address<textarea name="address" value={form.address} onChange={handleFormChange} rows="2" placeholder="Full venue address" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-3 text-white outline-none focus:border-[#ff5a5f]" /></label>
            <label className="text-sm font-semibold text-slate-300 md:col-span-2">Description<textarea name="description" value={form.description} onChange={handleFormChange} required rows="3" placeholder="Describe the venue and its facilities" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-3 text-white outline-none focus:border-[#ff5a5f]" /></label>
            <div className="md:col-span-2"><Button type="submit" isLoading={saving}>{editingVenue ? 'Save venue changes' : 'Submit venue for approval'}</Button></div>
          </motion.form>
        )}

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div id="venues" className="premium-card scroll-mt-28 p-6">
            <div className="mb-5 flex items-end justify-between"><div><h2 className="text-xl font-bold text-white">Your venue listings</h2><p className="mt-1 text-sm text-slate-400">Approval and publication status</p></div><Link to="/events?tab=halls" className="text-xs font-bold text-[#ff9a9e]">View marketplace</Link></div>
            {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading venues...</p> : venues.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">You have not submitted a venue yet.</p> : <div className="space-y-3">{venues.map((venue) => <div key={venue._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{venue.name}</h3><p className="mt-1 text-xs text-slate-400">{venue.city}, {venue.state} · {venue.capacity || 0} guests</p></div><div className="flex items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[venue.approvalStatus] || statusStyles.PENDING}`}>{venue.approvalStatus}</span><Button size="sm" variant="outline" onClick={() => handleEditVenue(venue)}>Edit</Button></div></div></div>)}</div>}
          </div>

          <div id="requests" className="premium-card scroll-mt-28 p-6">
            <div className="mb-5"><h2 className="text-xl font-bold text-white">Booking requests</h2><p className="mt-1 text-sm text-slate-400">Review and respond to customer requests</p></div>
            {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading requests...</p> : requests.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No customer requests yet.</p> : <div className="space-y-3">{requests.map((request) => <div key={request._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{request.venueId?.name || 'Venue request'}</h3><p className="mt-1 text-xs text-slate-400">{request.userId?.name || 'Customer'} · {new Date(request.bookingDate).toLocaleDateString()} · {request.startTime} - {request.endTime}</p></div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[request.status] || statusStyles.PENDING}`}>{request.status}</span></div>{request.status === 'PENDING' && <div className="mt-4 flex gap-2"><Button size="sm" onClick={() => handleRequestStatus(request._id, 'ACCEPTED')}>Accept</Button><Button size="sm" variant="outline" onClick={() => handleRequestStatus(request._id, 'REJECTED')}>Reject</Button></div>}</div>)}</div>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VenueOwnerDashboard;
