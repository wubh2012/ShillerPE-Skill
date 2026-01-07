# Shiller PE Data Extraction Guide

## Complete Workflow

This guide provides step-by-step instructions for extracting Shiller PE data using Chrome DevTools MCP.

## Prerequisites

1. **Chrome DevTools MCP Server**: Running and accessible
2. **Network Access**: Ability to reach `gurufocus.com`
3. **Write Permissions**: Ability to create files in current directory

## Step-by-Step Process

### Step 1: Initialize Browser Session

```bash
# Start a new browser page
mcp__chrome-devtools__new_page(url="https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235")
```

**Expected Result**: Browser opens to the Shiller PE module page

**Troubleshooting**:
- If page fails to load, check network connectivity
- If URL is invalid, verify the current GuruFocus URL structure
- If MCP server isn't responding, restart the server

### Step 2: Wait for Page Load

```bash
# Wait for chart to render (5-10 seconds)
mcp__chrome-devtools__wait_for(text="Shiller PE", timeout=10000)
```

**Alternative**: Wait for specific chart elements
```bash
mcp__chrome-devtools__wait_for(text="PE Ratio", timeout=15000)
```

**What to Expect**:
- Chart should be visible
- Data points should be plotted
- Legend or labels should appear

### Step 3: Extract Data (Latest Point Only)

#### Method A: Highcharts API (Recommended)

```javascript
// Use this code with evaluate_script - extracts ONLY the latest data point
const extractionCode = `() => {
  if (window.Highcharts && window.Highcharts.charts && window.Highcharts.charts[0]) {
    const chart = window.Highcharts.charts[0];
    if (chart.series && chart.series[0] && chart.series[0].data.length > 0) {
      // Get the latest data point only
      const latestPoint = chart.series[0].data[chart.series[0].data.length - 1];
      return {
        pe: latestPoint.y,
        crawl_date: new Date(latestPoint.x).toISOString().split('T')[0]
      };
    }
  }
  return null;
}`;

// Execute via MCP
mcp__chrome-devtools__evaluate_script(function=extractionCode)
```

#### Method B: DOM Scraping (Fallback)

```javascript
const extractionCode = `() => {
  // Try various selectors to find data elements
  const selectors = ['table tr', '[data-pe]', '.pe-value', '.shiller-data'];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Get the last element (latest data)
      const lastEl = elements[elements.length - 1];
      const peElement = lastEl.querySelector('[data-pe]') || lastEl;
      const pe = parseFloat(peElement.textContent);

      // Find date
      let dateStr = '';
      const row = lastEl.closest('tr');
      if (row) {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) dateStr = dateCell.textContent.trim();
      }

      if (!isNaN(pe) && pe > 0) {
        const date = dateStr ? new Date(dateStr) : new Date();
        if (!isNaN(date.getTime())) {
          return {
            pe: pe,
            crawl_date: date.toISOString().split('T')[0]
          };
        }
      }
    }
  }
  return null;
}`;

mcp__chrome-devtools__evaluate_script(function=extractionCode)
```

#### Method C: Text Pattern Matching (Last Resort)

```javascript
const extractionCode = `() => {
  const text = document.body.textContent;
  const regex = /(\\d{4}-\\d{2}-\\d{2}|\\w{3,9}\\s+\\d{4})\\s+(\\d+\\.\\d+|\\d+)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const date = new Date(match[1]);
    const pe = parseFloat(match[2]);

    if (!isNaN(pe) && pe > 0 && !isNaN(date.getTime())) {
      matches.push({
        pe: pe,
        crawl_date: date.toISOString().split('T')[0]
      });
    }
  }

  // Return the latest (last) match
  return matches.length > 0 ? matches[matches.length - 1] : null;
}`;

mcp__chrome-devtools__evaluate_script(function=extractionCode)
```

### Step 4: Validate Extracted Data

**Check the returned data structure**:
```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

**Validation Checklist**:
- [ ] Object is not null
- [ ] Has `pe` field
- [ ] Has `crawl_date` field
- [ ] `crawl_date` is in `yyyy-MM-dd` format
- [ ] `pe` is a positive number

### Step 5: Save to File

```bash
# Create shillerpe.json with the extracted data
# Use the Write tool with:
# File path: ./shillerpe.json
# Content: [paste the JSON object from step 3]
```

**Example**:
```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

### Step 6: Push Data to API

After saving the file, push the data to your local API endpoint:

```bash
# Push data to API
curl -X POST http://localhost:5000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'
```

**Expected Response**: HTTP 200 or success message from the API

### Step 7: Verify File Creation

```bash
# Check if file exists
dir shillerpe.json

# View file contents
type shillerpe.json
```

## Complete MCP Command Sequence

Here's the complete sequence of MCP commands to execute:

```bash
# 1. Navigate to page
mcp__chrome-devtools__new_page(url="https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235")

# 2. Wait for load
mcp__chrome-devtools__wait_for(text="Shiller PE", timeout=10000)

# 3. Extract data (using the Highcharts method)
mcp__chrome-devtools__evaluate_script(function="() => { /* extraction code */ }")

# 4. Save result as shillerpe.json
# (Use Write tool with the JSON output)

# 5. Push to API
curl -X POST http://localhost:5000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'

# 6. Close browser (optional)
mcp__chrome-devtools__close_page(pageIdx=0)
```

## Troubleshooting Common Issues

### Issue: Page loads but no chart appears
**Solution**:
```bash
# Wait longer
mcp__chrome-devtools__wait_for(text="Loading", timeout=5000)
mcp__chrome-devtools__wait_for(text="Shiller PE", timeout=15000)

# Or refresh the page
mcp__chrome-devtools__navigate_page(type="reload")
```

### Issue: Highcharts object not found
**Solution**: Try alternative extraction methods
- Use DOM scraping method
- Check if page uses different chart library
- Look for data in other global objects

### Issue: Data extraction returns null
**Solution**:
```javascript
// Debug: Check what's available
const debugCode = `() => {
  console.log('Highcharts available:', !!window.Highcharts);
  console.log('Chart count:', window.Highcharts?.charts?.length);
  console.log('DOM elements:', document.querySelectorAll('[data-pe], table tr').length);
  return {
    hasHighcharts: !!window.Highcharts,
    chartCount: window.Highcharts?.charts?.length || 0,
    elementCount: document.querySelectorAll('[data-pe], table tr').length
  };
}`;
```

### Issue: Invalid date format in output
**Solution**: Ensure date is parsed correctly
```javascript
// In extraction code
const date = new Date(latestPoint.x);
if (!isNaN(date.getTime())) {
  return {
    pe: latestPoint.y,
    crawl_date: date.toISOString().split('T')[0]
  };
}
```

## Performance Optimization

### Reduce Wait Time
```bash
# Use specific element wait instead of generic
mcp__chrome-devtools__wait_for(text="Shiller PE", timeout=8000)
```

### Quick Extraction
Since we only need the latest data point:
```javascript
// Minimal extraction code
const extractionCode = `() => {
  const chart = window.Highcharts?.charts?.[0];
  const point = chart?.series?.[0]?.data?.slice(-1)[0];
  return point ? {
    pe: point.y,
    crawl_date: new Date(point.x).toISOString().split('T')[0]
  } : null;
}`;
```

## Security Considerations

### Rate Limiting
- Wait between requests
- Cache extracted data
- Don't refresh unnecessarily

### Data Privacy
- Respect website terms of service
- Don't redistribute without permission
- Use for personal analysis only

### Error Handling
Always include null checks:
```javascript
const safeExtraction = `() => {
  try {
    const chart = window.Highcharts?.charts?.[0];
    if (!chart) return null;

    const point = chart.series?.[0]?.data?.slice(-1)[0];
    if (!point) return null;

    return {
      pe: point.y,
      crawl_date: new Date(point.x).toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Extraction failed:', error);
    return null;
  }
}`;
```

## Automation Script

For repeated use, create a complete automation:

```bash
#!/bin/bash
# Automated Shiller PE extraction (latest only)

URL="https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235"
OUTPUT="shillerpe.json"

echo "Starting extraction..."

# Execute MCP commands here
# 1. new_page(url=URL)
# 2. wait_for(text="Shiller PE", timeout=10000)
# 3. evaluate_script(function="extraction code")
# 4. Write to $OUTPUT

echo "Saved to $OUTPUT"
```

This guide provides everything needed to successfully extract the latest Shiller PE data using Chrome DevTools MCP.