# Shiller PE Data Extractor Skill

一个使用 Chrome DevTools MCP 从 GuruFocus 提取 Shiller PE 比率数据的 Claude Code 技能。

## 🎯 使用方法

直接告诉 Claude：
- "extract Shiller PE data"
- "抓取 Shiller PE 数据"
- "get CAPE ratio from GuruFocus"
- "scrape Shiller PE"
- "save Shiller PE to JSON"
- "update Shiller PE data"

## 📁 项目结构

```
shiller-pe-extractor/
├── SKILL.md              # 核心技能定义
├── references/           # 详细参考文档
│   ├── data-format.md   # 数据格式规范
│   └── extraction-guide.md  # 提取指南
└── shillerpe.json       # 最新提取的数据示例
```

## 📊 输出格式

```json
{
  "pe": 40.4,
  "crawl_date": "2026-01-07"
}
```

## 🔧 技能流程

1. **打开页面**: 使用 Chrome DevTools 访问 GuruFocus Shiller PE 模块
2. **等待加载**: 等待图表渲染完成
3. **提取数据**: 通过 Highcharts API 获取最新数据点
4. **保存结果**: 写入 `shillerpe.json` 文件
5. **可选推送**: 推送到本地 API 端点

## 📚 参考文档

- **[数据格式](./references/data-format.md)** - JSON 结构和验证规则
- **[提取指南](./references/extraction-guide.md)** - 详细提取方法和故障排除

## ✨ 已优化特性

- ✅ 精简文档 (78% 减少)
- ✅ 添加中文支持 ("抓取 Shiller PE 数据")
- ✅ 符合 Claude Code 技能规范
- ✅ 测试验证通过

## 🚀 快速测试

```bash
# 技能已测试，可直接使用
# 最新数据: PE=40.4 (2026-01-07)
```

