# PointKing

Language: [中文](#中文) | [English](#english)

## 中文

PointKing 是一个面向设计稿、图片和 PDF 的本地批注工作台。它运行在浏览器中，支持多文档管理、画布缩放、矩形批注、图片粘贴和局域网手机调试。

### 功能

- 导入 PDF、PNG、JPG 文件进行批注
- 支持多个文档，左侧文件列表可切换、重命名和删除
- 支持新建空白画布，并在启动页添加文件或粘贴图片
- 支持 `Ctrl+V` 将剪贴板图片追加到当前文档末尾
- 支持矩形批注、意见输入、参考图片粘贴和右侧批注列表
- 支持画布缩放、底部缩放滑块和批注详细引线显示
- 支持中英文界面切换
- 支持局域网访问，方便手机端调试

### 快速启动

```bash
node server.mjs
```

默认地址：

```text
http://127.0.0.1:8081
```

局域网调试时，使用当前电脑的局域网 IP 访问：

```text
http://你的局域网IP:8081
```

例如：

```text
http://192.168.2.228:8081
```

也可以通过环境变量修改端口和监听地址：

```bash
PORT=8082 HOST=0.0.0.0 node server.mjs
```

Windows PowerShell：

```powershell
$env:PORT=8082
$env:HOST="0.0.0.0"
node server.mjs
```

### 常用操作

- `T`：切换到批注工具
- `V`：切换到移动工具
- `Z`：切换到放大镜工具
- `Space`：临时抓手移动画布
- `Ctrl+V`：在画板外粘贴图片到当前文档
- `+` / `-`：调整放大镜倍率
- `1` / `2` / `3` / `4`：快速切换放大镜倍率
- 双击画布：添加点批注
- 拖拽画布区域：添加矩形批注

### 目录结构

```text
.
├── index.html
├── script.js
├── styles.css
├── server.mjs
└── vendor/
```

### 开发说明

项目当前不依赖构建步骤，修改 `index.html`、`script.js` 或 `styles.css` 后刷新浏览器即可。`server.mjs` 会为静态资源添加 `Cache-Control: no-store`，便于本地和局域网调试。

## English

PointKing is a local review workspace for images and PDFs. It runs in the browser and supports multi-document review, canvas zooming, rectangle annotations, clipboard image paste, and LAN mobile debugging.

### Features

- Import PDF, PNG, and JPG files for review
- Manage multiple documents from the left file list
- Rename, switch, and delete documents
- Create a blank board and add files from the startup view
- Paste clipboard images with `Ctrl+V` and append them to the current document
- Create rectangle annotations with notes and reference images
- Review annotations from the right-side comments panel
- Zoom the canvas with the bottom slider
- Show detailed annotation callouts for export-friendly review images
- Switch the interface between Chinese and English
- Access the app from other devices on the same LAN

### Quick Start

```bash
node server.mjs
```

Default local URL:

```text
http://127.0.0.1:8081
```

For LAN debugging, open the app with your computer's LAN IP:

```text
http://your-lan-ip:8081
```

Example:

```text
http://192.168.2.228:8081
```

You can also change the port and host with environment variables:

```bash
PORT=8082 HOST=0.0.0.0 node server.mjs
```

Windows PowerShell:

```powershell
$env:PORT=8082
$env:HOST="0.0.0.0"
node server.mjs
```

### Shortcuts

- `T`: annotation tool
- `V`: move tool
- `Z`: magnifier tool
- `Space`: temporary hand-pan mode
- `Ctrl+V`: paste a clipboard image into the current document
- `+` / `-`: adjust magnifier scale
- `1` / `2` / `3` / `4`: switch magnifier scale quickly
- Double-click the canvas: add a point annotation
- Drag on the canvas: create a rectangle annotation

### Project Structure

```text
.
├── index.html
├── script.js
├── styles.css
├── server.mjs
└── vendor/
```

### Development

There is no build step at the moment. Edit `index.html`, `script.js`, or `styles.css`, then refresh the browser. `server.mjs` serves static files with `Cache-Control: no-store`, which makes local and LAN debugging easier.
