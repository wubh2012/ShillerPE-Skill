基于Claude Code的远程技能触发智能体：技术可行性方案

**方案状态**：✅ 核心技术已验证，可立即开始开发

---

## 1. 项目概述

### 1.1 项目目标

开发一个部署于本地环境的智能体服务端，该服务端能够通过标准的HTTP接口，接收来自互联网的请求，并自动调用本地已安装的Claude Code及其预定义技能（Skills）来执行任务，最终将结果返回给调用方。从而实现将本地AI技能库"服务化"与"自动化"。

### 1.2 核心价值

**技能复用与集成**：将编写好的Claude Code技能通过API暴露，便于集成到其他网页应用、工作流自动化平台（如Zapier、n8n）或移动端应用中。

**自动化执行**：无需人工干预，可通过预设条件或外部事件自动触发技能执行。

**集中化管理**：所有技能在本地Claude Code环境中统一管理，安全性高，更新维护简便。

## 2. 技术架构

### 2.1 整体架构图
```
flowchart TD
    subgraph Internet [互联网]
        WebApp[网页/外部应用]
    end

    subgraph ClaudeServer [云服务器（FRP服务端）]
        FrpS[FRP服务端<br>frps]
    end

    subgraph LocalHost [本地开发机（目标部署环境）]
        subgraph “智能体服务端 (Node.js)”
            WebServer[HTTP服务器<br>Express.js]
            AuthModule[认证模块]
            CmdExecutor[命令执行器<br>child_process]
        end

        FrpC[FRP客户端 frpc]
        Claude[Claude Code CLI<br>及 Skills]

        WebApp -- HTTP请求 --> FrpS;
        FrpS -- 隧道转发 --> FrpC;
        FrpC -- 请求本地端口 --> WebServer;
        WebServer -- 验证请求 --> AuthModule;
        AuthModule -- 通过 --> CmdExecutor;
        CmdExecutor -- 调用 --> Claude;
        Claude -- 执行结果 --> CmdExecutor;
        CmdExecutor -- 封装响应 --> WebServer;
        WebServer -- HTTP响应 --> WebApp;
    end
```
### 2.2 组件说明

**智能体服务端 (Node.js应用)**：项目核心，负责接收HTTP请求、身份验证、解析参数、调用Claude Code并返回结果。

**Claude Code & Skills**：本地安装的AI命令行工具及预先编写好的技能集，是任务的实际执行者。

**FRP (Fast Reverse Proxy)**：轻量级反向代理工具，用于将本地服务端的特定端口安全地暴露到公网，解决无公网IP问题。

**云服务器**：具备公网IP的服务器，用于运行FRP服务端，作为流量中转站。

**客户端**：发起调用的网页、移动应用或其他软件。

## 3. 核心实现方案

### 3.1 智能体服务端 (Node.js + Express)

**框架**：采用Express.js搭建轻量级HTTP服务器。

#### 关键端点设计

**1. 同步执行接口（适合快速任务 <30秒）**

`POST /api/v1/execute`

请求体：
```json
{
  "instruction": "使用shiller-pe-extractor 抓取 Shiller PE 数据",
  "timeout": 60000  // 可选，默认 120000ms
}
```

响应：
```json
{
  "success": true,
  "request_id": "req_123",
  "output": "任务执行结果（文本或JSON）",
  "error": "",
  "execution_time": 2345
}
```

**2. 异步执行接口（适合长时间任务 >30秒）**

`POST /api/v1/execute/async`

请求体：
```json
{
  "instruction": "使用shiller-pe-extractor 抓取 Shiller PE 数据"
}
```

立即响应：
```json
{
  "task_id": "task_abc123",
  "status": "running",
  "created_at": "2026-01-10T10:00:00Z"
}
```

**3. 任务状态查询**

`GET /api/v1/task/{task_id}`

响应：
```json
{
  "task_id": "task_abc123",
  "status": "completed",  // running | completed | failed
  "output": "任务执行结果",
  "error": "",
  "execution_time": 45000,
  "created_at": "2026-01-10T10:00:00Z",
  "completed_at": "2026-01-10T10:00:45Z"
}
```

**4. 健康检查**

`GET /health`

响应：
```json
{
  "status": "healthy",
  "claude_available": true,
  "uptime": 86400,
  "active_tasks": 2
}
```
#### 核心流程

**同步执行流程：**

1. **认证**：校验请求头中的 X-API-Key 是否与服务器配置的密钥匹配
2. **验证**：检查 instruction 参数是否有效（长度、危险字符等）
3. **构造命令**：使用 child_process 模块，以非交互模式调用Claude Code

```javascript
// 方式一：使用命令字符串（简单）
const command = `claude -p --dangerously-skip-permissions --output-format json "${instruction.replace(/"/g, '\\"')}"`;

// 方式二：使用参数数组（推荐，更安全）
const { spawn } = require('child_process');
const args = [
  '-p',                              // 非交互模式
  '--dangerously-skip-permissions',  // 跳过权限检查（关键！）
  '--output-format', 'json',         // JSON格式输出
  instruction
];
const claudeProcess = spawn('claude', args, { cwd: projectDir });
```

**关键参数说明：**
- `-p` (--print)：非交互模式，执行后立即退出
- `--dangerously-skip-permissions`：**必须添加**，否则遇到文件操作会等待用户确认导致进程挂起
- `--output-format json`：以JSON格式输出结果，便于解析（可选：text / json / stream-json）

4. **执行与捕获**：在指定的项目目录（cwd）下执行命令，并捕获标准输出、标准错误和退出码
5. **响应**：等待进程结束，将执行结果封装为JSON返回

**异步执行流程：**

1. **认证和验证**：同上
2. **生成任务ID**：创建唯一的任务标识符
3. **启动后台进程**：将任务放入后台执行队列，立即返回任务ID
4. **进程监控**：后台监控任务状态，完成后保存结果
5. **状态查询**：客户端通过任务ID查询执行状态和结果


#### 3.2 Claude Code 技能调用机制

**自动发现**：服务端无需硬编码技能路径。Claude Code启动时会自动扫描项目根目录下的 `.claude/skills/` 文件夹，加载所有技能的元数据（SKILL.md中的 name 和 description）。

**智能匹配（已验证）**：服务端传递的 instruction 自然语言指令会被Claude Code的AI模型分析，并自动匹配已加载的技能。支持多种调用方式：
- 自然语言描述：`"使用 shiller-pe-extractor 技能抓取数据"`
- 斜杠命令：`"/shiller-pe-extractor"`
- 描述性指令：`"抓取 Shiller PE 数据"`（AI会自动匹配到对应技能）

**执行隔离**：建议为每次调用设置独立的工作目录（通过 `cwd` 参数），避免多任务间的文件冲突。

## 4. 部署与网络配置

### 4.1 FRP内网穿透配置

#### 服务端（云服务器）

配置文件 frps.ini：

```ini
[common]
bind_port = 7000
token = your_secure_token_here
```

启动：`./frps -c ./frps.ini`

#### 客户端（本地主机）

配置文件 frpc.ini：

```ini
[common]
server_addr = your_vps_ip
server_port = 7000
token = your_secure_token_here

[Claude-code-agent]
type = tcp
local_ip = 127.0.0.1
local_port = 3000 # Node.js服务端口
remote_port = 6000 # 公网暴露端口
```

启动：`./frpc -c ./frpc.ini`

#### 访问方式

互联网用户通过 `http://your_vps_ip:6000` 即可访问到本地的智能体服务。

## 5. 安全与权限设计

| 层面 | 措施 | 说明 |
|------|------|------|
| 接口认证 | API密钥 | 所有请求必须在Header中携带有效的 `X-API-Key` |
| 传输安全 | HTTPS (推荐) | 在FRP服务端或前置Nginx配置SSL证书，对传输内容加密 |
| 命令注入防护 | 输入过滤与转义 | 对 instruction 参数进行严格验证（见下方示例） |
| 资源隔离 | 进程沙箱与超时 | 使用child_process在子进程中执行，设置强制超时 |
| 权限最小化 | 低权限运行 | Node.js服务进程应以非root用户身份运行 |
| 网络隔离 | FRP Token & IP白名单 | 配置FRP连接Token，可选在云服务器设置IP白名单 |

### 输入验证示例代码

```javascript
function validateInstruction(instruction) {
  // 1. 长度限制
  if (!instruction || instruction.length === 0) {
    throw new Error('Instruction cannot be empty');
  }
  if (instruction.length > 5000) {
    throw new Error('Instruction too long (max 5000 characters)');
  }

  // 2. 检测危险命令模式（防止命令注入）
  const dangerousPatterns = [
    /&&\s*rm/i,           // 命令链接执行删除
    /;\s*rm\s+-rf/i,      // 命令分隔执行删除
    /\|\s*rm/i,           // 管道执行删除
    /`[^`]*rm[^`]*`/i,    // 反引号命令执行
    /\$\([^)]*rm[^)]*\)/i // 命令替换
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(instruction)) {
      throw new Error('Potentially dangerous instruction detected');
    }
  }

  return true;
}
```

**注意**：由于使用 `spawn` 传递参数数组而非字符串拼接，已经有效降低了命令注入风险。
## 6. 可行性评估

| 评估维度 | 结论 | 说明 |
|----------|------|------|
| 技术成熟度 | **高** | Node.js、Express、FRP、Claude Code CLI均为成熟稳定技术，社区资源丰富 |
| 开发难度 | **中低** | 核心逻辑清晰（HTTP服务器+命令行调用），主要工作量在安全加固和异常处理 |
| 性能与扩展性 | **良好** | 无状态服务，可通过多实例负载均衡扩展。性能瓶颈主要在Claude Code任务执行耗时 |
| 维护成本 | **低** | 本地技能更新独立于服务端，服务端本身逻辑简单，易于维护 |
| 主要风险 | **可控** | 1. Claude Code调用稳定性：已验证 `-p --dangerously-skip-permissions` 参数组合的稳定性<br>2. 安全风险：通过API Key、输入验证、进程隔离等措施可有效管控<br>3. API配额：每次调用消耗Claude API配额，需监控使用量 |

### 技术验证结果（已完成）

✅ **CLI调用方式**：已验证 `claude -p --dangerously-skip-permissions` 可正常执行技能
✅ **技能自动匹配**：自然语言指令可成功触发技能执行
✅ **JSON输出格式**：`--output-format json` 参数可返回结构化结果
✅ **非交互执行**：进程可正常退出，不会挂起等待用户输入


## 7. 结论与建议

本方案技术路径清晰，组件成熟，具备较高的技术可行性和实施成功率。核心优势在于充分利用了现有生态（Claude Code Skills、FRP），以较小的开发代价实现了本地AI能力的远程自动化调用。

### ✅ 核心技术已验证

经过实际测试，以下关键技术点已验证可行：
1. **Claude Code非交互式调用**：`-p --dangerously-skip-permissions` 参数组合可稳定运行
2. **技能自动触发**：自然语言指令能够自动匹配并执行对应技能
3. **进程管理**：子进程可正常启动、执行和退出，不会挂起

### 📝 实施建议

**立即可开始开发**，建议按以下优先级推进：

**Phase 1 - 核心功能（1-2天）**
- 实现基础HTTP服务器（Express）
- 实现同步执行接口（`POST /api/v1/execute`）
- 实现API Key认证
- 实现输入验证和安全防护
- 编写基础测试用例

**Phase 2 - 异步支持（1-2天）**
- 实现任务队列和状态管理
- 实现异步执行接口（`POST /api/v1/execute/async`）
- 实现任务状态查询（`GET /api/v1/task/{id}`）
- 添加健康检查端点

**Phase 3 - 部署配置（半天）**
- 配置FRP内网穿透
- 配置HTTPS（推荐使用Let's Encrypt）
- 编写部署文档

**Phase 4 - 优化增强（可选）**
- 添加日志和监控
- 实现任务取消功能
- 添加技能列表查询接口
- 实现请求限流（如需要）

### ⚠️ 重点注意事项

1. **安全第一**：
   - 务必在生产环境启用HTTPS
   - API Key需使用强随机字符串
   - 定期审查访问日志

2. **错误处理**：
   - 妥善处理Claude Code进程超时和异常退出
   - 对外屏蔽内部错误细节，避免信息泄露

3. **资源监控**：
   - 监控Claude API配额使用情况
   - 监控服务器资源（CPU、内存）
   - 设置异常告警

4. **文档完善**：
   - 编写API接口文档（建议使用Swagger）
   - 提供客户端调用示例代码
   - 记录故障排查指南


