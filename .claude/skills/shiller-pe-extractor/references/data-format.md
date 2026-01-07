# Shiller PE Data Format

## JSON Structure

```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

## Fields

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `pe` | number | Positive float/integer | `32.5` |
| `crawl_date` | string | ISO 8601 (YYYY-MM-DD) | `"2026-01-07"` |

## Validation Rules

1. **pe**: Must be positive number (typical range: 5-50)
2. **crawl_date**: Must match `^\d{4}-\d{2}-\d{2}$`

## About Shiller PE (CAPE)

- **Definition**: S&P 500 Price / 10-Year Average Real Earnings
- **Developer**: Robert Shiller (Nobel Prize winner)
- **Historical Average**: ~17
- **Current Range**: 25-35

## Usage Example

```python
# Python
import json
with open('shillerpe.json') as f:
    data = json.load(f)
print(f"PE: {data['pe']} on {data['crawl_date']}")
```

```javascript
// JavaScript
const data = require('./shillerpe.json');
console.log(`PE: ${data.pe} on ${data.crawl_date}`);
```