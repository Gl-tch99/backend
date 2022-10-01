var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
// const socket = require("socket.io");
var sockIO = require("socket.io")();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var projectsRouter = require("./routes/projects");
var messagesRouter = require("./routes/messages");
var app = express();
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/LetsCollab")
  .then(() => console.log("connected"))
  .catch(() => console.log("error"));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: "*",
  })
);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/projects", projectsRouter);
app.use("/messages", messagesRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// app.sockIO = sockIO;
// app.Cors = cors;
// sockIO.on("connection", function (socket) {
//   console.log("A client connection occurred!");
// });

// sockIO.on("send-msg", (data) => {
//   const sendUserSocket = onlineUsers.get(data.to);
//   if (sendUserSocket) {
//     sockIO.to(sendUserSocket).emit("msg-recieve", data.msg);
//   }
// });

// const io = socket(, {
//   cors: {
//     origin: "http://localhost:3001",
//     credentials: true,
//   },
// });

// global.onlineUsers = new Map();
// io.on("connection", (socket) => {
//   console.log(socket.id);

//   socket.on("add-user", (userId) => {
//     //  onlineUsers.set(userId, socket.id);
//     console.log("added user");
//   });

//   socket.on("send-msg", (data) => {
//     const sendUserSocket = onlineUsers.get(data.to);
//     if (sendUserSocket) {
//       socket.to(sendUserSocket).emit("msg-recieve", data.msg);
//     }
//   });
// });

module.exports = app;
