# COOPER OS 目录说明

> 2026-08-03 整理。根目录只保留核心文件，开发脚本和备份归档存放。

## 📁 根目录（核心文件，勿乱动）

| 文件 | 用途 |
|------|------|
| `index.html` | 主界面（星系中控台 v10.3.0）|
| `server.js` | 局域网服务器（端口 3000，含访问口令 + 自动备份）|
| `main.js` | exe 打包入口（Electron）|
| `sw.js` | PWA 离线缓存（网络优先）|
| `manifest.json` | PWA 配置 |
| `new_design.css` | 星系黑金设计样式 |
| `package.json` | 版本/依赖（当前 10.3.0）|
| `CHANGELOG.md` | 更新日志 |
| `SECURITY.md` | 安全防御标准 |
| `SYSTEM_DESIGN.md` | 系统设计文档 |
| `cooper-os-data.json` | 服务器同步数据 |
| `.server-auth.json` | 访问口令（1905）|
| `.npmrc` | 国内镜像配置 |
| `icon-192/512.png` | PWA 图标 |
| `草哥工作台.html` | 网页版副本 |

## 📁 _dev-scripts/（开发测试脚本）

- `security_test.js` — 正/负路径安全测试（发布前跑）
- `security_scan.js` — 敏感信息扫描
- `regression_test2.js` — 回归测试（历史 bug 检查）
- `make_icon.py` — 图标生成

## 📁 _archive/（归档：旧版/调试/备份）

- 旧版 HTML 备份（v9/v10.1/v10.2.6 等）
- 历史调试脚本（diag/fix/galaxy_v1-v18 等）
- `screenshots/` — 界面截图存档
- 数据备份文件（.bak）

## 📁 backups/（自动备份，server.js 生成）

- 每次保存数据前自动备份，保留最近 20 份
- 格式：`data-时间戳.json`

## 🔑 常用信息

- 访问：电脑 `http://localhost:3000` / 手机 `http://192.168.3.159:3000`
- 口令：见 .server-auth.json（老师会告诉你）
- 数据：exe 存 localStorage（3000 端口），服务器 JSON 同步
