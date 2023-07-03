const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const authMiddleware = require("../middlewares/auth");

// * define routes:
router.get("/testFollow", FollowController.followTest);
router.post("/save", authMiddleware.auth, FollowController.saveFollow);
router.delete(
  "/delete/:id",
  authMiddleware.auth,
  FollowController.deleteFollow
);

// * export router
module.exports = router;
