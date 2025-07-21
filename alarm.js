const audio = document.getElementById('alarm-audio');
audio.volume = 1.0;
audio.play().catch(() => {});

const stopBtn = document.getElementById('stop-alarm');
stopBtn.onclick = () => {
  stopBtn.disabled = true;
  stopBtn.innerHTML = '<i class="fas fa-check-circle"></i> Alarm Stopped';
  stopBtn.style.opacity = '0.7';
  audio.pause();
  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: 'stopAlarmFromPopup' });
  }
  // Fade out effect before closing
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '0';
  setTimeout(() => { window.close(); }, 400);
};

// Auto-close after 2 minutes if not stopped
setTimeout(() => {
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '0';
  setTimeout(() => { window.close(); }, 400);
}, 2 * 60 * 1000); 