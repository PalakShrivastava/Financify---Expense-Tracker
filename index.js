const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");

// Models
const User = require("./models/user.js");
const ExpenseGroup = require("./models/expenseGroup");

// Routes
const authRoutes = require("./routes/auth");

// ------------------------
// Connect to MongoDB
// ------------------------
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/financify');
  console.log("Connected successfully to MongoDB");
}

// ------------------------
// App settings
// ------------------------
app.set("view engine","ejs");
app.engine('ejs', engine); 
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// ------------------------
// Body parser
// ------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------------
// Session setup
// ------------------------
app.use(
  session({
    secret: "secretcode",
    resave: false,
    saveUninitialized: false,
  })
);

// ------------------------
// Passport setup
// ------------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------------
// Make user available in all views
// ------------------------
app.use((req, res, next) => {
  res.locals.user = req.user; // current logged-in user
  next();
});

// ------------------------
// Middleware to protect routes
// ------------------------
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// ------------------------
// Routes
// ------------------------
app.use("/", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.render("pages/home", { 
    title: "Home",
    hideNavbar: false
  });
});

// Expense entry page (Protected)
app.get("/next", isLoggedIn, (req, res) => {
  res.render("pages/next", { 
    title: "Track Your Expenses", 
    hideNavbar: false,
  });
});

// Save group of expenses (Protected)
app.post("/expenses/save", isLoggedIn, async (req, res) => {
  try {
    const { expenses } = req.body;
    const parsedExpenses = JSON.parse(expenses);

    if (!Array.isArray(parsedExpenses) || parsedExpenses.length === 0) {
      return res.status(400).send("No expenses provided");
    }

    const today = new Date();
    const options = { day: "numeric", month: "short", year: "numeric" };
    const groupName = today.toLocaleDateString("en-GB", options);

    const newGroup = new ExpenseGroup({
      date: today,
      groupName,
      expenses: parsedExpenses,
      user: req.user._id // link group to logged-in user
    });

    await newGroup.save();
    res.redirect("/my-expenses");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving expenses");
  }
});

// Show all saved groups (only current user's groups)
app.get("/my-expenses", isLoggedIn, async (req, res) => {
  try {
    const groups = await ExpenseGroup.find({ user: req.user._id });
    res.render("pages/myExpenses", { 
      title: "My Expenses", 
      groups,
      hideNavbar: false
    });
  } catch (err) {
    console.log(err);
    res.send("Error fetching expenses");
  }
});

// Show details of a specific group (only if owned by user)
app.get("/my-expenses/:id", isLoggedIn, async (req, res) => {
  try {
    const group = await ExpenseGroup.findById(req.params.id);
    if (!group || !group.user.equals(req.user._id)) {
      return res.status(403).send("Unauthorized access");
    }
    res.render("pages/expenseDetails", { 
      title: group.groupName, 
      group,
      hideNavbar: false
    });
  } catch (err) {
    console.log(err);
    res.send("Error fetching expense details");
  }
});

// About us route
app.get("/about", (req, res) => {
  res.render("pages/about", { 
    title: "About Us - Financify",
    hideNavbar: false,
  });
});

// Delete group (only if owned by user)
app.delete("/my-expenses/:id", isLoggedIn, async (req, res) => {
  try {
    const group = await ExpenseGroup.findById(req.params.id);
    if (!group || !group.user.equals(req.user._id)) {
      return res.status(403).send("Unauthorized action");
    }
    await group.deleteOne();
    res.redirect("/my-expenses"); 
  } catch (err) {
    console.log(err);
    res.send("Error deleting expense group");
  }
});

// ------------------------
// Start server
// ------------------------
const port = 3000;
app.listen(port, () => {
  console.log("Server is listening on port", port);
});
