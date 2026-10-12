# 代理与镜像访问

Kubernetes 学习环境经常需要访问软件源、镜像仓库和代码托管站点。代理配置应按组件分层处理，先满足练习需要，再决定是否扩大范围。

## 代理范围

| 范围 | 适用对象 | 影响 |
| --- | --- | --- |
| 当前命令 | 单次下载或测试 | 影响最小，适合排障 |
| 登录 Shell | 当前用户执行的 `curl`、`git`、包管理命令 | 方便学习，但不会影响 systemd 服务 |
| Docker 服务 | Docker Engine 拉取镜像 | 只影响 Docker，通常需要重启 Docker |
| K3s 服务 | K3s 内置 containerd 拉取镜像 | 只影响 K3s，通常需要重启 K3s |
| 所有 systemd 服务 | 主机上的大量后台服务 | 影响范围大，不建议作为默认学习配置 |

## 推荐顺序

1. 先用当前命令的临时代理验证目标地址。
2. 只给需要拉镜像的 Docker 或 K3s 服务配置代理。
3. 如需交互式学习，再给登录 Shell 配置代理。
4. 只有明确知道所有后台服务都应走代理时，才配置 systemd 全局代理。

## Shell 示例

下面的地址只是占位符，不要把真实内部代理地址提交到公共仓库：

```bash
export http_proxy=http://<代理地址>:<端口>
export https_proxy=http://<代理地址>:<端口>
export no_proxy=localhost,127.0.0.1,<集群节点地址>,<Pod网段>,<Service网段>
```

`NO_PROXY` 至少应覆盖本机回环地址、集群节点地址、Pod 网段、Service 网段和内部镜像仓库。不同工具对大小写变量的支持不完全一致，必要时同时设置大小写版本。

## K3s 与 Docker

K3s 使用自己的 containerd，Docker 的代理配置不会自动传给 K3s。应分别阅读产品官方文档，使用 systemd 环境文件或 drop-in 配置，并在重启后验证：

```bash
systemctl is-active k3s
kubectl get pods -A
docker info | grep -i proxy
```

不要把带用户名、密码或 token 的代理 URL 写入 Git。公共教程只记录配置方法和占位符，真实值通过受控的本机配置或密钥管理提供。

## 验证边界

代理连通不代表 Kubernetes 已经可用。至少分别验证软件源访问、镜像拉取、节点状态和系统 Pod；记录失败时的组件、时间和错误信息。
