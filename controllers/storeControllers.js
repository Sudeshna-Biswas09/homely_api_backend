const Home = require("../models/home");
const User = require("../models/user");



/*exports.Homelist = async (req, res) => {
  try {
    const homes = await Home.find();
    res.status(200).json({ success: true, homes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching homes" });
  }
};*/

exports.Homelist = async (req, res) => {
  try {
    // 1. Initialize an empty filter object (defaults to finding everything)
    let filter = {};

    // 2. Check if the frontend passed a search query parameter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // 'i' means case-insensitive
      
      // Multi-field search: Look for matches in either the title OR the location
      filter = {
        $or: [
          { housename: { $regex: searchRegex } },
          { location: { $regex: searchRegex } }
        ]
      };
    }

    // 3. Query the database using our dynamic filter
    console.log("1. Search Query Received from React:", req.query.search);
    console.log("2. Filter Object being sent to MongoDB:", filter);
    const homes = await Home.find(filter);

    // 4. Return the filtered properties back to React
    res.status(200).json({
      success: true,
      count: homes.length,
      homes
    });

  } catch (error) {
    console.error("Search/Fetch Homes Error:", error);
    res.status(500).json({ success: false, message: "Server error while retrieving properties." });
  }
};







exports.postAddToFavourites = async (req, res) => {
  try {
    console.log("inside post addd to favourites");
    const user = await User.findByIdAndUpdate(req.session.user._id, {
      $addToSet: { favourites: req.body.id }
    }, { new: true });
    res.status(200).json({ success: true, favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding to favourites" });
  }
};

exports.postRemoveFromFavourites = async (req, res) => {
  try {
    console.log("inside post remove from  favourites");
    const user = await User.findByIdAndUpdate(req.session.user._id, {
      $pull: { favourites: req.params.id || req.body.id }
    }, { new: true });
    res.status(200).json({ success: true, favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing favourite" });
  }
};

exports.getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('favourites');
    res.status(200).json({ success: true, favourites: user.favourites });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching favourites" });
  }
};

exports.getIndex = async (req, res) => {
  try {
    const homes = await Home.find();
    res.status(200).json({ success: true, homes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getHomeDetails = async (req, res) => {
  try {
    const home = await Home.findById(req.params.homeId);
    if (!home) return res.status(404).json({ success: false, message: "Home not found" });
    res.status(200).json({ success: true, home });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching home details" });
  }
};