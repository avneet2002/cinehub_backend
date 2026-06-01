const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// AUTH VALIDATION
const loginBodyValidation = (body) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });

  return schema.validate(body);
};

const signUpBodyValidation = (body) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .label("Confirm Password")
      .messages({ "any.only": "Password does not match" }),
  });

  return schema.validate(body);
};

const refreshTokenBodyValidation = (body) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required().label("Refresh Token"),
  });

  return schema.validate(body);
};

// MOVIE VALIDATION
const movieBodyValidation = (body) => {
  const schema = Joi.object({
    title: Joi.string().required().label("Title"),
    rating: Joi.string().required().label("Rating"),
    poster: Joi.string().uri().required().label("Poster"),
    background: Joi.string().uri().required().label("Background"),
    trailer: Joi.string().uri().required().label("Trailer"),
    releaseDate: Joi.date().required().label("Release Date"),
    duration: Joi.number().required().label("Duration"),
    genre: Joi.array().items(Joi.string()).required().label("Genre"),
    overview: Joi.string().required().label("Overview"),
    director: Joi.string().required().label("Director"),
    cast: Joi.array()
      .items(
        Joi.object({
          artist: Joi.string().required().label("Artist"),
          name: Joi.string().required().label("Name"),
          _id: Joi.string().label("Id"),
        })
      )
      .required()
      .label("Cast"),
  });

  return schema.validate(body);
};

// THEATER VALIDATION
const theaterBodyValidation = (body) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    cinemaImg: Joi.string().uri().required().label("Cinema Image"),
    location: Joi.object({
      address: Joi.string().required().label("Address"),
      city: Joi.string().required().label("City"),
      mapUrl: Joi.string().uri().required().label("Map Url"),
    })
      .required()
      .label("Location"),
    amenities: Joi.array().required().label("Amenities"),
    contact: Joi.object({
      phone: Joi.string().required().label("Phone"),
      email: Joi.string().required().label("Email"),
    })
      .required()
      .label("Contact"),
    operatingHours: Joi.object({
      open: Joi.string().required().label("Open"),
      close: Joi.string().required().label("Close"),
    })
      .required()
      .label("Operating Hours"),
  });

  return schema.validate(body);
};

module.exports = {
  loginBodyValidation,
  signUpBodyValidation,
  refreshTokenBodyValidation,
  movieBodyValidation,
  theaterBodyValidation,
};
