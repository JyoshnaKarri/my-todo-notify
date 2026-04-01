// ========== SOUND SETUP ==========
let soundEnabled = true;
const alarmSound = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');

// Try to preload sound
alarmSound.load();

// ========== STREAK SYSTEM ==========
let streak = JSON.parse(localStorage.getItem('streak')) || {
    count: 0,
    lastCompletedDate: null
};

// Update streak display
function updateStreakDisplay() {
    document.getElementById('streak-count').textContent = streak.count;
    
    if (streak.lastCompletedDate) {
        const lastDate = new Date(streak.lastCompletedDate);
        document.getElementById('last-completed').innerHTML = `Last completed: ${lastDate.toLocaleDateString()}`;
        
        // Check if streak is still active (if last completed was yesterday)
        const today = new Date().toDateString();
        const lastCompleted = new Date(streak.lastCompletedDate).toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastCompleted !== today && lastCompleted !== yesterday.toDateString()) {
            document.getElementById('last-completed').style.color = '#ffcccc';
            document.getElementById('last-completed').innerHTML += ' ⚠️ Complete today to keep streak!';
        } else {
            document.getElementById('last-completed').style.color = '#ffffff';
        }
    }
}

// Update streak when goals are completed
function updateStreak() {
    const today = new Date().toDateString();
    const lastCompleted = streak.lastCompletedDate ? new Date(streak.lastCompletedDate).toDateString() : null;
    
    if (lastCompleted === today) {
        // Already completed today, don't double count
        return false;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastCompleted === yesterday.toDateString()) {
        // Completed yesterday - increase streak
        streak.count++;
        playSound('streak');
        animateFire();
    } else if (lastCompleted === null) {
        // First time completing
        streak.count = 1;
    } else {
        // Streak broken - reset
        streak.count = 1;
    }
    
    streak.lastCompletedDate = new Date().toISOString();
    localStorage.setItem('streak', JSON.stringify(streak));
    updateStreakDisplay();
    return true;
}

// Animate fire icon
function animateFire() {
    const fireIcon = document.querySelector('.fire-icon');
    fireIcon.style.animation = 'fireAnimation 0.5s ease-in-out';
    setTimeout(() => {
        fireIcon.style.animation = '';
    }, 500);
}

// ========== SOUND EFFECTS ==========
function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        if (type === 'alarm') {
            alarmSound.currentTime = 0;
            alarmSound.play().catch(e => console.log('Sound play failed:', e));
        } else if (type === 'streak') {
            // Simple beep for streak
            const beep = new Audio('data:audio/wav;base64,U3RlYWsgbm90aWZpY2F0aW9u');
            beep.play().catch(e => console.log('Beep failed:', e));
        } else if (type === 'complete') {
            const completeSound = new Audio('data:audio/wav;base64,Q29tcGxldGUgY2hlY2sgbm90aWZpY2F0aW9u');
            completeSound.play().catch(e => console.log('Complete sound failed:', e));
        }
    } catch(e) {
        console.log('Sound error:', e);
    }
}

// ========== NOTIFICATIONS ==========
let notificationPermission = false;

document.getElementById('notification-btn').onclick = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        notificationPermission = true;
        document.getElementById('notification-btn').textContent = '✅ Notifications Enabled';
        document.getElementById('notification-btn').style.background = '#4CAF50';
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
    
    if (timeUntil > 0) {
        setTimeout(() => {
            // Play sound
            playSound('alarm');
            
            // Show notification
            showNotification('⏰ ALARM!', `Time to: ${todo.text}`);
            
            // Also show alert
            alert(`🔔 ALARM: ${todo.text}`);
        }, timeUntil);
        
        console.log(`Alarm set for ${todo.text} at ${new Date(todo.time)}`);
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '<h3>Your Tasks:</h3>';
    
    const sortedTodos = [...todos].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    if (sortedTodos.length === 0) {
        todoList.innerHTML += '<p style="color: gray;">No tasks yet. Add one above!</p>';
        return;
    }
    
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
            <button onclick="deleteTodo(${todo.id})" class="delete-btn">❌</button>
        `;
        todoList.appendChild(div);
    });
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        
        if (todo.completed) {
            playSound('complete');
        }
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
    
    // Save goals if not already saved
    saveGoals();
    
    // Update streak
    const streakUpdated = updateStreak();
    
    if (streakUpdated) {
        playSound('streak');
        showNotification('🎉 Streak Updated!', `You're on a ${streak.count} day streak! Keep going!`);
        alert(`✅ Great job! Streak: ${streak.count} days! 🎉`);
        
        // Animate the complete button
        const btn = document.getElementById('complete-goals-btn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 200);
    } else {
        alert('✅ Goals completed for today! Come back tomorrow to continue your streak!');
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
    renderTodos();
    loadGoals();
    updateStreakDisplay();
    checkExpiredTodos();
    
    // Check every minute for expired tasks
    setInterval(checkExpiredTodos, 60000);
    
    // Check if goals completed today
    const savedGoals = JSON.parse(localStorage.getItem('dailyGoals'));
    const today = new Date().toDateString();
    if (savedGoals && savedGoals.date === today) {
        // Goals already saved today
        console.log('Goals completed today');
    }
}

// Start the app
init();
