const Home = require("../models/home");
const fs = require("fs");
const path = require("path");

const User=require("../models/user");

exports.addHome = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : '';
    
    const home = new Home({
      ...req.body,
      image: imageUrl,
      hostId: req.session.user._id,
    });
    await home.save();
    res.status(201).json({ success: true, home });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.postEditHome = async (req, res) => {
  try {
    const home = await Home.findOne({ _id: req.body.id, hostId: req.session.user._id });
    if (!home) return res.status(404).json({ success: false, message: "Unauthorized" });

   if (req.file) {
      home.image = req.file.path; 
    }

    // THE MONGOOSE FIX: 
    // Remove 'id' from the body so it doesn't crash Mongoose's virtual setter
    delete req.body.id;
    Object.assign(home, req.body);
    await home.save();
    res.status(200).json({ success: true, home });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.getHostHomes = async (req, res) => {
  try {
    const homes = await Home.find({ hostId: req.session.user._id });
    res.status(200).json({ success: true, homes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

exports.postDeleteHome = async (req, res) => {
  try {
    const homeId = req.params.id;
    const hostId = req.session.user._id;

    // 1. Delete the home document first (ensuring only the owner can delete it)
    const home = await Home.findOneAndDelete({ _id: homeId, hostId: hostId });
    
    if (!home) {
      return res.status(404).json({ success: false, message: "Home not found or unauthorized" });
    }

    // 2. Cascade Delete: Remove this homeId from ALL users' favourites arrays
    // MongoDB is highly optimized for this; it will instantly find and update them all.
    await User.updateMany(
      { favourites: homeId }, // Query: Find any user who has this homeId in their favourites
      { $pull: { favourites: homeId } } // Action: Pull (remove) it out of the array
    );

    res.status(200).json({ success: true, message: "Home deleted and removed from all favourites" });
    
  } catch (err) {
    console.error("Delete Home Error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};