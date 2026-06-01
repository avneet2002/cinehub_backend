const Movie = require("../models/movie.model");
const { movieBodyValidation } = require("../utils/validationSchema");

const postMovie = async (req, res) => {
  const { error } = movieBodyValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }

  try {
    const {
      title,
      poster,
      background,
      trailer,
      releaseDate,
      duration,
      genre,
      overview,
      director,
      cast,
      rating,
    } = req.body;

    const existingMovie = await Movie.findOne({ title });
    if (existingMovie) {
      return res.status(400).json({ message: "Movie already exist" });
    }

    const movie = await Movie.create({
      title,
      poster,
      background,
      trailer,
      releaseDate,
      duration,
      genre,
      overview,
      director,
      cast,
      rating,
    });

    res
      .status(200)
      .json({ message: "Movie created successfully", newMovie: movie });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const putMovie = async (req, res) => {
  const { error } = movieBodyValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }

  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(400).json({ message: "Movie not found" });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Movie edited successfully", updatedMovie });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(400).json({ message: "Movie not found" });
    }

    await Movie.findByIdAndDelete(id);

    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find({});

    if (!movies) return;

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { postMovie, putMovie, deleteMovie, getMovies };
