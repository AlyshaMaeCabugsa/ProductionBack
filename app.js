require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require('./models/userDetails'); 
const UserProfile = require('./models/userProfile');
const resetApplications = require('./utils/resetApplication.js');

const app = express();

module.exports = app;

// CORS and Body Parsing Middlewares
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// View Engine Setup
app.set("view engine", "ejs");

// Routes
const establishmentRoutes = require('./routes/establishment');
const annualRecordsRoutes = require('./routes/annualRecord');
const inspectionRoutes = require('./routes/inspection'); 
const staffContactsRouter = require('./routes/staffContacts');
const pdfRoutes = require('./routes/pdfRoutes');
const alertsRoutes = require('./routes/alerts');
const recentInspectionsRoutes = require('./routes/recentInspections');
const userDataRoutes = require('./routes/userData');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/application'); 
const pdfApplicationRoutes = require('./routes/pdfApplicationRoutes');





app.use('/api/establishments', establishmentRoutes);
app.use('/api/annualrecords', annualRecordsRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/staffContacts', staffContactsRouter);
app.use('/pdf', pdfRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/recentInspections', recentInspectionsRoutes);
app.use('/api', userDataRoutes);
app.use('/api/users', userRoutes);
app.use('/api', applicationRoutes);
app.use('/api', pdfApplicationRoutes);







// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to database"))
  .catch(e => {
    console.error("Database connection error:", e);
    process.exit(1); // Exit with an error
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
  });

// Additional Models
require("./models/userDetails.js");
require('./websocketServer');
require('./services/reminderService.js');
resetApplications();




//const User = mongoose.model("UserInfo");

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: "error", error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: "ok",
      token: token,
      userType: user.userType,
      profileComplete: user.profileComplete,
      // Send the user ID only if the logged-in user is not an admin
      userId: user.userType !== 'Admin' ? user._id : undefined,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ status: "error", error: "Internal server error" });
  }
});

// app.listen(5000, () => {
//   console.log("Server Started");
// });

if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, () => {
    console.log("Server Started");
  });
}





app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "adarsh438tcsckandivali@gmail.com",
        pass: "rmdklolcsmswvyfw",
      },
    });

    var mailOptions = {
      from: "youremail@gmail.com",
      to: "thedebugarena@gmail.com",
      subject: "Password Reset",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    console.log(link);
  } catch (error) { }
});

app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
});

app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});



