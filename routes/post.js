const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post");

// * define routes:
router.get("/post-test", PostController.postTest);

// * export router
module.exports = router;
