const User = require("../models/user");
const bcrypt = require("bcrypt");

const userTest = (req, res) => {
  return res.status(200).json({ hello: "world form user controller" });
};

// // ! REGISTER USERS:
// const register = async (req, res) => {
//   // * Get request data:
//   let params = req.body;

//   try {
//     // * Validate required data:
//     const { firstName, email, password, username } = params;

//     if (!firstName || !email || !password || !username) {
//       return res.status(400).json({
//         status: "Error",
//         message: "One or more required values missing.",
//       });
//     }
//     // * Validate in case of duplicates with db:

//     // const existingUsers = await User.find({
//     //   $or: [
//     //     { email: email.toLowerCase() },
//     //     { username: username.toLowerCase() },
//     //   ],
//     // });

//     // if (existingUsers.length >= 1) {
//     //   return res.status(400).json({
//     //     message: "User already exists.",
//     //   });
//     // }
//   } catch (error) {
//     // return res.status(500).json({
//     //   message: "Internal error, contact admin.",
//     // });
//     console.log("XXXXXXX", error);
//     throw new Error("heeeeeeeeellooo");
//   }

//   // * if all good, hash password:
//   let hashedPassword = await bcrypt.hash(params.password, 10);
//   params.password = hashedPassword;

//   // * then create a new user object:
//   let newUser = new User(params);

//   // * save new user to db:
//   const savedUser = await newUser.save();
//   if (!savedUser) {
//     return res.status(500).json({
//       message: "Error saving new user to DB.",
//     });
//   }

//   return res.status(200).json({
//     status: "Success",
//     message: "User has been correctly saved to DB.",
//     newUser: savedUser,
//   });
// };

// ! REGISTER USERS:
const register = async (req, res) => {
  // * Get request data:
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

module.exports = {
  userTest,
  register,
};
