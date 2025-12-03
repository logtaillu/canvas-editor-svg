# 已加上
1. svg渲染
2. 基于mathjax3的latex转svg
3. 分栏：可能有bug
4.基于foreignObject的html元素渲染
5. 分离formatElements避免mathjax被带入worker,可以不用import()，但还是先分开
# 待处理
1. 按题目二级分块
2. 数据结构转换
3. 界面交互：公式点击编辑
4. 复制粘贴：基于dom渲染?，公式的复制粘贴?
5. 嵌vue组件

# 流程
1. vue嵌入
本地联调，尝试嵌入vue组件
2. 看复制、粘贴如何实现的，如何将做html<->结构间的双向转换