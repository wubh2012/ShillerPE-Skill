---
name: Shiller PE Data Extractor
description: Extract Shiller PE ratio data from GuruFocus using Chrome DevTools MCP and save to JSON file
version: 1.0.0
---

Extract Shiller PE ratio data and timestamps from GuruFocus market data and save the results to a local JSON file.

Use this skill when:
- Fetching historical Shiller PE ratio data for market analysis
- Automating data extraction from financial websites
- Saving structured financial data to JSON format
- Working with Chrome DevTools MCP for web scraping tasks

## Core Instructions

Use Chrome DevTools MCP to navigate to the GuruFocus Shiller PE module page and extract the data. The process involves:

1. **Navigate to the page**: Open the GuruFocus Shiller PE module URL
2. **Wait for data load**: Ensure the chart and data are fully rendered
3. **Extract data**: Parse the Shiller PE values and corresponding timestamps
4. **Save to file**: Write the extracted data to `shillerpe.json`

## Data Structure

The extracted JSON file will contain a single object with the latest data point:

```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

## API Integration

After data extraction, the skill automatically pushes the data to the local API endpoint:

```bash
curl -X POST http://localhost:5000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'
```

## Required Tools

- **Chrome DevTools MCP**: For browser automation and data extraction
- **File System Access**: For saving the JSON file locally

## Workflow Steps

1. **Launch Chrome DevTools**: Start a browser session using the MCP server
2. **Navigate to URL**: Open `https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235`
3. **Wait for rendering**: Allow time for the chart to load and render data
4. **Extract data points**: Use JavaScript evaluation to read the chart data
5. **Parse and format**: Convert the raw data into the structured JSON format
6. **Save file**: Write the result to `shillerpe.json` in the current directory

## Data Extraction Methods

### Method 1: Chart Data API (Recommended)
Use the browser's DevTools to access the chart's underlying data structure:

```javascript
// Execute in browser context to extract chart data
() => {
  // Look for chart data in window objects or chart instances
  if (window.Highcharts && window.Highcharts.charts) {
    const chart = window.Highcharts.charts[0];
    if (chart && chart.series && chart.series[0] && chart.series[0].data.length > 0) {
      // Get the latest data point only
      const latestPoint = chart.series[0].data[chart.series[0].data.length - 1];
      return {
        pe: latestPoint.y,
        crawl_date: new Date(latestPoint.x).toISOString().split('T')[0]
      };
    }
  }
  return null;
}
```

### Method 2: DOM Scraping (Alternative)
If chart API is not accessible, extract from table or data attributes:

```javascript
// Extract from data attributes or table elements
() => {
  // Look for data in various possible locations
  const elements = document.querySelectorAll('[data-pe], .pe-value, .shiller-data');
  if (elements.length > 0) {
    // Get the last element (latest data)
    const lastEl = elements[elements.length - 1];
    const pe = lastEl.getAttribute('data-pe') || lastEl.textContent;
    const date = lastEl.getAttribute('data-date') || lastEl.closest('[data-timestamp]')?.getAttribute('data-timestamp');
    if (pe && date) {
      return {
        pe: parseFloat(pe),
        crawl_date: date
      };
    }
  }
  return null;
}
```

## Error Handling

- **Page load timeout**: Wait up to 30 seconds for page to load
- **Data not found**: Check if chart is rendered or if URL structure changed
- **JSON parse errors**: Validate extracted data before saving
- **File write errors**: Ensure write permissions in current directory

## Validation

After extraction, verify:
- Data object is not null
- Object has `pe` and `crawl_date` fields
- `pe` value is numeric
- `crawl_date` is in `yyyy-MM-dd` format (ISO 8601 date)

## Example Output

```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

## API Call Workflow

After successful extraction and validation, the skill performs these steps:

1. **Save to file**: Write the extracted data to `shillerpe.json`
2. **API call**: Execute the curl command to push data to local API
3. **Verify response**: Check that the API accepted the data

```bash
# Complete workflow example
curl -X POST http://localhost:5000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'
```

## Troubleshooting

If data extraction fails:
1. Verify the URL is accessible and hasn't changed
2. Check if the page requires authentication or has anti-scraping measures
3. Try alternative extraction methods (DOM scraping vs chart API)
4. Increase wait time for data loading
5. Check browser console for JavaScript errors
6. Verify Chrome DevTools MCP is properly connected

## Security Notes

- Respect the website's terms of service
- Use reasonable rate limits if making multiple requests
- Consider caching data to avoid unnecessary requests
- Handle any authentication requirements appropriately