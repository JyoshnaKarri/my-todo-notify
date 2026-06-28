# To-Do Notify — Task Manager with Browser Notifications

A lightweight to-do web app built with HTML, CSS, and JavaScript — with browser-based notifications that remind you about pending tasks so nothing slips through.

**Tech:** HTML · CSS · JavaScript  
**Platform:** Web Browser (no backend, no login required)

---

## 🎯 What It Does

- Add, complete, and delete tasks
- Set a reminder time for any task
- Browser sends a notification when the deadline arrives — even if the tab is in the background
- Tasks persist in the session so they don't disappear on refresh

---

## ✨ Features

| Feature | Description |
|---|---|
| Add Tasks | Type a task and press Enter or click Add |
| Mark Complete | Click a task to toggle done/undone |
| Delete Tasks | Remove individual tasks |
| Set Reminder | Pick a time — browser notifies you when it's due |
| Browser Notifications | Native OS-level alerts via Web Notifications API |
| Clean UI | Minimal, distraction-free interface |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript |
| Notifications | Web Notifications API |
| Storage | localStorage (persists tasks across refresh) |

---

## 🚀 How to Run

No installation needed.

```bash
# Option 1 — Open directly
Just open index.html in any browser

# Option 2 — Live Server (VS Code)
Right-click index.html → Open with Live Server
```

When prompted, click **"Allow"** for browser notifications — required for reminders to work.

---


## 📸 How Notifications Work

1. User adds a task and sets a reminder time
2. JavaScript calculates the delay until that time
3. `setTimeout` triggers when the time is reached
4. `Notification API` fires a native browser alert with the task name

```javascript
// Core notification logic
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    setTimeout(() => {
      new Notification("Task Reminder", { body: taskName });
    }, delay);
  }
});
```

---

## 🔗 Links

- 🌐 [Portfolio](https://jyoshnakarri.github.io/Jyoshna-Karri/)
- 💼 [LinkedIn](https://www.linkedin.com/in/jyoshna-k-5b1626401/)
