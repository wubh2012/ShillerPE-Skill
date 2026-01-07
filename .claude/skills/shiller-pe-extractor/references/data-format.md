# Shiller PE Data Format Reference

## JSON Structure

The extracted data is saved as a single JSON object containing the latest Shiller PE ratio value.

### New Format (Latest Data Only)

```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `pe` | number | The Shiller PE ratio value | `32.5` |
| `crawl_date` | string | ISO 8601 date string (YYYY-MM-DD) | `"2026-01-07"` |

### Data Validation Rules

1. **Crawl Date Format**: Must be valid ISO 8601 date string in `yyyy-MM-dd` format
   - Pattern: `^\d{4}-\d{2}-\d{2}$`
   - Example: `"2026-01-07"`

2. **PE Value**: Must be a positive number
   - Range: Typically 5-50 (historical range)
   - Type: Number (float or integer)
   - Example: `32.5`

## Sample Complete Data

```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

## Data Source Information

### What is Shiller PE Ratio?
- **Definition**: Price-to-Earnings ratio based on inflation-adjusted average earnings over 10 years
- **Also Known As**: CAPE (Cyclically Adjusted Price-to-Earnings) ratio
- **Developer**: Robert Shiller (Nobel Prize winner)
- **Purpose**: Measures market valuation relative to historical earnings

### Calculation
```
Shiller PE = S&P 500 Price / 10-Year Average Real Earnings
```

### Typical Values
- **Historical Average**: ~17
- **Current Range**: 25-35 (as of recent years)
- **High Valuation**: >30 (considered expensive)
- **Low Valuation**: <15 (considered cheap)

## Data Extraction Methods

### Method 1: Highcharts API (Most Reliable)
```javascript
// Access the chart instance - get latest point only
const chart = window.Highcharts.charts[0];
const latestPoint = chart.series[0].data[chart.series[0].data.length - 1];
const data = {
  pe: latestPoint.y,
  crawl_date: new Date(latestPoint.x).toISOString().split('T')[0]
};
```

### Method 2: DOM Scraping
```javascript
// Extract latest data from table rows
const rows = document.querySelectorAll('table tbody tr');
const lastRow = rows[rows.length - 1];
const cells = lastRow.querySelectorAll('td');
const date = new Date(cells[0].textContent);
const pe = parseFloat(cells[1].textContent);

const data = {
  pe: pe,
  crawl_date: date.toISOString().split('T')[0]
};
```

### Method 3: Data Attributes
```javascript
// Look for data attributes - get last element
const elements = document.querySelectorAll('[data-shiller-pe]');
const lastEl = elements[elements.length - 1];
const pe = parseFloat(lastEl.getAttribute('data-shiller-pe'));
const timestamp = lastEl.getAttribute('data-timestamp');

const data = {
  pe: pe,
  crawl_date: timestamp
};
```

## Common Issues and Solutions

### Issue 1: Null/Empty Data
**Cause**: Page hasn't loaded or data structure changed
**Solution**:
- Increase wait time
- Check browser console for errors
- Verify URL is correct

### Issue 2: Invalid Date Format
**Cause**: Date parsing failed
**Solution**:
- Use fallback date generation
- Check source format
- Validate with `isNaN(date.getTime())`

### Issue 3: Missing Latest Data
**Cause**: Can't find the last data point
**Solution**:
- Try multiple extraction methods
- Check for pagination
- Verify data visibility

## Usage Examples

### Python Analysis
```python
import json

# Load data
with open('shillerpe.json', 'r') as f:
    data = json.load(f)

# Get latest values
latest_pe = data['pe']
latest_date = data['crawl_date']

print(f"Latest Shiller PE: {latest_pe}")
print(f"Date: {latest_date}")
```

### JavaScript Analysis
```javascript
const data = require('./shillerpe.json');

console.log(`Latest Shiller PE: ${data.pe}`);
console.log(`Date: ${data.crawl_date}`);
```

## File Storage

### Location
- **Default**: Current working directory
- **File Name**: `shillerpe.json`
- **Format**: UTF-8 encoded JSON

### Permissions
- Requires write access to target directory
- Should not overwrite existing files without confirmation

### Backup Strategy
```bash
# Create timestamped backup
cp shillerpe.json "shillerpe-$(date +%Y%m%d-%H%M%S).json"
```

## Data Update Frequency

### Recommended Schedule
- **Personal Analysis**: Monthly
- **Investment Research**: Weekly
- **Real-time Trading**: Daily (if available)

### Automation
Consider setting up automated extraction:
- Cron job for scheduled updates
- Git hook for version control
- CI/CD pipeline for data pipelines