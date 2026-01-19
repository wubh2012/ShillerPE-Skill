---
name: shiller-pe-data-extractor
description: This skill should be used when the user asks to "extract Shiller PE data", "抓取 Shiller PE 数据", "scrape Shiller PE"
version: 2.0.0
---

Extract the latest Shiller PE ratio from GuruFocus, save to `shillerpe.json`, and **MUST push to API**.

**IMPORTANT: All steps are mandatory. The task is NOT complete until the API push succeeds.**

## 📊 Progress Tracking

**Progress Bar:** `[░░░░░░░░░░] 0%` → `[██████████] 100%`

**Steps:**
1. 🌐 Navigate to GuruFocus Shiller PE page
2. ⏳ Wait for Highcharts chart to render
3. 📡 Extract latest PE ratio data
4. 💾 Save data to `shillerpe.json`
5. 🚀 Push data to API endpoint
6. ✅ Verify API response
7. 🧹 Close Chrome page

## 🔄 Process

### Step 1: Navigate to Source
Use Chrome DevTools MCP to navigate to the Shiller PE chart module:
- **Primary URL:** `https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235`
- **Fallback URL:** `https://www.gurufocus.com/shiller-pe.php`

### Step 2: Wait for Chart
Wait for the Highcharts chart to fully render (recommended: 10-15 seconds)

### Step 3: Extract Data
Extract the latest Shiller PE ratio data point using one of these methods:

**Method A (Highcharts API - Recommended):**
```javascript
Highcharts.charts[0].series[0].data[data.length - 1].y
```

**Method B (DOM Scraping - Fallback):**
```javascript
// Extract from DOM elements or network response
```

### Step 4: Save JSON
Save as JSON file: `{"pe": 32.5, "crawl_date": "2026-01-15"}`

### Step 5: Push to API
**[MANDATORY]** Push data to API:
```bash
curl -X POST http://localhost:5000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d @shillerpe.json
```

**Verification Requirements:**
- ✅ API returns HTTP 200 OK
- ✅ Response contains `success: true`
- ✅ Response includes the saved data

### Step 6: Report Results
Report the final result including:
- Extracted PE ratio value
- Crawl date
- API push status (success/failure)
- API response details

### Step 7: Cleanup
Close the opened Chrome page to free resources

## 📋 Required Tools
- Chrome DevTools MCP
- File write access
- curl (for API push)

## 📚 References
See `references/` for extraction methods and troubleshooting.

## 🎯 Success Criteria
- ✅ PE ratio extracted (positive number)
- ✅ JSON file saved correctly
- ✅ API push returns 200 OK
- ✅ Chrome page closed
- ✅ Final report generated

## 🚨 Error Handling
- **Page won't load:** Try fallback URL
- **Chart not visible:** Increase wait time
- **Highcharts blocked:** Use DOM scraping method
- **API fails:** Report error, do NOT consider complete
- **Invalid data:** Validate before saving

## 📤 Final Feedback Format

**Success Example:**
```
✅ Shiller PE Data Extraction Complete

📊 Extracted Data:
- PE Ratio: 40.3
- Crawl Date: 2026-01-17
- Source: GuruFocus

💾 File Saved:
- shillerpe.json: {"pe": 40.3, "crawl_date": "2026-01-17"}

🚀 API Push Status:
- Endpoint: http://localhost:5000/api/shiller-pe
- Status: ✅ SUCCESS (200 OK)
- Response ID: 1756

🧹 Cleanup:
- Chrome page closed successfully

📈 Progress: [██████████] 100% Complete
```

**Failure Example:**
```
❌ Shiller PE Data Extraction Failed

⚠️ Error: [Specific error description]
📍 Failed at: [Step name]
💡 Solution: [Recommended fix]

📊 Partial Results:
- PE Ratio: [Value if extracted]
- API Status: [Failed/Not attempted]

🔄 Next Steps:
1. [Action item 1]
2. [Action item 2]

📈 Progress: [██░░░░░░░░] 20% Complete
```

## 📊 Progress Bar Implementation

**During Execution:**
```
[░░░░░░░░░░] 0% - Starting extraction...
[██░░░░░░░░] 20% - Navigating to GuruFocus...
[████░░░░░░] 40% - Waiting for chart to render...
[██████░░░░] 60% - Extracting PE ratio...
[████████░░] 80% - Saving to shillerpe.json...
[██████████] 100% - Complete!
```

**Progress States:**
- 0%: Starting
- 20%: Navigation complete
- 40%: Chart loaded
- 60%: Data extracted
- 80%: File saved
- 100%: API push successful