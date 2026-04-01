# 专业真相 - 高考专业选择指导平台

> 免费、真实、无利益冲突的高考专业选择指导平台

## 项目概述

「专业真相」是一个连接高考学生和各行业专家的公益平台，帮助学生获取真实的专业信息，做出更适合自己的专业选择。

### 核心特色

- **完全免费**：学生无需付费获取信息
- **真实客观**：来自一线从业者的真实经历
- **多元视角**：同一专业多位专家分享，避免偏见
- **无利益冲突**：专家无偿分享，不推销任何机构

## 技术栈

- **前端框架**: [Next.js 14+](https://nextjs.org/) (App Router)
- **样式工具**: [Tailwind CSS](https://tailwindcss.com/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **后端/数据库**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **部署**: [Vercel](https://vercel.com/)

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd zhuanyezhenxiang
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写你的 Supabase 配置：

```bash
cp .env.local.example .env.local
```

### 4. 设置 Supabase

1. 在 [Supabase](https://supabase.com/) 创建一个新项目
2. 在 SQL 编辑器中执行 `supabase/migrations/001_initial_schema.sql`
3. 执行 `supabase/migrations/002_rls_policies.sql`
4. 复制项目 URL 和 Anon Key 到 `.env.local`

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
app/
├── (auth)/           # 认证相关页面
│   ├── login/
│   └── register/
├── (dashboard)/      # 后台管理
│   ├── page.tsx      # 概览
│   ├── profile/      # 个人资料
│   └── layout.tsx    # 后台布局
├── majors/           # 专业百科
├── experts/          # 专家广场
├── qa/               # 问答广场
├── page.tsx          # 首页
├── layout.tsx        # 根布局
└── globals.css       # 全局样式

components/
├── ui/               # shadcn/ui 组件
├── layout/           # 布局组件
│   ├── navbar.tsx
│   └── footer.tsx

lib/
└── supabase/         # Supabase 客户端
    ├── client.ts     # 浏览器端
    └── server.ts     # 服务端

supabase/
└── migrations/       # 数据库迁移
    ├── 001_initial_schema.sql
    └── 002_rls_policies.sql
```

## 核心功能

### 专业百科

- 浏览各专业的详细介绍
- 查看就业前景、学习内容、适合人群
- 阅读过来人的真实经验

### 问答广场

- 向专家提问
- 浏览已回答的问题
- 查看精选回答

### 专家团队

- 查看专家列表和详情
- 了解专家的背景和经验
- 申请成为专家

### 个人中心

- 管理个人资料
- 查看我的提问
- 专家后台（认证后）

## 部署

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

```bash
vercel --prod
```

## 数据库迁移

执行新的迁移文件：

```bash
# 在 Supabase SQL 编辑器中手动执行
# 或设置 Supabase CLI 自动迁移
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)

## 联系方式

- 项目主页: [https://zhuanyezhenxiang.com](https://zhuanyezhenxiang.com)
- 邮箱: contact@zhuanyezhenxiang.com

---

感谢所有愿意分享真实经历的专家们！
