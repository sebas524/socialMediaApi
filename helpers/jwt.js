const jwt = require("jwt-simple");
const moment = require("moment");

// * secret key:
const secretKey = "hey-there-123";
// * create generate jwt function:
const createToken = (user) => {
  const payload = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(10, "hours").unix(),
  };

  // * return encoded jwt:
  return jwt.encode(payload, secretKey);
};

module.exports = {
  secretKey,
  createToken,
};
