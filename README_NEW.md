# Work Timer Pro - Compact Edition

A modern, compact Chrome extension for tracking work time with smart break management and job sheet integration.

## ✨ Features

### 🎯 Compact Smart UI
- **Clean, Modern Design**: Dark theme with smooth animations
- **State-Based Interface**: UI adapts intelligently based on your work status
- **Compact Layout**: Optimized for quick access without taking up screen space

### 🔄 Smart State Management
- **Ready State**: Shows "Start Work Day" button when you're ready to begin
- **Working State**: Shows break options (Breakfast 15m, Lunch 1h) + End Day button
- **Break State**: Shows break countdown timer + End Break button  
- **Alarm State**: Shows Stop Alarm button when break time is over

### ⏰ Intelligent Break System
- **Breakfast Break**: 15-minute break with progress indicator
- **Lunch Break**: 1-hour break with progress indicator
- **Auto Alarm**: Automatic alarm when break time ends
- **Visual Countdown**: Real-time break timer with progress bar

### 🌐 Job Sheet Integration
- **Auto-Detection**: Automatically detects work-related buttons on job sheet websites
- **Smart Sync**: Seamlessly syncs with your job sheet actions
- **Background Processing**: Continues tracking even when popup is closed

## 🚀 How to Use

### 1. Starting Your Work Day
1. Click the extension icon
2. Click **"Start Work Day"** button
3. The timer starts and UI switches to working mode

### 2. Taking Breaks
**During work, you'll see:**
- **Breakfast (15m)** - Quick morning break
- **Lunch (1h)** - Extended meal break
- **End Work Day** - Complete your work session

### 3. Managing Breaks
**When on break:**
- Break countdown timer appears
- Progress bar shows remaining time
- **End Break** button to return to work early
- Auto-alarm when break time ends

### 4. Break End Alarm
**When break time is over:**
- Alarm sound plays
- Visual notification appears
- **Stop Alarm** button to acknowledge and return to work

## 🎨 UI Flow Examples

### Ready to Start
```
┌─────────────────────────┐
│ Work Timer              │
│ ○ Ready to start        │
│                         │
│    [Start Work Day]     │
└─────────────────────────┘
```

### Working
```
┌─────────────────────────┐
│ Work Timer  ●  Working  │
│     ⏱️ 02:30:15         │
│                         │
│ [Breakfast] [Lunch]     │
│    [End Work Day]       │
└─────────────────────────┘
```

### On Break
```
┌─────────────────────────┐
│ Work Timer  ●  Break    │
│     ⏱️ 02:30:15         │
│                         │
│ ☕ Breakfast: 12:45     │
│ ████████░░░░ 67%        │
│                         │
│      [End Break]        │
└─────────────────────────┘
```

## 🔧 Installation

1. **Download/Clone** this repository
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (top right toggle)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

## 🎯 Key Benefits

### For Users:
- **Streamlined Workflow**: Only see relevant buttons based on your current state
- **Zero Confusion**: Clear visual indicators for each mode
- **Efficient Break Management**: Smart break timing with automatic alarms
- **Beautiful Interface**: Modern, dark theme that's easy on the eyes

### For Productivity:
- **Focused Work Sessions**: Clear separation between work and break time
- **Automated Reminders**: Never forget to take breaks or return to work
- **Job Sheet Integration**: Seamless synchronization with your work systems
- **Data Persistence**: Your work time is saved even if you close the browser

## 🛠️ Technical Features

- **State Management**: Advanced state-based UI rendering
- **Local Storage**: Persistent data across browser sessions
- **Background Processing**: Continues timing even when popup is closed
- **Responsive Design**: Works on different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## 🔄 State Transition Flow

```
Ready → Start Work → Working
  ↑                    ↓
  └── End Day ←─── Take Break → Break
                              ↓
                        Break Ends → Alarm → Stop Alarm
                              ↓                 ↓
                        Auto Return ← ← ← ← ← ←
```

## 🎨 Color Scheme

- **Primary**: Indigo/Purple gradient for main actions
- **Success**: Green for positive actions (start work, end break)
- **Warning**: Orange for day-end actions
- **Break**: Teal for break-related actions
- **Danger**: Red for alarms and urgent actions

## 📱 Responsive Design

The extension adapts to different screen sizes:
- **Standard**: 380px width for desktop
- **Compact**: 320px width for smaller screens
- **Mobile-friendly**: Touch-optimized button sizes

## 🔔 Notification System

- **Toast Notifications**: In-app notifications for state changes
- **Chrome Notifications**: System notifications for important events
- **Visual Feedback**: Color-coded status indicators
- **Audio Alerts**: Break end alarms with sound

## 💡 Tips for Best Experience

1. **Pin the Extension**: Keep it easily accessible in your toolbar
2. **Enable Notifications**: Allow Chrome notifications for better alerts
3. **Keep Browser Open**: For continuous timing (though it saves progress)
4. **Use with Job Sheets**: Let it auto-detect your work actions
5. **Take Regular Breaks**: Use the built-in break system for better productivity

## 🐛 Troubleshooting

**Timer not running?**
- Check if you clicked "Start Work Day"
- Verify the extension is properly installed

**Breaks not working?**
- Ensure you're in "Working" state first
- Check if break timer is visible

**Job sheet not syncing?**
- Verify the website has detectable work buttons
- Check browser console for content script errors

## 🤝 Contributing

Feel free to contribute improvements, bug fixes, or new features. The codebase is well-structured and commented for easy understanding.

## 📄 License

This project is open source and available under the MIT License.

---

**Work Timer Pro** - Making work time tracking simple, smart, and beautiful. 🚀
