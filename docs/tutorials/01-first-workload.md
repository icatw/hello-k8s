# 01 · 部署第一个工作负载

本教程会在当前 Kubernetes context 中创建一个名为 `k8s-study` 的 namespace，并在其中运行 Nginx。开始前确认 `kubectl` 指向可丢弃的练习集群。

## 学习目标

- 区分 Pod、Deployment 和 Service。
- 用 `kubectl` 创建资源并检查期望状态与实际状态。
- 查看日志和事件，并清理本教程创建的资源。

## 1. 确认集群上下文

```bash
kubectl config current-context
kubectl get nodes -o wide
```

如果当前上下文不是专用练习集群，先停止，不要继续创建资源。

## 2. 创建 namespace 和 Deployment

```bash
kubectl create namespace k8s-study
kubectl create deployment web --image=nginx:stable --replicas=2 -n k8s-study
kubectl rollout status deployment/web -n k8s-study
```

查看资源：

```bash
kubectl get deployment,replicaset,pod -n k8s-study -o wide
kubectl describe deployment web -n k8s-study
```

Deployment 记录期望副本数并协调 ReplicaSet；ReplicaSet 再确保对应数量的 Pod 存在。Pod 是调度和运行容器的基本单元。

## 3. 查看日志和事件

```bash
kubectl logs deployment/web -n k8s-study
kubectl get events -n k8s-study --sort-by=.metadata.creationTimestamp
```

观察 Pod 的状态、重启次数、所在节点，以及事件中的调度和镜像拉取信息。

## 4. 扩缩容

```bash
kubectl scale deployment/web --replicas=3 -n k8s-study
kubectl get pods -n k8s-study -w
```

观察到 3 个 Pod 后按 `Ctrl-C` 退出观察，再缩回 2 个：

```bash
kubectl scale deployment/web --replicas=2 -n k8s-study
```

## 5. 暴露为集群内 Service

```bash
kubectl expose deployment web --port=80 --target-port=80 --type=ClusterIP -n k8s-study
kubectl get service,endpoints -n k8s-study
```

Service 用稳定名称和虚拟 IP 选择后端 Pod。此处只创建集群内部可访问的 ClusterIP，不会占用宿主机 80 端口。

## 6. 清理本教程资源

确认 namespace 名称后，只删除本教程创建的 namespace：

```bash
kubectl delete namespace k8s-study
```

## 完成后记录

将集群类型、`kubectl` context 名称（不要记录凭据）、观察到的对象关系、遇到的问题和结论写入[学习记录](../journal/README.md)。

## 排查提示

- Pod 长时间 Pending：查看 `kubectl describe pod` 和 namespace 事件。
- ImagePullBackOff：检查镜像名称、标签以及集群节点的镜像仓库连通性。
- Service 没有 Endpoints：核对 Service selector 与 Pod labels。
- 不要通过删除整个集群或清理宿主机 Docker 来解决单个练习资源的问题。
