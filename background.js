// Background script for Work Time Tracker Pro
// Handles communication between content script and popup

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerWorkAction') {
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
      lastSaveTime: Date.now()
    };
    
    const now = Date.now();
    const timeDiff = Math.floor((now - state.lastSaveTime) / 1000);
    
    // Update work time if working
    if (state.isWorking && !state.isOnBreak) {
      state.workSeconds += timeDiff;
    }
    
    // Update break time if on break
    if (state.isOnBreak && state.breakSeconds > 0) {
      state.breakSeconds = Math.max(0, state.breakSeconds - timeDiff);
    }
    
    // Execute the action
    switch (actionType) {
      case 'on':
        if (!state.isWorking) {
          state.isWorking = true;
          state.isOnBreak = false;
          state.workStartTime = now;
          
          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Work Started',
            message: 'Work session started from job sheet! 💪'
          });
          
          console.log('Work started from job sheet');
        }
        break;
        
      case 'off':
        if (state.isWorking) {
          // Calculate total work time
          const totalHours = Math.floor(state.workSeconds / 3600);
          const totalMinutes = Math.floor((state.workSeconds % 3600) / 60);
          
          // Show notification with total work time
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Work Day Completed! 🎉',
            message: `Total work time: ${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}`
          });
          
          // Reset state
          state = {
            workSeconds: 0,
            breakSeconds: 0,
            isWorking: false,
            isOnBreak: false,
            workStartTime: null,
            breakStartTime: null,
            lastSaveTime: now
          };
          
          // Clear storage
          chrome.storage.local.remove(['workTrackerState']);
          console.log('Work ended from job sheet');
          return;
        }
        break;
        
      case 'breakfast':
        if (state.isWorking && !state.isOnBreak) {
          state.isOnBreak = true;
          state.breakSeconds = 15 * 60; // 15 minutes
          state.breakStartTime = now;
          
          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Breakfast Break Started',
            message: 'Enjoy your 15-minute breakfast break! 🍽️'
          });
          
          console.log('Breakfast break started from job sheet');
        }
        break;
        
      case 'lunch':
        if (state.isWorking && !state.isOnBreak) {
          state.isOnBreak = true;
          state.breakSeconds = 60 * 60; // 60 minutes
          state.breakStartTime = now;
          
          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Lunch Break Started',
            message: 'Enjoy your 1-hour lunch break! 🍽️'
          });
          
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
      // Update work time
      if (state.isWorking && !state.isOnBreak) {
        state.workSeconds += timeDiff;
      }
      
      // Update break time
      if (state.isOnBreak && state.breakSeconds > 0) {
        state.breakSeconds = Math.max(0, state.breakSeconds - timeDiff);
        
        // Set alarm when break is almost over (10 seconds warning)
        if (state.breakSeconds === 10) {
          chrome.alarms.create('breakAlarm', { delayInMinutes: 10/60 });
        }
        
        // Check if break is over
        if (state.breakSeconds <= 0) {
          handleBreakAlarm();
        }
      }
      
      // Save updated state
      state.lastSaveTime = now;
      chrome.storage.local.set({ workTrackerState: state });
    }
  } catch (error) {
    console.error('Error updating timer:', error);
  }
}

async function handleBreakAlarm() {
  try {
    // Show break over notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Break Time Over! ⏰',
      message: 'Your break time has ended. Please return to work.',
      requireInteraction: true
    });
    
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
