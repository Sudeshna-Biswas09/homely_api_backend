// CORE MODULES
const path = require("path");

// EXTERNAL MODULES
const express = require("express");

// LOCAL MODULES
const storeControllers = require("../controllers/storeControllers");

const storeRouter = express.Router();

// API Endpoints - JSON Data Delivery
storeRouter.get("/", storeControllers.getIndex);

storeRouter.get("/allhomes", storeControllers.Homelist);

storeRouter.get("/homes/:homeId", storeControllers.getHomeDetails);

storeRouter.get("/favourites", storeControllers.getFavourites);

storeRouter.post("/favourites", storeControllers.postAddToFavourites);

storeRouter.delete("/favourites/remove", storeControllers.postRemoveFromFavourites);

module.exports = storeRouter;