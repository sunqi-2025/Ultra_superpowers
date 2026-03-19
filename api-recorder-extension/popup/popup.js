const SERVER_URL = 'http://localhost:3001';

let isRecording = false;
let sessionId = null;
let requestCount = 0;
let duration = 0;
let durationTimer = null;

const statusIndicator = document.getElementById('statusIndicator');
const sessionName = document.getElementById('sessionName');
const requestCountEl = document.getElementById('requestCount');
const durationEl = document.getElementById('duration');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

function updateUI() {
  if (isRecording) {
    statusIndicator.classList.add('recording');
    statusIndicator.querySelector('.status-text').textContent = '录制中';
    recordBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusIndicator.classList.remove('recording');
    statusIndicator.querySelector('.status-text').textContent = '已停止';
    recordBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDuration() {
  duration++;
  durationEl.textContent = formatDuration(duration);
}

function updateRequestCount(count) {
  requestCount = count;
  requestCountEl.textContent = count;
}

async function startRecording() {
  try {
    const response = await fetch(`${SERVER_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: `Session ${new Date().toLocaleString('zh-CN')}` 
      })
    });
    
    if (!response.ok) throw new Error('Failed to create session');
    
    const data = await response.json();
    sessionId = data.session.id;
    sessionName.textContent = data.session.name;
    
    isRecording = true;
    requestCount = 0;
    duration = 0;
    
    durationTimer = setInterval(updateDuration, 1000);
    updateUI();
    
    chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      tabId: null
    });
    
    showToast('开始录制');
  } catch (error) {
    console.error('Failed to start recording:', error);
    showToast('启动失败: ' + error.message);
  }
}

async function stopRecording() {
  try {
    if (sessionId) {
      await fetch(`${SERVER_URL}/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'stopped' })
      });
    }
    
    isRecording = false;
    clearInterval(durationTimer);
    updateUI();
    
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
    
    showToast('录制已停止');
  } catch (error) {
    console.error('Failed to stop recording:', error);
    showToast('停止失败: ' + error.message);
  }
}

async function loadCurrentSession() {
  try {
    const response = await fetch(`${SERVER_URL}/api/sessions`);
    const data = await response.json();
    
    const activeSession = data.sessions.find(s => s.status === 'active');
    if (activeSession) {
      sessionId = activeSession.id;
      sessionName.textContent = activeSession.name;
      isRecording = true;
      requestCount = activeSession.requestCount || 0;
      requestCountEl.textContent = requestCount;
      
      duration = Math.floor((Date.now() - new Date(activeSession.createdAt).getTime()) / 1000);
      durationEl.textContent = formatDuration(duration);
      
      durationTimer = setInterval(updateDuration, 1000);
      updateUI();
    }
  } catch (error) {
    console.error('Failed to load session:', error);
  }
}

function showProgress(percent, text) {
  progressContainer.style.display = 'flex';
  progressFill.style.width = `${percent}%`;
  progressText.textContent = text || `${percent}%`;
}

function hideProgress() {
  progressContainer.style.display = 'none';
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2d2d44;
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

recordBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'REQUEST_ADDED') {
    requestCount++;
    requestCountEl.textContent = requestCount;
  }
});

loadCurrentSession();
updateUI();
