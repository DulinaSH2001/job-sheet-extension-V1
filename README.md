# Work Time Tracker Pro - Chrome Extension

A modern, visually stunning Chrome extension for tracking work time, breaks, and job sheet actions—featuring advanced glassmorphism UI, smooth animations, and seamless integration with job sheets like miserp.com.

---

## 🚀 Features

- **Glassmorphism UI:** Professional glass containers, blur effects, gradients, and animated backgrounds.
- **Centered Timer:** Responsive, animated SVG timer ring with pulsing effects and clear typography.
- **Advanced Buttons:** Ripple effects, color-coded variants, and premium hover/shine animations.
- **Sophisticated Animations:** Smooth transitions, entrance effects, and dynamic feedback.
- **Enhanced Audio:** Alarm and notification sounds with visual overlays.
- **Responsive Design:** Optimized for Chrome extension popup and mobile-friendly.
- **Persistent State:** Timers and preferences saved using Chrome Storage API.
- **Job Sheet Integration:** Detects and syncs job sheet button clicks automatically.
- **Background Service Worker:** Ensures continuous operation and notifications.
- **Robust Error Handling:** Improved notifications and state management.

---

## 📁 File Structure

```
chromeextention_for_job_sheet/
├── alarm.html
├── alarm.js
├── background.js
├── content.js
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
├── README.md
├── README_NEW.md
├── IMPROVEMENTS.md
├── icons/
│   ├── icon-generator.html
│   ├── icon128.png
│   ├── icon16.png
│   └── icon48.png
├── sounds/
└── docs/
    └── (for documentation images, if needed)
```

---

## 🛠️ Installation & Usage

### 1. Clone the Repository

```bash
git clone https://github.com/DulinaSH2001/job-sheet-extension-V1.git
cd chromeextention_for_job_sheet
```

> **Tip:** Always clone into a directory without spaces in the path for best compatibility.

### 2. Load the Extension in Chrome

1. Open **Google Chrome** and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **"Load unpacked"** and select the `chromeextention_for_job_sheet` folder.

### 3. Enable Site Access

- Click the extension icon in Chrome.
- Select **"This can read and change site data"** > **"On miserp.com"**.
- Make sure site access is enabled for miserp.com for full functionality.

### 4. Start Using

- Click "Start Work" to begin tracking.
- Use "Breakfast" or "Lunch" for breaks.
- Click job sheet buttons on miserp.com to auto-sync actions.
- Use "End Day" to finish your session.

---

## 💡 Tips

- **Update Regularly:** Pull the latest changes from GitHub to get new features and fixes.
- **Check Permissions:** If the extension isn’t working, verify site access and permissions in Chrome.
- **Customize Sounds:** Add your own audio files to the `sounds/` folder for personalized alarms.
- **Debugging:** Use Chrome DevTools (F12) to view console logs and troubleshoot issues.
- **Contributions:** Fork the repo and submit pull requests for improvements or bug fixes!

---

## 📦 Key Improvements

- Professional glassmorphism and visual polish
- Responsive, mobile-friendly design
- Persistent timers and robust state management
- Seamless job sheet integration
- Enhanced notifications and error handling

---

## Repository

[View on GitHub](https://github.com/DulinaSH2001/job-sheet-extension-V1.git)

---

## Credits

- Developed by **Dulina Indrawansha**
- Powered by **Asyntax**

---
