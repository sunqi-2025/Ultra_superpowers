<template>
  <div class="app">
    <header class="app-header">
      <h1>API Recorder</h1>
      <p class="subtitle">浏览器操作录制与接口信息提取工具</p>
    </header>
    
    <div class="main-layout">
      <aside class="sidebar">
        <div class="session-list">
          <div class="session-header">
            <h3>录制会话</h3>
            <button class="refresh-btn" @click="refreshSessions">刷新</button>
          </div>
          
          <div class="sessions" v-if="sessions.length > 0">
            <div 
              v-for="session in sessions" 
              :key="session.id"
              class="session-item"
              :class="{ active: currentSession?.id === session.id }"
              @click="selectSession(session)"
            >
              <div class="session-info">
                <span class="session-name">{{ session.name }}</span>
                <span class="session-meta">
                  {{ session.requestCount }} 请求 · 
                  {{ session.status === 'active' ? '录制中' : '已停止' }}
                </span>
              </div>
              <button 
                class="delete-session-btn"
                @click.stop="deleteSession(session.id)"
              >×</button>
            </div>
          </div>
          
          <div class="empty-sessions" v-else>
            <p>暂无会话</p>
          </div>
        </div>
      </aside>
      
      <main class="content">
        <RecordingControls />
        
        <div class="content-grid" v-if="currentSession">
          <div class="left-panel">
            <RequestList 
              :requests="requests"
              :selectedId="selectedRequest?.id"
              @select="handleSelectRequest"
              @delete="handleDeleteRequest"
            />
          </div>
          
          <div class="right-panel">
            <RequestDetail 
              :request="selectedRequest"
              @close="selectedRequest = null"
            />
          </div>
        </div>
        
        <div class="no-session" v-else>
          <p>请选择一个会话或创建新录制</p>
        </div>
        
        <ExportPanel v-if="currentSession" />
      </main>
    </div>
    
    <div class="toast" v-if="toast.show" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRecorderStore } from './stores/recorder';
import RecordingControls from './components/RecordingControls.vue';
import RequestList from './components/RequestList.vue';
import RequestDetail from './components/RequestDetail.vue';
import ExportPanel from './components/ExportPanel.vue';

const store = useRecorderStore();

const selectedRequest = ref(null);
const toast = ref({ show: false, message: '', type: '' });

const sessions = computed(() => store.sessions);
const currentSession = computed(() => store.currentSession);
const requests = computed(() => store.requests);

async function refreshSessions() {
  try {
    await store.fetchSessions();
    showToast('会话列表已刷新', 'success');
  } catch (err) {
    showToast('刷新失败', 'error');
  }
}

async function selectSession(session) {
  try {
    await store.fetchSessionDetail(session.id);
    selectedRequest.value = null;
  } catch (err) {
    showToast('加载会话失败', 'error');
  }
}

async function deleteSession(id) {
  if (!confirm('确定要删除这个会话吗？')) return;
  try {
    await store.deleteSession(id);
    if (currentSession.value?.id === id) {
      selectedRequest.value = null;
    }
    showToast('会话已删除', 'success');
  } catch (err) {
    showToast('删除失败', 'error');
  }
}

function handleSelectRequest(request) {
  selectedRequest.value = request;
}

async function handleDeleteRequest(id) {
  try {
    await store.deleteRequest(id);
    if (selectedRequest.value?.id === id) {
      selectedRequest.value = null;
    }
    showToast('请求已删除', 'success');
  } catch (err) {
    showToast('删除失败', 'error');
  }
}

function showToast(message, type = 'info') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

onMounted(async () => {
  await store.fetchSessions();
  
  if (sessions.value.length > 0) {
    await selectSession(sessions.value[0]);
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #1a1a2e;
  color: #eee;
  line-height: 1.5;
}

.app {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
  padding: 24px 32px;
  border-bottom: 1px solid #3d3d5c;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: #888;
}

.main-layout {
  display: flex;
  min-height: calc(100vh - 100px);
}

.sidebar {
  width: 280px;
  background: #232338;
  border-right: 1px solid #3d3d5c;
  flex-shrink: 0;
}

.session-list {
  padding: 16px;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.session-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.refresh-btn {
  background: transparent;
  border: 1px solid #3d3d5c;
  color: #888;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #3d3d5c;
  color: #fff;
}

.sessions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #2d2d44;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.session-item:hover {
  background: #3d3d5c;
}

.session-item.active {
  background: #3d3d5c;
  border-left: 3px solid #00d9ff;
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
}

.session-meta {
  font-size: 11px;
  color: #888;
}

.delete-session-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.delete-session-btn:hover {
  color: #f93e3e;
}

.empty-sessions {
  text-align: center;
  padding: 20px;
  color: #666;
}

.content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.no-session {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #888;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: #3d3d5c;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

.toast.success {
  background: #49cc90;
}

.toast.error {
  background: #f93e3e;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
