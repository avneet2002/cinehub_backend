const Showtime = require("../models/showtime.model");

const postShowtime = async (req, res) => {
  try {
    const {
      screenId,
      movieId,
      theaterId,
      hall,
      date,
      availableSeats,
      price,
      times,
    } = req.body;

    const showtimeResults = [];

    for (let time of times) {
      const { startTime, endTime } = time;

      // const showtimeExist = await Showtime.findOne({
      //   movieId,
      //   screenId,
      //   theaterId,
      //   startTime,
      //   hall,
      // });

      // if (showtimeExist) {
      //   return res.status(400).json({ message: "Showtime already exist" });
      // }

      const showtime = new Showtime({
        screenId,
        movieId,
        theaterId,
        date,
        hall,
        price: parseInt(price),
        availableSeats: parseInt(availableSeats),
        startTime,
        endTime,
      });

      const newShowtime = await showtime.save();

      showtimeResults.push(newShowtime);
    }

    res.status(200).json({
      message: "Showtimes created successfully",
      newShowtimes: showtimeResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find({});

    if (!showtimes) return;

    res.status(200).json(showtimes);
  } catch (error) {}
};

// 🟢 Delete function
const deleteShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedShowtime = await Showtime.findByIdAndDelete(id);
    
    if (!deletedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    
    res.status(200).json({ message: "Showtime deleted successfully" });
  } catch (error) {
    console.error("Error deleting showtime:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🟢 NAYA ADD KIYA: Update function (Step 2)
const updateShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    const { screenId, movieId, theaterId, hall, date, availableSeats, price, startTime, endTime } = req.body;

    const updatedShowtime = await Showtime.findByIdAndUpdate(
      id,
      {
        screenId,
        movieId,
        theaterId,
        hall,
        date,
        price: parseInt(price),
        availableSeats: parseInt(availableSeats),
        startTime,
        endTime,
      },
      { new: true } // Update hone ke baad naya document return karega
    );

    if (!updatedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    res.status(200).json({ message: "Showtime updated successfully", updatedShowtime });
  } catch (error) {
    console.error("Error updating showtime:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🟢 YAHAN BHI UPDATE KIYA: updateShowtime ko export mein daal diya
module.exports = { postShowtime, getShowtimes, deleteShowtime, updateShowtime };