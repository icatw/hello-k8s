# 02 · 用 YAML 描述应用

上一课使用命令创建了 Deployment。这一课换一种方式：把希望 Kubernetes 创建的内容写进 YAML 文件，再交给 Kubernetes。

## 本课目标

- 理解“期望状态”。
- 看懂一份最小 Deployment YAML。
- 使用 `kubectl apply` 创建资源。
- 修改副本数，再观察 Kubernetes 如何调整实际状态。

## 先理解一个词：声明式

假设你想要 2 个 Nginx。

命令式做法是直接告诉系统怎么做：

```text
创建一个 Pod
再创建第二个 Pod
```

声明式做法是描述最终想要的状态：

```text
我希望最终有 2 个 Nginx Pod
```

Kubernetes 会根据这份描述创建和维护资源。以后 Pod 因故障消失时，控制器会再次把实际状态调整到目标状态。

## 创建 YAML 文件

在自己的学习目录中创建 `web.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-yaml
  namespace: k8s-study
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-yaml
  template:
    metadata:
      labels:
        app: web-yaml
    spec:
      containers:
        - name: nginx
          image: nginx:stable
          ports:
            - containerPort: 80
```

如果你直接在服务器上学习，可以执行：

```bash
mkdir -p ~/k8s-study
cd ~/k8s-study
vi web.yaml
```

也可以在本地仓库的 `examples/` 目录中保存练习文件。

## 逐段阅读 YAML

### 资源类型

```yaml
apiVersion: apps/v1
kind: Deployment
```

- `apiVersion`：告诉 Kubernetes 使用哪一版 API 规则。
- `kind`：告诉 Kubernetes 这是什么资源。
- 这里表示：我要创建一个 Deployment。

### 名称和 Namespace

```yaml
metadata:
  name: web-yaml
  namespace: k8s-study
```

这表示资源名称是 `web-yaml`，放在 `k8s-study` 这个 Namespace 中。

### 副本数量

```yaml
spec:
  replicas: 2
```

`spec` 是资源的期望配置。`replicas: 2` 表示希望有两个 Pod。

### 选择器和标签

```yaml
selector:
  matchLabels:
    app: web-yaml
```

Deployment 用这个条件识别哪些 Pod 属于自己。

下面这部分给 Pod 添加同样的标签：

```yaml
template:
  metadata:
    labels:
      app: web-yaml
```

两处的 `app: web-yaml` 必须匹配。可以先把它理解成“管理者和被管理对象使用同一个编号”。

### 容器配置

```yaml
containers:
  - name: nginx
    image: nginx:stable
    ports:
      - containerPort: 80
```

这表示 Pod 中运行一个名为 `nginx` 的容器，使用 `nginx:stable` 镜像，应用在容器内使用 80 端口。

## 应用 YAML

先确保 Namespace 存在：

```bash
k3s kubectl get namespace k8s-study || \
  k3s kubectl create namespace k8s-study
```

应用文件：

```bash
k3s kubectl apply -f web.yaml
```

`apply` 的意思是：读取文件中的期望状态，让 Kubernetes 创建或更新对应资源。

检查结果：

```bash
k3s kubectl get deployment,pod -n k8s-study
k3s kubectl rollout status deployment/web-yaml -n k8s-study
```

## 修改期望状态

把 YAML 中的：

```yaml
replicas: 2
```

改成：

```yaml
replicas: 3
```

再次执行：

```bash
k3s kubectl apply -f web.yaml
k3s kubectl get pods -n k8s-study -w
```

看到第三个 Pod 进入 `Running` 后，按 `Ctrl-C` 停止观察。

这次的过程是：

```text
修改 YAML 中的 replicas
→ 再次 apply
→ Deployment 发现目标变成 3
→ ReplicaSet 创建第 3 个 Pod
```

## 查看 Kubernetes 保存的配置

```bash
k3s kubectl get deployment web-yaml -n k8s-study -o yaml
```

你会看到比原文件更多的字段。这些字段由 Kubernetes 补充，用来记录实际状态、版本和系统信息。

当前先区分两个部分：

- `spec`：希望它是什么样子。
- `status`：它现在实际是什么样子。

## 清理本课资源

本课创建的 Deployment 名称是 `web-yaml`。如果 Namespace 中还有其他练习资源，不要删除整个 Namespace，只删除本课资源：

```bash
k3s kubectl delete deployment web-yaml -n k8s-study
```

如果确认 Namespace 中没有其他需要保留的资源，也可以最后删除练习 Namespace：

```bash
k3s kubectl delete namespace k8s-study
```

## 课后问题

1. `kind: Deployment` 表示什么？

<details>
<summary>展开参考答案</summary>

它表示这份 YAML 描述的是一个 Deployment 资源。

</details>

2. `replicas: 2` 表达了什么？

<details>
<summary>展开参考答案</summary>

它表达了期望状态：希望 Kubernetes 保持两个符合配置的 Pod。

</details>

3. 为什么 `selector.matchLabels` 和 `template.metadata.labels` 要匹配？

<details>
<summary>展开参考答案</summary>

selector 是 Deployment 用来寻找和管理 Pod 的条件，template 中的 labels 是新 Pod 的标签。两者匹配后，Deployment 才能管理自己创建的 Pod。

</details>

4. `apply` 和“直接运行一个容器”有什么不同？

<details>
<summary>展开参考答案</summary>

`apply` 把期望状态交给 Kubernetes，由 Deployment 和 ReplicaSet 等控制器持续维护；直接运行容器通常只启动一次，缺少 Kubernetes 的持续管理关系。

</details>
