import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runFullApiSuite() {
  console.log('====================================================');
  console.log('       EVENT PRO FULL COMPREHENSIVE API TEST SUITE   ');
  console.log('====================================================\n');

  let adminToken = '';
  let userToken = '';
  let testEventId = '';
  let testHallId = '';
  let testBookingId = '';

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: AUTHENTICATION
    // -------------------------------------------------------------
    console.log('[1/7] Testing Authentication (Admin & User)...');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@eventpro.com',
      password: 'admin123',
    });
    assert(adminLoginRes.status === 200, 'Admin login status is 200');
    assert(adminLoginRes.data.success === true, 'Admin login success flag is true');
    assert(adminLoginRes.data.user.role === 'admin', 'Admin user has role "admin"');
    adminToken = adminLoginRes.data.token;

    const userLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@eventpro.com',
      password: 'user123',
    });
    assert(userLoginRes.status === 200, 'User login status is 200');
    assert(userLoginRes.data.user.role === 'user', 'Regular user has role "user"');
    userToken = userLoginRes.data.token;

    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };
    const userHeaders = { headers: { Authorization: `Bearer ${userToken}` } };

    // -------------------------------------------------------------
    // TEST 2: DYNAMIC EVENT CREATION, MODIFICATION & DELETION (ADMIN)
    // -------------------------------------------------------------
    console.log('\n[2/7] Testing Dynamic Events Management (Admin Add/Modify/Delete)...');

    // Create dynamic event
    const newEventPayload = {
      title: 'Global AI & Robotics Conclave 2026',
      description: 'The largest congregation of machine learning researchers and deep-tech pioneers in India.',
      category: 'Artificial Intelligence & Deep Tech', // Dynamic category, not limited to hardcoded enums
      organizer: 'NextGen Tech Council',
      date: '2026-11-25',
      startTime: '08:30',
      endTime: '19:00',
      timeSlots: [
        'Keynote & Research Papers (08:30 AM - 01:00 PM)',
        'Hands-on Robotics Labs & Networking (02:00 PM - 07:00 PM)',
      ],
      venue: 'Cyber Pearl Convention Center',
      state: 'Telangana',
      district: 'Hyderabad',
      area: 'Hitec City',
      capacity: 800,
      availableSlots: 800,
      price: 1499,
      registrationDeadline: '2026-11-20',
      eligibility: 'Open to All Developers and Engineers',
      contactEmail: 'conclave@nextgen.ai',
      contactPhone: '+91 99887 76655',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      status: 'Published',
    };

    const createEventRes = await axios.post(`${BASE_URL}/events`, newEventPayload, adminHeaders);
    assert(createEventRes.status === 201, 'Admin can dynamically create a new event (201)');
    assert(createEventRes.data.data.title === newEventPayload.title, 'Created event title matches');
    assert(createEventRes.data.data.category === 'Artificial Intelligence & Deep Tech', 'Dynamic category accepted');
    testEventId = createEventRes.data.data._id;

    // Modify dynamic event
    const updateEventPayload = {
      ...newEventPayload,
      title: 'Global AI & Robotics Conclave 2026 (Updated Edition)',
      price: 1999,
      capacity: 1000,
      availableSlots: 1000,
      status: 'Published',
    };

    const updateEventRes = await axios.put(`${BASE_URL}/events/${testEventId}`, updateEventPayload, adminHeaders);
    assert(updateEventRes.status === 200, 'Admin can modify an existing dynamic event (200)');
    assert(updateEventRes.data.data.title === 'Global AI & Robotics Conclave 2026 (Updated Edition)', 'Event title updated');
    assert(updateEventRes.data.data.price === 1999, 'Event price updated');
    assert(updateEventRes.data.data.capacity === 1000, 'Event capacity updated');

    // Verify GET by ID
    const getEventRes = await axios.get(`${BASE_URL}/events/${testEventId}`);
    assert(getEventRes.status === 200, 'Public can fetch event by ID');
    assert(getEventRes.data.data.title === updateEventPayload.title, 'Fetched event matches updated content');

    // -------------------------------------------------------------
    // TEST 3: FUNCTION HALL CREATION & LOCATION SEARCH
    // -------------------------------------------------------------
    console.log('\n[3/7] Testing Function Halls & Location Queries...');
    const hallsQueryRes = await axios.get(`${BASE_URL}/halls`, {
      params: { state: 'Andhra Pradesh', district: 'Krishna', area: 'Vijayawada' },
    });
    assert(hallsQueryRes.status === 200, 'Location-filtered halls query succeeds');
    assert(hallsQueryRes.data.data.length >= 4, 'Multiple function halls returned for selected area');

    // Admin adds a function hall
    const newHallPayload = {
      name: 'The Royal Sovereign Banquet & Lawns',
      description: 'Exquisite ballroom with 24K gold foil ceiling accents, landscaped gardens, and valet service.',
      state: 'Andhra Pradesh',
      district: 'Krishna',
      area: 'Vijayawada',
      fullAddress: 'Plot 45, MG Road, Vijayawada, Andhra Pradesh - 520010',
      capacity: 1500,
      price: 85000,
      type: 'Banquet Hall',
      acType: 'Central AC',
      parking: '200+ Cars',
      stage: '45x30 ft Grand Stage',
      catering: 'In-House & Outside Allowed',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545232979-fbf68fe9b1a2?auto=format&fit=crop&w=1200&q=80',
      ],
      availableTimeSlots: [
        'Morning Slot (08:00 AM - 02:00 PM)',
        'Evening Slot (04:00 PM - 10:00 PM)',
        'Full Day Slot (08:00 AM - 11:00 PM)',
      ],
      facilities: ['Central Air Conditioning', 'Grand Stage', 'Valet Parking', 'Bridal Suites'],
      additionalServices: [
        { name: 'Floral Stage & Arch Decoration', price: 20000 },
        { name: 'Concert Grade JBL Sound System', price: 12000 },
      ],
    };

    const createHallRes = await axios.post(`${BASE_URL}/halls`, newHallPayload, adminHeaders);
    assert(createHallRes.status === 201, 'Admin can dynamically create function hall');
    testHallId = createHallRes.data.data._id;

    // -------------------------------------------------------------
    // TEST 4: LOCATION HIERARCHY
    // -------------------------------------------------------------
    console.log('\n[4/7] Testing Hierarchical Location API (36 States & UTs)...');
    const locHierarchyRes = await axios.get(`${BASE_URL}/locations/hierarchy`);
    assert(locHierarchyRes.status === 200, 'Locations hierarchy status 200');
    const statesCount = Object.keys(locHierarchyRes.data.data).length;
    assert(statesCount >= 36, `All 36 States & UTs present in hierarchy (found ${statesCount})`);

    // -------------------------------------------------------------
    // TEST 5: BOOKINGS LIFECYCLE (CREATE, RETRIEVE, ADMIN APPROVE)
    // -------------------------------------------------------------
    console.log('\n[5/7] Testing Booking Flow (User Booking & Admin Approval)...');
    const bookingPayload = {
      bookingType: 'hall',
      hallId: testHallId,
      date: '2026-12-10',
      timeSlot: 'Evening Slot (04:00 PM - 10:00 PM)',
      basePrice: 85000,
      additionalServices: [{ name: 'Floral Stage & Arch Decoration', price: 20000 }],
      guestCount: 500,
      contactName: 'Satish Kumar',
      contactPhone: '+91 91234 56789',
      contactEmail: 'user@eventpro.com',
      specialRequests: 'VIP stage sofa arrangement needed',
    };

    const createBookingRes = await axios.post(`${BASE_URL}/bookings`, bookingPayload, userHeaders);
    assert(createBookingRes.status === 201, 'User can place a function hall booking');
    assert(createBookingRes.data.data.bookingId.startsWith('EP-'), 'Unique Booking ID generated with EP- prefix');
    assert(createBookingRes.data.data.totalPrice === 105000, 'Total price calculated correctly (85000 + 20000)');
    testBookingId = createBookingRes.data.data._id;

    // User retrieves their bookings
    const myBookingsRes = await axios.get(`${BASE_URL}/bookings/my-bookings`, userHeaders);
    assert(myBookingsRes.status === 200, 'User can fetch their bookings');
    const userFoundBooking = myBookingsRes.data.data.find((b) => b._id === testBookingId);
    assert(!!userFoundBooking, 'Newly placed booking appears in My Bookings');

    // Admin updates booking status to confirmed
    const adminUpdateStatusRes = await axios.patch(
      `${BASE_URL}/bookings/${testBookingId}/status`,
      { bookingStatus: 'confirmed' },
      adminHeaders
    );
    assert(adminUpdateStatusRes.status === 200, 'Admin can update booking status');
    assert(adminUpdateStatusRes.data.data.bookingStatus === 'confirmed', 'Booking status confirmed in database');

    // -------------------------------------------------------------
    // TEST 6: PAYMENTS & RAZORPAY ORDER GENERATION
    // -------------------------------------------------------------
    console.log('\n[6/7] Testing Razorpay Payments Integration...');
    const createOrderRes = await axios.post(
      `${BASE_URL}/payments/create-order`,
      { bookingId: testBookingId },
      userHeaders
    );
    assert(createOrderRes.status === 200, 'Razorpay order created for booking');
    assert(createOrderRes.data.success === true, 'Payment order response is success');
    assert(createOrderRes.data.data.orderId.startsWith('order_'), 'Razorpay order ID returned (order_*)');
    assert(createOrderRes.data.data.amount === 10500000, 'Amount calculated in paise (₹1,05,000 * 100)');
    assert(createOrderRes.data.data.currency === 'INR', 'Currency is INR');

    // -------------------------------------------------------------
    // TEST 7: ADMIN STATS & CLEANUP
    // -------------------------------------------------------------
    console.log('\n[7/7] Testing Admin Overview Stats & Cleanup...');
    const statsRes = await axios.get(`${BASE_URL}/admin/stats`, adminHeaders);
    assert(statsRes.status === 200, 'Admin can fetch system overview stats');
    assert(typeof statsRes.data.data.totalBookings === 'number', 'Total bookings metric present');
    assert(typeof statsRes.data.data.totalHalls === 'number', 'Total halls metric present');
    assert(typeof statsRes.data.data.totalEvents === 'number', 'Total events metric present');

    // Delete test event
    const deleteEventRes = await axios.delete(`${BASE_URL}/events/${testEventId}`, adminHeaders);
    assert(deleteEventRes.status === 200, 'Admin can delete an event');

    // Delete test hall
    const deleteHallRes = await axios.delete(`${BASE_URL}/halls/${testHallId}`, adminHeaders);
    assert(deleteHallRes.status === 200, 'Admin can delete a function hall');

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('   EVENT PRO PLATFORM APIs 100% OPERATIONAL & VERIFIED');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ API Test Suite Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runFullApiSuite();
