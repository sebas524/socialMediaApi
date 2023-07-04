const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post");
const authMiddleware = require("../middlewares/auth");
const multer = require("multer");

// * configuere where you want to store your images:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // * here will the images be saved:
    cb(null, "./images/posts");
  },
  //   * name that these files will have:
  filename: (req, file, cb) => {
    // * personalized name:
    cb(null, "post" + Date.now() + file.originalname);
  },
});

const uploads = multer({ storage: storage });

// * define routes:
router.get("/post-test", PostController.postTest);
router.post("/save", authMiddleware.auth, PostController.savePost);
router.get("/getPost/:id", authMiddleware.auth, PostController.getPost);
router.delete("/delete/:id", authMiddleware.auth, PostController.deletePost);
router.get(
  "/getAllUserPosts/:id",
  authMiddleware.auth,
  PostController.getAllUserPosts
);

// * export router
module.exports = router;
