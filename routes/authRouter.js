//EXTERNAL MODULES
const express = require("express");

//LOCAL MODULES
const authControllers = require("../controllers/authControllers");

const authRouter = express.Router();


authRouter.post("/signup",authControllers.postsignup);

authRouter.post("/login", authControllers.postLogin);

authRouter.post("/logout", authControllers.postLogout);

authRouter.get("/verify-session", authControllers.verifySession);

module.exports = authRouter;
