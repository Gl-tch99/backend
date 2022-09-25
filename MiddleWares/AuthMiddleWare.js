const jwt = require("jsonwebtoken");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const protect = (req, res, next) => {
  token = req.body.headers.authorization;
  console.log(req.body);
  if (!token) console.log("no token");
  if (
    req.body.headers.authorization &&
    req.body.headers.authorization.startsWith("Bearer")
  ) {
    try {
      console.log("MiddleWare");
      let token = req.body.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "abc123");
      // User.findOne({ email: decoded.user.email })
      //   .then((user) => {
      //     console.log(user);
      //     req.user = user;
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     // res.status(401)
      //     res.status(401).send("Invalid Token");
      //   });
      req.next();
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

const getprotect = (req, res, next) => {
  token = req.body.headers.authorization;
  console.log(req.body);
  if (!token) console.log("no token");
  if (
    req.body.headers.authorization &&
    req.body.headers.authorization.startsWith("Bearer")
  ) {
    try {
      console.log("MiddleWare");
      let token = req.body.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "abc123");

      // User.findOne({ email: decoded.user.email })
      //   .then((user) => {
      //     console.log(user);
      //     req.user = user;
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     // res.status(401)
      //     res.status(401).send("Invalid Token");
      //   });
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

module.exports = { protect, getprotect };
