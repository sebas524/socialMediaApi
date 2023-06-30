const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");

// * define routes:
router.get("/user-test", UserController.userTest);
router.post("/register", UserController.register);

// * export router
module.exports = router;
