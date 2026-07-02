// 🚨 Handles 404 - Resource Not Found
exports.Routerror = (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: "The requested resource could not be found." 
  });
};

// 🔥 Handles 500 - Server Crashes
exports.ServerError = (err, req, res, next) => {
  console.error("SERVER CRASH:", err);
  
  res.status(500).json({ 
    success: false, 
    message: "Internal server error.",
    // Only include stack trace if in development mode
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};