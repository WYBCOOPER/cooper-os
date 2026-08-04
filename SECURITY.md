# 项目安全防御标准（COOPER OS 开发规范）

> 2026-08-03 建立。宝宝要求：版本更新必须过安全审核。
> 依据：OWASP Top 10 + 企业 AI 代码安全实践（联网研究）+ 本项目扫描结果。

## 🚨 核心原则

> **"安全检查应成为流程关口，而非上线前临时补课。"**
> **"功能可用 ≠ 可进入生产环境。"**

## 一、提交（Commit）前安全审查清单

每次 git commit / 发布版本前，必须逐项检查：

- [ ] **敏感信息扫描**：跑 `node _dev-scripts/security_test_v2.js`（自动扫描真实密钥特征）
- [ ] **密钥不入库**：密钥只存 `openclaw.json` / `.env`（已 gitignore），绝不进代码
- [ ] **日志脱敏**：不打印 key/token 明文（server.js 已确认干净）
- [ ] **依赖漏洞**：有 node_modules 跑 `npm audit`（electron-builder 项目关注高危）
- [ ] **正/负路径测试**：正常功能 ✅ + 恶意输入（超长/特殊字符）不崩溃
- [ ] **JS 语法**：`node --check` 通过（防"禁用弹窗误伤函数名"类事故复发）
- [ ] **回归测试**：跑 `regression_test.js`，历史 bug 不复发
- [ ] **功能自检**：跑 `node _dev-scripts/full_selfcheck2.js`（34 项：抽屉/按钮/函数/浮层/水印/毛玻璃/分桶/JS）

### 安全检测全过程（2026-08-04 宝宝要求，写入 SECURITY.md）

> 宝宝原话（2026-08-04 13:23）："打包收尾提交，安全检测做了吗。如果没有，我觉得需要再制定一下有关的全过程"

**提交/发布前必跑（两套脚本）：**
1. `node _dev-scripts/full_selfcheck2.js` — 功能自检（34 项）
2. `node _dev-scripts/security_test_v2.js` — 安全检测（14 项）

**security_test_v2.js 检测项（14 项）：**
- 无真实密钥泄漏（智谱 key / sk- 长密钥 / api_key / token）
- 敏感文件被 gitignore 覆盖（.server-auth.json / cooper-os-data.json）
- JS 语法（server.js / main.js / sw.js / index.html 内嵌）
- 无未转义 innerHTML
- server.js 用 execFile（非 exec，防 shell 注入）
- 未登录访问 → 登录页
- 路径穿越被拒
- 原型污染 key 被拒
- 超长 key 被拒
- 图片静态服务 200

**历史结果：**
- 2026-08-04 v10.3.1 发布前：14/14 通过 ✅

## 二、项目防御（防信息泄露）

### 2.1 禁止事项
- ❌ 前端代码硬编码 API key（智谱 key 只在 openclaw.json）
- ❌ 日志打印 token / secret 明文
- ❌ `eval()` / `Function()` 执行动态字符串
- ❌ `innerHTML` 直接插入未经转义的用户输入
- ❌ 文件读写不校验路径（防目录穿越 `../../`）

### 2.2 必做事项
- ✅ 用户输入过滤/转义（escapeHtml）
- ✅ 服务端读写文件前校验路径
- ✅ 对外服务必须有认证（3001 访问口令 = 待办 #1）
- ✅ 局域网/公网服务：安全响应头（CSP / X-Frame-Options / nosniff）

### 2.3 当前项目状态（2026-08-03 扫描）
- ✅ server.js / main.js / sw.js / package.json：无敏感信息
- ✅ .npmrc：仅国内镜像配置，无密钥
- ⚠️ 待办：3001 端口 0.0.0.0 无认证（同 WiFi 可访问）→ 加访问口令
- ⚠️ 待办：正式"使坏测试"脚本（恶意输入）

## 三、发布（Release）安全关口

发布流程 = 功能完成 → **安全审核** → 版本更新 → 打包：

1. **功能测试**：宝宝体验验收 ✅
2. **安全扫描**：security_scan.js 无风险 ✅
3. **回归测试**：regression_test.js 全过 ✅
4. **版本更新**：package.json + CHANGELOG + 界面版本显示
5. **打包**：electron-builder（需宝宝同意）
6. **留痕**：git commit + 日记记录

## 四、AI 生成代码特别规范（针对老师/Reasonix）

- **规则入文件**：修改逻辑必须写进 AGENTS.md / CHANGELOG，不能只留在对话里
- **改动留痕**：每次改动说明"读了哪些规则、改了什么、验证了什么"
- **独立验证**：代码和测试不能同一认知（老师写代码后，用独立脚本验证）
- **边界确认**：任务边界不清时停下问宝宝，不自行扩大改动范围
- **权限最小**：低风险任务只读，涉及发布必须单独批准

## 五、参考来源
- 财经杂志《AI 生成代码，企业要避开四个坑》（安全权责、流程关口）
- OWASP Top 10（注入/XSS/访问控制/配置错误）
- 前端安全总览（cnblogs.com/yuzhihui/p/17230589.html）
