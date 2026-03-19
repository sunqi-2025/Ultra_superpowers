<template>
  <div class="request-detail" v-if="request">
    <div class="detail-header">
      <h3>请求详情</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    
    <div class="detail-content">
      <div class="section">
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <label>Method</label>
            <span class="method" :class="request.method.toLowerCase()">
              {{ request.method }}
            </span>
          </div>
          <div class="info-item full-width">
            <label>URL</label>
            <div class="url-box">
              <span class="url-text">{{ request.url }}</span>
              <button class="copy-btn" @click="copyToClipboard(request.url)">复制</button>
            </div>
          </div>
          <div class="info-item">
            <label>状态码</label>
            <span class="status" :class="getStatusClass(request.response?.status)">
              {{ request.response?.status || '-' }}
            </span>
          </div>
          <div class="info-item">
            <label>响应时间</label>
            <span>{{ request.response?.time || '-' }}ms</span>
          </div>
          <div class="info-item full-width">
            <label>页面URL</label>
            <span class="page-url">{{ request.pageUrl }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">请求头</div>
        <pre class="code-block" v-if="hasHeaders(request.headers)">
{{ formatJson(request.headers) }}</pre>
        <p class="empty-text" v-else>无</p>
      </div>
      
      <div class="section" v-if="request.queryParams && Object.keys(request.queryParams).length > 0">
        <div class="section-title">Query参数</div>
        <pre class="code-block">{{ formatJson(request.queryParams) }}</pre>
      </div>
      
      <div class="section" v-if="request.body">
        <div class="section-title">请求体</div>
        <pre class="code-block">{{ formatBody(request.body) }}</pre>
      </div>
      
      <div class="section">
        <div class="section-title">响应头</div>
        <pre class="code-block" v-if="hasHeaders(request.response?.headers)">
{{ formatJson(request.response.headers) }}</pre>
        <p class="empty-text" v-else>无</p>
      </div>
      
      <div class="section">
        <div class="section-title">响应体</div>
        <pre class="code-block" v-if="request.response?.body">
{{ formatBody(request.response.body) }}</pre>
        <p class="empty-text" v-else>无</p>
      </div>
    </div>
  </div>
  <div class="request-detail empty" v-else>
    <p>选择一个请求查看详情</p>
  </div>
</template>

<script setup>
defineProps({
  request: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);

function hasHeaders(headers) {
  return headers && Object.keys(headers).length > 0;
}

function formatJson(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return obj;
  }
}

function formatBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
  return JSON.stringify(body, null, 2);
}

function getStatusClass(status) {
  if (!status) return '';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 400 && status < 500) return 'client-error';
  if (status >= 500) return 'server-error';
  return '';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}
</script>

<style scoped>
.request-detail {
  background: #2d2d44;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.request-detail.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #888;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3d3d5c;
}

.detail-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #00d9ff;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 11px;
  color: #888;
}

.info-item span {
  font-size: 13px;
  color: #e0e0e0;
}

.method {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  display: inline-block;
  width: fit-content;
}

.method.get { background: #61affe; color: #fff; }
.method.post { background: #49cc90; color: #fff; }
.method.put { background: #fca130; color: #fff; }
.method.delete { background: #f93e3e; color: #fff; }
.method.patch { background: #50e3c2; color: #fff; }

.status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status.success { background: #49cc90; color: #fff; }
.status.client-error { background: #fca130; color: #fff; }
.status.server-error { background: #f93e3e; color: #fff; }

.url-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a2e;
  padding: 8px 12px;
  border-radius: 6px;
}

.url-text {
  flex: 1;
  font-size: 12px;
  word-break: break-all;
}

.copy-btn {
  background: #3d3d5c;
  border: none;
  color: #00d9ff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.copy-btn:hover {
  background: #4d4d6c;
}

.page-url {
  font-size: 12px;
  color: #888;
  word-break: break-all;
}

.code-block {
  background: #1a1a2e;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #e0e0e0;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-text {
  color: #666;
  font-size: 13px;
  margin: 0;
}
</style>
