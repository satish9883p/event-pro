import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { venueService } from '../../services/venueService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const VenueBookingModal = ({ isOpen, onClose, venue, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bookingDate: '',
    startTime: '09:00',
    endTime: '18:00',
    numberOfPeople: '',
    purpose: '',
    notes: '',
    contactPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (venue) {
      setForm((current) => ({ ...current, contactPhone: user?.phone || '' }));
      setError('');
      setSubmitted(false);
    }
  }, [venue, user]);

  if (!isOpen || !venue) return null;

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await venueService.addBookingRequest(venue._id, {
        ...form,
        numberOfPeople: Number(form.numberOfPeople) || 1,
        contactName: user?.name || '',
        contactEmail: user?.email || '',
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit this booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#11151d] shadow-2xl">
          {submitted ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-3xl text-emerald-300">✓</div>
              <h2 className="text-2xl font-bold text-white">Request submitted</h2>
              <p className="mt-2 text-sm text-slate-400">{venue.name} will review your request and respond with availability.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => { onClose(); navigate('/bookings'); }}>View requests</Button>
                <Button variant="outline" onClick={onClose}>Done</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-start justify-between border-b border-white/10 p-6">
                <div><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff9a9e]">Venue booking request</span><h2 className="mt-2 text-xl font-bold text-white">{venue.name}</h2><p className="mt-1 text-xs text-slate-400">{venue.city}, {venue.state}</p></div>
                <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4 p-6">
                {error && <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="text-sm font-semibold text-slate-300 sm:col-span-2">Booking date<input required type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-semibold text-slate-300">Guests<input required type="number" min="1" max={venue.capacity || undefined} name="numberOfPeople" value={form.numberOfPeople} onChange={handleChange} placeholder="100" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-semibold text-slate-300">Start time<input required type="time" name="startTime" value={form.startTime} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-semibold text-slate-300">End time<input required type="time" name="endTime" value={form.endTime} onChange={handleChange} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-semibold text-slate-300 sm:col-span-3">Contact phone<input required type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Phone number" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-semibold text-slate-300 sm:col-span-3">Purpose<input required name="purpose" value={form.purpose} onChange={handleChange} placeholder="Wedding, conference, birthday..." className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-white" /></label>
                  <label className="text-sm font-semibold text-slate-300 sm:col-span-3">Notes<textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Anything the venue owner should know?" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-white" /></label>
                </div>
                <Button type="submit" isLoading={loading} className="w-full">Send booking request</Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VenueBookingModal;
