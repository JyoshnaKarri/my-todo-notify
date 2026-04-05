// ========== POMODORO TIMER (FIXED) ==========
let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = display;
    
    // Change color when less than 1 minute
    if (timeLeft < 60) {
        timerDisplay.style.color = '#f44336';
    } else {
        timerDisplay.style.color = '#333';
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    isRunning = true;
    
    timerInterval = setInterval(() => {
        if (timeLeft > 0 && isRunning) {
            timeLeft--;
            updateTimerDisplay();
        } else if (timeLeft === 0) {
            // Timer finished!
            clearInterval(timerInterval);
            isRunning = false;
            
            // Play sound
            const alarmSound = document.getElementById('alarm-sound');
            if (alarmSound) {
                alarmSound.play().catch(e => console.log('Sound error:', e));
            }
            
            // Show notification
            showNotification('🍅 Pomodoro Complete!', 'Time for a break! Great focus session!');
            
            // Alert popup
            alert('🎉 Pomodoro completed! Great focus session!');
            
            // Reward: Add to completed goals
            addToCompletedHistory('Pomodoro Session (25 min focus)');
            
            // Reset to selected time
            const selectedTime = parseInt(document.getElementById('timer-select').value);
            timeLeft = selectedTime * 60;
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    pauseTimer();
    const selectedTime = parseInt(document.getElementById('timer-select').value);
    timeLeft = selectedTime * 60;
    updateTimerDisplay();
}

// ========== STREAK SYSTEM ==========
let streak = JSON.parse(localStorage.getItem('streak')) || {
    count: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    history: {}
};

function initHistory() {
    for (let i = 30; i >= 0; i--) {
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

function updateStreak() {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    
    if (streak.history[todayKey]) {
        alert('You already completed your goals today! Come back tomorrow.');
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
    
    const goal1 = document.getElementById('goal1')?.value || 'Goal completed';
    const goal2 = document.getElementById('goal2')?.value || '';
    addToCompletedHistory(`Daily Goals: ${goal1} ${goal2}`);
    
    updateAllDisplays();
    showNotification('🎉 Streak Updated!', `You're on a ${streak.count} day streak!`);
    
    return true;
}

// ========== COMPLETED GOALS HISTORY ==========
let completedGoalsHistory = JSON.parse(localStorage.getItem('completedGoalsHistory')) || [];

function addToCompletedHistory(goalText) {
    const now = new Date();
    completedGoalsHistory.unshift({
        text: goalText,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        timestamp: now.getTime()
    });
    
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

// ========== HABITS SYSTEM ==========
let habits = JSON.parse(localStorage.getItem('habits')) || {
    unstop: { streak: 0, lastCompleted: null },
    linkedin: { streak: 0, lastCompleted: null },
    gmail: { streak: 0, lastCompleted: null }
};

function saveHabitsData() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

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
            checkbox.checked = false;
            return;
        } else {
            habits[habitName].streak = 1;
        }
        
        habits[habitName].lastCompleted = today;
        saveHabitsData();
        updateHabitDisplay();
        addToCompletedHistory(`Habit: ${habitName.toUpperCase()}`);
    }
}

function updateHabitDisplay() {
    const today = new Date().toISOString().split('T')[0];
    
    const unstopEl = document.getElementById('unstop-streak');
    const linkedinEl = document.getElementById('linkedin-streak');
    const gmailEl = document.getElementById('gmail-streak');
    
    if (unstopEl) unstopEl.textContent = `Streak: ${habits.unstop.streak}`;
    if (linkedinEl) linkedinEl.textContent = `Streak: ${habits.linkedin.streak}`;
    if (gmailEl) gmailEl.textContent = `Streak: ${habits.gmail.streak}`;
    
    const unstopCheck = document.getElementById('habit-unstop');
    const linkedinCheck = document.getElementById('habit-linkedin');
    const gmailCheck = document.getElementById('habit-gmail');
    
    if (unstopCheck) unstopCheck.checked = habits.unstop.lastCompleted === today;
    if (linkedinCheck) linkedinCheck.checked = habits.linkedin.lastCompleted === today;
    if (gmailCheck) gmailCheck.checked = habits.gmail.lastCompleted === today;
}

function saveHabits() {
    saveHabitsData();
    alert('Habits saved for today!');
    updateHabitDisplay();
}

// ========== HACKATHON TRACKER ==========
let hackathons = JSON.parse(localStorage.getItem('hackathons')) || [];

function addHackathon() {
    const name = document.getElementById('hack-name')?.value;
    const deadline = document.getElementById('hack-deadline')?.value;
    const status = document.getElementById('hack-status')?.value;
    
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
    
    if (document.getElementById('hack-name')) document.getElementById('hack-name').value = '';
    if (document.getElementById('hack-deadline')) document.getElementById('hack-deadline').value = '';
}

function renderHackathons() {
    const container = document.getElementById('hackathon-list');
    if (!container) return;
    
    if (hackathons.length === 0) {
        container.innerHTML = '<p style="color: gray; text-align: center;">No hackathons added yet. Add your first hackathon above!</p>';
        return;
    }
    
    const now = new Date();
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
            const deadlineDate = new Date(hack.deadline);
            const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            let daysLeftText = '';
            let daysLeftColor = '';
            
            if (daysLeft < 0) {
                daysLeftText = '⚠️ Past Due';
                daysLeftColor = 'gray';
            } else if (daysLeft === 0) {
                daysLeftText = '🔥 TODAY!';
                daysLeftColor = 'red';
            } else {
                daysLeftText = `${daysLeft} days`;
                daysLeftColor = daysLeft <= 3 ? 'red' : 'green';
            }
            
            return `
                <div class="hackathon-row">
                    <span><strong>${hack.name}</strong></span>
                    <span>${new Date(hack.deadline).toLocaleDateString()}</span>
                    <span><span class="status-badge status-${hack.status}">${hack.status}</span></span>
                    <span style="color: ${daysLeftColor}; font-weight: bold;">${daysLeftText}</span>
                    <button onclick="deleteHackathon(${hack.id})" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">❌</button>
                </div>
            `;
        }).join('')}
    `;
}

function deleteHackathon(id) {
    if (confirm('Delete this hackathon?')) {
        hackathons = hackathons.filter(h => h.id !== id);
        localStorage.setItem('hackathons', JSON.stringify(hackathons));
        renderHackathons();
    }
}

// ========== TODO & ALARM SYSTEM ==========
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function addTodo() {
    const text = document.getElementById('todo-text')?.value;
    const time = document.getElementById('todo-time')?.value;
    
    if (!text) {
        alert('Please enter a task');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        time: time,
        completed: false,
        alarmTriggered: false
    };
    
    todos.push(todo);
    saveTodos();
    renderTodos();
    
    document.getElementById('todo-text').value = '';
    if (document.getElementById('todo-time')) document.getElementById('todo-time').value = '';
    
    checkAllAlarms();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    const sorted = [...todos].sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(a.time) - new Date(b.time);
    });
    
    if (sorted.length === 0) {
        todoList.innerHTML = '<p style="color: gray; text-align: center;">No tasks. Add one above!</p>';
        return;
    }
    
    todoList.innerHTML = sorted.map(todo => {
        const isOverdue = todo.time && new Date(todo.time) < new Date() && !todo.completed;
        return `
            <div class="todo-item">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <span style="${todo.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''} ${isOverdue ? 'color: red; font-weight: bold;' : ''}">
                    ${todo.text}
                </span>
                <small style="flex: 1;">${todo.time ? new Date(todo.time).toLocaleString() : 'No deadline'}</small>
                ${isOverdue ? '<span style="color: red;">⚠️ OVERDUE</span>' : ''}
                <button onclick="deleteTodo(${todo.id})" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">❌</button>
            </div>
        `;
    }).join('');
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        if (todo.completed) {
            addToCompletedHistory(`Task: ${todo.text}`);
        }
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function checkAllAlarms() {
    const now = new Date();
    
    todos.forEach(todo => {
        if (todo.time && !todo.completed && !todo.alarmTriggered) {
            const alarmTime = new Date(todo.time);
            const timeDiff = alarmTime - now;
            
            if (timeDiff <= 0 && timeDiff > -60000) {
                todo.alarmTriggered = true;
                saveTodos();
                
                const alarmSound = document.getElementById('alarm-sound');
                if (alarmSound) {
                    alarmSound.play().catch(e => console.log('Sound error:', e));
                }
                
                showNotification('⏰ ALARM!', `Time to: ${todo.text}`);
                alert(`🔔 ALARM: ${todo.text}`);
                addToCompletedHistory(`Alarm triggered: ${todo.text}`);
            }
        }
    });
}

// ========== BAR GRAPH & CALENDAR ==========
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
        label.textContent = day.dayName;
        label.style.marginTop = '5px';
        label.style.fontSize = '12px';
        label.style.textAlign = 'center';
        
        barItem.appendChild(bar);
        barItem.appendChild(label);
        barGraph.appendChild(barItem);
    });
    
    const completedCount = days.filter(d => d.completed).length;
    const rate = Math.round((completedCount / 7) * 100);
    
    const completionRateEl = document.getElementById('completion-rate');
    const totalCompletedEl = document.getElementById('total-completed');
    const bestStreakEl = document.getElementById('best-streak');
    const streakCountEl = document.getElementById('streak-count');
    
    if (completionRateEl) completionRateEl.textContent = `${rate}%`;
    if (totalCompletedEl) totalCompletedEl.textContent = Object.values(streak.history).filter(v => v === true).length;
    if (bestStreakEl) bestStreakEl.textContent = streak.bestStreak;
    if (streakCountEl) streakCountEl.textContent = streak.count;
    
    const summaryDiv = document.getElementById('weekly-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `This week: ${completedCount}/7 days (${rate}%)`;
    }
    
    const streakMsg = document.getElementById('streak-message');
    if (streakMsg) {
        if (streak.count === 0) streakMsg.textContent = '✨ Complete today\'s goals to start! ✨';
        else if (streak.count < 3) streakMsg.textContent = `🔥 ${streak.count}/3 days - Almost at first milestone!`;
        else if (streak.count < 7) streakMsg.textContent = `🌟 ${streak.count} day streak! Keep going! 🌟`;
        else if (streak.count < 14) streakMsg.textContent = `🏆 ${streak.count} day streak! You're on fire! 🏆`;
        else streakMsg.textContent = `👑 LEGENDARY ${streak.count} DAY STREAK! 👑`;
    }
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let calendarHTML = '';
    
    // Day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(day => {
        calendarHTML += `<div style="font-weight: bold; font-size: 12px; text-align: center;">${day}</div>`;
    });
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div></div>';
    }
    
    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
        const completed = streak.history[dateKey] || false;
        const isToday = day === today.getDate() && currentMonth === today.getMonth();
        
        let bgColor = '#f0f0f0';
        let textColor = '#333';
        
        if (completed) {
            bgColor = '#4CAF50';
            textColor = 'white';
        } else if (streak.history[dateKey] === false && dateKey !== today.toISOString().split('T')[0]) {
            bgColor = '#f44336';
            textColor = 'white';
        }
        
        calendarHTML += `
            <div class="calendar-day ${completed ? 'completed' : ''} ${!completed && streak.history[dateKey] === false ? 'missed' : ''} ${isToday ? 'today' : ''}"
                 style="background: ${bgColor}; color: ${textColor}; padding: 8px; border-radius: 8px; text-align: center;">
                ${day}
            </div>
        `;
    }
    
    calendar.innerHTML = calendarHTML;
}

function updateAllDisplays() {
    renderBarGraph();
    renderCalendar();
    renderHackathons();
    renderCompletedGoals();
    updateHabitDisplay();
    renderTodos();
    checkAllAlarms();
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
            notificationBtn.style.background = '#4CAF50';
            localStorage.setItem('notifications', 'granted');
        }
    };
}

if (localStorage.getItem('notifications') === 'granted') {
    notificationPermission = true;
    if (notificationBtn) {
        notificationBtn.textContent = '✅ Notifications Enabled';
        notificationBtn.style.background = '#4CAF50';
    }
}

function showNotification(title, message) {
    if (notificationPermission || Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
}

// ========== DAILY GOALS ==========
function saveGoals() {
    const goal1 = document.getElementById('goal1')?.value || '';
    const goal2 = document.getElementById('goal2')?.value || '';
    
    const goals = {
        goal1: goal1,
        goal2: goal2,
        date: new Date().toDateString()
    };
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    alert('Goals saved for today!');
}

function loadGoals() {
    const saved = JSON.parse(localStorage.getItem('dailyGoals'));
    if (saved && saved.date === new Date().toDateString()) {
        if (saved.goal1 && document.getElementById('goal1')) document.getElementById('goal1').value = saved.goal1;
        if (saved.goal2 && document.getElementById('goal2')) document.getElementById('goal2').value = saved.goal2;
    }
}

function completeDailyGoals() {
    const goal1 = document.getElementById('goal1')?.value;
    const goal2 = document.getElementById('goal2')?.value;
    
    if (!goal1 && !goal2) {
        alert('Please set your goals first!');
        return;
    }
    
    saveGoals();
    const updated = updateStreak();
    
    if (updated) {
        alert(`✅ Great job! You're on a ${streak.count} day streak! 🎉`);
    }
}

// ========== DATA EXPORT/IMPORT ==========
function exportAllData() {
    const allData = {
        streak: streak,
        habits: habits,
        hackathons: hackathons,
        completedGoals: completedGoalsHistory,
        todos: todos,
        exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toodoo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Export Complete', 'Your data has been backed up!');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.streak) localStorage.setItem('streak', JSON.stringify(imported.streak));
            if (imported.habits) localStorage.setItem('habits', JSON.stringify(imported.habits));
            if (imported.hackathons) localStorage.setItem('hackathons', JSON.stringify(imported.hackathons));
            if (imported.completedGoals) localStorage.setItem('completedGoalsHistory', JSON.stringify(imported.completedGoals));
            if (imported.todos) localStorage.setItem('todos', JSON.stringify(imported.todos));
            
            alert('Import successful! Refresh the page to see changes.');
            location.reload();
        } catch (error) {
            alert('Invalid backup file');
        }
    };
    reader.readAsText(file);
}

// ========== DARK MODE ==========
const darkModeToggle = document.getElementById('dark-mode-toggle');
const isDarkMode = localStorage.getItem('darkMode') === 'true';

if (isDarkMode) {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) darkModeToggle.textContent = '☀️';
}

if (darkModeToggle) {
    darkModeToggle.onclick = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    };
}

// ========== INITIALIZE ==========
function init() {
    initHistory();
    loadGoals();
    updateAllDisplays();
    
    // Setup timer event listeners
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    const timerSelect = document.getElementById('timer-select');
    
    if (startBtn) startBtn.onclick = startTimer;
    if (pauseBtn) pauseBtn.onclick = pauseTimer;
    if (resetBtn) resetBtn.onclick = resetTimer;
    if (timerSelect) timerSelect.onchange = resetTimer;
    
    // Setup settings buttons
    const exportBtn = document.getElementById('export-data');
    const importBtn = document.getElementById('import-data');
    const importFile = document.getElementById('import-file');
    const clearAllBtn = document.getElementById('clear-all');
    
    if (exportBtn) exportBtn.onclick = exportAllData;
    if (importBtn) importBtn.onclick = () => importFile.click();
    if (importFile) importFile.onchange = (e) => importData(e.target.files[0]);
    if (clearAllBtn) {
        clearAllBtn.onclick = () => {
            if (confirm('⚠️ THIS WILL DELETE EVERYTHING. Are you sure?')) {
                localStorage.clear();
                alert('All data cleared. Refresh the page.');
                location.reload();
            }
        };
    }
    
    // Check alarms every 30 seconds
    setInterval(() => {
        checkAllAlarms();
        renderHackathons();
    }, 30000);
    
    console.log('App initialized! Pomodoro timer is ready.');
}

// Start the app
init();
