const mongoose = require("mongoose");
const Project = new mongoose.Schema({
  projectid: {
    type: String,
    required: [true],
    minLength: [36],
    maxLength: [36],
  },
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },

  creatorid: {
    type: String,
    required: [true],
    minLength: [36],
    maxLength: [36],
  },

  description: {
    type: String,
    required: [true],
    minLength: [5, "Description is neccesary"],
    maxLength: [150, "Should not exceed 150 characters"],
  },

  requirements: {
    type: [],
    required: [true],
  },

  projectDoc: {
    type: String,
  },

  technologies: {
    type: [],
    required: [true],
  },

  payment: {
    type: String,
    required: [true],
    select: false,
  },

  status: {
    type: String,
    required: [true, "Please enter valid status"],
    default: "Working",
  },

  leaderid: {
    type: String,
    required: [true, "Please enter leaderid"],
    minLength: [36],
    maxLength: [36],
  },

  teamusers: {
    type: [{}],
  },
});

module.exports = mongoose.model("Project", Project);
