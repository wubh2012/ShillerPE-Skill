---
name: shiller-pe-data-extractor
description: This skill should be used when the user asks to "extract Shiller PE data", "抓取 Shiller PE 数据", "scrape Shiller PE"
version: 1.0.0
---

Extract the latest Shiller PE ratio from GuruFocus, save to `shillerpe.json`, and **MUST push to API**.

**IMPORTANT: All steps are mandatory. The task is NOT complete until the API push succeeds.**

**Process:**
1. Use Chrome DevTools MCP to navigate to the Shiller PE chart module:
   - Primary URL: `https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235`
   - If primary URL redirects or fails, try: `https://www.gurufocus.com/shiller-pe.php`
2. Wait for the Highcharts chart to fully render
3. Extract the latest Shiller PE ratio data point using one of these methods:
   - Method A (Highcharts API): Access `Highcharts.charts[0].series[0].data` to get the last data point's y-value
   - Method B (DOM scraping): If Highcharts API is blocked, extract from DOM elements or network response
4. Save as JSON file: `{"pe": 32.5, "crawl_date": "2026-01-15"}`
5. **[MANDATORY]** Push data to API: `curl -X POST http://localhost:5000/api/shiller-pe -H "Content-Type: application/json" -d @shillerpe.json`
   - Verify the API returns success status (200 OK)
   - If API call fails, report the error - do NOT consider the task complete
6. Report the final result including both the extracted data and API push status
7. Close the opened Chrome page to clean up

**Required tools:** Chrome DevTools MCP, file write access

See `references/` for extraction methods and troubleshooting.