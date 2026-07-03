require('dotenv').config();

//EXTERNAL MODULES
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBstore = require("connect-mongodb-session")(session);
const path = require('path');

const DB_path=process.env.MONGO_URI;

const cors=require('cors');
//LOCAL MODULE
const storeRouter = require("./routes/storeRouter");
const { hostRouter} = require("./routes/hostRouter");
const bookingRouter = require('./routes/bookingRouter');
const { Routerror } = require("./controllers/errors");
const authRouter = require("./routes/authRouter");
const errcontroller=require("./controllers/errors");
const app = express();



// Health Check Route for Cloud Load Balancers
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is awake and ready to accept bookings.',
    timestamp: new Date().toISOString()
  });
});



app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const store = new MongoDBstore({
  uri: DB_path,
  collection: "sessions",
});

app.set("trust proxy", 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  
cookie: {
    secure: true,        // Requires HTTPS (Render provides this automatically)
    sameSite: 'none',    // Explicitly allows the cookie to travel across different domains
    maxAge: 1000 * 60 * 60 * 48 // Keeps the user logged in for 48 hours
  }
  
}));


const allowedOrigins = [
  'http://localhost:5173', 
  'https://homely-api-frontend.vercel.app',
  'https://homely-api-frontend-git-main-sudeshna.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use((req, res, next) => {
  
 
 //req.isloggedIn = req.get("Cookie")?req.get("cookie").split("=")[1] === "true":false;
 req.isloggedIn = req.session.isloggedIn;
  next();
});


app.use((req, res, next) => {
  console.log(req.url, req.method);

  next();
});
app.use("/api",authRouter);
app.use("/api",storeRouter);
app.use('/api', bookingRouter);
app.use("/api/host", (req, res, next) => {
  // Middleware logic for host routes
  if (req.isloggedIn) {
    next();
  } else {
    //res.redirect("/login");

    res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }
});

app.use("/api",hostRouter);

app.use(errcontroller.Routerror);
app.use(errcontroller.ServerError);

mongoose
  .connect(
    DB_path,
  )
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`server running on address http://localhost:${PORT} `);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
