# 第 0 课：如何开始学习 Kubernetes

这套教程面向第一次接触 Kubernetes 的学习者。你不需要先记住所有命令，也不需要一次理解所有对象。

## 每一课的学习方式

每一课都按下面的顺序进行：

1. 先读“这一步要解决什么问题”。
2. 只学习本步骤出现的新名词。
3. 执行一条命令。
4. 对照“你应该看到什么”检查输出。
5. 用自己的话解释结果，再继续下一步。

如果一条命令中出现三个以上陌生名词，先停下来查名词，不要直接复制执行。

## 先学会读命令

例如：

```bash
k3s kubectl get pods -n k8s-study
```

从左到右读：

| 部分 | 含义 |
| --- | --- |
| `k3s` | 使用 K3s 自带的 Kubernetes 命令入口 |
| `kubectl` | Kubernetes 的命令行客户端 |
| `get` | 查看资源 |
| `pods` | 要查看的资源类型是 Pod |
| `-n k8s-study` | 只查看 `k8s-study` 这个 Namespace 中的资源 |

所以整条命令的意思是：

> 查看 `k8s-study` 房间里的所有 Pod。

## 先分清三类动作

### 查看

不会改变集群：

```bash
k3s kubectl get pods
k3s kubectl describe pod <pod-name>
k3s kubectl logs <pod-name>
```

### 创建或修改

会改变集群：

```bash
k3s kubectl create namespace <name>
k3s kubectl scale deployment <name> --replicas=3
```

### 删除

会移除资源：

```bash
k3s kubectl delete namespace <name>
```

学习初期，先熟悉查看命令，再执行创建和删除命令。每次删除前都确认 Namespace 和资源名称。

## 第一阶段只学这些名词

| 名词 | 先记住什么 |
| --- | --- |
| Cluster | 一整套 Kubernetes 系统 |
| Node | 实际提供 CPU、内存和磁盘的机器 |
| Namespace | 集群中的逻辑房间 |
| Pod | 运行应用的基本单元 |
| Container | Pod 中实际运行的程序 |
| Deployment | 描述并维持应用运行目标 |
| ReplicaSet | 帮 Deployment 维持 Pod 数量 |
| Service | 给 Pod 提供稳定访问入口 |

暂时不需要同时学习 Ingress、StatefulSet、DaemonSet、Operator、CNI 和 CSI。它们会在基础对象熟悉后再出现。

## 练习时要问自己的问题

看到一条输出时，依次问：

1. 这是哪一种资源？
2. 它属于哪个 Namespace？
3. 它当前是什么状态？
4. 它由哪个对象负责管理？
5. 如果它消失了，谁会重新创建它？

## 推荐学习节奏

每次只完成一个小目标，例如：

- 今天只理解 Node 和 Pod。
- 下一次只理解 Deployment 如何维持副本数。
- 再下一次只理解 Service 如何找到 Pod。

完成实验不等于学会。能够解释“为什么这样做”和“输出代表什么”，才算完成这一小节。
