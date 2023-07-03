const { Schema, model } = require("mongoose");

const FollowSchema = Schema({
  //* user = will save another objects identificator. this object follows someone.
  user: { type: Schema.ObjectId, ref: "User" },
  //* followed = user that is being followed: here is which user i am following:
  followed: {
    type: Schema.ObjectId,
    ref: "User",
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = model("Follow", FollowSchema);
