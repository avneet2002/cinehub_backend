const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});

// 🟢 Real-time Seat Locking events
io.on("connection", (socket) => {
  console.log("A user connected with ID:", socket.id);

  // Jab koi user seat select kare
  socket.on("lockSeat", ({ seatId, showtimeId }) => {
    // Is user ko chhod kar baaki sabhi connected users ko batao
    socket.broadcast.emit("seatLocked", { seatId, showtimeId });
  });

  // Jab koi user seat unselect (cancel) kare
  socket.on("unlockSeat", ({ seatId, showtimeId }) => {
    socket.broadcast.emit("seatUnlocked", { seatId, showtimeId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const authRoutes = require("./routes/auth.routes");
const refreshTokenRoutes = require("./routes/refreshToken.routes");
const movieRoutes = require("./routes/movie.routes");
const theaterRoutes = require("./routes/theater.routes");
const screenRoutes = require("./routes/screen.routes");
const showtimeRoutes = require("./routes/showtime.routes");
const concessionRoutes = require("./routes/concession.routes");
const bookingRoutes = require("./routes/booking.routes");
const userRoutes = require("./routes/user.routes");

app.use(express.json());
app.use(cors());

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  let { amount } = req.body;

  amount = Math.round(Number(amount) * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "inr", // 🟢 YAHAN UPDATE KIYA: php ko inr kar diya
      amount,
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.post("/refund", async (req, res) => {
  const { paymentIntentId, amount } = req.body;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
    });

    res
      .status(200)
      .json({ success: true, refund, message: "Refund Successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    server.listen(process.env.PORT, () => {
      console.log("Server and Socket.io running on port " + process.env.PORT);
    });
  })
  .catch((err) => console.log(err));

app.use("/api/auth/", authRoutes);
app.use("/api/refreshToken/", refreshTokenRoutes);
app.use("/api/", movieRoutes);
app.use("/api/", theaterRoutes);
app.use("/api/", screenRoutes);
app.use("/api/", showtimeRoutes);
app.use("/api/", concessionRoutes);
app.use("/api/", bookingRoutes);
app.use("/api/", userRoutes);