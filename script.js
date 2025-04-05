document.addEventListener("DOMContentLoaded", function() {
  // Populate time dropdowns
  populateTimeDropdowns();
  
  // Load saved tasks from localStorage
  loadTasks();

  // Add task button event listener
  document.getElementById("addTaskBtn").addEventListener("click", addTask);

  // Filter tasks event listener
  document.getElementById("filterTasks").addEventListener("change", filterTasks);
  
  // Search tasks event listener
  document.getElementById("searchTasks").addEventListener("input", searchTasks);
  
  // Navigation buttons event listeners
  document.getElementById("todayBtn").addEventListener("click", function() {
    document.getElementById("filterTasks").value = "today";
    filterTasks();
  });
  
  document.getElementById("upcomingBtn").addEventListener("click", function() {
    document.getElementById("filterTasks").value = "upcoming";
    filterTasks();
  });
  
  document.getElementById("completedBtn").addEventListener("click", function() {
    showCompletedTasks();
  });
});

function populateTimeDropdowns() {
  const startHour = document.getElementById("startHour");
  const endHour = document.getElementById("endHour");
  
  // Clear any existing options except the first one
  while (startHour.options.length > 1) {
    startHour.remove(1);
  }
  
  while (endHour.options.length > 1) {
    endHour.remove(1);
  }
  
  // Add time options for 24-hour format
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    
    // Add full hours
    const optionStart = document.createElement("option");
    optionStart.value = `${hour}:00`;
    optionStart.textContent = `${hour}:00`;
    startHour.appendChild(optionStart);
    
    const optionEnd = document.createElement("option");
    optionEnd.value = `${hour}:00`;
    optionEnd.textContent = `${hour}:00`;
    endHour.appendChild(optionEnd);
    
    // Add half hours
    const optionStartHalf = document.createElement("option");
    optionStartHalf.value = `${hour}:30`;
    optionStartHalf.textContent = `${hour}:30`;
    startHour.appendChild(optionStartHalf);
    
    const optionEndHalf = document.createElement("option");
    optionEndHalf.value = `${hour}:30`;
    optionEndHalf.textContent = `${hour}:30`;
    endHour.appendChild(optionEndHalf);
  }
}

function addTask() {
  const taskName = document.getElementById("taskName").value;
  const taskDate = document.getElementById("taskDate").value;
  const startTime = document.getElementById("startHour").value;
  const endTime = document.getElementById("endHour").value;

  if (taskName === "" || taskDate === "" || startTime === "" || endTime === "") {
    alert("Please fill in all fields!");
    return;
  }

  // Validate that end time is after start time
  if (startTime >= endTime) {
    alert("End time must be after start time!");
    return;
  }

  const task = {
    id: Date.now(),
    name: taskName,
    date: taskDate,
    startTime: startTime,
    endTime: endTime,
    completed: false
  };

  // Add task to localStorage
  saveTask(task);

  // Create and append task element
  createTaskElement(task);

  // Clear inputs
  document.getElementById("taskName").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("startHour").selectedIndex = 0;
  document.getElementById("endHour").selectedIndex = 0;
}

function createTaskElement(task) {
  const taskList = document.getElementById("taskList");

  const li = document.createElement("li");
  li.className = task.completed ? "task-item completed" : "task-item";
  li.dataset.id = task.id;

  const taskDetails = document.createElement("div");
  taskDetails.className = "task-details";
  
  const taskNameEl = document.createElement("div");
  taskNameEl.className = "task-name";
  taskNameEl.textContent = task.name;
  
  const taskTimeEl = document.createElement("div");
  taskTimeEl.className = "task-time";
  taskTimeEl.textContent = `${task.date} | ${task.startTime} - ${task.endTime}`;
  
  taskDetails.appendChild(taskNameEl);
  taskDetails.appendChild(taskTimeEl);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  
  const completeBtn = document.createElement("button");
  if (task.completed) {
    completeBtn.className = "undo-btn";
    completeBtn.textContent = "Undo";
  } else {
    completeBtn.className = "complete-btn";
    completeBtn.textContent = "Complete";
  }
  
  completeBtn.addEventListener("click", function() {
    toggleTaskComplete(task.id);
  });

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";

  removeBtn.addEventListener("click", function() {
    removeTask(task.id);
  });

  actions.appendChild(completeBtn);
  actions.appendChild(removeBtn);

  li.appendChild(taskDetails);
  li.appendChild(actions);
  taskList.appendChild(li);
}

function saveTask(task) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  
  tasks.forEach(task => {
    createTaskElement(task);
  });
}

function removeTask(taskId) {
  // Remove from DOM
  const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
  if (taskElement) {
    taskElement.remove();
  }
  
  // Remove from localStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleTaskComplete(taskId) {
  // Update in localStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    
    // Refresh the task display
    loadTasks();
  }
}

function filterTasks() {
  const filterValue = document.getElementById("filterTasks").value;
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  
  const today = new Date().toISOString().split('T')[0];
  
  const filteredTasks = tasks.filter(task => {
    if (filterValue === "all") return true;
    if (filterValue === "today") return task.date === today;
    if (filterValue === "upcoming") return task.date > today;
    if (filterValue === "overdue") return task.date < today && !task.completed;
    return true;
  });
  
  filteredTasks.forEach(task => {
    createTaskElement(task);
  });
}

function searchTasks() {
  const searchValue = document.getElementById("searchTasks").value.toLowerCase();
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  
  const filteredTasks = tasks.filter(task => {
    return task.name.toLowerCase().includes(searchValue);
  });
  
  filteredTasks.forEach(task => {
    createTaskElement(task);
  });
}

function showCompletedTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  
  const completedTasks = tasks.filter(task => task.completed);
  
  completedTasks.forEach(task => {
    createTaskElement(task);
  });
}