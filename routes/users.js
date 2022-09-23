var express = require("express");
const { response } = require("../app");
const abc = require("../models/abc");
const user = require("../models/user");
var router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { protect } = require("../MiddleWares/AuthMiddleWare");
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
            token: generateToken(u1, false),
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
            token: generateToken(data, rememberMe),
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
  } catch {}
});

router.put("/update/:id", (req, res) => {
  console.log(req.params.id);
  User.findById(req.params.id, (err, data) => {
    if (err) throw err;
    console.log(data);
    data.firstname = req.body.UpdateUser.firstname;
    data.lastname = req.body.UpdateUser.lastname;
    data.email = req.body.UpdateUser.email;
    data.password = req.body.UpdateUser.password;
    data.mobile = req.body.UpdateUser.mobile;
    data.projects = req.body.UpdateUser.projects;
    data.skillsets = req.body.UpdateUser.skillsets;
    data.friends = req.body.UpdateUser.friends;
    data.friendsreq = req.body.UpdateUser.friendsreq;
    data.experience = req.body.UpdateUser.experience;
    data.description = req.body.UpdateUser.description;
    data.save((err) => {
      if (err) res.send("not updated");
      else res.send("data updated");
    });
  });
});

router.put("/add/:id", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "abc123");
  const tokendata = decoded.user;
  console.log(tokendata);
  User.findById(req.params.id)
    .then((data) => {
      User.findById(tokendata._id)
        .then((user) => {
          user.friends.push(data);
          // data.friends.push(user);
          // data.friendsreq.pull({
          //   $where: { name: user.firstname + " " + user.lastname },
          // });
          user.friendsreq.pull({
            $where: { name: data.firstname + "" + data.lastname },
          });
          user.save((err, doc) => {
            if (err) console.log(err);
            else console.log(doc);
          });
          // data.save((err, doc) => {
          //   if (err) console.log(err);
          //   else console.log(doc);
          // });
          console.log("friend added");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/sendreq/", (req, res) => {
  console.log(req.body);
  const token = req.body.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "abc123");
  console.log(decoded);
  User.findById(req.body.data.id)
    .then((data) => {
      data.friendsreq.push({
        name: decoded.user.firstname + " " + decoded.user.lastname,
        userid: decoded.user.userid,
        Accepted: false,
      });
      data.save((err, data) => {
        if (err) console.log(err);
        else {
          console.log(data);
          res.status(200).send(data);
        }
      });
    })
    .catch((err) => {
      console.log("not sent" + err);
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
