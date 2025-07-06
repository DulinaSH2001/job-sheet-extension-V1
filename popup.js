document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let workSeconds = 0;
  let breakSeconds = 0;
  let isWorking = false;
  let isOnBreak = false;
  let workInterval;
  let breakInterval;
  let workStartTime = null;
  let breakStartTime = null;
  let isAlarmPlaying = false;
  let clockInterval;
  
  // DOM elements
  const mainTimer = document.getElementById('main-timer');
  const breakTimer = document.getElementById('break-timer');
  const breakTimerContainer = document.getElementById('break-timer-container');
  const breakProgressBar = document.getElementById('break-progress-bar');
  const statusElement = document.getElementById('status');
  const currentTimeElement = document.getElementById('current-time');
  const notificationArea = document.getElementById('notification-area');
  const progressRing = document.getElementById('progress-ring');
  const floatingHint = document.getElementById('floating-hint');
  
  // Audio elements
  const alarmSound = document.getElementById('alarm-sound');
  const notificationSound = document.getElementById('notification-sound');
  
  // Buttons
  const startWorkBtn = document.getElementById('start-work-btn');
  const breakfastBtn = document.getElementById('breakfast-btn');
  const lunchBtn = document.getElementById('lunch-btn');
  const endBreakBtn = document.getElementById('end-break-btn');
  const offDayBtn = document.getElementById('off-day-btn');
  const stopAlarmBtn = document.getElementById('stop-alarm-btn');
  
  // Event listeners
  startWorkBtn.addEventListener('click', startWork);
  breakfastBtn.addEventListener('click', () => startBreak(15 * 60)); // 15 minutes
  lunchBtn.addEventListener('click', () => startBreak(60 * 60)); // 60 minutes
  endBreakBtn.addEventListener('click', endBreak);
  offDayBtn.addEventListener('click', offDay);
  stopAlarmBtn.addEventListener('click', stopAlarm);
  
  // Initialize
  initializeClock();
  loadState();
  checkPendingActions();
  updateDisplay();
  initializeButtonVisibility();
  
  // Initialize clock
  function initializeClock() {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }
  
  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    currentTimeElement.textContent = timeString;
  }
  
  // Initialize button visibility with smooth transitions
  function initializeButtonVisibility() {
    setElementVisibility(offDayBtn, false);
    setElementVisibility(endBreakBtn, false);
    setElementVisibility(stopAlarmBtn, false);
    setElementVisibility(breakTimerContainer, false);
  }
  
  // Utility function for smooth show/hide with animations
  function setElementVisibility(element, isVisible) {
    if (!element) return;
    
    if (isVisible) {
      element.style.display = 'block';
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        element.style.transition = 'all 0.3s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    } else {
      element.style.transition = 'all 0.3s ease-out';
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.display = 'none';
      }, 300);
    }
  }
  
  // Enhanced button click feedback
  function addClickFeedback(button) {
    if (!button) return;
    
    button.addEventListener('click', function(e) {
      // Add ripple effect
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = e.offsetX + 'px';
      ripple.style.top = e.offsetY + 'px';
      
      this.appendChild(ripple);
      
      // Add scale animation
      this.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        this.style.transform = 'scale(1)';
        ripple.remove();
      }, 150);
    });
  }
  
  // Apply click feedback to all buttons
  [startWorkBtn, breakfastBtn, lunchBtn, endBreakBtn, offDayBtn, stopAlarmBtn].forEach(btn => {
    if (btn) addClickFeedback(btn);
  });
  
  // Alarm functions
  function playAlarm() {
    if (!isAlarmPlaying) {
      isAlarmPlaying = true;
      alarmSound.currentTime = 0;
      alarmSound.play().catch(e => console.log('Audio play failed:', e));
      
      // Add visual alarm effects
      document.body.classList.add('alarm-active');
      stopAlarmBtn.style.display = 'block';
      
      showNotification('⏰ Break time is over!', 'warning');
      
      // Auto-stop alarm after 30 seconds if not stopped manually
      setTimeout(() => {
        if (isAlarmPlaying) {
          stopAlarm();
        }
      }, 30000);
    }
  }
  
  function stopAlarm() {
    if (isAlarmPlaying) {
      isAlarmPlaying = false;
      alarmSound.pause();
      alarmSound.currentTime = 0;
      
      // Remove visual alarm effects
      document.body.classList.remove('alarm-active');
      stopAlarmBtn.style.display = 'none';
      
      showNotification('Alarm stopped', 'success');
    }
  }
  
  // Notification system
  function showNotification(message, type = 'info') {
    if (!notificationArea) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    
    notificationArea.appendChild(notification);
    
    // Play notification sound
    if (type !== 'info' && notificationSound) {
      notificationSound.play().catch(e => console.log('Notification sound failed:', e));
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
  
  function getNotificationIcon(type) {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'exclamation-triangle';
      case 'error': return 'times-circle';
      default: return 'info-circle';
    }
  }
  
  // Enhanced progress ring update
  function updateProgressRing() {
    if (!progressRing) return;
    
    // Calculate progress based on 8-hour work day (28800 seconds)
    const maxWorkSeconds = 8 * 60 * 60;
    const progress = Math.min(workSeconds / maxWorkSeconds, 1);
    const circumference = 2 * Math.PI * 85; // radius is 85
    const offset = circumference - (progress * circumference);
    
    progressRing.style.strokeDashoffset = offset;
    
    // Change color based on progress
    if (progress < 0.5) {
      progressRing.style.stroke = '#4CAF50'; // Green
    } else if (progress < 0.8) {
      progressRing.style.stroke = '#FF9800'; // Orange
    } else {
      progressRing.style.stroke = '#2196F3'; // Blue
    }
  }
  
  // Break progress bar
  function updateBreakProgress() {
    if (!breakProgressBar || !isOnBreak) return;
    
    const totalBreakTime = breakStartTime ? 
      (breakfastBtn.textContent.includes('Breakfast') ? 15 * 60 : 60 * 60) : 
      (breakSeconds > 30 * 60 ? 60 * 60 : 15 * 60);
    const progress = Math.max(0, (totalBreakTime - breakSeconds) / totalBreakTime * 100);
    breakProgressBar.style.width = `${progress}%`;
  }
  
  // Enhanced button visibility management
  function updateButtonVisibility() {
    // Reset all buttons (with null checks)
    if (startWorkBtn) startWorkBtn.style.display = 'none';
    if (breakfastBtn) breakfastBtn.style.display = 'none';
    if (lunchBtn) lunchBtn.style.display = 'none';
    if (endBreakBtn) endBreakBtn.style.display = 'none';
    if (offDayBtn) offDayBtn.style.display = 'none';
    if (breakTimerContainer) breakTimerContainer.style.display = 'none';
    
    if (isWorking) {
      if (offDayBtn) offDayBtn.style.display = 'block';
      
      if (isOnBreak) {
        if (endBreakBtn) endBreakBtn.style.display = 'block';
        if (breakTimerContainer) breakTimerContainer.style.display = 'block';
        if (statusElement) {
          statusElement.innerHTML = `
            <div class="status-indicator-wrapper">
              <div class="status-indicator break"></div>
              <div class="status-pulse"></div>
            </div>
            <span class="status-text">On ${breakSeconds >= 3600 ? 'lunch' : 'breakfast'} break</span>
          `;
        }
      } else {
        if (breakfastBtn) breakfastBtn.style.display = 'block';
        if (lunchBtn) lunchBtn.style.display = 'block';
        if (statusElement) {
          statusElement.innerHTML = `
            <div class="status-indicator-wrapper">
              <div class="status-indicator working"></div>
              <div class="status-pulse"></div>
            </div>
            <span class="status-text">Working</span>
          `;
        }
      }
    } else {
      if (startWorkBtn) startWorkBtn.style.display = 'block';
      if (statusElement) {
        statusElement.innerHTML = `
          <div class="status-indicator-wrapper">
            <div class="status-indicator ready"></div>
            <div class="status-pulse"></div>
          </div>
          <span class="status-text">Ready to start</span>
        `;
      }
    }
    
    // Hide floating hint after first interaction
    if (floatingHint && (isWorking || workSeconds > 0)) {
      floatingHint.style.opacity = '0';
    }
  }
  
  // Save and Load functions
  function saveState() {
    const state = {
      workSeconds,
      breakSeconds,
      isWorking,
      isOnBreak,
      workStartTime,
      breakStartTime,
      lastSaveTime: Date.now()
    };
    chrome.storage.local.set({ workTrackerState: state });
  }
  
  function loadState() {
    chrome.storage.local.get(['workTrackerState'], (result) => {
      if (result.workTrackerState) {
        const state = result.workTrackerState;
        const now = Date.now();
        const timeDiff = Math.floor((now - state.lastSaveTime) / 1000);
        
        // Restore state
        workSeconds = state.workSeconds || 0;
        breakSeconds = state.breakSeconds || 0;
        isWorking = state.isWorking || false;
        isOnBreak = state.isOnBreak || false;
        workStartTime = state.workStartTime;
        breakStartTime = state.breakStartTime;
        
        // Add elapsed time since last save
        if (isWorking && !isOnBreak) {
          workSeconds += timeDiff;
        } else if (isOnBreak && breakSeconds > 0) {
          breakSeconds = Math.max(0, breakSeconds - timeDiff);
        }
        
        // Restore UI state
        updateButtonVisibility();
        updateDisplay();
        
        // Restart timers if they were running
        if (isWorking && !isOnBreak) {
          startWorkTimer();
        } else if (isOnBreak && breakSeconds > 0) {
          startBreakTimer();
        } else if (isOnBreak && breakSeconds <= 0) {
          // Break time is over
          alarmSound.play();
          showBreakOverNotification();
          statusElement.textContent = "Status: Break over - please end break";
        }
      }
    });
  }
  
  function checkPendingActions() {
    chrome.storage.local.get(['pendingAction'], (result) => {
      if (result.pendingAction) {
        const actionType = result.pendingAction;
        
        // Clear the pending action
        chrome.storage.local.remove(['pendingAction']);
        
        // Show notification that action was triggered from job sheet
        showJobSheetNotification(actionType);
        
        // Refresh the UI to reflect the changes
        setTimeout(() => {
          loadState();
        }, 100);
      }
    });
  }
  
  function showJobSheetNotification(actionType) {
    const notification = document.createElement('div');
    notification.textContent = `${actionType.toUpperCase()} triggered from job sheet`;
    notification.style.cssText = `
      position: absolute;
      top: 5px;
      left: 5px;
      right: 5px;
      background: #2196F3;
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
      z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
  
  // Add loading state management
  function showLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="loading-text">Loading...</div>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  }
  
  function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.remove();
      }, 300);
    }
  }
  
  // Show loading initially
  showLoading();
  
  // Hide loading after everything is initialized
  setTimeout(() => {
    hideLoading();
  }, 800);
  
  function updateButtonVisibility() {
    if (isWorking) {
      startWorkBtn.style.display = 'none';
      offDayBtn.style.display = 'block';
      
      if (isOnBreak) {
        breakfastBtn.style.display = 'none';
        lunchBtn.style.display = 'none';
        endBreakBtn.style.display = 'block';
        statusElement.textContent = `Status: On break (${breakSeconds >= 3600 ? 'Lunch' : 'Breakfast'})`;
      } else {
        breakfastBtn.style.display = 'block';
        lunchBtn.style.display = 'block';
        endBreakBtn.style.display = 'none';
        statusElement.textContent = "Status: Working";
      }
    } else {
      startWorkBtn.style.display = 'block';
      breakfastBtn.style.display = 'none';
      lunchBtn.style.display = 'none';
      endBreakBtn.style.display = 'none';
      offDayBtn.style.display = 'none';
      statusElement.textContent = "Status: Not working";
    }
  }
  
  function startWorkTimer() {
    if (workInterval) clearInterval(workInterval);
    workInterval = setInterval(() => {
      workSeconds++;
      updateDisplay();
      updateProgressRing();
      saveState();
    }, 1000);
  }
  
  function startBreakTimer() {
    if (breakInterval) clearInterval(breakInterval);
    breakInterval = setInterval(() => {
      breakSeconds--;
      updateDisplay();
      updateBreakProgress();
      saveState();
      
      // Play alarm when break is over
      if (breakSeconds <= 0) {
        clearInterval(breakInterval);
        playAlarm();
        showBreakOverNotification();
      }
    }, 1000);
  }
  
  // Enhanced timer functions
  function startWork() {
    if (isWorking) return;
    
    isWorking = true;
    isOnBreak = false;
    workStartTime = Date.now();
    
    updateButtonVisibility();
    saveState();
    startWorkTimer();
    
    showNotification('Work session started! 💪', 'success');
    
    // Add working class for animations
    document.body.classList.add('working');
  }
  
  function startBreak(duration) {
    if (!isWorking || isOnBreak) return;
    
    isOnBreak = true;
    breakSeconds = duration;
    breakStartTime = Date.now();
    
    updateButtonVisibility();
    saveState();
    startBreakTimer();
    
    const breakType = duration >= 3600 ? 'lunch' : 'breakfast';
    showNotification(`${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break started! 🍽️`, 'success');
  }
  
  function endBreak() {
    if (!isOnBreak) return;
    
    clearInterval(breakInterval);
    isOnBreak = false;
    breakStartTime = null;
    
    // Stop alarm if playing
    stopAlarm();
    
    updateButtonVisibility();
    saveState();
    
    // Reset break timer display
    if (breakTimer) {
      breakTimer.textContent = '00:00';
    }
    if (breakProgressBar) {
      breakProgressBar.style.width = '0%';
    }
    
    // Restart work timer
    startWorkTimer();
    
    showNotification('Break ended, back to work! 🚀', 'success');
  }
  
  function offDay() {
    // Stop all timers and alarms
    clearInterval(workInterval);
    clearInterval(breakInterval);
    stopAlarm();
    
    // Calculate total work time for the day
    const totalHours = Math.floor(workSeconds / 3600);
    const totalMinutes = Math.floor((workSeconds % 3600) / 60);
    const totalTime = `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}`;
    
    // Reset state
    isWorking = false;
    isOnBreak = false;
    workSeconds = 0;
    breakSeconds = 0;
    workStartTime = null;
    breakStartTime = null;
    
    // Update status with total time
    if (statusElement) {
      statusElement.innerHTML = `
        <div class="status-indicator-wrapper">
          <div class="status-indicator" style="background: #4CAF50; box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);"></div>
          <div class="status-pulse"></div>
        </div>
        <span class="status-text">Day complete! Total: ${totalTime}</span>
      `;
    }
    
    // Update button visibility
    updateButtonVisibility();
    
    // Reset timer displays
    if (mainTimer) {
      mainTimer.textContent = '00:00:00';
    }
    if (mainTimerOverlay) {
      mainTimerOverlay.textContent = '00:00:00';
    }
    if (breakTimer) {
      breakTimer.textContent = '00:00';
    }
    if (breakProgressBar) {
      breakProgressBar.style.width = '0%';
    }
    
    // Reset progress ring
    if (progressRing) {
      progressRing.style.strokeDashoffset = '534.07';
    }
    
    // Remove working class
    document.body.classList.remove('working');
    
    // Clear saved state
    chrome.storage.local.remove(['workTrackerState']);
    
    showNotification(`Work day completed! Total time: ${totalTime} 🎉`, 'success');
  }
  
  function updateDisplay() {
    // Update work timer
    const workHours = Math.floor(workSeconds / 3600);
    const workMinutes = Math.floor((workSeconds % 3600) / 60);
    const workSecs = workSeconds % 60;
    const workTimeString = `${String(workHours).padStart(2, '0')}:${String(workMinutes).padStart(2, '0')}:${String(workSecs).padStart(2, '0')}`;
    
    // Update main timer display with smooth transition
    if (mainTimer) {
      if (mainTimer.textContent !== workTimeString) {
        mainTimer.style.transform = 'scale(1.05)';
        mainTimer.textContent = workTimeString;
        
        setTimeout(() => {
          mainTimer.style.transform = 'scale(1)';
        }, 100);
      }
    }
    
    // Update overlay timer (if it exists)
    if (mainTimerOverlay) {
      mainTimerOverlay.textContent = workTimeString;
    }
    
    // Update progress ring
    updateProgressRing();
    
    // Update break timer if on break
    if (isOnBreak && breakSeconds > 0) {
      const breakMins = Math.floor(breakSeconds / 60);
      const breakSecs = breakSeconds % 60;
      const breakTimeString = `${String(breakMins).padStart(2, '0')}:${String(breakSecs).padStart(2, '0')}`;
      
      if (breakTimer) {
        breakTimer.textContent = breakTimeString;
      }
      
      // Update progress bar
      updateBreakProgress();
      
      // Add pulsing effect when break time is low
      if (breakSeconds <= 60) {
        breakTimer.classList.add('low-time-pulse');
      } else {
        breakTimer.classList.remove('low-time-pulse');
      }
    } else {
      if (breakTimer) {
        breakTimer.textContent = '00:00';
      }
    }
    
    // Update progress ring
    updateProgressRing();
  }
  
  function showBreakOverNotification() {
    showNotification('Break time is over! Please return to work.', 'warning');
    
    // Also show browser notification
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification("Break Time Over", {
        body: "Your break time has ended. Please return to work.",
        icon: "icons/icon48.png"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Break Time Over", {
            body: "Your break time has ended. Please return to work.",
            icon: "icons/icon48.png"
          });
        }
      });
    }
  }
  
  // Cleanup function
  function cleanup() {
    clearInterval(workInterval);
    clearInterval(breakInterval);
    clearInterval(clockInterval);
    stopAlarm();
  }
  
  // Handle popup close
  window.addEventListener('beforeunload', cleanup);
  
  // Request notification permission on first load
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});