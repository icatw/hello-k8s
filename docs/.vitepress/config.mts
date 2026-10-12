import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Kubernetes 学习手册',
  description: '循序渐进的 Kubernetes 学习路线、实验教程与复盘记录',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '学习路线', link: '/guide/learning-plan' },
      { text: '教程', link: '/tutorials/01-first-workload' },
      { text: '学习记录', link: '/journal/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '学习指南',
          items: [
            { text: '第 0 课 · 如何学习', link: '/guide/00-how-to-learn' },
            { text: '学习计划', link: '/guide/learning-plan' },
            { text: '环境与安全边界', link: '/guide/environment' },
            { text: '代理与镜像访问', link: '/guide/proxy' },
            { text: '基础概念', link: '/guide/fundamentals' },
          ],
        },
      ],
      '/tutorials/': [
        {
          text: '入门教程',
          items: [{ text: '01 · 第一个工作负载', link: '/tutorials/01-first-workload' }],
        },
      ],
      '/journal/': [
        {
          text: '过程记录',
          items: [
            { text: '记录索引与模板', link: '/journal/' },
            { text: '2026-10-12 · K3s 安装', link: '/journal/2026-10-12-k3s-install' },
          ],
        },
      ],
    },
    socialLinks: [],
    footer: {
      message: '边学边做，记录每一次可复现的发现。',
    },
  },
})
