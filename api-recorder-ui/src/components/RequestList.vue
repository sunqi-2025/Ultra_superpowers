<template>
  <div class="request-list">
    <div class="list-header">
      <h3>请求列表</h3>
      <span class="count">{{ requests.length }} 个请求</span>
    </div>
    
    <div class="list-content" v-if="requests.length > 0">
      <div 
        v-for="(request, index) in requests" 
        :key="request.id"
        class="request-item"
        :class="{ selected: selectedId === request.id }"
        @click="handleSelect(request)"
      >
        <div class="request-main">
          <span class="method" :class="request.method.toLowerCase()">
            {{ request.method }}
          </span>
          <span class="url" :title="request.url">
            {{ formatUrl(request.url) }}
          </span>
        </div>
        <div class="request-meta">
          <span class="status" :class="getStatusClass(request.response?.status)">
            {{ request.response?.status || '-' }}
          </span>
          <span class="time">{{ request.response?.time || '-' }}ms</span>
          <button class="delete-btn" @click.stop="handleDelete(request.id)">×</button>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <p>暂无请求数据</p>
      <small>开始录制后，捕获的请求将显示在这里</small>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  requests: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select', 'delete']);

function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

function getStatusClass(status) {
  if (!status) return '';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 400 && status < 500) return 'client-error';
  if (status >= 500) return 'server-error';
  return '';
}

function handleSelect(request) {
  emit('select', request);
}

function handleDelete(id) {
  emit('delete', id);
}
</script>

<style scoped>
.request-list {
  background: #2d2d44;
  border-radius: 12px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3d3d5c;
}

.list-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.count {
  font-size: 13px;
  color: #888;
}

.list-content {
  max-height: 400px;
  overflow-y: auto;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #3d3d5c;
  cursor: pointer;
  transition: background 0.2s;
}

.request-item:hover {
  background: #3d3d5c;
}

.request-item.selected {
  background: #3d3d5c;
  border-left: 3px solid #00d9ff;
}

.request-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.method {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.method.get { background: #61affe; color: #fff; }
.method.post { background: #49cc90; color: #fff; }
.method.put { background: #fca130; color: #fff; }
.method.delete { background: #f93e3e; color: #fff; }
.method.patch { background: #50e3c2; color: #fff; }

.url {
  font-size: 13px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.status.success { background: #49cc90; color: #fff; }
.status.client-error { background: #fca130; color: #fff; }
.status.server-error { background: #f93e3e; color: #fff; }

.time {
  font-size: 12px;
  color: #888;
  min-width: 50px;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.delete-btn:hover {
  color: #f93e3e;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #888;
}

.empty-state p {
  margin: 0 0 8px;
  font-size: 14px;
}

.empty-state small {
  font-size: 12px;
  color: #666;
}
</style>
