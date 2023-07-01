const jwt = require("jwt-simple");
const moment = require("moment");
// * import secret_key
const myJwt = require("../helpers/jwt");

// * auth function:
const auth = (req, res, next) => {
  // * proof of receiving auth heading:
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: "Error",
      message: "Req does not contain authentication heading.",
    });
  }
  // * clean token:
  let token = req.headers.authorization.replace(/['"]+/g, "");
  // * decode token:
  try {
    payload = jwt.decode(token, myJwt.secretKey);
    // * check if token expired:
    // ! if exp date is older than actual date
    if (payload.exp <= moment.unix) {
      return res
        .status(401)
        .send({ status: "Error", message: "Token has expired" });
    }
  } catch (error) {
    return res.status(404).send({ status: "Error", message: "Invalid token." });
  }

  // * add user data to req:
  req.user = payload;
  // * execute action
  next();
};

module.exports = {
  auth,
};
