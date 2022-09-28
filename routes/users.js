var express = require("express");
const { response } = require("../app");
const abc = require("../models/abc");
var router = express.Router();
const User = require("../models/user");
const Project = require("../models/project");
const jwt = require("jsonwebtoken");
const { protect, getprotect } = require("../MiddleWares/AuthMiddleWare");
const bcrypt = require("bcrypt");
const UUID = require("uuid");
const { $where } = require("../models/user");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/submit", (req, res) => {
  // let obj={name:'shweta',surname:'kamble',salary:123344}
  console.log(req.body);
  var user = req.body.User;
  User.findOne({ email: user.email }).then((userinfo) => {
    if (userinfo != null) {
      console.log("user already exists.");
      res.status(200).send("User Already Exist..");
    } else {
      let id = generateUUID();
      user = {
        ...user,
        userid: id,
      };
      console.log(id);
      let u1 = new User(user);
      console.log(u1);
      u1.password = bcrypt.hashSync(u1.password, 10);
      console.log(u1);
      console.error("no user found in db");
      u1.save((err, data) => {
        if (err) console.log(err);
        else {
          console.log(data);
          res.status(201).json({
            ...data,
            token: generateToken(
              {
                _id: u1._id,
                userid: u1.userid,
                firstname: u1.firstname,
                lastname: u1.lastname,
                email: u1.email,
                mobile: u1.mobile,
                skillsets: u1.skillsets,
              },
              false
            ),
          });
        }
      });
    }
  });
});

const generateToken = (user, rememberMe) => {
  const secretKey = "abc123";
  if (rememberMe) return jwt.sign({ user }, secretKey, { expiresIn: "30d" });
  else return jwt.sign({ user }, secretKey, { expiresIn: "6h" });
};

const generateUUID = () => {
  const uuid = UUID.v4();

  return uuid.toString();
};

const refreshtoken = (token = {});

router.post("/login", (req, res) => {
  var user = req.body.LoginUser;
  const rememberMe = user.rememberMe;
  console.log(rememberMe);
  console.log(user);
  User.findOne({ email: user.email })
    .select({
      userid: 1,
      password: 1,
      firstname: 1,
      lastname: 1,
      email: 1,
      mobile: 1,
      projects: 1,
      friends: 1,
      friendsreq: 1,
      skillsets: 1,
      experience: 1,
      description: 1,
      admin: 1,
    })
    .then((data) => {
      console.log("Result : ", data);
      if (data !== null) {
        if (bcrypt.compareSync(user.password, data.password)) {
          console.log("Login Successfull.....");
          res.status(200).send({
            ...data,
            token: generateToken(
              {
                _id: data._id,
                userid: data.userid,
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                mobile: data.mobile,
                skillsets: data.skillsets,
              },
              rememberMe
            ),
          });
        } else {
          console.log("Login Failed...");
          res.status(401).send("Incorrect Email or Password...");
        }
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send("Login Failed...");
    });
});

router.get("/fetchdata", protect, (req, res) => {
  User.find((err, data) => {
    if (err) throw err;
    res.send(data);
  });
});

router.post("/search", (req, res) => {
  console.log(req.body.data.Search);
  User.find({ firstname: req.body.data.Search })
    .then((data) => {
      console.log(data);
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.send(401).send("Data not found.");
    });
});

router.get("/verifytoken", (req, res) => {
  console.log(req.headers.authorization);
  let token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "abc123");
    console.log(decoded);
    User.findOne({ userid: decoded.user.userid })
      .then((data) => {
        console.log(data);
        res.send(data);
      })
      .catch((err) => {
        res.status(400).send("User not found." + err);
      });
  } catch (error) {
    console.log(error);
  }
});

router.put("/joinproj", (req, res) => {
  const token = req.body.headers.authorization.split(" ")[1];
  console.log(token);
  const decoded = jwt.decode(token, "abc123");
  const tokendata = decoded.user;
  const project = req.body.data.project;
  console.log(tokendata);
  User.findOneAndUpdate(
    { userid: tokendata.userid },
    {
      $push: { projects: project },
    }
  ).exec((err, data) => {
    if (err) {
      console.log(err);
      res.status(401).send(err);
    } else {
      console.log(data);
      res.status(200).send({
        ...data,
        token: generateToken(
          {
            _id: data._id,
            userid: data.userid,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            mobile: data.mobile,
            skillsets: data.skillsets,
          },
          false
        ),
      });
    }
  });
  Project.findOneAndUpdate(
    {
      projectid: project.projectid,
    },
    {
      $push: {
        teamusers: {
          firstname: tokendata.firstname,
          lastname: tokendata.lastname,
          skillsets: tokendata.skillsets,
          email: tokendata.email,
          userid: tokendata.userid,
        },
      },
    }
  ).exec();
});

router.put("/update/:id", (req, res) => {
  console.log(req.headers);
  const password = bcrypt.hashSync(req.body.data.EditedUser.password, 10);
  console.log(req.body);
  User.findOneAndUpdate(
    { userid: req.params.id },
    {
      $set: {
        firstname: req.body.data.EditedUser.firstname,
        lastname: req.body.data.EditedUser.lastname,
        email: req.body.data.EditedUser.email,
        password: password,
        mobile: req.body.data.EditedUser.mobile,
        projects: req.body.data.EditedUser.projects,
        skillsets: req.body.data.EditedUser.skillsets,
        friends: req.body.data.EditedUser.friends,
        friendsreq: req.body.data.EditedUser.friendsreq,
        experience: req.body.data.EditedUser.experience,
        description: req.body.data.EditedUser.description,
      },
    }
  )
    .exec()
    .then((data) => {
      console.log(data);
      res.status(200).send({
        ...data,
        token: generateToken(
          {
            _id: data._id,
            userid: data.userid,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            mobile: data.mobile,
            skillsets: data.skillsets,
          },
          false
        ),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/add/:id", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "abc123");
  const tokendata = decoded.user;
  const project = req.body.data.project;
  console.log(tokendata);
  User.findOneAndUpdate(
    { userid: tokendata.userid },
    {
      $push: { projects: project },
    },
    (err, data) => {
      if (err) console.log(err);
      else console.log(data);
    }
  );
});

router.put("/sendreq", (req, res) => {
  const token = req.body.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "abc123");
  User.findById(req.body.data.friend._id)
    .then((data) => {
      const friendreq = {
        firstname: decoded.user.firstname,
        lastname: decoded.user.lastname,
        skillsets: decoded.user.skillsets,
        email: decoded.user.email,
        userid: decoded.user.userid,
        Accepted: false,
      };
      console.log(decoded.user);
      data.friendsreq.push(friendreq);
      data.save((err, data) => {
        if (err) console.log(err);
        else {
          // console.log(data);
          res.status(200).send(data);
        }
      });
    })
    .catch((err) => {
      console.log("not sent" + err);
    });
});

router.put("/acceptreq", (req, res) => {
  const token = req.body.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "abc123");
  const tokendata = decoded.user;
  User.findOneAndUpdate(
    { userid: tokendata.userid },
    {
      $push: {
        friends: {
          firstname: req.body.data.friend.firstname,
          lastname: req.body.data.friend.lastname,
          skillsets: req.body.data.friend.skillsets,
          email: req.body.data.friend.email,
          userid: req.body.data.friend.userid,
        },
      },
    }
  )
    .exec()
    .then((data) => {
      // console.log(data);
      res.status(201).json({
        ...data,
        token: generateToken(
          {
            _id: data._id,
            userid: data.userid,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            mobile: data.mobile,
            skillsets: data.skillsets,
          },
          false
        ),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/addfriend", (req, res) => {
  const token = req.body.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "abc123");
  const tokendata = decoded.user;
  User.findOneAndUpdate(
    { userid: req.body.data.friend.userid },
    {
      $push: {
        friends: {
          firstname: tokendata.firstname,
          lastname: tokendata.lastname,
          skillsets: tokendata.skillsets,
          email: tokendata.email,
          userid: tokendata.userid,
        },
      },
    }
  )
    .exec()
    .then((data) => {
      // console.log(data);
      res.status(201).send("Friend Added");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/rejectreq", (req, res) => {
  console.log(req.body);
  const token = req.body.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "abc123");
  const tokendata = decoded.user;
  // console.log(tokendata);
  const friend = req.body.data.friend.userid;
  console.log(decoded);
  console.log(req.body.data.friend.userid);
  console.log(tokendata.userid);
  User.findOneAndUpdate(
    { userid: tokendata.userid },
    {
      $pull: {
        friendsreq: { userid: req.body.data.friend.userid },
      },
    }
  )
    .exec()
    .then((data) => {
      // console.log(data);
      res.status(201).json({
        ...data,
        token: generateToken(
          {
            _id: data._id,
            userid: data.userid,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            mobile: data.mobile,
            skillsets: data.skillsets,
          },
          false
        ),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/user/:id", (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) res.send("id not found");
    else res.send(data);
  });
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id, (err) => {
    if (err) res.send("not deleted");
    else res.send("deleted");
  });
});

module.exports = router;
