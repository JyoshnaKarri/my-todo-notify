// ========== STREAK SYSTEM WITH HISTORY ==========
let streak = JSON.parse(localStorage.getItem('streak')) || {
    count: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    history: {} // Format: { "2024-01-01": true, "2024-01-02": false }
};

// Initialize history for last 7 days if empty
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

// Save streak data
function saveStreak() {
    localStorage.setItem('streak', JSON.stringify(streak));
}

// Update streak when goals are completed
function updateStreak() {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const lastCompleted = streak.lastCompletedDate ? new Date(streak.lastCompletedDate).toISOString().split('T')[0] : null;
    
    // Already completed today
    if (streak.history[todayKey]) {
        return false;
    }
    
    // Mark today as completed
    streak.history[todayKey] = true;
    
    // Calculate yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    
    if (lastCompleted === yesterdayKey) {
        // Streak continues
        streak.count++;
    } else if (lastCompleted === todayKey) {
        // Already counted
        return false;
    } else {
        // Streak broken - start new streak
        streak.count = 1;
    }
    
    // Update best streak
    if (streak.count > streak.bestStreak) {
        streak.bestStreak = streak.count;
    }
    
    streak.lastCompletedDate = new Date().toISOString();
    saveStreak();
    
    // Show milestone message
    checkMilestones();
    
    // Update all displays
    updateAllDisplays();
    
    return true;
}

// Check for milestones
function checkMilestones() {
    const milestones = [3, 7, 14, 30, 50, 100];
    if (milestones.includes(streak.count)) {
        const milestoneDiv = document.getElementById('weekly-summary');
        const message = document.createElement('div');
        message.className = 'milestone';
        message.innerHTML = `🎉 AMAZING! You've reached a ${streak.count} day streak! 🎉`;
        milestoneDiv.insertBefore(message, milestoneDiv.firstChild);
        setTimeout(() => {
            message.remove();
        }, 5000);
        
        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('🎉 Streak Milestone!', { 
                body: `Congratulations! You've reached a ${streak.count} day streak!` 
            });
        }
    }
}

// ========== BAR GRAPH ==========
function renderBarGraph() {
    const barGraph = document.getElementById('bar-graph');
    barGraph.innerHTML = '';
    
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const completed = streak.history[dateKey] || false;
        
        days.push({ date: dateKey, dayName, completed });
    }
    
    // Find max height for scaling
    const maxHeight = 200;
    const barHeight = completed => completed ? maxHeight : 10;
    
    days.forEach(day => {
        const barItem = document.createElement('div');
        barItem.className = 'bar-item';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = barHeight(day.completed);
        bar.style.height = `${height}px`;
        bar.style.background = day.completed 
            ? 'linear-gradient(180deg, #4CAF50 0%, #45a049 100%)'
            : 'linear-gradient(180deg, #ddd 0%, #bbb 100%)';
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = day.dayName;
        
        const value = document.createElement('div');
        value.className = 'bar-value';
        value.textContent = day.completed ? '✅' : '❌';
        
        barItem.appendChild(bar);
        barItem.appendChild(label);
        barItem.appendChild(value);
        barGraph.appendChild(barItem);
    });
}

// ========== WEEKLY SUMMARY ==========
function generateWeeklySummary() {
    const summaryDiv = document.getElementById('summary-text');
    const days = [];
    let completedCount = 0;
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const completed = streak.history[dateKey] || false;
        
        days.push({ dayName, completed });
        if (completed) completedCount++;
    }
    
    const completionRate = (completedCount / 7) * 100;
    document.getElementById('completion-rate').textContent = `${Math.round(completionRate)}%`;
    
    let summaryHTML = `<div style="margin-bottom: 10px;"><strong>This week:</strong> ${completedCount}/7 days completed (${Math.round(completionRate)}%)</div>`;
    
    if (completionRate === 100) {
        summaryHTML += '<div style="color: #4CAF50; font-weight: bold;">🌟 PERFECT WEEK! Amazing job! 🌟</div>';
    } else if (completionRate >= 70) {
        summaryHTML += '<div style="color: #667eea;">👍 Great progress this week! Keep it up!</div>';
    } else if (completionRate >= 50) {
        summaryHTML += '<div style="color: #ff9800;">💪 Good effort! Try to complete 1 more day next week!</div>';
    } else {
        summaryHTML += '<div style="color: #f44336;">📈 Start fresh tomorrow! You can do this! 💪</div>';
    }
    
    summaryDiv.innerHTML = summaryHTML;
    
    // Update streak message
    const streakMsg = document.getElementById('streak-message');
    if (streak.count === 0) {
        streakMsg.textContent = 'Complete your goals to start a streak!';
    } else if (streak.count < 3) {
        streakMsg.textContent = `Keep going! ${streak.count}/3 for your first milestone!`;
    } else if (streak.count < 7) {
        streakMsg.textContent = `🔥 Great! ${streak.count} days! 7 days = 🔥🔥🔥`;
    } else if (streak.count < 14) {
        streakMsg.textContent = `🌟🌟 Incredible ${streak.count} day streak! You're on fire! 🌟🌟`;
    } else {
        streakMsg.textContent = `🏆 LEGENDARY ${streak.count} DAY STREAK! You're a champion! 🏆`;
    }
}

// ========== UPDATE ALL DISPLAYS ==========
function updateAllDisplays() {
    // Update streak count
    document.getElementById('streak-count').textContent = streak.count;
    document.getElementById('best-streak').textContent = streak.bestStreak;
    
    // Update last completed
    if (streak.lastCompletedDate) {
        const lastDate = new Date(streak.lastCompletedDate);
        document.getElementById('last-completed').innerHTML = `Last completed: ${lastDate.toLocaleDateString()}`;
    }
    
    // Update total completed tasks
    const totalCompleted = Object.values(streak.history).filter(v => v === true).length;
    document.getElementById('total-completed').textContent = totalCompleted;
    
    // Render graph and summary
    renderBarGraph();
    generateWeeklySummary();
}

// ========== SOUND SYSTEM ==========
let soundEnabled = true;
const alarmSound = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');

function playSound(type) {
    if (!soundEnabled) return;
    try {
        if (type === 'alarm') {
            alarmSound.currentTime = 0;
            alarmSound.play().catch(e => console.log('Sound error:', e));
        }
    } catch(e) {}
}

// ========== NOTIFICATIONS ==========
let notificationPermission = false;

document.getElementById('notification-btn').onclick = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        notificationPermission = true;
        document.getElementById('notification-btn').textContent = '✅ Notifications Enabled';
        localStorage.setItem('notifications', 'granted');
    }
};

if (localStorage.getItem('notifications') === 'granted') {
    notificationPermission = true;
    document.getElementById('notification-btn').textContent = '✅ Notifications Enabled';
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
    
    const todo = {
        id: Date.now(),
        text: text,
        time: time,
        completed: false
    };
    
    todos.push(todo);
    saveTodos();
    renderTodos();
    
    if (time) {
        setAlarm(todo);
    }
    
    document.getElementById('todo-text').value = '';
    document.getElementById('todo-time').value = '';
}

function setAlarm(todo) {
    const alarmTime = new Date(todo.time).getTime();
    const now = new Date().getTime();
    const timeUntil = alarmTime - now;
    
    if (timeUntil > 0 && timeUntil < 86400000) { // Only set alarms within 24 hours
        setTimeout(() => {
            playSound('alarm');
            showNotification('⏰ ALARM!', `Time to: ${todo.text}`);
            alert(`🔔 ALARM: ${todo.text}`);
        }, timeUntil);
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '<div class="todo-card"><h3>📋 Your Tasks</h3>';
    
    const sortedTodos = [...todos].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    if (sortedTodos.length === 0) {
        todoList.innerHTML += '<p style="color: gray; text-align: center;">No tasks yet. Add one above!</p>';
    } else {
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
                <small style="font-size: 12px; color: gray; flex: 1;">📅 ${timeDisplay}</small>
                <button onclick="deleteTodo(${todo.id})" style="background: #f44336; color: white; padding: 5px 10px;">❌</button>
            `;
            todoList.appendChild(div);
        });
    }
    
    todoList.innerHTML += '</div>';
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// ========== DAILY GOALS ==========
function saveGoals() {
    const goal1 = document.getElementById('goal1').value;
    const goal2 = document.getElementById('goal2').value;
    
    const goals = { 
        goal1, 
        goal2, 
        date: new Date().toDateString() 
    };
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    alert('Goals saved for today!');
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
    const streakUpdated = updateStreak();
    
    if (streakUpdated) {
        showNotification('🎉 Streak Updated!', `You're on a ${streak.count} day streak! Keep going!`);
        alert(`✅ Great job! Streak: ${streak.count} days! 🎉`);
    } else {
        const todayKey = new Date().toISOString().split('T')[0];
        if (streak.history[todayKey]) {
            alert('✅ You already completed your goals today! Come back tomorrow to continue your streak!');
        } else {
            alert('✅ Goals completed for today!');
        }
    }
}

// ========== CHECK EXPIRED TASKS ==========
function checkExpiredTodos() {
    todos.forEach(todo => {
        if (todo.time && !todo.completed && new Date(todo.time) < new Date()) {
            showNotification('⚠️ Overdue Task', `${todo.text} is overdue!`);
        }
    });
}

// ========== INITIALIZE ==========
function init() {
    initHistory();
    renderTodos();
    loadGoals();
    updateAllDisplays();
    checkExpiredTodos();
    setInterval(checkExpiredTodos, 60000);
}

// Start the app
init();
