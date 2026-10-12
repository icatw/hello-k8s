# 01 · 第一个 Kubernetes 应用

这一课不追求一次学会所有命令。我们先理解一个简单目标：让 Kubernetes 持续运行两个 Nginx。

如果你还不熟悉 Cluster、Node、Pod、Deployment 和 Service，请先阅读[基础概念](../guide/fundamentals.md)。

## 我们要完成什么

```text
一台 Node
└── 一个 Namespace：k8s-study
    ├── 一个 Deployment：web
    │   └── 两个 Nginx Pod
    └── 一个 Service：web
```

## 第一步：确认机器可以工作

```bash
k3s kubectl get nodes
```

只看 `STATUS`，应该是 `Ready`，表示这台机器可以接收工作。

## 第二步：创建一个练习房间

```bash
k3s kubectl create namespace k8s-study
```

Namespace 可以理解为一个练习房间。后面的资源都放进这个房间，方便查看和清理。

## 第三步：告诉 Kubernetes 我们想要什么

```bash
k3s kubectl create deployment web \
  --image=nginx:stable \
  --replicas=2 \
  -n k8s-study
```

意思是：创建一个叫 `web` 的 Deployment，使用 Nginx 镜像，希望同时运行 2 个副本。

Deployment 会持续努力让“实际运行数量”符合“希望运行数量”。

## 第四步：看它实际创建了什么

```bash
k3s kubectl get deployment,replicaset,pod -n k8s-study
```

| 对象 | 一句话理解 |
| --- | --- |
| Deployment | 记录我们希望应用怎样运行 |
| ReplicaSet | 帮 Deployment 维持 Pod 数量 |
| Pod | 实际运行 Nginx 容器的单元 |

Pod 的 `Running` 表示容器已经启动；`Pending` 表示还在等待调度；`ContainerCreating` 表示正在创建容器或准备镜像。

## 第五步：等待两个 Pod 可用

```bash
k3s kubectl rollout status deployment/web -n k8s-study
k3s kubectl get pods -n k8s-study -o wide
```

确认有两个 Pod，且都是 `1/1 Running`。

## 第六步：为应用创建稳定入口

Pod 的 IP 可能变化，所以不让其他程序直接记 Pod IP。创建 Service：

```bash
k3s kubectl expose deployment web \
  --port=80 \
  --target-port=80 \
  --type=ClusterIP \
  -n k8s-study
```

`ClusterIP` 表示只允许集群内部访问，不占用宿主机 80 端口。

检查 Service 是否找到了 Pod：

```bash
k3s kubectl get service,endpoints -n k8s-study
```

如果 `ENDPOINTS` 中出现两个 Pod IP 和 `:80`，说明 Service 已经找到两个 Pod。

## 第七步：实际访问页面

在服务器上执行：

```bash
k3s kubectl port-forward service/web 8080:80 -n k8s-study
```

看到 `Forwarding from 127.0.0.1:8080 -> 80` 后，不要立刻按 `Ctrl-C`。保持这个终端运行，再打开第二个终端执行：

```bash
curl http://127.0.0.1:8080
```

看到 Nginx 的 HTML 响应后，回到第一个终端按 `Ctrl-C`。

`port-forward` 只是临时把本机 8080 接到 Service，方便学习和验证。

## 第八步：观察扩容

```bash
k3s kubectl scale deployment web --replicas=3 -n k8s-study
k3s kubectl get pods -n k8s-study -w
```

看到第三个 Pod 变成 `Running` 后按 `Ctrl-C`。这说明你修改了 Deployment 的目标数量，Kubernetes 自动创建了新的 Pod。

## 第九步：清理练习

```bash
k3s kubectl delete namespace k8s-study
```

删除 Namespace 会删除本课创建的 Deployment、ReplicaSet、Pod 和 Service。

## 课后只回答三个问题

1. Node 和 Pod 分别是什么？

<details>
<summary>展开参考答案</summary>

Node 是集群中提供 CPU、内存、磁盘和网络的实际机器。Pod 是 Kubernetes 调度和运行应用的基本单元，里面通常运行一个或多个容器。

</details>

2. 为什么不建议长期直接访问 Pod IP？

<details>
<summary>展开参考答案</summary>

Pod 可能因为故障、更新或扩缩容被删除并重新创建，新 Pod 的 IP 可能变化。Service 提供稳定的访问入口，并把请求转发给当前可用的 Pod。

</details>

3. Deployment 的副本数从 2 改成 3 后，谁创建了第三个 Pod？

<details>
<summary>展开参考答案</summary>

你修改了 Deployment 的目标副本数。Deployment 背后的 ReplicaSet 发现实际只有 2 个 Pod，于是创建了第 3 个 Pod。

</details>
