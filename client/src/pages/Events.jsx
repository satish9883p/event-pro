import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { functionHallService } from '../services/functionHallService';
import { eventService } from '../services/eventService';
import { venueService } from '../services/venueService';
import { locationService } from '../services/locationService';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { BookingModal } from '../components/booking/BookingModal';
import { VenueBookingModal } from '../components/booking/VenueBookingModal';
import { useAuth } from '../hooks/useAuth';

const getHallMapUrl = (hall) => {
  const query = hall.mapQuery || [hall.area, hall.district, hall.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || hall.name)}`;
};

const getVenueMapUrl = (venue) => {
  const query = venue.googleMapUrl || [venue.address, venue.city, venue.state].filter(Boolean).join(', ');
  return venue.googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || venue.name)}`;
};

export const Events = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'all' | 'halls' | 'events'
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Hierarchical Location State
  const [locationHierarchy, setLocationHierarchy] = useState({});
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [locationsLoading, setLocationsLoading] = useState(true);

  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || '');

  // Date Selection
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');

  // Advanced Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Data lists
  const [halls, setHalls] = useState([]);
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedItemForBooking, setSelectedItemForBooking] = useState(null);
  const [bookingType, setBookingType] = useState('hall');
  const [venueBookingOpen, setVenueBookingOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  // Fetch Location Hierarchy on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'all';
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, activeTab]);

  const fetchLocations = async () => {
    setLocationsLoading(true);
    setLocationError('');
    try {
      const [statesResponse, hierarchyResponse] = await Promise.all([
        locationService.getStates(),
        locationService.getHierarchy(),
      ]);
      const hierarchy = hierarchyResponse.data || {};
      setLocationHierarchy(hierarchy);
      setStates((statesResponse.data || Object.keys(hierarchy)).sort());

      // If URL had a state, populate its districts
      const urlState = searchParams.get('state');
      if (urlState) {
        const districtsResponse = await locationService.getDistricts(urlState);
        setDistricts((districtsResponse.data || []).sort());
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setStates([]);
      setLocationError('Location filters are temporarily unavailable. Refresh to try again.');
    } finally {
      setLocationsLoading(false);
    }
  };

  // State change handler -> dynamically update districts
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedDistrict('');
    setSelectedArea('');

    if (stateName) {
      setDistricts(Object.keys(locationHierarchy[stateName] || {}).sort());
      locationService.getDistricts(stateName)
        .then((response) => setDistricts((response.data || []).sort()))
        .catch(() => setLocationError('Unable to load districts for this state.'));
    } else {
      setDistricts([]);
    }
    setAreas([]);
  };

  // District change handler -> dynamically update areas
  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    setSelectedArea('');

    if (selectedState && districtName) {
      setAreas((locationHierarchy[selectedState]?.[districtName] || []).sort());
      locationService.getAreas(selectedState, districtName)
        .then((response) => setAreas((response.data || []).sort()))
        .catch(() => setLocationError('Unable to load areas for this district.'));
    } else {
      setAreas([]);
    }
  };

  // Fetch items whenever filters change
  useEffect(() => {
    fetchData();
  }, [
    activeTab,
    selectedState,
    selectedDistrict,
    selectedArea,
    selectedDate,
    searchQuery,
    maxPrice,
    minCapacity,
    selectedType,
    selectedCategory,
    minRating,
    availableOnly,
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const commonParams = {
        state: selectedState || undefined,
        district: selectedDistrict || undefined,
        area: selectedArea || undefined,
        date: selectedDate || undefined,
        search: searchQuery || undefined,
      };

      if (activeTab === 'all' || activeTab === 'halls') {
        const hallParams = {
          ...commonParams,
          maxPrice: maxPrice < 200000 ? maxPrice : undefined,
          minCapacity: minCapacity > 0 ? minCapacity : undefined,
          type: selectedType !== 'All' ? selectedType : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          availability: availableOnly ? 'Available' : undefined,
        };
        const hallRes = await functionHallService.getFunctionHalls(hallParams);
        setHalls(hallRes.data || []);

        const venueRes = await venueService.getVenues({
          state: selectedState || undefined,
          district: selectedDistrict || undefined,
          area: selectedArea || undefined,
          search: searchQuery || undefined,
        });
        setVenues(venueRes.data || []);
      } else {
        setHalls([]);
        setVenues([]);
      }

      if (activeTab === 'all' || activeTab === 'events') {
        const eventParams = {
          ...commonParams,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          maxPrice: maxPrice < 200000 ? maxPrice : undefined,
        };
        const eventRes = await eventService.getEvents(eventParams);
        setEvents(eventRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (item, type) => {
    setSelectedItemForBooking(item);
    setBookingType(type);
    setBookingModalOpen(true);
  };

  const handleOpenVenueBooking = (venue) => {
    setSelectedVenue(venue);
    setVenueBookingOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedArea('');
    setSelectedDate('');
    setSearchQuery('');
    setMaxPrice(200000);
    setMinCapacity(0);
    setSelectedType('All');
    setSelectedCategory('All');
    setMinRating(0);
    setAvailableOnly(false);
    setDistricts([]);
    setAreas([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header Title */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Event Pro Platform
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            Explore Events &amp; Function Halls
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Find, compare, and instantly book venues &amp; event slots by State, District, and Area
          </p>
        </div>

        {/* Tab Switcher: All, Function Halls, Events */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('all'); setSearchParams({ tab: 'all' }); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>🌟</span> All Listings
          </button>
          <button
            onClick={() => { setActiveTab('halls'); setSearchParams({ tab: 'halls' }); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'halls'
                ? 'bg-white text-[#07090d]'
                : 'border border-white/40 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span>🏛️</span> Function Halls ({halls.length + venues.length})
          </button>
          <button
            onClick={() => { setActiveTab('events'); setSearchParams({ tab: 'events' }); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>🎟️</span> Live Events ({events.length})
          </button>
        </div>

        {/* ================= Hierarchical Location Search & Date Bar ================= */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <span>📍</span> Hierarchical Location Filter (State → District → Area)
            </span>
            {(selectedState || selectedDistrict || selectedArea || selectedDate) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Reset Location &amp; Date
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {locationError && (
              <p className="sm:col-span-2 lg:col-span-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                {locationError}
              </p>
            )}
            {/* 1. State Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={locationsLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{locationsLoading ? 'Loading states...' : 'All States'}</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. District Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Select District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedState}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedState ? 'All Districts' : '← Select State First'}
                </option>
                {districts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Area Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Select Area / Locality
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                disabled={!selectedDistrict}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedDistrict ? 'All Areas' : '← Select District First'}
                </option>
                {areas.map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Date Picker / Calendar */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Select Exact Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ================= Main Layout: Filter Sidebar & Results Grid ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Filters &amp; Refinements
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Keyword Search */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Search by Keyword
                </label>
                <input
                  type="text"
                  placeholder="Venue name, hall, event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <span>Max Price</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    ₹{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="200000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Capacity Filter */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <span>Min Capacity</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {minCapacity > 0 ? `${minCapacity}+ Guests` : 'Any'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2500"
                  step="100"
                  value={minCapacity}
                  onChange={(e) => setMinCapacity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Hall Type Filter */}
              {(activeTab === 'all' || activeTab === 'halls') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Function Hall Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-medium text-gray-900 dark:text-white"
                  >
                    <option value="All">All Types</option>
                    <option value="Banquet Hall">Banquet Hall</option>
                    <option value="Convention Center">Convention Center</option>
                    <option value="Marriage Hall">Marriage Hall</option>
                    <option value="Party Lawn">Party Lawn</option>
                    <option value="Rooftop Venue">Rooftop Venue</option>
                  </select>
                </div>
              )}

              {/* Event Category Filter */}
              {(activeTab === 'all' || activeTab === 'events') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Event Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-medium text-gray-900 dark:text-white"
                  >
                    <option value="All">All Categories</option>
                    <option value="Technical">Technical</option>
                    <option value="Business">Business</option>
                    <option value="Social">Social</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Music">Music</option>
                  </select>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Customer Rating
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Any', val: 0 },
                    { label: '4.5+ ★', val: 4.5 },
                    { label: '4.8+ ★', val: 4.8 },
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setMinRating(r.val)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        minRating === r.val
                          ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="text-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-500">Searching venues and events...</p>
              </div>
            ) : (
              <>
                {/* 1. Function Halls Section */}
                {(activeTab === 'all' || activeTab === 'halls') && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>🏛️</span> Available Function Halls
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {halls.length + venues.length}
                        </span>
                      </h2>
                    </div>

                    {halls.length === 0 && venues.length === 0 ? (
                      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-400">
                        <span className="text-3xl block mb-2">🔍</span>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          No function halls match the selected location or filters.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Try changing the Area, District, or Date filter above.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {venues.map((venue) => (
                          <motion.div
                            key={`venue-${venue._id}`}
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="h-52 relative overflow-hidden bg-gray-900">
                                {venue.images?.[0] ? (
                                  <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-4xl text-gray-400">🏛️</div>
                                )}
                                <span className="absolute top-3 left-3 rounded-lg bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white">
                                  APPROVED VENUE
                                </span>
                              </div>
                              <div className="p-5">
                                <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">{venue.name}</h3>
                                <p className="mb-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <span>📍</span> {venue.city}, {venue.state}
                                </p>
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  👥 {Number(venue.capacity || 0).toLocaleString()} Capacity · {venue.venueType}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t border-gray-100 p-5 pt-4 dark:border-gray-700">
                              <div>
                                <span className="block text-[10px] font-semibold uppercase text-gray-400">Starting price</span>
                                <span className="text-xl font-black text-gray-900 dark:text-white">₹{Number(venue.price || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex gap-2">
                                <a href={getVenueMapUrl(venue)} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Map</a>
                                <Button size="sm" onClick={() => handleOpenVenueBooking(venue)} className="text-xs font-bold">Request booking</Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {halls.map((hall) => {
                          const thumb =
                            hall.images && hall.images.length > 0
                              ? hall.images[0]
                              : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

                          return (
                            <motion.div
                              key={hall._id}
                              whileHover={{ y: -4 }}
                              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                            >
                              <div>
                                {/* Thumbnail & Badges */}
                                <div className="h-52 relative overflow-hidden bg-gray-900">
                                  <img
                                    src={thumb}
                                    alt={hall.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-black/60 backdrop-blur-md text-white">
                                      {hall.type}
                                    </span>
                                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-green-500/90 text-white">
                                      ● {hall.availability}
                                    </span>
                                  </div>
                                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white shadow-xs">
                                    <span className="text-amber-400">★</span>
                                    <span>{hall.rating}</span>
                                  </div>
                                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-[11px] font-medium flex items-center gap-1">
                                    <span>👥</span> {hall.capacity.toLocaleString()} Capacity
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                    {hall.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                                    <span>📍</span>
                                    <span>{hall.area}, {hall.district}, {hall.state}</span>
                                  </p>

                                  {/* Facilities preview */}
                                  <div className="flex flex-wrap gap-1.5 mb-4">
                                    {hall.facilities.slice(0, 3).map((f, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                      >
                                        {f}
                                      </span>
                                    ))}
                                    {hall.facilities.length > 3 && (
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-400">
                                        +{hall.facilities.length - 3} more
                                      </span>
                                    )}
                                  </div>

                                  {/* Slots Tag */}
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                      Available Time Slots:
                                    </span>{' '}
                                    {hall.availableTimeSlots?.length || 3} Slots daily
                                  </div>
                                </div>
                              </div>

                              {/* Card Footer: Pricing & Action Buttons */}
                              <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-700 mt-2 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                                    Base Price / Day
                                  </span>
                                  <span className="text-xl font-black text-gray-900 dark:text-white">
                                    ₹{hall.price.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <a
                                    href={getHallMapUrl(hall)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10"
                                  >
                                    Map
                                  </a>
                                  <Link to={`/halls/${hall._id}`}>
                                    <Button variant="outline" size="sm" className="text-xs font-semibold">
                                      View Details
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenBooking(hall, 'hall')}
                                    className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                                  >
                                    Book Now
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Events Section */}
                {(activeTab === 'all' || activeTab === 'events') && (
                  <div className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>🎟️</span> Discover Live Events
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          {events.length}
                        </span>
                      </h2>
                    </div>

                    {events.length === 0 ? (
                      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-400">
                        <span className="text-3xl block mb-2">📅</span>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          No events found matching your location or filters.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.map((ev) => {
                          const thumb =
                            ev.image ||
                            (ev.images && ev.images[0]) ||
                            'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80';

                          const isSoldOut = ev.availableSlots <= 0;

                          return (
                            <motion.div
                              key={ev._id}
                              whileHover={{ y: -4 }}
                              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="h-48 relative overflow-hidden bg-gray-900">
                                  <img
                                    src={thumb}
                                    alt={ev.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 text-white">
                                      {ev.category}
                                    </span>
                                  </div>
                                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold">
                                    📅 {new Date(ev.date).toLocaleDateString()} • {ev.startTime}
                                  </div>
                                </div>

                                <div className="p-5">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                    {ev.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                                    <span>📍</span>
                                    <span>{ev.venue}, {ev.area || ev.location}</span>
                                  </p>

                                  {/* Slots remaining pill */}
                                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-3 text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Available Slots:</span>
                                    <span
                                      className={`font-bold ${
                                        isSoldOut
                                          ? 'text-red-500'
                                          : ev.availableSlots < 50
                                          ? 'text-amber-500'
                                          : 'text-green-600 dark:text-green-400'
                                      }`}
                                    >
                                      {isSoldOut ? 'SOLD OUT' : `${ev.availableSlots} seats left`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-700 mt-2 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                                    Ticket Price
                                  </span>
                                  <span className="text-xl font-black text-gray-900 dark:text-white">
                                    {ev.price ? `₹${ev.price.toLocaleString()}` : 'Free Entry'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {user?.role === 'admin' && (
                                    <Link to={`/admin/events/${ev._id}`}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs font-bold border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                                      >
                                        ✏️ Edit
                                      </Button>
                                    </Link>
                                  )}
                                  <Button
                                    size="sm"
                                    disabled={isSoldOut}
                                    onClick={() => handleOpenBooking(ev, 'event')}
                                    className={`text-xs font-bold ${
                                      isSoldOut
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                    }`}
                                  >
                                    {isSoldOut ? 'Sold Out' : 'Book Slot'}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        item={selectedItemForBooking}
        type={bookingType}
        onSuccess={() => fetchData()}
      />

      <VenueBookingModal
        isOpen={venueBookingOpen}
        onClose={() => setVenueBookingOpen(false)}
        venue={selectedVenue}
        onSuccess={() => fetchData()}
      />

      <Footer />
    </div>
  );
};

export default Events;
