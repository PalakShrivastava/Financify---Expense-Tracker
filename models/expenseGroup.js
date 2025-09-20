const mongoose = require("mongoose");

const expenseGroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  expenses: [
    {
      item: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      category: {
        type: String,
        enum: ["Food", "Travel", "Shopping", "Bills", "Other"],
        default: "Other"
      }
    }
  ],
  // -------------------------------
  // Reference to the user who owns this group
  // -------------------------------
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const ExpenseGroup = mongoose.model("ExpenseGroup", expenseGroupSchema);
module.exports = ExpenseGroup;
