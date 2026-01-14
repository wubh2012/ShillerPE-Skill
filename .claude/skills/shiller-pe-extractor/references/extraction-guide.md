# Shiller PE Extraction Guide

## Quick Start

```bash
# 1. Open browser
mcp__chrome-devtools__new_page(url="https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235")

# 2. Wait for chart
mcp__chrome-devtools__wait_for(text="Shiller PE", timeout=10000)

# 3. Extract data
mcp__chrome-devtools__evaluate_script(function="() => { const chart = window.Highcharts?.charts?.[0]; const point = chart?.series?.[0]?.data?.slice(-1)[0]; return point ? { pe: point.y, crawl_date: new Date(point.x).toISOString().split('T')[0] } : null; }")

# 4. Save as shillerpe.json
# 5. Push to API
curl -X POST http://localhost:5000/api/shiller-pe -H "Content-Type: application/json" -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'
```

## Extraction Methods

### Method 1: Highcharts API (Recommended)
```javascript
() => {
  const chart = window.Highcharts?.charts?.[0];
  const point = chart?.series?.[0]?.data?.slice(-1)[0];
  return point ? {
    pe: point.y,
    crawl_date: new Date(point.x).toISOString().split('T')[0]
  } : null;
}
```

### Method 2: DOM Scraping (Fallback)
```javascript
() => {
  const elements = document.querySelectorAll('[data-pe], .pe-value, table tr');
  if (elements.length === 0) return null;

  const lastEl = elements[elements.length - 1];
  const pe = parseFloat(lastEl.textContent);

  if (isNaN(pe) || pe <= 0) return null;

  const row = lastEl.closest('tr');
  const dateCell = row?.querySelector('td:first-child');
  const date = dateCell ? new Date(dateCell.textContent) : new Date();

  return {
    pe: pe,
    crawl_date: date.toISOString().split('T')[0]
  };
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Page won't load | Check network, verify URL |
| Chart not visible | Increase wait time to 15000ms |
| Highcharts not found | Use DOM scraping method |
| Returns null | Check browser console for errors |
| Invalid date | Verify source data format |

## Validation

After extraction, verify:
- Result is not null
- Has `pe` (number > 0)
- Has `crawl_date` (format: `YYYY-MM-DD`)