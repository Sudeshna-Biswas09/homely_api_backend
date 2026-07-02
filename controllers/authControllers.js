const User = require("../models/user"); // Ensure this path matches your structure
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");



exports.verifySession = async (req, res) => {
  // 1. Check if the session exists and has a user
  if (req.session && req.session.user) {
    try {
      
      const user = await User.findById(req.session.user._id).select('-password'); 
      
      if (user) {
        return res.status(200).json({ success: true, user: user });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // 3. If no session, return success: false (or simply user: null)
  res.status(200).json({ success: false, user: null });
};
// postLogin
exports.postLogin = async (req, res) => {
  console.log("inside authcontroller",req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    req.session.isloggedIn = true;
    req.session.user = user;
    
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Session saving error" });
      }
      res.status(200).json({ 
        success: true, 
        user: { 
          id: user._id, 
          email: user.email, 
          usertype: user.usertype 
        } 
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};


exports.postsignup = async (req, res) => {
  // 1. Destructure ALL required fields sent from the React frontend
  const { firstname, lastname, email, password, usertype } = req.body;
  
  // 2. Evaluate validations executed in the router
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    // 4. Hash the password with a salt round of 12
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 5. Create user with proper format matching the frontend payload
    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      usertype: usertype || 'guest'
    });

    await user.save();
    res.status(201).json({ success: true, message: "User created successfully" });
    
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
};

// postLogout
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Could not log out." });
    }
    // 'connect.sid' is the default name for express-session cookies
    res.clearCookie("connect.sid"); 
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};