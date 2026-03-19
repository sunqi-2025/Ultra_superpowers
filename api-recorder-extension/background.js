const SERVER_URL = 'http://localhost:3001';

let currentSessionId = null;
let isRecording = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    startRecording(message.tabId);
    sendResponse({ success: true });
  } else if (message.type === 'STOP_RECORDING') {
    stopRecording();
    sendResponse({ success: true });
  } else if (message.type === 'GET_RECORDING_STATUS') {
    sendResponse({ 
      isRecording, 
      sessionId: currentSessionId 
    });
  } else if (message.type === 'REQUEST_CAPTURED') {
    captureRequest(message.data);
    sendResponse({ success: true });
  } else if (message.type === 'USER_ACTION') {
    captureUserAction(message.data);
    sendResponse({ success: true });
  }
  return true;
});

async function startRecording(tabId) {
  try {
    const response = await fetch(`${SERVER_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Session ${Date.now()}` })
    });
    const data = await response.json();
    currentSessionId = data.session.id;
    isRecording = true;
    
    chrome.storage.local.set({ 
      isRecording: true, 
      sessionId: currentSessionId 
    });
    
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: 'SET_RECORDING', value: true });
    }
    
    console.log('Recording started, session ID:', currentSessionId);
  } catch (error) {
    console.error('Failed to start recording:', error);
  }
}

async function stopRecording() {
  if (currentSessionId) {
    try {
      await fetch(`${SERVER_URL}/api/sessions/${currentSessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'stopped' })
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }
  
  isRecording = false;
  chrome.storage.local.set({ isRecording: false, sessionId: null });
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_RECORDING', value: false });
    }
  });
  
  console.log('Recording stopped');
}

async function captureRequest(requestData) {
  if (!currentSessionId || !isRecording) return;
  
  try {
    const response = await fetch(`${SERVER_URL}/api/sessions/${currentSessionId}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (response.ok) {
      const result = await response.json();
      chrome.runtime.sendMessage({
        type: 'REQUEST_ADDED',
        data: result.request
      });
    }
  } catch (error) {
    console.error('Failed to capture request:', error);
  }
}

async function captureUserAction(actionData) {
  if (!currentSessionId || !isRecording) return;
  
  try {
    await fetch(`${SERVER_URL}/api/sessions/${currentSessionId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });
  } catch (error) {
    console.error('Failed to capture user action:', error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('API Recorder extension installed');
});
