const User = require("../models/user");
const bcrypt = require("bcrypt");
const myJwt = require("../helpers/jwt");

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

module.exports = {
  register,
  login,
  testUser,
};
