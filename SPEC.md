# API Recorder - 浏览器操作录制工具规格文档

## 1. 项目概述

### 项目名称
**API Recorder** - 浏览器操作录制与接口信息提取工具

### 核心功能
一款Chrome浏览器扩展，用于录制用户在浏览器中的操作，自动捕获相关的HTTP/HTTPS请求，并提供接口文档导出和JMeter脚本生成功能。

### 目标用户
- 测试工程师（接口测试、压力测试）
- 后端开发人员（快速获取API信息）
- 产品经理（记录用户操作流程）

---

## 2. 技术架构

### 整体架构
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Chrome扩展    │────▶│   本地Node服务  │◀────│   Web UI界面    │
│  (录制/拦截)    │     │  (数据存储/导出)│     │  (展示/操作)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 组件说明
1. **Chrome扩展 (api-recorder-extension)**
   - manifest V3架构
   - 负责页面操作录制和网络请求拦截
   - 通过Chrome API与后端通信

2. **本地服务 (api-recorder-server)**
   - Node.js + Express
   - 提供RESTful API
   - 处理数据存储和导出逻辑

3. **前端界面 (api-recorder-ui)**
   - Vue.js 3 + Vite
   - 实时展示录制进度和接口列表
   - 提供导出功能

---

## 3. 功能详细规格

### 3.1 录制功能

#### 页面操作录制
- **点击录制**：捕获用户点击事件，记录元素选择器（CSS Selector、XPath）
- **输入录制**：记录用户在输入框中的输入内容
- **页面跳转录制**：记录页面URL变化
- **操作时间戳**：记录每个操作的时间

#### 网络请求拦截
- **请求捕获**：捕获所有XHR和Fetch请求
- **响应捕获**：自动记录响应内容
- **请求详情**：
  - URL
  - HTTP方法（GET/POST/PUT/DELETE等）
  - 请求头（Headers）
  - 请求体（Body）
  - 响应状态码
  - 响应时间
  - 响应数据

### 3.2 控制功能

#### 录制控制
- **开始录制**：启动新的录制会话，生成会话ID
- **停止录制**：结束当前录制会话
- **暂停/恢复**：临时中断和恢复录制

#### 会话管理
- 支持创建多个录制会话
- 会话列表展示
- 会话删除和重命名

### 3.3 接口详情展示

#### 列表视图
| 字段 | 说明 |
|------|------|
| 序号 | 自动编号 |
| 方法 | HTTP方法（彩色标签） |
| URL | 请求地址（可复制） |
| 状态 | 响应状态码 |
| 耗时 | 请求响应时间 |
| 操作 | 详情/删除 |

#### 详情面板
- **请求信息**
  - 完整URL
  - HTTP方法
  - 请求头（JSON格式化）
  - Query参数
  - 请求体（JSON格式化）

- **响应信息**
  - 响应状态码
  - 响应头
  - 响应体（JSON格式化，支持展开/折叠）
  - 响应时间

### 3.4 导出功能

#### 导出为API文档
- **格式**：Markdown / JSON
- **内容**：
  ```markdown
  ## API文档

  ### 1. 获取用户列表
  - **方法**: GET
  - **URL**: /api/users
  - **描述**: 获取所有用户列表
  - **请求头**:
    - Content-Type: application/json
  - **响应**:
    ```json
    { "code": 200, "data": [...] }
    ```
  ```

#### 导出为JMX脚本
- **格式**：JMeter兼容的JMX XML格式
- **内容**：
  - HTTP请求默认值
  - 线程组配置
  - 每个接口的HTTP请求采样器
  - 响应断言

### 3.5 实时进度显示

#### 录制状态栏
- 当前录制状态（录制中/已停止）
- 当前会话名称
- 已捕获请求数量
- 录制持续时间

#### 实时通知
- Toast通知显示操作结果
- 进度条显示导出进度

---

## 4. 数据模型

### 4.1 录制会话 (RecordingSession)
```typescript
interface RecordingSession {
  id: string;              // UUID
  name: string;            // 会话名称
  createdAt: Date;         // 创建时间
  updatedAt: Date;         // 更新时间
  status: 'active' | 'paused' | 'stopped';
  requestCount: number;    // 请求数量
}
```

### 4.2 网络请求 (HttpRequest)
```typescript
interface HttpRequest {
  id: string;              // UUID
  sessionId: string;       // 所属会话ID
  method: string;          // HTTP方法
  url: string;             // 请求URL
  headers: Record<string, string>;  // 请求头
  queryParams: Record<string, string>;  // 查询参数
  body: string | null;     // 请求体
  response: {
    status: number;        // 响应状态码
    headers: Record<string, string>;
    body: string;
    time: number;          // 响应时间(ms)
  };
  capturedAt: Date;       // 捕获时间
  pageUrl: string;         // 触发请求的页面URL
  userAction?: {
    type: 'click' | 'input' | 'navigate' | 'submit';
    selector?: string;
    value?: string;
  };
}
```

---

## 5. API接口设计

### 5.1 会话管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/sessions | 创建新会话 |
| GET | /api/sessions | 获取所有会话 |
| GET | /api/sessions/:id | 获取会话详情 |
| PUT | /api/sessions/:id | 更新会话 |
| DELETE | /api/sessions/:id | 删除会话 |

### 5.2 请求管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/sessions/:id/requests | 添加请求 |
| GET | /api/sessions/:id/requests | 获取会话的所有请求 |
| GET | /api/requests/:id | 获取请求详情 |
| DELETE | /api/requests/:id | 删除请求 |

### 5.3 导出功能

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/sessions/:id/export/markdown | 导出为Markdown |
| GET | /api/sessions/:id/export/json | 导出为JSON |
| GET | /api/sessions/:id/export/jmx | 导出为JMX脚本 |

---

## 6. 项目结构

```
/workspace/
├── api-recorder-extension/          # Chrome扩展
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── api-recorder-server/             # Node.js后端服务
│   ├── src/
│   │   ├── index.js                 # 服务入口
│   │   ├── routes/
│   │   │   ├── sessions.js
│   │   │   └── requests.js
│   │   ├── services/
│   │   │   ├── exportService.js     # 导出服务
│   │   │   └── storageService.js    # 存储服务
│   │   └── models/
│   │       └── schemas.js
│   ├── package.json
│   └── server.js
│
└── api-recorder-ui/                 # 前端界面
    ├── src/
    │   ├── main.js
    │   ├── App.vue
    │   ├── components/
    │   │   ├── RecordingControls.vue
    │   │   ├── RequestList.vue
    │   │   ├── RequestDetail.vue
    │   │   └── ExportPanel.vue
    │   ├── stores/
    │   │   └── recorder.js
    │   └── api/
    │       └── index.js
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 7. 验收标准

### 7.1 核心功能
- [ ] Chrome扩展能够正确安装和卸载
- [ ] 点击扩展图标可以打开录制控制面板
- [ ] 点击"开始录制"后能够捕获页面上的XHR/Fetch请求
- [ ] 点击"停止录制"能够结束录制并保存数据
- [ ] 能够在UI中查看每个请求的详情（URL、方法、请求/响应等）
- [ ] 能够将录制结果导出为Markdown格式的API文档
- [ ] 能够将录制结果导出为JMeter可用的JMX脚本

### 7.2 用户体验
- [ ] 录制状态实时显示（录制中/已停止）
- [ ] 请求数量实时更新
- [ ] 导出进度实时显示
- [ ] Toast通知操作结果

### 7.3 数据准确性
- [ ] 导出的Markdown文档格式正确
- [ ] 导出的JMX脚本可以被JMeter正确加载
- [ ] 请求详情完整显示（不丢失数据）

---

## 8. 开发计划

### Phase 1: 项目搭建
- 创建目录结构
- 初始化各模块的package.json
- 配置Vite开发服务器

### Phase 2: Chrome扩展开发
- 编写manifest.json
- 实现content script请求拦截
- 实现background消息通信
- 实现popup控制面板

### Phase 3: 后端服务开发
- 实现Express路由
- 实现数据存储
- 实现导出功能

### Phase 4: 前端UI开发
- 实现录制控制组件
- 实现请求列表组件
- 实现详情查看组件
- 实现导出面板

### Phase 5: 联调测试
- 扩展与服务联调
- 功能完整性测试
- 导出文件验证
