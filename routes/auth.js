const express = require("express");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

// =======================
// SIGN UP form
// =======================
router.get("/signUp", (req, res) => {
  res.render("pages/signUp", { 
    title: "Sign Up", 
    hideNavbar: true,
    user: req.user || null
  });
});

// =======================
// SIGN UP user
// =======================
router.post("/signUp", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });

    // register user (passport-local-mongoose handle karega hash+salt)
    const registeredUser = await User.register(newUser, password);

    // auto login after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      // signup ke baad home pe redirect
      res.redirect("/");
    });
  } catch (err) {
    console.log("Signup error:", err);
    res.redirect("/signUp");
  }
});

// =======================
// LOGIN form
// =======================
router.get("/login", (req, res) => {
  res.render("pages/login", { 
    title: "Login", 
    hideNavbar: true,
    user: req.user || null
  });
});

// =======================
// LOGIN user
// =======================
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // login ke baad home pe redirect
    res.redirect("/");
  }
);
// GET Change Password form
router.get("/change-password", isLoggedIn, (req, res) => {
  res.render("pages/changePassword", { title: "Change Password", hideNavbar: false, user: req.user });
});

// POST Change Password
router.post("/change-password", isLoggedIn, async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.send("New password and confirm password do not match");
  }

  try {
    const user = await User.findById(req.user._id);
    await user.changePassword(oldPassword, newPassword); // passport-local-mongoose method
    res.send("Password changed successfully! <a href='/'>Go to Home</a>");
  } catch (err) {
    console.log(err);
    res.send("Error changing password. Please check your old password.");
  }
});

// =======================
// LOGOUT user
// =======================
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    // logout ke baad home page pe redirect
    res.redirect("/");
  });
});

// =======================
// PROTECTED dashboard
// =======================
router.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("pages/dashboard", {
    title: "Dashboard",
    user: req.user, // logged-in user info
    hideNavbar: false,
  });
});

// =======================
// Middleware
// =======================
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
