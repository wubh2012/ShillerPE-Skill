# Shiller PE Data Extractor Skill

一个使用 Chrome DevTools MCP 从 GuruFocus 提取 Shiller PE 比率数据并保存为 JSON 文件的技能。

## 📁 目录结构

```
shiller-pe-extractor/
├── SKILL.md                    # 核心技能文档
├── README.md                   # 本文件（使用指南）
├── references/                 # 详细参考文档
│   ├── data-format.md         # 数据格式规范
│   └── extraction-guide.md    # 完整提取指南
└── examples/                   # 使用示例
    ├── extract-shillerpe.sh   # 完整提取脚本
    └── manual-extraction.js   # 手动提取代码
```

## 🚀 快速开始

### 基本使用流程

当你需要提取 Shiller PE 数据时，按照以下步骤操作：

#### 1. 导航到目标页面
```bash
mcp__chrome-devtools__new_page(url="https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235")
```

#### 2. 等待页面加载
```bash
mcp__chrome-devtools__wait_for(text="Shiller PE", timeout=10000)
```

#### 3. 提取数据
使用以下 JavaScript 代码通过 Highcharts API 提取最新数据：
```javascript
const extractionCode = `() => {
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
  return null;
}`;

mcp__chrome-devtools__evaluate_script(function=extractionCode)
```

#### 4. 保存数据
将提取的结果保存为 `shillerpe.json` 文件。

#### 5. 推送数据到 API
使用 curl 将数据推送到本地 API 端点：

```bash
curl -X POST http://localhost:5000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'
```

### 输出格式

提取的数据将保存为以下 JSON 格式：

```json
{
  "pe": 32.5,
  "crawl_date": "2026-01-07"
}
```

## 📋 数据字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `pe` | number | Shiller PE 比率值 | `32.5` |
| `crawl_date` | string | `yyyy-MM-dd` 格式 | `"2026-01-07"` |

## 🛠️ 使用示例

### 完整提取脚本

查看 `examples/extract-shillerpe.sh` 获取完整的自动化脚本。

### 手动提取代码

如果需要自定义提取逻辑，参考 `examples/manual-extraction.js`。

### 四步完成提取

```bash
# 1. 打开浏览器
mcp__chrome-devtools__new_page(url="https://www.gurufocus.com/modules/chart/market/shillerPE-module.php?width=392&height=235")

# 2. 等待并提取
mcp__chrome-devtools__wait_for(text="Shiller PE", timeout=10000)
# 然后执行 JavaScript 提取代码

# 3. 保存为 shillerpe.json
# 使用 Write 工具保存提取的数据

# 4. 推送到 API
curl -X POST http://localhost:5000/api/shiller-pe \
  -H "Content-Type: application/json" \
  -d '{"pe": 32.5, "crawl_date": "2026-01-07"}'
```

## 🔍 提取方法

### 方法 1: Highcharts API (推荐)
- 最可靠的方法
- 直接访问图表数据
- 保持数据精度

### 方法 2: DOM Scraping (备用)
- 当 API 不可用时使用
- 从 HTML 元素提取
- 需要处理更多边缘情况

### 方法 3: 文本解析 (最后手段)
- 解析页面文本内容
- 使用正则表达式匹配
- 可能不够准确

## ⚠️ 常见问题

### 数据提取失败
**解决方案**:
- 增加等待时间
- 检查网络连接
- 验证 URL 是否正确

### 空数据数组
**解决方案**:
- 确保图表已完全加载
- 尝试不同的提取方法
- 检查浏览器控制台错误

### 日期格式错误
**解决方案**:
- 使用备用日期生成
- 验证源数据格式
- 添加错误处理

## 📊 数据分析示例

### Python 分析
```python
import json

# 加载数据
with open('shillerpe.json', 'r') as f:
    data = json.load(f)

# 获取最新数据
latest_pe = data['pe']
latest_date = data['crawl_date']

print(f"最新 Shiller PE: {latest_pe}")
print(f"数据日期: {latest_date}")
```

### JavaScript 分析
```javascript
const data = require('./shillerpe.json');

console.log(`最新 Shiller PE: ${data.pe}`);
console.log(`数据日期: ${data.crawl_date}`);
```

## 🔧 高级用法

### 定期更新数据
```bash
# 创建定时任务
# 每月运行一次提取
0 0 1 * * /path/to/extract-shillerpe.sh
```

### 数据版本控制
```bash
# 使用 Git 跟踪数据变化
git add shillerpe.json
git commit -m "Update Shiller PE data: $(date +%Y-%m-%d)"
```

### 多时间范围提取
```javascript
// 提取不同时间范围的数据
const ranges = ['1Y', '5Y', '10Y', 'max'];
// 对每个范围执行提取
```

## 📚 参考文档

- **[数据格式](./references/data-format.md)**: 详细的 JSON 结构和验证规则
- **[提取指南](./references/extraction-guide.md)**: 完整的工作流程和故障排除

## 🎯 最佳实践

1. **验证数据完整性**: 提取后检查所有字段是否正确
2. **错误处理**: 添加 try-catch 块处理异常
3. **数据备份**: 定期备份提取的数据
4. **尊重网站**: 避免频繁请求，使用缓存
5. **文档记录**: 记录提取时间和数据来源

## 🤝 贡献

欢迎改进这个技能：
- 添加新的提取方法
- 改进错误处理
- 添加数据分析功能
- 优化性能

## 📄 许可

MIT License - 请自由使用和修改。