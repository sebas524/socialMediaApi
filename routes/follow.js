const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");

// * define routes:
router.get("/follow-test", FollowController.followTest);

// * export router
module.exports = router;
