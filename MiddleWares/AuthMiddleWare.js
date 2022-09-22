const jwt = require("jsonwebtoken");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const protect = (req, res, next) => {
  token = req.headers.authorization;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      console.log("MiddleWare");
      let token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "abc123");
      User.findOne({ email: decoded.email })
        .then((user) => {
          req.user = user;
        })
        .catch((error) => {
          console.log(error);
          // res.status(401)
          res.status(401).send("Invalid Token");
        });
      next();
    } catch (error) {
      res.status(401).send("Not Authorized");
    }
  }
  if (!token) {
    console.log("No Token");
    //throw new Error("No Token")
    res.status(401).send("No Token");
  }
};

module.exports = { protect };
