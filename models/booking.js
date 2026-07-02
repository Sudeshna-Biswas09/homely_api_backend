// models/booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home', // Must match the exact name you exported in your Home model
    required: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Must match the exact name you exported in your User model
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0 // Safety check to prevent negative pricing
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'], // Restricts the values allowed
    default: 'confirmed'
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

bookingSchema.virtual('nights').get(function() {
  return (this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24);
});

module.exports = mongoose.model('Booking', bookingSchema);