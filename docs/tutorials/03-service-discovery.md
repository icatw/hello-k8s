# 03 · Service 如何找到 Pod

这一课只解决一个问题：Pod 的 IP 会变化，其他程序怎样稳定访问它？答案是 Service。

## 本课目标

- 理解 Pod IP 为什么不适合作为长期访问地址。
- 理解 Label 和 Selector 的关系。
- 看懂一个 Service YAML。
- 观察 Service 的 Endpoints。
- 通过 Service 访问 Nginx。

## 先回顾上节课

上一课的 Deployment 负责维持 Pod 数量。Pod 有自己的 IP，例如 `10.42.0.5` 和 `10.42.0.6`，但 Pod 被更新、故障重建或扩缩容后，IP 可能改变。

因此我们不让客户端长期记住 Pod IP，而是使用 Service：

```text
客户端
  ↓
Service：web-yaml
  ├── Pod A：app=web-yaml
  ├── Pod B：app=web-yaml
  └── Pod C：app=web-yaml
```

## Label：给 Pod 贴标签

上一课的 Deployment 会给 Pod 添加标签：

```yaml
labels:
  app: web-yaml
```

Label 可以理解成资源上的分类信息。查看 Pod 的标签：

```bash
k3s kubectl get pods -n k8s-study --show-labels
```

只查看带有某个标签的 Pod：

```bash
k3s kubectl get pods -n k8s-study -l app=web-yaml
```

`-l` 是 `--selector` 的缩写，意思是按标签筛选。

## 创建练习环境

如果上一课已经删除了 Namespace，先重新创建：

```bash
k3s kubectl create namespace k8s-study
k3s kubectl create deployment web-yaml \
  --image=nginx:stable \
  --replicas=2 \
  -n k8s-study
k3s kubectl rollout status deployment/web-yaml -n k8s-study
k3s kubectl get pods -n k8s-study --show-labels
```

## 创建 Service YAML

创建 `web-service.yaml`：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-yaml
  namespace: k8s-study
spec:
  selector:
    app: web-yaml
  ports:
    - name: http
      port: 80
      targetPort: 80
  type: ClusterIP
```

逐段理解：

| 字段 | 含义 |
| --- | --- |
| `kind: Service` | 这份 YAML 创建 Service |
| `selector` | Service 用它寻找 Pod |
| `port` | Service 自己提供的端口 |
| `targetPort` | 请求转发到 Pod 的端口 |
| `ClusterIP` | 只在集群内部提供访问入口 |

`selector` 会寻找带有 `app=web-yaml` 标签的 Pod。标签不匹配，Service 就找不到 Pod。

## 应用并观察 Service

```bash
k3s kubectl apply -f web-service.yaml
k3s kubectl get service -n k8s-study
k3s kubectl get endpoints web-yaml -n k8s-study
```

预期会看到 Service 的 `CLUSTER-IP`，以及两个 Pod IP 和 `:80`：

```text
10.42.0.5:80,10.42.0.6:80
```

这说明 selector 找到了两个带有 `app=web-yaml` 标签的 Pod。

新版本 Kubernetes 还可以查看 EndpointSlice：

```bash
k3s kubectl get endpointslice -n k8s-study
```

如果终端提示 Endpoints API 已废弃，这是提醒信息，不代表实验失败。

## 访问 Service

在第一个终端执行：

```bash
k3s kubectl port-forward service/web-yaml 8080:80 -n k8s-study
```

保持这个终端运行，在第二个终端执行：

```bash
curl http://127.0.0.1:8080
```

如果返回 Nginx HTML，访问链路就是：

```text
本机 8080 → Service web-yaml:80 → 某个 Pod:80 → Nginx
```

访问完成后，回到第一个终端按 `Ctrl-C`。

## 小实验：让 Service 找不到一个 Pod

先查看当前 selector：

```bash
k3s kubectl describe service web-yaml -n k8s-study
```

临时修改一个 Pod 的标签：

```bash
POD=$(k3s kubectl get pod -n k8s-study -l app=web-yaml -o jsonpath='{.items[0].metadata.name}')
k3s kubectl label pod "$POD" app=wrong --overwrite -n k8s-study
```

再次查看后端：

```bash
k3s kubectl get endpoints web-yaml -n k8s-study
```

后端数量会减少，因为这个 Pod 不再匹配 Service 的 selector。这个实验只用于理解 selector，完成后删除 Namespace 即可恢复干净状态。

## 清理

```bash
k3s kubectl delete namespace k8s-study
```

## 课后问题

1. Service 负责运行容器吗？

<details>
<summary>展开参考答案</summary>

不负责。Pod 中的容器负责运行应用，Service 负责提供稳定入口，并根据 selector 找到 Pod。

</details>

2. `selector: app: web-yaml` 的作用是什么？

<details>
<summary>展开参考答案</summary>

它告诉 Service 寻找带有 `app=web-yaml` 标签的 Pod，并把请求转发给这些 Pod。

</details>

3. `port` 和 `targetPort` 有什么区别？

<details>
<summary>展开参考答案</summary>

`port` 是 Service 提供的端口，`targetPort` 是 Service 转发请求时使用的 Pod 端口。

</details>

4. Endpoints 为空通常先检查什么？

<details>
<summary>展开参考答案</summary>

先检查 Service 的 selector 是否和 Pod 的 labels 匹配，再检查 Pod 是否处于可接收流量的状态。

</details>
