# API Recorder - 浏览器操作录制工具

一款Chrome浏览器扩展，用于录制用户在浏览器中的操作，自动捕获相关的HTTP/HTTPS请求，并提供接口文档导出和JMeter脚本生成功能。

## 功能特性

- **录制功能**: 捕获页面上的XHR和Fetch请求
- **用户操作录制**: 记录点击、输入等操作及其对应的选择器
- **接口详情展示**: 查看请求/响应的完整信息（URL、方法、头信息、请求体、响应体等）
- **导出为API文档**: 生成Markdown格式的API接口文档
- **导出为JMX脚本**: 生成可被JMeter直接使用的测试脚本
- **实时进度显示**: 录制状态、请求数量、导出进度实时更新

## 项目结构

```
/workspace/
├── api-recorder-extension/    # Chrome扩展
│   ├── manifest.json
│   ├── background.js           # 后台服务脚本
│   ├── content.js              # 内容脚本（请求拦截）
│   ├── popup/                  # 弹出面板
│   └── icons/                 # 图标
│
├── api-recorder-server/        # Node.js后端服务
│   ├── server.js               # 服务入口
│   └── src/
│       ├── routes/             # API路由
│       ├── services/           # 业务逻辑
│       └── models/             # 数据模型
│
└── api-recorder-ui/            # Vue.js前端界面
    ├── src/
    │   ├── components/         # Vue组件
    │   ├── stores/            # Pinia状态管理
    │   └── api/               # API调用
    └── dist/                  # 构建输出
```

## 快速开始

### 1. 启动后端服务

```bash
cd api-recorder-server
npm install
npm start
```

服务将在 http://localhost:3001 启动。

### 2. 安装Chrome扩展

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `api-recorder-extension` 目录

### 3. 使用工具

1. 点击Chrome工具栏中的扩展图标
2. 点击"开始录制"按钮
3. 在目标网站上执行操作
4. 所有捕获的请求将显示在管理界面中
5. 点击"停止录制"结束录制
6. 选择导出格式（Markdown/JSON/JMX）

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/sessions | 创建新会话 |
| GET | /api/sessions | 获取所有会话 |
| GET | /api/sessions/:id | 获取会话详情 |
| PUT | /api/sessions/:id | 更新会话 |
| DELETE | /api/sessions/:id | 删除会话 |
| GET | /api/sessions/:id/export/markdown | 导出为Markdown |
| GET | /api/sessions/:id/export/json | 导出为JSON |
| GET | /api/sessions/:id/export/jmx | 导出为JMX |

## 技术栈

- **Chrome扩展**: Manifest V3, Content Script, Background Service Worker
- **后端服务**: Node.js, Express, CORS
- **前端界面**: Vue.js 3, Vite, Pinia, Axios

## 预览地址

http://localhost:3001

## 注意事项

1. Chrome扩展需要授予"访问所有网站"的权限才能拦截请求
2. 录制会话保存在内存中，刷新页面后会丢失
3. 导出JMX脚本需要JMeter 5.0或更高版本打开
