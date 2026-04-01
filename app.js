// Enable Notifications
let notificationPermission = false;

document.getElementById('notification-btn').onclick = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        notificationPermission = true;
        document.getElementById('notification-btn').textContent = '✅ Notifications Enabled';
        document.getElementById('notification-btn').style.background = '#4CAF50';
        
        // Store in localStorage that notifications are allowed
        localStorage.setItem('notifications', 'granted');
    }
};

// Check if notifications were already allowed
if (localStorage.getItem('notifications') === 'granted') {
    notificationPermission = true;
    document.getElementById('notification-btn').textContent = '✅ Notifications Enabled';
}

// Load todos from storage
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Function to show notification
function showNotification(title, message) {
    if (notificationPermission || Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
}

// Add todo
function addTodo() {
    const text = document.getElementById('todo-text').value;
    const time = document.getElementById('todo-time').value;
    
    if (!text) {
        alert('Please enter a task');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        time: time,
        completed: false
    };
    
    todos.push(todo);
    saveTodos();
    renderTodos();
    
    // Set alarm
    if (time) {
        setAlarm(todo);
    }
    
    document.getElementById('todo-text').value = '';
    document.getElementById('todo-time').value = '';
}

// Set alarm for todo
function setAlarm(todo) {
    const alarmTime = new Date(todo.time).getTime();
    const now = new Date().getTime();
    const timeUntil = alarmTime - now;
    
    if (timeUntil > 0) {
        setTimeout(() => {
            showNotification('⏰ ALARM!', `Time to: ${todo.text}`);
            // Play a beep sound (simple alert)
            alert(`🔔 ALARM: ${todo.text}`);
        }, timeUntil);
        
        console.log(`Alarm set for ${todo.text} at ${new Date(todo.time)}`);
    }
}

// Save todos
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todo list
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '<h3>Your Tasks:</h3>';
    
    const sortedTodos = [...todos].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    sortedTodos.forEach(todo => {
        const div = document.createElement('div');
        div.className = 'todo-item';
        
        const timeDisplay = todo.time ? new Date(todo.time).toLocaleString() : 'No deadline';
        const isPast = todo.time && new Date(todo.time) < new Date();
        
        div.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   onclick="toggleTodo(${todo.id})">
            <span style="${todo.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}
                         ${isPast && !todo.completed ? 'color: red; font-weight: bold;' : ''}">
                ${todo.text}
            </span>
            <small style="font-size: 12px; color: gray;">📅 ${timeDisplay}</small>
            <button onclick="deleteTodo(${todo.id})" style="background: red; color: white; border: none;">❌</button>
        `;
        todoList.appendChild(div);
    });
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Save daily goals
function saveGoals() {
    const goal1 = document.getElementById('goal1').value;
    const goal2 = document.getElementById('goal2').value;
    
    const goals = { goal1, goal2, date: new Date().toDateString() };
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    alert('Goals saved for today!');
}

// Load today's goals
function loadGoals() {
    const saved = JSON.parse(localStorage.getItem('dailyGoals'));
    if (saved && saved.date === new Date().toDateString()) {
        if (saved.goal1) document.getElementById('goal1').value = saved.goal1;
        if (saved.goal2) document.getElementById('goal2').value = saved.goal2;
    }
}

// Check for expired todos on page load
function checkExpiredTodos() {
    todos.forEach(todo => {
        if (todo.time && !todo.completed && new Date(todo.time) < new Date()) {
            showNotification('⚠️ Overdue Task', `${todo.text} is overdue!`);
        }
    });
}

// Initialize
renderTodos();
loadGoals();
checkExpiredTodos();

// Check every minute for expired tasks
setInterval(checkExpiredTodos, 60000);
