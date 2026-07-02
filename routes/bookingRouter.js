const express = require('express');
const bookingRouter = express.Router();
const bookingController = require('../controllers/bookingController');

// POST: Create a new booking (Wired to your HomeDetails.jsx frontend)
bookingRouter.post('/bookings', bookingController.createBooking);


bookingRouter.post('/create-checkout-session', bookingController.createCheckoutSession);
// GET: Retrieve all bookings for the logged-in guest (Wired to your upcoming Bookings.jsx)
bookingRouter.get('/bookings', bookingController.getUserBookings);

module.exports = bookingRouter;