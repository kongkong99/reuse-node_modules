## 自动化构建部署优化 - 复用node_modules
> 当前后两次node_modules中包版本一致时，当前包使用上一次包中node_modules

### 特殊边界条件考虑
> 核心问题：如何确定前后两次node_modules中依赖包版本一致
`package-lock.json`, `~1.2.3`, `^1.2.3`, `1.2.3`, `1.2.3-beta`, `18.0.0-alpha-43f4cc160218`


### 代码中速度优化
1. 并行获取必要包符合筛选条件的版本`npm view <packageName>@'>=1.0.0' version --json`
2. 移动node_modules，而非拷贝，移动很快，拷贝很慢


