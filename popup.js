// Work Timer Pro - Enhanced JavaScript with State Management
document.addEventListener('DOMContentLoaded', () => {
  console.log('Work Timer Pro loaded');
  
  // State management
  let state = {
    workSeconds: 0,
    breakSeconds: 0,
    isWorking: false,
    isOnBreak: false,
    currentBreakType: null, // 'breakfast' or 'lunch'
    workStartTime: null,
    breakStartTime: null,
    isAlarmPlaying: false,
    appState: 'ready' // 'ready', 'working', 'break', 'alarm'
  };
  
  // Timer intervals
  let clockInterval;
  let timerInterval;
  let breakTimerInterval;
  
  // DOM elements
  const elements = {
    // Timers
    currentTime: document.getElementById('current-time'),
    mainTimer: document.getElementById('main-timer'),
    breakTimer: document.getElementById('break-timer'),
    breakTimerContainer: document.getElementById('break-timer-container'),
    breakProgressBar: document.getElementById('break-progress-bar'),
    breakTypeText: document.getElementById('break-type-text'),
    progressCircle: document.getElementById('progress-circle'),
    
    // Buttons
    startWorkBtn: document.getElementById('start-work-btn'),
    workControls: document.getElementById('work-controls'),
    breakfastBtn: document.getElementById('breakfast-btn'),
    lunchBtn: document.getElementById('lunch-btn'),
    endDayBtn: document.getElementById('end-day-btn'),
    endBreakBtn: document.getElementById('end-break-btn'),
    stopAlarmBtn: document.getElementById('stop-alarm-btn'),
    alarmControls: document.getElementById('alarm-controls'),
    
    // Status and notifications
    status: document.getElementById('status'),
    notificationArea: document.getElementById('notification-area'),
    
    // Audio
    alarmSound: document.getElementById('alarm-sound'),
    notificationSound: document.getElementById('notification-sound')
  };
  
  // Initialize the app
  init();
  
  function init() {
    console.log('Initializing app...');
    
    // Load saved state
    loadState();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start clock
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
    
    // Start timer loop
    startTimerLoop();
    
    // Check for pending actions from job sheet
    checkPendingActions();
    
    // Initial UI update
    updateUI();
    
    console.log('App initialized successfully');
  }
  
  function setupEventListeners() {
    // Work controls
    elements.startWorkBtn?.addEventListener('click', startWork);
    elements.breakfastBtn?.addEventListener('click', () => startBreak('breakfast', 15 * 60));
    elements.lunchBtn?.addEventListener('click', () => startBreak('lunch', 60 * 60));
    elements.endDayBtn?.addEventListener('click', endWorkDay);
    elements.endBreakBtn?.addEventListener('click', endBreak);
    elements.stopAlarmBtn?.addEventListener('click', stopAlarm);
    
    console.log('Event listeners setup complete');
  }
  
  function startWork() {
    console.log('Starting work day');
    
    state.isWorking = true;
    state.isOnBreak = false;
    state.workStartTime = Date.now();
    state.appState = 'working';
    
    updateUI();
    saveState();
    showNotification('Work day started!', 'success');
    updateStatus('working', 'Working - Stay focused!');
  }
  
  function startBreak(type, duration) {
    console.log(`Starting ${type} break for ${duration} seconds`);
    
    if (!state.isWorking) return;
    
    state.isOnBreak = true;
    state.currentBreakType = type;
    state.breakSeconds = duration;
    state.breakStartTime = Date.now();
    state.appState = 'break';
    
    updateUI();
    saveState();
    
    const breakName = type === 'breakfast' ? 'Breakfast' : 'Lunch';
    const breakDuration = type === 'breakfast' ? '15 minutes' : '1 hour';
    showNotification(`${breakName} break started! Enjoy your`, 'info');
    updateStatus('break', `On ${breakName.toLowerCase()} break`);
    
    // Update break type text
    if (elements.breakTypeText) {
      elements.breakTypeText.textContent = `${breakName} Break`;
    }
    
    // Start break countdown
    startBreakCountdown();
  }
  
  function endBreak() {
    console.log('Ending break');
    
    if (!state.isOnBreak) return;
    
    state.isOnBreak = false;
    state.currentBreakType = null;
    state.breakSeconds = 0;
    state.breakStartTime = null;
    state.appState = 'working';
    
    updateUI();
    saveState();
    showNotification('Break ended! Back to work', 'success');
    updateStatus('working', 'Working - Stay focused!');
    
    // Clear break countdown
    if (breakTimerInterval) {
      clearInterval(breakTimerInterval);
      breakTimerInterval = null;
    }
  }
  
  function endWorkDay() {
    console.log('Ending work day');
    
    // Calculate total work time
    const totalHours = Math.floor(state.workSeconds / 3600);
    const totalMinutes = Math.floor((state.workSeconds % 3600) / 60);
    const timeString = `${totalHours}h ${totalMinutes}m`;
    
    // Reset state
    state = {
      workSeconds: 0,
      breakSeconds: 0,
      isWorking: false,
      isOnBreak: false,
      currentBreakType: null,
      workStartTime: null,
      breakStartTime: null,
      isAlarmPlaying: false,
      appState: 'ready'
    };
    
    updateUI();
    saveState();
    showNotification(`Work day completed! Total time: ${timeString}`, 'success');
    updateStatus('ready', 'Ready to start your next work day');
    
    // Clear intervals
    if (breakTimerInterval) {
      clearInterval(breakTimerInterval);
      breakTimerInterval = null;
    }
  }
  
  function startBreakCountdown() {
    // Clear any existing break timer
    if (breakTimerInterval) {
      clearInterval(breakTimerInterval);
      breakTimerInterval = null;
    }
    
    console.log('Starting break countdown with', state.breakSeconds, 'seconds remaining');
    
    // Only start countdown if we have break time remaining
    if (state.breakSeconds > 0) {
      console.log('Break timer started successfully');
      
      breakTimerInterval = setInterval(() => {
        if (state.breakSeconds > 0) {
          state.breakSeconds--;
          updateBreakDisplay();
          saveState();
          
          console.log('Break time remaining:', state.breakSeconds);
          
          // Check if break is almost over (10 seconds warning)
          if (state.breakSeconds === 10) {
            showNotification('Break ending in 10 seconds!', 'warning');
          }
          
          // Check if break is over
          if (state.breakSeconds <= 0) {
            handleBreakEnd();
          }
        } else {
          // Safety check - if breakSeconds is 0 or negative, end the break
          handleBreakEnd();
        }
      }, 1000);
      
      console.log('Break countdown started successfully');
    } else {
      console.log('No break time remaining, ending break');
      handleBreakEnd();
    }
  }
  
  function handleBreakEnd() {
    console.log('Break time ended');
    
    state.isAlarmPlaying = true;
    state.appState = 'alarm';
    
    updateUI();
    playAlarm();
    showNotification('Break time is over! Please return to work', 'warning');
    updateStatus('break', 'Break time ended - Click to return to work');
    
    // Clear break countdown
    if (breakTimerInterval) {
      clearInterval(breakTimerInterval);
      breakTimerInterval = null;
    }
  }
  
  function playAlarm() {
    console.log('Playing alarm');
    
    if (elements.alarmSound) {
      elements.alarmSound.play().catch(e => {
        console.log('Could not play alarm sound:', e);
      });
    }
    
    // Flash the document title
    let titleFlash = 0;
    const originalTitle = document.title;
    const flashInterval = setInterval(() => {
      document.title = titleFlash % 2 === 0 ? ' BREAK OVER!' : originalTitle;
      titleFlash++;
      
      if (titleFlash > 10 || !state.isAlarmPlaying) {
        clearInterval(flashInterval);
        document.title = originalTitle;
      }
    }, 500);
  }
  
  function stopAlarm() {
    console.log('Stopping alarm');
    
    state.isAlarmPlaying = false;
    state.appState = 'working';
    
    if (elements.alarmSound) {
      elements.alarmSound.pause();
      elements.alarmSound.currentTime = 0;
    }
    
    endBreak();
  }
  
  function startTimerLoop() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
      if (state.isWorking && !state.isOnBreak) {
        state.workSeconds++;
        updateWorkDisplay();
        saveState();
      }
    }, 1000);
  }
  
  function updateClock() {
    if (elements.currentTime) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      elements.currentTime.textContent = timeString;
    }
  }
  
  function updateWorkDisplay() {
    if (elements.mainTimer) {
      const hours = Math.floor(state.workSeconds / 3600);
      const minutes = Math.floor((state.workSeconds % 3600) / 60);
      const seconds = state.workSeconds % 60;
      
      elements.mainTimer.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    updateProgressRing();
  }
  
  function updateBreakDisplay() {
    if (elements.breakTimer) {
      const minutes = Math.floor(state.breakSeconds / 60);
      const seconds = state.breakSeconds % 60;
      
      elements.breakTimer.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    updateBreakProgress();
  }
  
  function updateProgressRing() {
    if (elements.progressCircle) {
      const maxWorkSeconds = 8 * 60 * 60; // 8 hours
      const progress = Math.min(state.workSeconds / maxWorkSeconds, 1);
      const circumference = 2 * Math.PI * 50; // radius is 50
      const offset = circumference - (progress * circumference);
      
      elements.progressCircle.style.strokeDasharray = circumference;
      elements.progressCircle.style.strokeDashoffset = offset;
      
      // Change color based on progress
      if (progress < 0.5) {
        elements.progressCircle.style.stroke = '#10b981';
      } else if (progress < 0.8) {
        elements.progressCircle.style.stroke = '#f59e0b';
      } else {
        elements.progressCircle.style.stroke = '#ef4444';
      }
    }
  }
  
  function updateBreakProgress() {
    if (elements.breakProgressBar) {
      const totalTime = state.currentBreakType === 'breakfast' ? 15 * 60 : 60 * 60;
      const elapsed = totalTime - state.breakSeconds;
      const progress = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
      
      elements.breakProgressBar.style.width = `${progress}%`;
    }
  }
  
  function updateUI() {
    console.log('Updating UI for state:', state.appState);
    
    // Update body class for CSS state management
    document.body.className = `app-state-${state.appState}`;
    
    // Update displays
    updateWorkDisplay();
    if (state.isOnBreak) {
      updateBreakDisplay();
    }
    
    // Show/hide break timer container
    if (elements.breakTimerContainer) {
      if (state.isOnBreak || state.appState === 'alarm') {
        elements.breakTimerContainer.classList.add('active');
      } else {
        elements.breakTimerContainer.classList.remove('active');
      }
    }
    
    // Update work controls visibility
    if (elements.workControls) {
      if (state.appState === 'working') {
        elements.workControls.classList.add('active');
      } else {
        elements.workControls.classList.remove('active');
      }
    }
    
    // Update alarm controls visibility
    if (elements.alarmControls) {
      if (state.appState === 'alarm') {
        elements.alarmControls.classList.add('active');
      } else {
        elements.alarmControls.classList.remove('active');
      }
    }
    
    // Update break type text if on break
    if (state.isOnBreak && elements.breakTypeText && state.currentBreakType) {
      const breakName = state.currentBreakType === 'breakfast' ? 'Breakfast' : 'Lunch';
      elements.breakTypeText.textContent = `${breakName} Break`;
    }
    
    // Update status indicator to ensure animation is applied
    if (elements.status) {
      const indicator = elements.status.querySelector('.status-indicator');
      if (indicator) {
        // Force re-application of status class to ensure animation works
        indicator.className = `status-indicator ${state.appState}`;
      }
    }
  }
  
  function updateStatus(type, message) {
    if (elements.status) {
      const indicator = elements.status.querySelector('.status-indicator');
      const text = elements.status.querySelector('.status-text');
      
      if (indicator) {
        indicator.className = `status-indicator ${type}`;
      }
      
      if (text) {
        text.textContent = message;
      }
    }
  }
  
  function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type);
    
    if (!elements.notificationArea) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    elements.notificationArea.appendChild(notification);
    
    // Play notification sound
    if (type !== 'info' && elements.notificationSound) {
      elements.notificationSound.play().catch(e => {
        console.log('Could not play notification sound:', e);
      });
    }
    
    // Remove notification after 4 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
  
  function saveState() {
    if (chrome && chrome.storage) {
      const stateToSave = {
        ...state,
        lastSaveTime: Date.now()
      };
      
      chrome.storage.local.set({ 
        workTrackerState: stateToSave 
      }, () => {
        console.log('State saved');
      });
    }
  }
  
  function loadState() {
    if (chrome && chrome.storage) {
      chrome.storage.local.get(['workTrackerState'], (result) => {
        if (result.workTrackerState) {
          const savedState = result.workTrackerState;
          const now = Date.now();
          const timeDiff = Math.floor((now - (savedState.lastSaveTime || now)) / 1000);
          
          // Restore state
          state = {
            ...state,
            ...savedState,
            lastSaveTime: now
          };
          
          // Update work time if working
          if (state.isWorking && !state.isOnBreak && timeDiff > 0) {
            state.workSeconds += timeDiff;
          }
          
          // Update break time if on break
          if (state.isOnBreak && state.breakSeconds > 0 && timeDiff > 0) {
            state.breakSeconds = Math.max(0, state.breakSeconds - timeDiff);
            
            if (state.breakSeconds <= 0) {
              handleBreakEnd();
            }
          }
          
          // Always restart break countdown if on break (fixes freeze issue)
          if (state.isOnBreak && state.breakSeconds > 0) {
            startBreakCountdown();
          }
          
          // Set correct app state
          if (state.isAlarmPlaying) {
            state.appState = 'alarm';
          } else if (state.isOnBreak) {
            state.appState = 'break';
          } else if (state.isWorking) {
            state.appState = 'working';
          } else {
            state.appState = 'ready';
          }
          
          console.log('State loaded:', state);
          updateUI();
          
          // Update status with proper message after state load (fixes status dot animation)
          updateStatusAfterLoad();
        } else {
          // No saved state, ensure we're in ready state
          state.appState = 'ready';
          updateUI();
          updateStatus('ready', 'Ready to start your work day');
        }
      });
    }
  }
  
  function updateStatusAfterLoad() {
    // Update status message and ensure indicator class is applied correctly
    if (state.appState === 'ready') {
      updateStatus('ready', 'Ready to start your work day');
    } else if (state.appState === 'working') {
      updateStatus('working', 'Working - Stay focused!');
    } else if (state.appState === 'break') {
      const breakName = state.currentBreakType === 'breakfast' ? 'Breakfast' : 'Lunch';
      updateStatus('break', `On ${breakName.toLowerCase()} break`);
    } else if (state.appState === 'alarm') {
      updateStatus('break', 'Break time ended - Click to return to work');
    }
    
    // Force update of status indicator to ensure animation is applied
    if (elements.status) {
      const indicator = elements.status.querySelector('.status-indicator');
      if (indicator) {
        // Remove and re-add class to trigger animation
        indicator.className = 'status-indicator';
        setTimeout(() => {
          indicator.className = `status-indicator ${state.appState}`;
        }, 50);
      }
    }
  }
  
  function checkPendingActions() {
    if (chrome && chrome.storage) {
      chrome.storage.local.get(['pendingAction'], (result) => {
        if (result.pendingAction) {
          const action = result.pendingAction;
          console.log('Executing pending action:', action);
          
          switch (action) {
            case 'on':
              if (!state.isWorking) {
                startWork();
              }
              break;
            case 'off':
              if (state.isWorking) {
                endWorkDay();
              }
              break;
            case 'breakfast':
              if (state.isWorking && !state.isOnBreak) {
                startBreak('breakfast', 15 * 60);
              }
              break;
            case 'lunch':
              if (state.isWorking && !state.isOnBreak) {
                startBreak('lunch', 60 * 60);
              }
              break;
          }
          
          // Clear pending action
          chrome.storage.local.remove(['pendingAction']);
        }
      });
    }
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (clockInterval) clearInterval(clockInterval);
    if (timerInterval) clearInterval(timerInterval);
    if (breakTimerInterval) clearInterval(breakTimerInterval);
    
    saveState();
  });
  
  console.log('Work Timer Pro JavaScript loaded successfully');
});