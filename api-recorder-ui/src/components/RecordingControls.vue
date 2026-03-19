<template>
  <div class="recording-controls">
    <div class="status-bar">
      <div class="status-info">
        <span class="status-indicator" :class="{ recording: isRecording }">
          <span class="status-dot"></span>
          {{ isRecording ? '录制中' : '已停止' }}
        </span>
        <span class="session-name" v-if="session">{{ session.name }}</span>
      </div>
      <div class="stats">
        <span class="stat">
          <span class="stat-value">{{ requestCount }}</span>
          <span class="stat-label">请求</span>
        </span>
        <span class="stat" v-if="isRecording">
          <span class="stat-value">{{ duration }}</span>
          <span class="stat-label">时长</span>
        </span>
      </div>
    </div>
    <div class="controls">
      <button 
        class="btn btn-primary" 
        @click="handleStartRecording"
        :disabled="loading"
      >
        {{ loading ? '创建中...' : '开始新录制' }}
      </button>
      <button 
        class="btn btn-secondary" 
        @click="handleStopRecording"
        :disabled="!session || session.status === 'stopped'"
      >
        停止录制
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRecorderStore } from '../stores/recorder';

const store = useRecorderStore();

const loading = ref(false);
const duration = ref('00:00');
let durationTimer = null;

const session = computed(() => store.currentSession);
const isRecording = computed(() => session.value?.status === 'active');
const requestCount = computed(() => store.requests.length);

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function handleStartRecording() {
  loading.value = true;
  try {
    const newSession = await store.createSession();
    await store.fetchSessionDetail(newSession.id);
    startDurationTimer();
  } catch (err) {
    console.error('Failed to start recording:', err);
  } finally {
    loading.value = false;
  }
}

async function handleStopRecording() {
  if (!session.value) return;
  try {
    await store.updateSession(session.value.id, { status: 'stopped' });
    stopDurationTimer();
  } catch (err) {
    console.error('Failed to stop recording:', err);
  }
}

function startDurationTimer() {
  let seconds = 0;
  durationTimer = setInterval(() => {
    seconds++;
    duration.value = formatDuration(seconds);
  }, 1000);
}

function stopDurationTimer() {
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
}

onUnmounted(() => {
  stopDurationTimer();
});
</script>

<style scoped>
.recording-controls {
  background: #2d2d44;
  border-radius: 12px;
  padding: 20px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #888;
}

.status-indicator.recording {
  color: #e94560;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-indicator.recording .status-dot {
  background: #e94560;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.session-name {
  color: #fff;
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #00d9ff;
}

.stat-label {
  font-size: 11px;
  color: #888;
}

.controls {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #00d9ff;
  color: #1a1a2e;
}

.btn-primary:hover:not(:disabled) {
  background: #00b8d9;
}

.btn-secondary {
  background: #e94560;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background: #d63850;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
