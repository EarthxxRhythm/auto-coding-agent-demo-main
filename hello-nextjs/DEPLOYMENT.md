# Spring FES Video - 部署说明

## 项目简介

Spring FES Video 是一个故事转视频生成平台，使用 Next.js 16 构建，集成智谱 AI 和火山引擎 API。

## 环境要求

- Node.js 18+
- npm 或 yarn
- 智谱 AI API 密钥
- 火山引擎 API 密钥（图片生成 + 视频生成）
- Supabase 账号（可选，用于云端数据库）

## 本地部署

### 1. 安装依赖

```bash
cd hello-nextjs
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写以下配置：

```bash
# 智谱 AI API
ZHIPU_API_KEY=your_zhipu_api_key_here

# 火山引擎 API
VOLC_ACCESS_KEY=your_volc_access_key_here
VOLC_SECRET_KEY=your_volc_secret_key_here

# Supabase (可选，用于云端数据库)
# 如果不配置，将使用本地 SQLite 数据库
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# 本地数据库（默认使用）
USE_LOCAL_DB=true
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

### 5. 运行生产服务器

```bash
npm run start
```

## 云端部署选项

### Vercel 部署 (推荐)

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Vercel 项目设置中配置环境变量
4. 自动部署完成

### Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

构建并运行:

```bash
docker build -t spring-fes-video .
docker run -p 3000:3000 --env-file .env.local spring-fes-video
```

### 阿里云/腾讯云部署

1. 购买云服务器 (1核2G 以上)
2. 安装 Node.js 和 npm
3. 克隆代码仓库
4. 配置环境变量
5. 使用 PM2 守护进程:

```bash
npm install -g pm2
pm2 start npm --name "spring-fes-video" -- start
pm2 save
pm2 startup
```

## 数据库配置

### 本地 SQLite (默认)

无需配置，自动使用本地 `data` 目录下的 SQLite 数据库。

### Supabase 云端数据库

1. 在 Supabase 创建项目
2. 在 SQL Editor 中执行数据库 schema:
   - 查看 `supabase/migrations/` 目录下的迁移文件
3. 配置 `.env.local` 中的 Supabase 凭证
4. 设置环境变量 `USE_LOCAL_DB=false`

## API 服务

本项目需要以下外部 API 服务：

### 智谱 AI (GLM 模型)
- 用于生成故事分镜描述
- API 文档: https://open.bigmodel.cn/
- 注册: https://open.bigmodel.cn/usercenter/apikeys

### 火山引擎
- **Seedream**: 图片生成
- **Seedance**: 视频生成
- API 文档: https://www.volcengine.com/docs
- 注册: https://console.volcengine.com/

## 故障排查

### 构建失败 - Google Fonts 连接问题

如果遇到 `Failed to fetch Geist from Google Fonts` 错误，项目已配置使用系统字体作为后备方案。

### middleware 警告

Next.js 16 弃用了 middleware 文件约定，提示使用 proxy。这是一个警告，不影响功能。

### 数据库连接失败

检查 `USE_LOCAL_DB` 环境变量:
- 设置为 `true` 使用本地 SQLite
- 设置为 `false` 使用 Supabase

### API 调用失败

检查环境变量是否正确配置:
- `ZHIPU_API_KEY`
- `VOLC_ACCESS_KEY`
- `VOLC_SECRET_KEY`

## 性能优化建议

1. **CDN 部署**: 静态资源使用 CDN 加速
2. **图片优化**: 启用 Next.js Image 优化
3. **缓存策略**: 配置适当的 HTTP 缓存头
4. **数据库**: 生产环境建议使用 Supabase 云端数据库
5. **日志监控**: 使用 Sentry 或类似服务监控错误

## 安全建议

1. 不要在代码中硬编码 API 密钥
2. 使用 `.env.local` 存储敏感配置
3. 确保 `.env.local` 不提交到版本控制
4. 生产环境使用 HTTPS
5. 配置 CORS 策略

## 许可证

MIT
