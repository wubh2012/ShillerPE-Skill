基于从 context7 获取的官方文档，我来为你总结如何创建 Claude Code skills：

  📋 创建 Skills 的完整指南

  1. 基本结构

  标准目录结构：
  skill-name/
  ├── SKILL.md              # 核心文档（必需）
  ├── references/           # 详细参考资料（可选）
  │   └── detailed-guide.md
  └── examples/             # 使用示例（可选）
      └── working-example.sh

  复杂技能的完整结构：
  skill-name/
  ├── SKILL.md              # 核心文档
  ├── references/           # 参考资料
  │   ├── patterns.md
  │   └── advanced.md
  ├── examples/             # 示例
  │   ├── example1.sh
  │   └── example2.json
  └── scripts/              # 验证脚本
      └── validate.sh

  2. SKILL.md 文件格式

  YAML 前元数据（Frontmatter）：
  ---
  name: Skill Name
  description: When to use this skill
  version: 1.0.0
  ---

  Skill instructions and guidance...

  - name: 技能名称
  - description: 何时使用此技能（要具体明确）
  - version: 版本号

  3. 编写规范和最佳实践

  ✅ 应该做的：
  - 使用祈使句/不定式（动词开头）
  ✅ 正确: "To create a hook, define the event type."
  ❌ 错误: "You can create a hook by defining..."
  - 保持客观和指令性
  ✅ 正确: "Validate settings before use."
  ❌ 错误: "Claude should validate settings"
  - 使用第三人称描述元数据
  description: "This skill should be used when analyzing API responses"

  ❌ 应该避免的：
  - 主观语言："You can...", "Claude should...", "The user might..."
  - 属性归因：避免将动作归因于特定角色

  4. 内容组织原则

  渐进式披露（Progressive Disclosure）：
  - SKILL.md: 保持精简，只包含核心要点（约1800字以内）
  - references/: 放置详细说明、高级技巧
  - examples/: 提供可工作的示例代码

  维护要点：
  - 保持 SKILL.md 聚焦核心基础
  - 将详细规范移到 references/
  - 为不同用例添加新的 examples
  - 更新 frontmatter 当命令定义有变化时
  - 定期测试示例确保兼容性

  5. 实际示例

  简单技能：
  ---
  name: Git Commit Helper
  description: Creates conventional commits with proper formatting
  version: 1.0.0
  ---

  Create commits following conventional commit standards.

  Use this skill when:
  - Creating git commits
  - Writing commit messages
  - Following commit message conventions

  ## Steps
  1. Analyze the changes
  2. Determine commit type (feat, fix, docs, etc.)
  3. Write clear commit message
  4. Include breaking changes if needed

  复杂技能：
  ---
  name: API Testing Framework
  description: Comprehensive API testing with authentication and validation
  version: 2.1.0
  ---

  Perform complete API testing workflows.

  ## Core Instructions
  Create test cases, validate responses, and generate reports.

  ## Directory Structure
  - references/: API guides, auth patterns
  - examples/: Basic and authenticated tests
  - scripts/: Test runners and reporters

  这样你就能创建结构清晰、易于维护的 Claude Code skills 了！