const User = require("../models/user");
const bcrypt = require("bcrypt");
const myJwt = require("../helpers/jwt");
const pagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// ! ---REGISTER USERS--- :

const testUser = (req, res) => {
  return res.status(200).json({
    status: "Success",
    message: "User test route accessed",
    user: req.user,
  });
};

const register = async (req, res) => {
  // * fetch request data:
  let params = req.body;

  // * Validate required data:
  const { firstName, email, password, username } = params;

  if (!firstName || !email || !password || !username) {
    return res.status(400).json({
      status: "Error",
      message: "One or more required values are missing.",
    });
  }

  // * if all good, hash password:
  let hashedPassword = await bcrypt.hash(params.password, 10);
  params.password = hashedPassword;

  // * then create a new user object:
  let newUser = new User(params);

  // * save new user to db:
  try {
    const savedUser = await newUser.save();
    return res.status(200).json({
      status: "Success",
      message: "User has been correctly saved to DB.",
      newUser: savedUser,
    });
  } catch (error) {
    // * if errors:
    if (error.code === 11000) {
      return res.status(400).json({
        status: "Error",
        message: "Username or Email already taken.",
      });
    }

    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

const login = async (req, res) => {
  // * fetch request data:
  let params = req.body;
  const { email, password } = params;
  // * validate data:
  if (!email || !password) {
    return res.status(400).json({
      status: "Error",
      message: "Email or password are missing.",
    });
  }

  //  * look for email in db:
  const foundUser = await User.findOne({ email: email });
  // ! .select({password:0}) means you do not want the password to be shown in respond.
  // .select({
  //   password: 0,
  // });
  if (!foundUser) {
    return res.status(400).json({
      status: "Error",
      message: "Invalid email or password.",
    });
  }

  // * check if password correct:
  const correctPassword = bcrypt.compareSync(password, foundUser.password); //! here we are comparing password from req.body with password from foundUser(db)
  if (!correctPassword) {
    return res.status(400).json({
      status: "Error",
      message: "Invalid email or password.",
    });
  }
  // * give token:
  const token = myJwt.createToken(foundUser);
  // * return user info

  return res.status(200).json({
    status: "Success",
    message: "Correct credentials.",
    user: {
      id: foundUser._id,
      name: foundUser.firstName,
      email: email,
      username: foundUser.username,
    },
    token: token,
  });
};

const getUsers = async (req, res) => {
  let page = 1;
  if (req.params.page) {
    page = parseInt(req.params.page);
  }

  // * paginate:
  let itemsPerPage = 3;

  try {
    const totalCount = await User.countDocuments({}); // Count total number of users

    const allUsers = await User.find({})
      .sort({ created_at: -1 })
      .paginate(page, itemsPerPage);

    if (!allUsers) {
      return res.status(404).json({
        status: "error",
        message: "No users found.",
      });
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage); // Calculate total number of pages

    return res.status(200).json({
      status: "success",
      totalUsers: totalCount,
      totalPages: totalPages,
      currentPage: page,
      itemsPerPage: itemsPerPage,
      users: allUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

const getUser = async (req, res) => {
  // * get user id from id in link:
  const id = req.params.id;

  try {
    // * get user info from db
    const userInfo = await User.findById(id).select({ password: 0, role: 0 });

    // * return:
    if (!userInfo) {
      return res
        .status(404)
        .json({ status: "Error", message: "User does not exist" });
    }
    return res.status(200).json({
      status: "success",
      user: userInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

const updateUser = async (req, res) => {
  // * get info from user that we want to update
  let userInfo = req.user;
  console.log(userInfo);

  // * get info from body
  let newUserInfo = req.body;

  // * remove info we dont need from user:
  delete newUserInfo.iat;
  delete newUserInfo.exp;
  delete newUserInfo.role;
  delete newUserInfo.image;

  // * see if user already exist:
  try {
    // ! remember this gives you a [{}] with all users.
    const dbUsers = await User.find({});

    // ! now we search each user and see if username matches our body's username and same thing with email.
    let foundUser = false;
    dbUsers.forEach((user) => {
      if (
        user.username === newUserInfo.username ||
        user.email === newUserInfo.email
      ) {
        foundUser = true;
        return;
      }
    });

    // ! if it matches that means username or email is already taken and therefore we must show error.
    if (foundUser) {
      return res.status(400).json({
        status: "Error",
        message: "Username or email already taken.",
      });
    }
  } catch (error) {
    console.log("XXX", error);
  }

  // * if password wants to be change then bcrypt it

  if (newUserInfo.password) {
    let hashedPassword = await bcrypt.hash(newUserInfo.password, 10);
    newUserInfo.password = hashedPassword;
  }
  // * find and update

  User.findByIdAndUpdate(userInfo.id, newUserInfo, {
    new: true,
  })
    .then((updatedUser) => {
      return res.status(200).send({
        status: "success",
        message: "update method working",
        updatedUser,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        status: "Error",
        message: "Server error, please contact admin.",
      });
    });
};

const uploadPhoto = async (req, res) => {
  // * multer configuration:
  //// ! done already in routes file!!!
  // * see if file is being sent:
  if (!req.file) {
    return res
      .status(400)
      .json({ status: "error", message: "No file currently being uploaded." });
  }

  // * name of img file:
  const filenameOriginal = req.file.originalname;
  // * extension of img file(we get it by splitting filename by the dot. ex: "mypic","jpeg"):
  const fileSplit = filenameOriginal.split(".");
  const fileExtension = fileSplit[1];

  // * check that extension is correct:
  if (
    fileExtension !== "png" &&
    fileExtension !== "jpg" &&
    fileExtension !== "jpeg" &&
    fileExtension !== "gif"
  ) {
    // * delete file and give respond:
    fs.unlink(req.file.path, (err) => {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid file type" });
    });
  }

  // * starting here we know we have a correct image.
  // * now we save image to specific user image:
  try {
    const userImageUpdated = await User.findOneAndUpdate(
      { _id: req.user.id },
      { image: req.file.filename },
      { new: true }
    );
    if (!userImageUpdated) {
      return res.status(400).send({
        status: "Error",
        message: "photo has not been uploaded",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "photo has been uploaded",
      file: req.file,
      user: userImageUpdated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Error",
      message: "Something went wrong. Please contact admin.",
    });
  }
};

const getImage = (req, res) => {
  let chosenImage = req.params.chosenImage; //! REMEBER chosenImage has to match :chosenImage in ROUTES!!!!!!!
  // * where is physical path:
  let physicalPath = `./images/users/` + chosenImage;

  // * does image with that path exist?
  try {
    fs.stat(physicalPath, (error, exists) => {
      if (exists) {
        return res.sendFile(path.resolve(physicalPath));
      } else {
        // * return file
        return res.status(404).json({
          status: "error",
          message: "image does not exists",
          exists,
          chosenImage,
          physicalPath,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  getUser,
  testUser,
  updateUser,
  uploadPhoto,
  getImage,
};
