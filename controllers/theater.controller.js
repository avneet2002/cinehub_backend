const Theater = require("../models/theater.model");
const { theaterBodyValidation } = require("../utils/validationSchema");

const postTheater = async (req, res) => {
  const { error } = theaterBodyValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }

  try {
    const { name, cinemaImg, location, amenities, contact, operatingHours } =
      req.body;

    const existingTheater = await Theater.findOne({ name });
    if (existingTheater) {
      return res.status(400).json({ message: "Theater already exist" });
    }

    const newTheater = await Theater.create({
      name,
      cinemaImg,
      location,
      amenities,
      contact,
      operatingHours,
    });

    res
      .status(200)
      .json({ message: "Theater created successfully", newTheater });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const putTheater = async (req, res) => {
  const { error } = theaterBodyValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }

  try {
    const { id } = req.params;

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(400).json({ message: "Theater didn't exist" });
    }

    const updatedTheater = await Theater.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Theater updated successfully", updatedTheater });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(400).json({ message: "Theater didn't exist" });
    }

    await Theater.findByIdAndDelete(id);

    res.status(200).json({ message: "Theater deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTheater = async (req, res) => {
  try {
    const theaters = await Theater.find({});

    if (!theaters) {
      return;
    }

    res.status(200).json(theaters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { postTheater, putTheater, deleteTheater, getTheater };
