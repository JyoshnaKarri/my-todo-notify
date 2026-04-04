// ========== STREAK SYSTEM ==========
let streak = JSON.parse(localStorage.getItem('streak')) || {
    count: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    history: {}
};

// ========== HABITS SYSTEM ==========
let habits = JSON.parse(localStorage.getItem('habits')) || {
    unstop: { streak: 0, lastCompleted: null, history: {} },
    linkedin: { streak: 0, lastCompleted: null, history: {} },
    gmail: { streak: 0, lastCompleted: null, history: {} }
};

// ========== HACKATHON SYSTEM ==========
let hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];

// ========== COMPLETED GOALS HISTORY ==========
let completedGoalsHistory = JSON.parse(localStorage.getItem('completedGoalsHistory')) || [];

// ========== INITIALIZE HISTORY ==========
function initHistory() {
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        if (streak.history[dateKey] === undefined) {
            streak.history[dateKey] = false;
        }
    }
    saveStreak();
}

function saveStreak() {
    localStorage.setItem('streak', JSON.stringify(streak));
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// ========== UPDATE STREAK ==========
function updateStreak() {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    
    if (streak.history[todayKey]) {
        return false;
    }
    
    streak.history[todayKey] = true;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    const lastCompleted = streak.lastCompletedDate ? new Date(streak.lastCompletedDate).toISOString().split('T')[0] : null;
    
    if (lastCompleted === yesterdayKey) {
        streak.count++;
    } else {
        streak.count = 1;
    }
    
    if (streak.count > streak.bestStreak) {
        streak.bestStreak = streak.count;
    }
    
    streak.lastCompletedDate = new Date().toISOString();
    saveStreak();
    
    // Add to completed goals history
    addToCompletedHistory('Daily Goals Completed');
    
    updateAllDisplays();
    return true;
}

// ========== ADD TO COMPLETED HISTORY ==========
function addToCompletedHistory(goalText) {
    const now = new Date();
    completedGoalsHistory.unshift({
        text: goalText,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        timestamp: now.getTime()
    });
    
    // Keep only last 50 items
    if (completedGoalsHistory.length > 50) {
        completedGoalsHistory = completedGoalsHistory.slice(0, 50);
    }
    
    localStorage.setItem('completedGoalsHistory', JSON.stringify(completedGoalsHistory));
    renderCompletedGoals();
}

function renderCompletedGoals() {
    const container = document.getElementById('completed-goals-list');
    if (!container) return;
    
    if (completedGoalsHistory.length === 0) {
        container.innerHTML = '<p style="color: gray; text-align: center;">No completed goals yet. Complete your daily goals to see them here!</p>';
        return;
    }
    
    container.innerHTML = completedGoalsHistory.map(goal => `
        <div class="completed-goal-item">
            <span>✅ ${goal.text}</span>
            <span class="goal-date">${goal.date} ${goal.time}</span>
        </div>
    `).join('');
}

function clearCompletedHistory() {
    if (confirm('Are you sure you want to clear all completed goals history?')) {
        completedGoalsHistory = [];
        localStorage.setItem('completedGoalsHistory', JSON.stringify(completedGoalsHistory));
        renderCompletedGoals();
    }
}

// ========== HABITS TRACKING ==========
function toggleHabit(habitName) {
    const checkbox = document.getElementById(`habit-${habitName}`);
    const today = new Date().toISOString().split('T')[0];
    
    if (checkbox.checked) {
        const lastCompleted = habits[habitName].lastCompleted;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        
        if (lastCompleted === yesterdayKey) {
            habits[habitName].streak++;
        } else if (lastCompleted === today) {
            // Already completed today
            return;
        } else {
            habits[habitName].streak = 1;
        }
        
        habits[habitName].lastCompleted = today;
        saveHabits();
        updateHabitDisplay();
    }
}

function updateHabitDisplay() {
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById('unstop-streak').textContent = `Streak: ${habits.unstop.streak}`;
    document.getElementById('linkedin-streak').textContent = `Streak: ${habits.linkedin.streak}`;
    document.getElementById('gmail-streak').textContent = `Streak: ${habits.gmail.streak}`;
    
    document.getElementById('habit-unstop').checked = habits.unstop.lastCompleted === today;
    document.getElementById('habit-linkedin').checked = habits.linkedin.lastCompleted === today;
    document.getElementById('habit-gmail').checked = habits.gmail.lastCompleted === today;
}

function saveHabits() {
    saveHabits();
    alert('Habits saved for today!');
    updateHabitDisplay();
}

// ========== HACKATHON TRACKER ==========
function addHackathon() {
    const name = document.getElementById('hack-name').value;
    const deadline = document.getElementById('hack-deadline').value;
    const status = document.getElementById('hack-status').value;
    
    if (!name || !deadline) {
        alert('Please enter hackathon name and deadline');
        return;
    }
    
    hackathons.push({
        id: Date.now(),
        name: name,
        deadline: deadline,
        status: status,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('hackathons', JSON.stringify(hackathons));
    renderHackathons();
    
    document.getElementById('hack-name').value = '';
    document.getElementById('hack-deadline').value = '';
}

function renderHackathons() {
    const container = document.getElementById('hackathon-list');
    if (!container) return;
    
    if (hackathons.length === 0) {
        container.innerHTML = '<p style="color: gray; text-align: center;">No hackathons added yet. Add your first hackathon above!</p>';
        return;
    }
    
    const sorted = [...hackathons].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    container.innerHTML = `
        <div class="hackathon-header">
            <div class="hackathon-row">
                <span>🏆 Name</span>
                <span>📅 Deadline</span>
                <span>📊 Status</span>
                <span>⏰ Days Left</span>
                <span>⚡ Action</span>
            </div>
        </div>
        ${sorted.map(hack => {
            const daysLeft = Math.ceil((new Date(hack.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            const daysLeftText = daysLeft < 0 ? 'Past Due' : `${daysLeft} days`;
            
            return `
                <div class="hackathon-row">
                    <span>${hack.name}</span>
                    <span>${new Date(hack.deadline).toLocaleDateString()}</span>
                    <span><span class="status-badge status-${hack.status}">${hack.status}</span></span>
                    <span style="color: ${daysLeft < 3 && daysLeft > 0 ? 'red' : daysLeft < 0 ? 'gray' : 'green'}">${daysLeftText}</span>
                    <button onclick="deleteHackathon(${hack.id})" class="btn-danger" style="padding: 5px 10px;">❌</button>
                </div>
            `;
        }).join('')}
    `;
}

function deleteHackathon(id) {
    hackathons = hackathons.filter(h => h.id !== id);
    localStorage.setItem('hackathons', JSON.stringify(hackathons));
    renderHackathons();
}

// ========== BAR GRAPH ==========
function renderBarGraph() {
    const barGraph = document.getElementById('bar-graph');
    if (!barGraph) return;
    
    barGraph.innerHTML = '';
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const completed = streak.history[dateKey] || false;
        days.push({ dayName, completed });
    }
    
    const maxHeight = 150;
    days.forEach(day => {
        const barItem = document.createElement('div');
        barItem.className = 'bar-item';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = day.completed ? `${maxHeight}px` : '10px';
        bar.style.background = day.completed ? 'linear-gradient(180deg, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(180deg, #ddd 0%, #bbb 100%)';
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = day.dayName;
        label.style.marginTop = '5px';
        label.style.fontSize = '12px';
        
        barItem.appendChild(bar);
        barItem.appendChild(label);
        barGraph.appendChild(barItem);
    });
    
    // Update weekly summary
    const completedCount = days.filter(d => d.completed).length;
    const rate = Math.round((completedCount / 7) * 100);
    document.getElementById('completion-rate').textContent = `${rate}%`;
    document.getElementById('total-completed').textContent = Object.values(streak.history).filter(v => v === true).length;
    document.getElementById('best-streak').textContent = streak.bestStreak;
    document.getElementById('streak-count').textContent = streak.count;
    
    const summaryDiv = document.getElementById('weekly-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `This week: ${completedCount}/7 days (${rate}%)`;
    }
    
    // Streak message
    const streakMsg = document.getElementById('streak-message');
    if (streakMsg) {
        if (streak.count === 0) streakMsg.textContent = 'Complete goals to start!';
        else if (streak.count < 3) streakMsg.textContent = `${streak.count}/3 for first milestone!`;
        else if (streak.count < 7) streakMsg.textContent = `🔥 ${streak.count} days! Keep going!`;
        else streakMsg.textContent = `🏆 LEGENDARY ${streak.count} DAYS! 🏆`;
    }
}

// ========== UPDATE ALL DISPLAYS ==========
function updateAllDisplays() {
    renderBarGraph();
    renderHackathons();
    renderCompletedGoals();
    updateHabitDisplay();
    renderTodos();
}

// ========== NOTIFICATIONS ==========
let notificationPermission = false;

const notificationBtn = document.getElementById('notification-btn');
if (notificationBtn) {
    notificationBtn.onclick = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            notificationPermission = true;
            notificationBtn.textContent = '✅ Notifications Enabled';
            localStorage.setItem('notifications', 'granted');
        }
    };
}

if (localStorage.getItem('notifications') === 'granted') {
    notificationPermission = true;
    if (notificationBtn) notificationBtn.textContent = '✅ Notifications Enabled';
}

function showNotification(title, message) {
    if (notificationPermission || Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
}

// ========== TODO SYSTEM ==========
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function addTodo() {
    const text = document.getElementById('todo-text').value;
    const time = document.getElementById('todo-time').value;
    
    if (!text) {
        alert('Please enter a task');
        return;
    }
    
    todos.push({
        id: Date.now(),
        text: text,
        time: time,
        completed: false
    });
    
    saveTodos();
    renderTodos();
    
    if (time) setAlarm(text, time);
    
    document.getElementById('todo-text').value = '';
    document.getElementById('todo-time').value = '';
}

function setAlarm(text, time) {
    const alarmTime = new Date(time).getTime();
    const now = new Date().getTime();
    const timeUntil = alarmTime - now;
    
    if (timeUntil > 0 && timeUntil < 86400000) {
        setTimeout(() => {
            showNotification('⏰ ALARM!', `Time to: ${text}`);
            alert(`🔔 ALARM: ${text}`);
        }, timeUntil);
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    const sorted = [...todos].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    if (sorted.length === 0) {
        todoList.innerHTML = '<p style="color: gray; text-align: center;">No tasks. Add one above!</p>';
        return;
    }
    
    todoList.innerHTML = sorted.map(todo => `
        <div class="todo-item">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span style="${todo.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${todo.text}</span>
            <small style="flex: 1;">${todo.time ? new Date(todo.time).toLocaleString() : 'No deadline'}</small>
            <button onclick="deleteTodo(${todo.id})" class="btn-danger" style="padding: 5px 10px;">❌</button>
        </div>
    `).join('');
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        if (todo.completed) addToCompletedHistory(`Task: ${todo.text}`);
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// ========== DAILY GOALS ==========
function saveGoals() {
    const goals = {
        goal1: document.getElementById('goal1').value,
        goal2: document.getElementById('goal2').value,
        date: new Date().toDateString()
    };
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    alert('Goals saved!');
}

function loadGoals() {
    const saved = JSON.parse(localStorage.getItem('dailyGoals'));
    if (saved && saved.date === new Date().toDateString()) {
        if (saved.goal1) document.getElementById('goal1').value = saved.goal1;
        if (saved.goal2) document.getElementById('goal2').value = saved.goal2;
    }
}

function completeDailyGoals() {
    const goal1 = document.getElementById('goal1').value;
    const goal2 = document.getElementById('goal2').value;
    
    if (!goal1 && !goal2) {
        alert('Please set your goals first!');
        return;
    }
    
    saveGoals();
    updateStreak();
    alert(`✅ Great job! Streak: ${streak.count} days! 🎉`);
}

// ========== INITIALIZE ==========
function init() {
    initHistory();
    loadGoals();
    updateAllDisplays();
    setInterval(() => {
        renderHackathons();
    }, 60000);
}

init();
