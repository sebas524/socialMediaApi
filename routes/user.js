const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const authMiddleware = require("../middlewares/auth");

// * --- define routes ----:
// * public
router.post("/register", UserController.register);
router.post("/login", UserController.login);
// * private
router.get("/testUser", authMiddleware.auth, UserController.testUser);
router.get("/users/:page?", authMiddleware.auth, UserController.getUsers);
router.get("/user/:id", authMiddleware.auth, UserController.getUser);
router.patch("/user", authMiddleware.auth, UserController.updateUser);

// * export router
module.exports = router;
