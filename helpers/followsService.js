const Follow = require("../models/follow");

const userIDsFromFollows = async (loggedInUser) => {
  try {
    // * to see users im(as loggedInUser)  following
    let following = await Follow.find({ user: loggedInUser }).select({
      followed: 1,
      _id: 0,
    });
    let followers = await Follow.find({ followed: loggedInUser }).select({
      user: 1,
      _id: 0,
    });

    // * turn it into an array:
    let followingClean = [];
    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });
    let followersClean = [];
    followers.forEach((follow) => {
      followersClean.push(follow.user);
    });

    return {
      following: followingClean,
      followers: followersClean,
    };
  } catch (error) {
    console.log(error);
    return {};
  }
};

// * to see when i go into someones profile if they follow me or not (and if i follow him or not):

const amIfollowingUser = async (loggedInUser, profileFromOtherUser) => {
  try {
    // * to see if  im(as loggedInUser)  following user or if he follows me.
    let following = await Follow.findOne({
      user: loggedInUser,
      followed: profileFromOtherUser,
    });
    let follower = await Follow.findOne({
      user: profileFromOtherUser,
      followed: loggedInUser,
    });

    return {
      following,
      follower,
    };
  } catch (error) {
    console.log(error);
    return {};
  }
};

module.exports = {
  userIDsFromFollows,
  amIfollowingUser,
};
