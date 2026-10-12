# 基础概念：先建立一张地图

这一章只解决一个问题：Kubernetes 到底在管理什么。

## 先从熟悉的 Docker 开始

Docker 的基本工作方式是：准备一个镜像，然后启动一个容器。

```text
镜像（nginx） ──启动──> 容器（正在运行的 Nginx）
```

Kubernetes 的价值是持续管理这些容器：你声明希望有 2 个 Nginx，它会持续检查实际数量，少了就创建，多了就删除。

## 四个最先要懂的词

### 集群（Cluster）

一套 Kubernetes 系统的整体。你安装的 K3s 集群就是一个集群。

### 节点（Node）

集群中真正提供 CPU、内存和磁盘的机器。你现在只有一台节点，所以 `get nodes` 只显示一行。

### Pod

Kubernetes 调度和运行程序的最小单位。初学时可以先把 Pod 理解成“一个被 Kubernetes 管理的运行单元”，里面通常放一个容器。

```text
节点（Node）
└── Pod
    └── Nginx 容器
```

### Namespace

集群中的一个逻辑房间，用来分组资源。`k8s-study` 就是你创建的练习房间。删除这个 Namespace 时，里面的练习资源也会一起删除。

## 为什么会有 Deployment

Deployment 表达的是一个持续目标：请保持指定数量的 Pod，并按照我的配置运行它们。所以你执行 `--replicas=2` 后，Kubernetes 会努力保持两个 Nginx Pod。

Deployment 会委托 ReplicaSet 管理 Pod：

```text
Deployment
└── ReplicaSet
    ├── Pod 1
    └── Pod 2
```

ReplicaSet 是 Kubernetes 的内部管理对象。现在知道它负责“维持数量”就够了，暂时不需要单独操作它。

## 为什么会有 Service

Pod 的 IP 可能变化。如果客户端直接访问 Pod IP，Pod 被重新创建后地址可能就失效了。

Service 提供一个稳定的访问入口，并把请求转发给符合条件的 Pod：

```text
客户端 → Service（稳定入口） → Pod 1 / Pod 2
```

Service 通过标签找到 Pod。你的 Pod 有 `app=web` 标签，Service 也使用 `app=web` 作为筛选条件，因此它找到了两个 Endpoints。

## 把实验结果翻译成人话

| 输出 | 含义 |
| --- | --- |
| `node/... Ready` | 这台机器可以接收工作 |
| `deployment.apps/web 2/2` | 要求 2 个，实际有 2 个可用 |
| `pod/... 1/1 Running` | 这个 Pod 中的 1 个容器正在运行 |
| `endpoints/web 10.42...:80` | Service 已找到可以接收请求的 Pod |

## 当前阶段只记住这张图

```text
Cluster 集群
└── Node 节点
    └── Namespace 命名空间
        ├── Deployment 持续目标
        │   └── ReplicaSet 数量管理
        │       └── Pod 运行单元
        │           └── Container 容器
        └── Service 稳定访问入口
```

这不是所有 Kubernetes 对象的完整结构，只是当前学习阶段需要的地图。
