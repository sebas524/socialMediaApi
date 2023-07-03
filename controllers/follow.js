const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePagination = require("mongoose-pagination");

const followTest = (req, res) => {
  return res.status(200).json({ hello: "world form follow controller" });
};

// * SAVE A FOLLOW(FOLLOW ACTION)

const saveFollow = async (req, res) => {
  // * get data from body - which user am I going to follow?
  const params = req.body;

  // * get the ID of the logged-in user
  const loggedInAs = req.user;

  try {
    // * Check if the user is already being followed
    const existingFollow = await Follow.findOne({
      user: loggedInAs.id,
      followed: params.followed,
    });

    // * If the user is already being followed, show an error
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

  // * Create a new Follow object
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
const deleteFollow = async (req, res) => {
  // * get id from link:
  const idToDelete = req.params.id;
  // * get id from logged in as:
  const loggedInAs = req.user;

  try {
    // * find and delete:
    const foundFollowed = await Follow.findOneAndDelete({
      user: loggedInAs.id,
      followed: idToDelete,
    });
    if (!foundFollowed) {
      return res.status(400).json({
        status: "Error",
        message: "id of follow not found.",
        loggedInAs,
      });
    }
    return res.status(200).json({
      status: "Success",
      message: "Followed has been deleted.",

      deleted: foundFollowed,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};
// * LIST OF USERS IM FOLLOWING

const usersIFollow = async (req, res) => {
  try {
    const loggedInAs = req.user;
    let userId = req.user.id;

    if (req.query.id) {
      userId = req.query.id;
    }

    let page = parseInt(req.query.page) || 1;
    const itemsPerPage = 1;

    const follows = await Follow.find({ user: userId })
      // ! populate means fill(in this example) "followed" with all the info from its User model.
      .populate(
        "followed",
        // ! after the coma goes values that you do not want to show, therefore they have a minus next to them. you can also just write the values you are interested in and the others wont appear.
        "-__v -password -created_at -role -firstName -lastName"
      )
      .paginate(page, itemsPerPage);

    const totalFollows = await Follow.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalFollows / itemsPerPage);

    return res.status(200).json({
      status: "Success",
      loggedInAs,
      userIdBeingChecked: userId,
      followInfo: {
        totalFollowed: totalFollows,
        totalPages,
        currentPage: page,
        follows,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

// * LIST OF USERS THAT ARE FOLLOWING ME
const usersFollowingMe = async (req, res) => {
  const loggedInAs = req.user;

  return res.status(200).json({
    status: "In Progress",
    message: "usersFollowingMe method working",
    loggedInAs,
  });
};

module.exports = {
  followTest,
  saveFollow,
  deleteFollow,
  usersIFollow,
  usersFollowingMe,
};
