const enterBtn = document.querySelector("#enterBtn");
const currentAmountInput = document.querySelector("#currentAmount");
const showAmount = document.querySelector("#showAmount");
const expenseBox = document.querySelector("#expenseBox");
const addBtn = document.querySelector("#addBtn");
const expenseList = document.querySelector("#expenseList");
const expensesInput = document.querySelector("#expensesInput");

let currAmt = 0;
let expenses = [];

// Step 1: Enter total amount
enterBtn.addEventListener("click", () => {
  const value = currentAmountInput.value.trim();
  if (!value || isNaN(value) || Number(value) <= 0) {
    alert("Please enter a valid total amount");
    currentAmountInput.value = "";
    return;
  }

  currAmt = Number(value);
  showAmount.innerText = `Current Amount: ₹${currAmt}`;
  currentAmountInput.value = "";
  currentAmountInput.parentElement.style.display = "none";
  expenseBox.style.display = "block";
});

// Step 2: Add expense
addBtn.addEventListener("click", () => {
  const category = document.querySelector("#category").value;
  const item = document.querySelector("#item").value.trim();
  const amount = document.querySelector("#amount").value.trim();

  if (!item || !amount || isNaN(amount) || Number(amount) <= 0) {
    alert("Please enter valid expense details");
    return;
  }

  const expenseAmount = Number(amount);
  if (expenseAmount > currAmt) {
    alert("Expense exceeds current amount");
    return;
  }

  const expense = { category, item, amount: expenseAmount };
  expenses.push(expense);

  // Add to UI list
  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between align-items-center";
  li.style.gap = "10px";
  li.style.flexWrap = "nowrap";
  li.innerHTML = `
    <span class="fw-bold" style="flex:3;">${expense.item}</span>
    <span class="text-muted" style="flex:2;">${expense.category}</span>
    <span class="fw-bold" style="flex:2;">₹${expense.amount}</span>
    <button class="btn btn-sm btn-danger" style="flex:1; min-width:50px;">X</button>
  `;
  expenseList.appendChild(li);

  currAmt -= expenseAmount;
  showAmount.innerText = `Current Amount: ₹${currAmt}`;

  document.querySelector("#item").value = "";
  document.querySelector("#amount").value = "";

  expensesInput.value = JSON.stringify(expenses);

  // Remove item logic
  li.querySelector("button").addEventListener("click", () => {
    expenseList.removeChild(li);
    currAmt += expenseAmount;
    showAmount.innerText = `Current Amount: ₹${currAmt}`;
    expenses = expenses.filter(e => e !== expense);
    expensesInput.value = JSON.stringify(expenses);
  });
});
