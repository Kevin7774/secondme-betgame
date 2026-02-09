# SecondMe 集成项目

## 应用信息

- **App Name**: AI新葡京娱乐城
- **Client ID**: `a5cbdc79-8203-40c6-846a-49ea7fff1110`
- **当前阶段**: `ready`
- **状态文件**: `.secondme/state.json`

## API 文档

开发时优先从 `.secondme/state.json` 的 `docs` 字段读取：

| 文档 | 配置键 |
|------|--------|
| 快速入门 | `docs.quickstart` |
| OAuth2 认证 | `docs.oauth2` |
| API 参考 | `docs.api_reference` |
| 错误码 | `docs.errors` |

## 关键信息

- API 基础 URL: `https://app.mindos.com/gate/lab`
- API 路径前缀: `/api/secondme`
- OAuth 授权 URL: `https://go.second.me/oauth/`
- Token Endpoint: `https://app.mindos.com/gate/lab/api/oauth/token`
- Access Token 有效期: 2 小时
- Refresh Token 有效期: 30 天

> 所有 API 和文档地址以 `.secondme/state.json` 为准，不要在业务代码中硬编码。

## 已选模块

- `auth`
- `profile`
- `chat`
- `act`
- `note`

## 权限列表 (Scopes)

| 权限 | 说明 | 状态 |
|------|------|------|
| `user.info` | 用户基础信息 | ✅ 已配置 |
| `user.info.shades` | 用户兴趣标签 | ✅ 已配置 |
| `user.info.softmemory` | 用户软记忆 | ✅ 已配置 |
| `chat` | 聊天 / Act 能力 | ✅ 已配置 |
| `note.add` | 添加笔记 | ✅ 已配置 |
| `voice` | 语音能力 | ✅ 已配置（暂不生成代码） |

## 开发约定

- OAuth 回调 URI 默认值：`http://localhost:3000/api/auth/callback`
- 环境变量优先，缺失时回退读取 `.secondme/state.json`
- `.secondme/` 目录包含敏感配置，禁止提交到仓库
- 所有 SecondMe API 响应按统一格式处理：`{ code, data, message }`
