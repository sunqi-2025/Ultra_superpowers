<template>
  <div class="export-panel">
    <div class="panel-header">
      <h3>导出选项</h3>
    </div>
    
    <div class="export-progress" v-if="exportProgress > 0">
      <div class="progress-info">
        <span>导出进度</span>
        <span>{{ exportProgress }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: exportProgress + '%' }"></div>
      </div>
    </div>
    
    <div class="export-options" v-else>
      <button 
        class="export-btn"
        @click="handleExport('markdown')"
        :disabled="!sessionId || requests.length === 0"
      >
        <span class="export-icon">📄</span>
        <span class="export-text">
          <strong>导出为 Markdown</strong>
          <small>生成API接口文档</small>
        </span>
      </button>
      
      <button 
        class="export-btn"
        @click="handleExport('json')"
        :disabled="!sessionId || requests.length === 0"
      >
        <span class="export-icon">📋</span>
        <span class="export-text">
          <strong>导出为 JSON</strong>
          <small>结构化数据格式</small>
        </span>
      </button>
      
      <button 
        class="export-btn"
        @click="handleExport('jmx')"
        :disabled="!sessionId || requests.length === 0"
      >
        <span class="export-icon">⚡</span>
        <span class="export-text">
          <strong>导出为 JMX</strong>
          <small>JMeter测试脚本</small>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRecorderStore } from '../stores/recorder';

const store = useRecorderStore();

const sessionId = computed(() => store.currentSession?.id);
const requests = computed(() => store.requests);
const exportProgress = computed(() => store.exportProgress);

async function handleExport(type) {
  if (!sessionId.value) return;
  
  try {
    switch (type) {
      case 'markdown':
        await store.exportAsMarkdown(sessionId.value);
        break;
      case 'json':
        await store.exportAsJson(sessionId.value);
        break;
      case 'jmx':
        await store.exportAsJmx(sessionId.value);
        break;
    }
  } catch (err) {
    console.error('Export failed:', err);
    alert('导出失败: ' + err.message);
  }
}
</script>

<style scoped>
.export-panel {
  background: #2d2d44;
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #3d3d5c;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.export-progress {
  padding: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #888;
}

.progress-bar {
  height: 6px;
  background: #3d3d5c;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d9ff, #00ff88);
  transition: width 0.3s ease;
}

.export-options {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #3d3d5c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.export-btn:hover:not(:disabled) {
  background: #4d4d6c;
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-icon {
  font-size: 24px;
}

.export-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.export-text strong {
  font-size: 14px;
  color: #fff;
}

.export-text small {
  font-size: 12px;
  color: #888;
}
</style>
