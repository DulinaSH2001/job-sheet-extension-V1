// Background script for Work Timer Pro
// Enhanced background processing with better notifications

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerWorkAction') {
    console.log('Received work action:', request.actionType);
    
    // Store the action to be executed by popup
    chrome.storage.local.set({ 
      pendingAction: request.actionType,
      actionTimestamp: Date.now()
    });
    
    // Execute the action immediately in background
    handleWorkAction(request.actionType);
    
    sendResponse({ success: true });
  }
});

// Handle work actions in background
async function handleWorkAction(actionType) {
  try {
    // Get current state
    const result = await chrome.storage.local.get(['workTrackerState']);
    let state = result.workTrackerState || {
      workSeconds: 0,
      breakSeconds: 0,
      isWorking: false,
      isOnBreak: false,
      workStartTime: null,
      breakStartTime: null,
      lastSaveTime: Date.now(),
      appState: 'ready'
    };
    
    const now = Date.now();
    const timeDiff = Math.floor((now - state.lastSaveTime) / 1000);
    
    // Update work time if working
    if (state.isWorking && !state.isOnBreak && timeDiff > 0) {
      state.workSeconds += timeDiff;
    }
    
    // Update break time if on break
    if (state.isOnBreak && state.breakSeconds > 0 && timeDiff > 0) {
      state.breakSeconds = Math.max(0, state.breakSeconds - timeDiff);
    }
    
    // Execute the action
    switch (actionType) {
      case 'on':
        if (!state.isWorking) {
          state.isWorking = true;
          state.isOnBreak = false;
          state.workStartTime = now;
          state.appState = 'working';
          
          // Show notification
          showNotification('Work Started', 'Work session started from job sheet! 💪', 'success');
          console.log('Work started from job sheet');
        }
        break;
        
      case 'off':
        if (state.isWorking) {
          // Calculate total work time
          const totalHours = Math.floor(state.workSeconds / 3600);
          const totalMinutes = Math.floor((state.workSeconds % 3600) / 60);
          const timeString = `${totalHours}h ${totalMinutes}m`;
          
          // Show notification with total work time
          showNotification('Work Day Completed! 🎉', `Total work time: ${timeString}`, 'success');
          
          // Reset state
          state = {
            workSeconds: 0,
            breakSeconds: 0,
            isWorking: false,
            isOnBreak: false,
            workStartTime: null,
            breakStartTime: null,
            lastSaveTime: now,
            appState: 'ready'
          };
          
          console.log('Work ended from job sheet');
        }
        break;
        
      case 'breakfast':
        if (state.isWorking && !state.isOnBreak) {
          state.isOnBreak = true;
          state.breakSeconds = 15 * 60; // 15 minutes
          state.breakStartTime = now;
          state.currentBreakType = 'breakfast';
          state.appState = 'break';
          
          // Show notification
          showNotification('Breakfast Break Started', 'Enjoy your 15-minute breakfast break! 🍽️', 'info');
          console.log('Breakfast break started from job sheet');
        }
        break;
        
      case 'lunch':
        if (state.isWorking && !state.isOnBreak) {
          state.isOnBreak = true;
          state.breakSeconds = 60 * 60; // 60 minutes
          state.breakStartTime = now;
          state.currentBreakType = 'lunch';
          state.appState = 'break';
          
          // Show notification
          showNotification('Lunch Break Started', 'Enjoy your 1-hour lunch break! 🍽️', 'info');
          console.log('Lunch break started from job sheet');
        }
        break;
    }
    
    // Save updated state
    state.lastSaveTime = now;
    chrome.storage.local.set({ workTrackerState: state });
    
  } catch (error) {
    console.error('Error handling work action:', error);
  }
}

// Enhanced notification system
function showNotification(title, message, type = 'basic') {
  const iconUrl = getNotificationIcon(type);
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: type === 'success' ? 1 : 0
  });
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success':
      return 'icons/icon48.png';
    case 'warning':
      return 'icons/icon48.png';
    case 'error':
      return 'icons/icon48.png';
    default:
      return 'icons/icon48.png';
  }
}

// Enhanced timer management with alarm support
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateTimer') {
    updateTimerInBackground();
  } else if (alarm.name === 'breakAlarm') {
    handleBreakAlarm();
  }
});

// Create periodic alarm for timer updates
chrome.alarms.create('updateTimer', { periodInMinutes: 1/60 }); // Every second

async function updateTimerInBackground() {
  try {
    const result = await chrome.storage.local.get(['workTrackerState']);
    if (!result.workTrackerState) return;
    
    const state = result.workTrackerState;
    const now = Date.now();
    const timeDiff = Math.floor((now - state.lastSaveTime) / 1000);
    
    if (timeDiff >= 1) {
      let shouldUpdate = false;
      
      // Update work time
      if (state.isWorking && !state.isOnBreak) {
        state.workSeconds += timeDiff;
        shouldUpdate = true;
      }
      
      // Update break time
      if (state.isOnBreak && state.breakSeconds > 0) {
        state.breakSeconds = Math.max(0, state.breakSeconds - timeDiff);
        shouldUpdate = true;
        
        // Set alarm when break is almost over (10 seconds warning)
        if (state.breakSeconds === 10) {
          chrome.alarms.create('breakAlarm', { delayInMinutes: 10/60 });
        }
        
        // Check if break is over
        if (state.breakSeconds <= 0) {
          handleBreakAlarm();
          return;
        }
      }
      
      // Save updated state
      if (shouldUpdate) {
        state.lastSaveTime = now;
        chrome.storage.local.set({ workTrackerState: state });
      }
    }
  } catch (error) {
    console.error('Error updating timer:', error);
  }
}

async function handleBreakAlarm() {
  try {
    // Update state to alarm mode
    const result = await chrome.storage.local.get(['workTrackerState']);
    if (result.workTrackerState) {
      const state = result.workTrackerState;
      state.isAlarmPlaying = true;
      state.appState = 'alarm';
      state.breakSeconds = 0;
      
      chrome.storage.local.set({ workTrackerState: state });
    }
    
    // Show break over notification
    showNotification('Break Time Over! ⏰', 'Your break time has ended. Please return to work.', 'warning');
    
    // Clear the alarm
    chrome.alarms.clear('breakAlarm');
    
  } catch (error) {
    console.error('Error handling break alarm:', error);
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Clear the notification
  chrome.notifications.clear(notificationId);
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Work Timer Pro installed');
});

// Handle startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Work Timer Pro started');
});
