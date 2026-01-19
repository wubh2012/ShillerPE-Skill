# 进度条与反馈实现指南

## 📊 进度条实现示例

### 使用 TodoWrite 工具跟踪进度

```javascript
// 在 skill 执行过程中使用 TodoWrite
// 每个步骤对应一个 todo 项，状态为 in_progress 时显示进度

// 示例执行流程：
1. TodoWrite: "Navigating to GuruFocus Shiller PE page" [in_progress]
   → Progress: [██░░░░░░░░] 20%

2. TodoWrite: "Waiting for Highcharts chart to render" [in_progress]
   → Progress: [████░░░░░░] 40%

3. TodoWrite: "Extracting Shiller PE ratio data" [in_progress]
   → Progress: [██████░░░░] 60%

4. TodoWrite: "Saving data to shillerpe.json" [in_progress]
   → Progress: [████████░░] 80%

5. TodoWrite: "Pushing data to API" [in_progress]
   → Progress: [██████████] 100%
```

## 🎯 完整执行示例

### 成功执行流程

```bash
# Step 1: Navigate [20%]
🌐 Navigating to GuruFocus Shiller PE page...
✅ Page loaded successfully

# Step 2: Wait [40%]
⏳ Waiting for Highcharts chart to render...
✅ Chart rendered (Highcharts detected)

# Step 3: Extract [60%]
📡 Extracting Shiller PE ratio data...
✅ PE Ratio extracted: 40.3

# Step 4: Save [80%]
💾 Saving data to shillerpe.json...
✅ File saved: {"pe": 40.3, "crawl_date": "2026-01-17"}

# Step 5: Push [90%]
🚀 Pushing data to API...
✅ API response: {"success": true, "data": {"id": 1756, ...}}

# Step 6: Verify [95%]
✅ API verification: 200 OK

# Step 7: Cleanup [100%]
🧹 Closing Chrome page...
✅ Cleanup complete

📈 Progress: [██████████] 100% Complete
```

## 📤 最终反馈模板

### 成功反馈格式

```markdown
✅ **Shiller PE Data Extraction Complete**

📊 **Extracted Data:**
- PE Ratio: 40.3
- Crawl Date: 2026-01-17
- Source: GuruFocus

💾 **File Saved:**
- Path: shillerpe.json
- Content: {"pe": 40.3, "crawl_date": "2026-01-17"}

🚀 **API Push Status:**
- Endpoint: http://localhost:5000/api/shiller-pe
- Status: ✅ SUCCESS (200 OK)
- Response ID: 1756
- Message: 创建成功

🧹 **Cleanup:**
- Chrome page closed successfully

📈 **Progress:** [██████████] 100% Complete
```

### 失败反馈格式

```markdown
❌ **Shiller PE Data Extraction Failed**

⚠️ **Error:** Connection timeout to GuruFocus
📍 **Failed at:** Step 1 - Navigating to page
💡 **Solution:** Check network connection or try fallback URL

📊 **Partial Results:**
- PE Ratio: Not extracted
- API Status: Not attempted

🔄 **Next Steps:**
1. Verify internet connection
2. Try alternative URL: https://www.gurufocus.com/shiller-pe.php
3. Check if GuruFocus is accessible

📈 **Progress:** [██░░░░░░░░] 20% Complete
```

## 📈 进度条状态映射

| 步骤 | 进度 | 状态 | 进度条 |
|------|------|------|--------|
| 开始 | 0% | Starting | `[░░░░░░░░░░]` |
| 导航完成 | 20% | Navigation | `[██░░░░░░░░]` |
| 图表加载 | 40% | Chart Render | `[████░░░░░░]` |
| 数据提取 | 60% | Extraction | `[██████░░░░]` |
| 文件保存 | 80% | File Save | `[████████░░]` |
| API推送 | 90% | API Push | `[█████████░]` |
| 完成 | 100% | Complete | `[██████████]` |

## 🎨 视觉反馈元素

### Emoji 指南
- 🌐 Navigation
- ⏳ Waiting/Loading
- 📡 Data Extraction
- 💾 File Operations
- 🚀 API Operations
- ✅ Success
- ❌ Failure
- 🧹 Cleanup
- 📊 Progress
- ⚠️ Warning
- 💡 Tip

### 颜色编码（Markdown）
- ✅ Green: Success
- ❌ Red: Failure
- ⚠️ Yellow: Warning
- 📊 Blue: Progress
- 🚀 Purple: API

## 🔍 验证检查点

### 每个步骤的验证
```javascript
// Step 1: Navigation
- URL loads successfully
- No network errors
- Page title contains "Shiller PE"

// Step 2: Chart Render
- Highcharts object exists
- Chart series data available
- Data points > 0

// Step 3: Extraction
- PE value is number
- PE value > 0 and < 100
- Date format is YYYY-MM-DD

// Step 4: File Save
- JSON is valid
- File exists
- Content matches expected format

// Step 5: API Push
- HTTP 200 OK
- Response contains success: true
- Response includes saved data

// Step 6: Cleanup
- Chrome page closed
- No memory leaks
```

## 📋 执行检查清单

- [ ] 1. Navigate to GuruFocus
- [ ] 2. Wait for Highcharts chart
- [ ] 3. Extract PE ratio (40.3)
- [ ] 4. Save to shillerpe.json
- [ ] 5. Push to API (200 OK)
- [ ] 6. Verify API response
- [ ] 7. Close Chrome page
- [ ] 8. Generate final report

## 🔄 错误恢复流程

### 如果第一步失败
```
尝试: https://www.gurufocus.com/shiller-pe.php
如果仍然失败: 报告网络问题
```

### 如果第二步失败
```
增加等待时间: 15000ms
检查浏览器控制台
```

### 如果第三步失败
```
切换到 DOM scraping 方法
检查 Highcharts.charts[0] 是否存在
```

### 如果第五步失败
```
检查 API 服务器是否运行
验证 curl 命令格式
检查网络连接
```

## 📊 性能指标

### 预期执行时间
- 导航: 2-5 秒
- 等待图表: 5-10 秒
- 提取数据: <1 秒
- 保存文件: <1 秒
- API 推送: 1-3 秒
- 清理: <1 秒

**总计: 10-20 秒**

### 资源使用
- 内存: ~50MB (Chrome tab)
- 网络: ~200KB (page load)
- 磁盘: ~100 bytes (JSON file)