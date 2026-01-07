---
name: Shiller PE Data Extractor
description: This skill should be used when the user asks to "extract Shiller PE data", "抓取 Shiller PE 数据", "get CAPE ratio from GuruFocus", "scrape Shiller PE", "save Shiller PE to JSON", or "update Shiller PE data"
version: 1.0.0
---

Extract the latest Shiller PE ratio from GuruFocus and save to `shillerpe.json`.

**Process:**
1. Use Chrome DevTools MCP to open GuruFocus Shiller PE module
2. Wait for chart to render
3. Extract latest data point via Highcharts API or DOM scraping
4. Save as JSON: `{"pe": 32.5, "crawl_date": "2026-01-07"}`
5. Optionally POST to local API

**Required tools:** Chrome DevTools MCP, file write access

See `references/` for extraction methods and troubleshooting.