const Follow = require("../models/follow");
const User = require("../models/user");

const followTest = (req, res) => {
  return res.status(200).json({ hello: "world form follow controller" });
};

// * SAVE A FOLLOW(FOLLOW ACTION)

const saveFollow = async (req, res) => {
  // get data from body - which user am I going to follow?
  const params = req.body;

  // get the ID of the logged-in user
  const loggedInAs = req.user;

  try {
    // Check if the user is already being followed
    const existingFollow = await Follow.findOne({
      user: loggedInAs.id,
      followed: params.followed,
    });

    // If the user is already being followed, show an error
    if (existingFollow) {
      return res.status(400).json({
        status: "Error",
        message: "Already following.",
      });
    }
  } catch (error) {
    console.log("XXX", error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }

  // Create a new Follow object
  const userToFollow = new Follow({
    user: loggedInAs.id,
    followed: params.followed,
  });

  try {
    // Save the new Follow object in the database
    const savedFollow = await userToFollow.save();
    if (!savedFollow) {
      return res.status(400).send({
        status: "Error",
        message: "Follow could not be saved.",
      });
    }
    return res.status(200).send({
      status: "Success",
      message: "Follow has been saved.",
      savedFollow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

// * DELETE A FOLLOW(STOP FOLLOW ACTION)
// * LIST OF USERS IM FOLLOWING
// * LIST OF USERS THAT ARE FOLLOWING ME

module.exports = {
  followTest,
  saveFollow,
};
