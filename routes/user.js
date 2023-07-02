const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const authMiddleware = require("../middlewares/auth");
const multer = require("multer");

// * configuere where you want to store your images:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // * here will the images be saved:
    cb(null, "./images/users");
  },
  //   * name that these files will have:
  filename: (req, file, cb) => {
    // * personalized name:
    cb(null, "user" + Date.now() + file.originalname);
  },
});

const uploads = multer({ storage: storage });

// * --- define routes ----:
// * public
router.post("/register", UserController.register);
router.post("/login", UserController.login);
// * private
router.get("/testUser", authMiddleware.auth, UserController.testUser);
router.get("/users/:page?", authMiddleware.auth, UserController.getUsers);
router.get("/specific-user/:id", authMiddleware.auth, UserController.getUser);
router.patch("/specific-user", authMiddleware.auth, UserController.updateUser);
router.post(
  "/upload",
  [authMiddleware.auth, uploads.single("file0")],
  UserController.uploadPhoto
);
router.get("/image/:chosenImage", authMiddleware.auth, UserController.getImage);

// * export router
module.exports = router;
