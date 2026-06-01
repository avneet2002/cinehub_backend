const Booking = require("../models/booking.model");
const Concession = require("../models/concession.model");
const Showtime = require("../models/showtime.model");
const Movie = require("../models/movie.model");

const postBooking = async (req, res) => {
  try {
    const {
      showtimeId,
      ticket,
      ticketPrice,
      addOns,
      totalAmount,
      paymentIntentId,
    } = req.body;
    const { id } = req.params;

    const showtime = await Showtime.findOne({ _id: showtimeId });
    if (!showtime) {
      return res.status(400).json({ message: `Showtime not found` });
    }

    const unavailableSeats = ticket.filter((seat) =>
      showtime.bookedSeats.includes(seat)
    );

    if (unavailableSeats.length > 0) {
      return res
        .status(400)
        .json({ message: "Selected seat(s) are no longer available." });
    }

    const concessionResults = [];

    for (let addOn of addOns) {
      const { id: addOnId, quantity } = addOn;

      const concession = await Concession.findById(addOnId);
      if (!concession) {
        return res.status(400).json({ message: `Concession not found` });
      }

      if (concession.stock < quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${concession.name}` });
      }

      concession.stock -= quantity;

      await concession.save();
      concessionResults.push(concession);
    }

    const booking = new Booking({
      showtimeId,
      userId: id,
      ticket,
      ticketPrice,
      addOns,
      totalAmount,
      paymentIntentId,
      status: "Paid",
      paymentStatus: "Card",
    });

    const newBooking = await booking.save();

    const updatedShowtime = await Showtime.findByIdAndUpdate(
      showtimeId,
      {
        $push: { bookedSeats: { $each: ticket } },
      },
      { new: true }
    );

    res.status(201).json({
      message: "Booked Successfully!",
      newBooking,
      updatedConcession: concessionResults,
      updatedShowtime,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const refundBooking = async (req, res) => {
  try {
    const { showtimeId, ticket, addOns, bookingId } = req.body;
    const { id } = req.params;

    console.log(showtimeId, ticket, addOns, bookingId);
    console.log(id);

    const userBooking = await Booking.findOne({ userId: id, _id: bookingId });
    if (!userBooking) {
      return res
        .status(400)
        .json({ message: `You don't have authorize in this booking` });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "Refunded" },
      { new: true }
    );

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    showtime.bookedSeats = showtime.bookedSeats.filter(
      (seat) => !ticket.includes(seat)
    );

    const updatedShowtime = await showtime.save();

    const concessionResults = [];

    for (let addOn of addOns) {
      const { id: addOnId, quantity } = addOn;

      const concession = await Concession.findById(addOnId);
      if (!concession) {
        return res.status(400).json({ message: `Concession not found` });
      }

      concession.stock += quantity;

      await concession.save();
      concessionResults.push(concession);
    }

    res.status(201).json({
      message: "Refunded Successfully!",
      updatedBooking,
      updatedShowtime,
      updatedConcession: concessionResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.find({});

    if (!booking) return;

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rateBooking = async (req, res) => {
  try {
    const { bookingId, rating, movieId } = req.body;
    const { id } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(400).json({ message: `Showtime not found` });
    }

    const alreadyReviewed = movie.reviews.some(
      (review) =>
        review.userId?.toString() === id &&
        review.bookingId?.toString() === bookingId
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: `Booked already reviewed` });
    }

    movie.reviews.push({
      bookingId,
      movieId,
      userId: id,
      rating,
    });

    const updatedMovie = await movie.save();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(400).json({ message: `Showtime not found` });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        isReviewed: true,
      },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Rated successfully!", updatedMovie, updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { postBooking, getBooking, refundBooking, rateBooking };
