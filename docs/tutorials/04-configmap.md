# 04 · ConfigMap：把配置从镜像中分开

这一课只学习一个问题：应用需要的普通配置，怎样不写死在镜像里？

答案是 ConfigMap。

## 本课目标

- 理解配置和程序镜像为什么要分开。
- 看懂 ConfigMap 的 `data`。
- 把 ConfigMap 作为文件挂载到 Pod 中。
- 修改配置并观察 Pod 中的文件变化。
- 知道 ConfigMap 不适合保存密码。

## 为什么需要配置

同一个 Nginx 镜像可以用于不同环境，但不同环境的页面标题、服务地址或功能开关可能不同：

```text
开发环境：Welcome to Development
测试环境：Welcome to Testing
生产环境：Welcome to Production
```

如果每次改标题都重新制作镜像，会让程序和配置绑在一起。更方便的方式是：

```text
同一个镜像 + 不同的配置 = 不同环境的应用
```

ConfigMap 用来保存不敏感的文本配置，例如页面内容、端口名称和功能开关。

## ConfigMap 是什么

ConfigMap 是 Kubernetes 中保存普通键值配置的对象：

```text
ConfigMap
├── 页面标题：Hello from ConfigMap
└── 页面内容：<html>...</html>
```

ConfigMap 本身不运行程序。Pod 需要主动引用它，配置才会进入容器。

## 创建练习目录和 Namespace

```bash
mkdir -p ~/k8s-study/configmap
cd ~/k8s-study/configmap

k3s kubectl create namespace k8s-study
```

如果 Namespace 已存在，命令会提示已存在，可以继续学习。

## 创建 ConfigMap

创建 `web-config.yaml`：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-content
  namespace: k8s-study
data:
  index.html: |
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <title>Kubernetes 学习页面</title>
      </head>
      <body>
        <h1>Hello from ConfigMap</h1>
        <p>这个页面内容来自 ConfigMap。</p>
      </body>
    </html>
```

## 逐段理解

```yaml
kind: ConfigMap
```

表示这份 YAML 要创建 ConfigMap。

```yaml
data:
  index.html: |
```

`data` 保存配置内容。`index.html` 是配置项的名字，`|` 表示下面缩进的多行内容都属于这个配置项。

查看文件中的 ConfigMap：

```bash
k3s kubectl apply -f web-config.yaml
k3s kubectl get configmap -n k8s-study
k3s kubectl describe configmap web-content -n k8s-study
```

## 让 Pod 使用 ConfigMap

创建 `web-deployment.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-config
  namespace: k8s-study
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web-config
  template:
    metadata:
      labels:
        app: web-config
    spec:
      containers:
        - name: nginx
          image: nginx:stable
          ports:
            - containerPort: 80
          volumeMounts:
            - name: web-content
              mountPath: /usr/share/nginx/html
      volumes:
        - name: web-content
          configMap:
            name: web-content
```

这里新增了两处关系：

```yaml
volumeMounts:
  - name: web-content
    mountPath: /usr/share/nginx/html
```

表示把一个名为 `web-content` 的卷挂载到 Nginx 的网页目录。

```yaml
volumes:
  - name: web-content
    configMap:
      name: web-content
```

表示这个卷的内容来自名为 `web-content` 的 ConfigMap。

可以把它理解成：

```text
ConfigMap web-content
        ↓
Kubernetes 创建卷
        ↓
挂载到容器的 /usr/share/nginx/html
        ↓
Nginx 读取 index.html
```

## 应用 Deployment 并查看页面

```bash
k3s kubectl apply -f web-deployment.yaml
k3s kubectl rollout status deployment/web-config -n k8s-study
k3s kubectl get pod -n k8s-study -o wide
```

确认 Pod 为 `Running` 后，查看容器中的文件：

```bash
POD=$(k3s kubectl get pod -n k8s-study -l app=web-config -o jsonpath='{.items[0].metadata.name}')
k3s kubectl exec "$POD" -n k8s-study -- cat /usr/share/nginx/html/index.html
```

如果能看到 `Hello from ConfigMap`，说明配置已经进入容器。

通过端口转发访问：

```bash
k3s kubectl port-forward pod/"$POD" 8080:80 -n k8s-study
```

保持这个终端运行，在另一个终端执行：

```bash
curl http://127.0.0.1:8080
```

应该能看到页面中的文字。

## 修改 ConfigMap

把 `web-config.yaml` 中的：

```html
<h1>Hello from ConfigMap</h1>
```

改成：

```html
<h1>配置已经更新</h1>
```

再次应用：

```bash
k3s kubectl apply -f web-config.yaml
```

稍等几秒后，再查看容器中的文件：

```bash
k3s kubectl exec "$POD" -n k8s-study -- cat /usr/share/nginx/html/index.html
```

挂载为文件的 ConfigMap 通常会被 Kubernetes 更新到容器中。实际应用是否立即使用新配置，还取决于应用是否会重新读取文件。某些程序需要重启或重新加载配置。

## ConfigMap 的安全边界

ConfigMap 适合保存普通配置，不适合保存：

- 密码
- Token
- 私钥
- 数据库凭据

这些内容应该使用 Secret，并配合权限控制。Secret 也不是自动安全的保险箱，后续学习 Secret 时还会讲访问权限和存储风险。

## 清理

先停止端口转发终端，然后执行：

```bash
k3s kubectl delete namespace k8s-study
```

## 课后问题

1. ConfigMap 会运行容器吗？

<details>
<summary>展开参考答案</summary>

不会。ConfigMap 只保存普通配置，Pod 通过卷、环境变量等方式读取它；真正运行程序的是容器。

</details>

2. `mountPath: /usr/share/nginx/html` 是什么意思？

<details>
<summary>展开参考答案</summary>

它表示把 ConfigMap 提供的卷挂载到容器内的这个目录，Nginx 就可以从该目录读取 `index.html`。

</details>

3. 为什么 ConfigMap 不应该保存密码？

<details>
<summary>展开参考答案</summary>

ConfigMap 面向普通配置，权限和保密性不适合存放敏感信息。密码、Token 和私钥应使用 Secret，并设置合适的访问权限。

</details>

4. 修改 ConfigMap 后应用一定会立即生效吗？

<details>
<summary>展开参考答案</summary>

不一定。挂载文件可能会被更新，但应用是否重新读取文件取决于应用本身；有些应用需要重新加载配置或重启。

</details>
