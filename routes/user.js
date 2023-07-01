const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const authMiddleware = require("../middlewares/auth");

// * define routes:
router.get("/testUser", authMiddleware.auth, UserController.testUser);

router.post("/register", UserController.register);
router.post("/login", UserController.login);

// * export router
module.exports = router;
