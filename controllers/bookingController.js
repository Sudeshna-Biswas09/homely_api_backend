const Booking = require("../models/booking");

const Home = require("../models/home");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

const sendEmail = require("../utils/sendEmail"); 

exports.createCheckoutSession = async (req, res) => {
  try {
    const { homeId, checkIn, checkOut, totalPrice, nights } = req.body;
    
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Fetch the home from the DB to guarantee the price hasn't been tampered with on the frontend
    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ success: false, message: "Home not found" });

    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Stay at ${home.housename}`,
              description: `${nights} nights (${checkIn} to ${checkOut})`,
              images: [home.image], // Stripe will display your Cloudinary image!
            },
            unit_amount: home.price * 100, // Stripe expects amounts in cents
          },
          quantity: nights,
        },
      ],
      mode: 'payment',
      // Redirect URLs after Stripe finishes
      success_url: `https://homely-api-frontend-git-main-sudeshna.vercel.app/bookings?success=true`,
      cancel_url: `https://homely-api-frontend-git-main-sudeshna.vercel.app/homes/${homeId}?canceled=true`,
      client_reference_id: req.session.user._id.toString(), // Attach the guest ID to the payment
    });

    res.status(200).json({ 
  success: true, 
  id: session.id, 
  url: session.url // We are now passing the secure Stripe URL to React
});
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ success: false, message: "Payment initialization failed." });
  }
};


exports.getUserBookings = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const guestId = req.session.user._id;

    // Fetch bookings and populate the referenced Home document
    const bookings = await Booking.find({ guestId: guestId })
      .populate('homeId') // Grabs the full home object based on the ObjectId
      .sort({ checkIn: 1 }); // Sorts chronologically, upcoming trips first

    res.status(200).json({ success: true, bookings });

  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ success: false, message: "Failed to load your bookings." });
  }
};

exports.postBooking = async (req, res) => {
  try {
    const { homeId, checkIn, checkOut, totalPrice } = req.body;
    
    // Ensure the user is authenticated (session exists)
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: "You must be logged in to book." });
    }
    
    const guestId = req.session.user._id;

    // 1. Backend Validation: Never trust the client
    if (!homeId || !checkIn || !checkOut || !totalPrice) {
      return res.status(400).json({ success: false, message: "Missing required booking details." });
    }

    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    if (newCheckIn >= newCheckOut) {
      return res.status(400).json({ success: false, message: "Check-out must be after check-in." });
    }

    // 2. The Mathematical Overlap Query
    // Two intervals (A and B) overlap if: startA < endB AND endA > startB
    const overlappingBooking = await Booking.findOne({
      homeId: homeId,
      status: { $ne: 'cancelled' }, // Ignore cancelled bookings
      checkIn: { $lt: newCheckOut },
      checkOut: { $gt: newCheckIn }
    });

    if (overlappingBooking) {
      return res.status(409).json({ 
        success: false, 
        message: "Sorry, these dates have already been booked by someone else." 
      });
    }

    // 3. Execute the Transaction
    const booking = new Booking({
      homeId,
      guestId,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      totalPrice
    });

    await booking.save();
    
    res.status(201).json({ success: true, booking, message: "Booking confirmed!" });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Server error during booking process." });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { homeId, checkIn, checkOut, totalPrice } = req.body;


     if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: "You must be logged in to book." });
    }
    
    const guestId = req.session.user._id;

    // 1. Backend Validation: Never trust the client
    if (!homeId || !checkIn || !checkOut || !totalPrice) {
      return res.status(400).json({ success: false, message: "Missing required booking details." });
    }

    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    if (newCheckIn >= newCheckOut) {
      return res.status(400).json({ success: false, message: "Check-out must be after check-in." });
    }

    // 2. The Mathematical Overlap Query
    // Two intervals (A and B) overlap if: startA < endB AND endA > startB
    const overlappingBooking = await Booking.findOne({
      homeId: homeId,
      status: { $ne: 'cancelled' }, // Ignore cancelled bookings
      checkIn: { $lt: newCheckOut },
      checkOut: { $gt: newCheckIn }
    });

    if (overlappingBooking) {
      return res.status(409).json({ 
        success: false, 
        message: "Sorry, these dates have already been booked by someone else." 
      });
    }


    
    // 1. Save to MongoDB (Your existing logic)
    const newBooking = await Booking.create({
      homeId,
      guestId,
      checkIn : newCheckIn,
      checkOut: newCheckOut,
      totalPrice,
      status: 'confirmed'
    });
     
    // Fetch home details to include in the email
    const home = await Home.findById(homeId);

    // 2. Build a beautiful HTML Email Template
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-5 border border-gray-200 rounded-lg">
        <h2 style="color: #9333ea;">Booking Confirmed! 🎉</h2>
        <p>Hi ${req.session.user.name || 'Guest'},</p>
        <p>Your trip to <strong>${home.housename}</strong> is officially locked in.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(checkOut).toLocaleDateString()}</p>
          <p><strong>Total Paid:</strong> $${totalPrice}</p>
        </div>
        
        <p>Pack your bags, and we will see you soon!</p>
        <br/>
        <p>Cheers,<br/>The Homely Team</p>
      </div>
    `;

    // 3. Send the email (Don't use await if you want it to happen in the background!)
    console.log("Sending email to:", req.session.user.email);
    sendEmail({
      email: req.session.user.email, // Assuming you store user email in the session
      subject: `Booking Confirmation: ${home.housename}`,
      html: emailHTML
    }).catch(err => console.error("Email failed to send:", err)); 
    // We catch the error silently so if the email fails, the user's booking still succeeds.

    // 4. Respond to React
    res.status(201).json({ success: true, booking: newBooking });

  } catch (error) {
    console.error("Booking Creation Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
