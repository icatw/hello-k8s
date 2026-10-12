# Kubernetes 学习手册

这是一个边学边更新的 Kubernetes 学习仓库，包含学习路线、主题教程、实验步骤和复盘记录。文档使用 Markdown 编写，并已准备 VitePress 站点骨架。

## 开始学习

1. 阅读[学习计划](docs/guide/learning-plan.md)，按阶段推进，不要求一次学完。
2. 从[环境与安全边界](docs/guide/environment.md)开始，确认练习环境。
3. 完成[第一个工作负载](docs/tutorials/01-first-workload.md)，并把结果记入[学习记录](docs/journal/README.md)。

## 本地预览文档站

需要 Node.js 20 或更高版本。

```bash
npm install
npm run docs:dev
```

构建静态站点：

```bash
npm run docs:build
```

## 目录结构

```text
docs/
├── guide/       # 学习路线与环境约定
├── tutorials/   # 可重复操作的主题教程
├── journal/     # 每次练习的过程记录与复盘
└── .vitepress/  # 文档站配置
```

## 学习原则

- 优先在专用本地虚拟机或专用练习主机创建集群。
- 不要在承载重要业务的主机上直接安装集群；如果必须共用主机，先评估资源、网络、端口和回滚方案。
- 每次练习记录目标、命令、观察结果、问题、解决方式和复盘结论。
- 命令中的名称和资源范围先看清楚；删除、清理、重启、改防火墙等操作先确认影响范围。
- 公共文档只保留可复现的通用步骤；主机地址、内部域名、代理地址、凭据和业务名称放在本地私有记录中。
