// Content script for Work Time Tracker
// Detects clicks on job sheet buttons and communicates with extension

(function() {
  'use strict';
  
  // Configuration - Common button text patterns that might appear on job sheets
  const BUTTON_PATTERNS = {
    on: ['on', 'start', 'start work', 'work start'],
    off: ['off', 'stop', 'end work', 'finish work', 'work end'],
    breakfast: ['breakfast', 'morning break'],
    lunch: ['lunch', 'lunch break', 'meal break']
  };
  
  // Initialize the content script
  function init() {
    console.log('Work Time Tracker content script loaded');
    
    // Listen for clicks on the entire document
    document.addEventListener('click', handleClick, true);
    
    // Also listen for changes in case buttons are added dynamically
    observeForNewButtons();
  }
  
  // Handle click events
  function handleClick(event) {
    const target = event.target;
    
    // Check if clicked element is a button or clickable element
    if (isClickableElement(target)) {
      const buttonText = getElementText(target);
      const actionType = detectActionType(buttonText);
      
      if (actionType) {
        console.log(`Detected ${actionType} action from job sheet button:`, buttonText);
        
        // Send message to background script
        chrome.runtime.sendMessage({
          action: 'triggerWorkAction',
          actionType: actionType,
          buttonText: buttonText,
          url: window.location.href
        }, (response) => {
          if (response && response.success) {
            showNotification(`${actionType.toUpperCase()} action triggered from job sheet`);
          }
        });
      }
    }
  }
  
  // Check if element is clickable (button, link, etc.)
  function isClickableElement(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();
    const role = element.getAttribute('role')?.toLowerCase();
    
    return (
      tagName === 'button' ||
      tagName === 'a' ||
      (tagName === 'input' && ['button', 'submit'].includes(type)) ||
      role === 'button' ||
      element.classList.contains('btn') ||
      element.classList.contains('button') ||
      element.onclick ||
      element.getAttribute('onclick')
    );
  }
  
  // Get text content from element
  function getElementText(element) {
    return (
      element.textContent ||
      element.innerText ||
      element.value ||
      element.title ||
      element.getAttribute('aria-label') ||
      element.getAttribute('alt') ||
      ''
    ).toLowerCase().trim();
  }
  
  // Detect action type based on button text
  function detectActionType(text) {
    if (!text) return null;
    
    // Check each pattern
    for (const [actionType, patterns] of Object.entries(BUTTON_PATTERNS)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          return actionType;
        }
      }
    }
    
    return null;
  }
  
  // Observe for dynamically added buttons
  function observeForNewButtons() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the new node or its children contain buttons
              const buttons = node.querySelectorAll ? 
                node.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]') : 
                [];
              
              if (buttons.length > 0) {
                console.log(`Found ${buttons.length} new buttons on job sheet`);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Show notification to user
  function showNotification(message) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
