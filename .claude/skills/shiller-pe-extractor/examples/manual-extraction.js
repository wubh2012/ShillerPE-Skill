// Manual Data Extraction Script
// This JavaScript code can be executed in the browser console or via Chrome DevTools MCP

function extractLatestShillerPEData() {
  console.log("🔍 Starting Shiller PE data extraction (latest point only)...");

  // Method 1: Highcharts API extraction (Preferred)
  if (window.Highcharts && window.Highcharts.charts && window.Highcharts.charts[0]) {
    console.log("✅ Found Highcharts chart instance");
    const chart = window.Highcharts.charts[0];

    if (chart.series && chart.series[0] && chart.series[0].data.length > 0) {
      // Get the latest data point only
      const latestPoint = chart.series[0].data[chart.series[0].data.length - 1];
      const date = new Date(latestPoint.x);
      const data = {
        pe: latestPoint.y,
        crawl_date: date.toISOString().split('T')[0]
      };

      console.log(`✅ Extracted latest data point via Highcharts API`);
      return data;
    }
  }

  // Method 2: DOM-based extraction
  console.log("⚠️  Highcharts API not available, trying DOM extraction...");

  // Try various selectors for data elements
  const selectors = [
    'table tbody tr',
    '[data-pe]',
    '.pe-value',
    '.shiller-data',
    '.data-row',
    'tr[class*="row"]'
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);

      // Get the last element (latest data)
      const lastEl = elements[elements.length - 1];
      const text = lastEl.textContent || '';
      const peMatch = text.match(/(\d+\.\d+|\d+)/);

      if (peMatch) {
        const peValue = parseFloat(peMatch[1]);

        // Only include reasonable PE values
        if (peValue > 0) {
          // Try to find date
          let dateStr = '';

          // Look for date in the same row
          if (lastEl.tagName === 'TR') {
            const cells = lastEl.querySelectorAll('td');
            if (cells.length >= 2) {
              dateStr = cells[0].textContent.trim();
            }
          } else {
            // Look for date in parent or siblings
            const row = lastEl.closest('tr');
            if (row) {
              const firstCell = row.querySelector('td:first-child');
              if (firstCell) {
                dateStr = firstCell.textContent.trim();
              }
            }
          }

          // Parse date
          if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return {
                pe: peValue,
                crawl_date: date.toISOString().split('T')[0]
              };
            }
          }
        }
      }
    }
  }

  // Method 3: Text content parsing
  console.log("⚠️  DOM extraction failed, trying text parsing...");

  const bodyText = document.body.textContent;
  const peRegex = /(\d{4}-\d{2}-\d{2}|\w{3,9}\s+\d{4})\s+(\d+\.\d+|\d+)/g;
  let match;
  const textData = [];

  while ((match = peRegex.exec(bodyText)) !== null) {
    const dateStr = match[1];
    const peValue = parseFloat(match[2]);

    if (peValue > 0) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        textData.push({
          pe: peValue,
          crawl_date: date.toISOString().split('T')[0]
        });
      }
    }
  }

  if (textData.length > 0) {
    console.log(`✅ Extracted ${textData.length} data points via text parsing, returning latest`);
    // Return the latest (last) data point
    return textData[textData.length - 1];
  }

  console.error("❌ Failed to extract data using all methods");
  return null;
}

// Execute the extraction
const result = extractLatestShillerPEData();

if (result) {
  console.log("🎉 Extraction successful!");
  console.log("Data:", JSON.stringify(result, null, 2));

  // Return the result for MCP consumption
  return result;
} else {
  console.error("❌ No data extracted");
  return { error: "Failed to extract Shiller PE data" };
}

// Note: After getting the result, you should:
// 1. Save it to shillerpe.json using Write tool
// 2. Push to API using curl:
//    curl -X POST http://localhost:5000/api/shiller-pe \
//      -H "Content-Type: application/json" \
//      -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'