// EXTERNAL MODULES
const express = require("express");
//const multer = require('multer');

// LOCAL MODULES
const hostController = require("../controllers/hostControllers");
const {uploadCloud}=require('../cloudinaryConfig');
const hostRouter = express.Router();

// Multer OS-level file storage configuration (Kept exactly as is)




// API Endpoints - Data and File transactions only
hostRouter.post("/host/add-home", uploadCloud.single('image'), hostController.addHome);

hostRouter.post("/host/edit-home", uploadCloud.single('image'), hostController.postEditHome);

hostRouter.get("/host/host-home-list", hostController.getHostHomes);

hostRouter.delete("/host/delete-home/:id", hostController.postDeleteHome);

exports.hostRouter = hostRouter;

/*{
      houseName:req.body.housename,
      location:req.body.location,
      ratings:req.body.ratings,
      price_per_night:req.body.price,
      image_link:req.body.image,

   }*/
