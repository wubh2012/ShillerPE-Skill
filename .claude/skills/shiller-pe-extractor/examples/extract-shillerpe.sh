#!/bin/bash
# Shiller PE Data Extraction Example Script
# This script demonstrates how to use the Shiller PE Extractor skill

echo "🚀 Starting Shiller PE Data Extraction"
echo "========================================"
echo ""

# Set target URL
TARGET_URL="https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235"
OUTPUT_FILE="shillerpe.json"

echo "📋 Target URL: $TARGET_URL"
echo "💾 Output File: $OUTPUT_FILE"
echo ""

# Step 1: Launch Chrome DevTools session
echo "Step 1: Launching Chrome DevTools..."
echo "Use the MCP server to start a browser session:"
echo "  mcp__chrome-devtools__new_page(url=\"$TARGET_URL\")"
echo ""

# Step 2: Wait for page to load
echo "Step 2: Waiting for page to load..."
echo "Allow 5-10 seconds for the chart to render:"
echo "  mcp__chrome-devtools__wait_for(text=\"Shiller PE\", timeout=10000)"
echo ""

# Step 3: Extract data using JavaScript evaluation
echo "Step 3: Extracting Shiller PE data..."
echo "Execute JavaScript to extract chart data:"
echo ""
cat << 'JSEOF'
// JavaScript to extract latest data from Highcharts
const extractionCode = `() => {
  // Method 1: Try Highcharts API (get latest data point only)
  if (window.Highcharts && window.Highcharts.charts && window.Highcharts.charts[0]) {
    const chart = window.Highcharts.charts[0];
    if (chart.series && chart.series[0] && chart.series[0].data.length > 0) {
      const latestPoint = chart.series[0].data[chart.series[0].data.length - 1];
      return {
        pe: latestPoint.y,
        crawl_date: new Date(latestPoint.x).toISOString().split('T')[0]
      };
    }
  }

  // Method 2: Try DOM scraping (get latest data point only)
  const dataElements = document.querySelectorAll('[data-pe], .pe-value, .shiller-data, td');
  if (dataElements.length > 0) {
    const lastEl = dataElements[dataElements.length - 1];
    const peValue = parseFloat(lastEl.textContent);
    if (!isNaN(peValue) && peValue > 0) {
      // Look for associated date
      const row = lastEl.closest('tr');
      if (row) {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) {
          const dateText = dateCell.textContent.trim();
          const date = new Date(dateText);
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

  return null;
}`;

console.log("Use this code with mcp__chrome-devtools__evaluate_script:");
console.log(extractionCode);
JSEOF
echo ""

# Step 4: Save the data
echo "Step 4: Save the extracted data..."
echo "Create a file with the JSON data:"
echo ""
cat << 'JSONEOF'
# Example of what the extracted data might look like:
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}

# Save using Write tool:
# File path: ./shillerpe.json
# Content: [paste the extracted JSON]
JSONEOF
echo ""

# Step 5: Push to API
echo "Step 5: Push data to API..."
echo "Execute the following curl command:"
echo ""
echo "curl -X POST http://localhost:5000/api/shiller-pe \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"pe\": 32.5, \"crawl_date\": \"2026-01-07\"}'"
echo ""

echo "✅ Extraction Complete!"
echo ""
echo "📁 Output will be saved to: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "1. Verify the JSON file was created"
echo "2. Check data format and completeness"
echo "3. Push data to API using curl command"
echo "4. Verify API response"
echo ""
echo "💡 Tip: You can run this process multiple times to get updated data"