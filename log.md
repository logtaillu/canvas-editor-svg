# 已加上
1. svg渲染
2. 基于mathjax3的latex转svg
3. 分栏：可能有bug
4.基于foreignObject的html元素渲染
5. 分离formatElements避免mathjax被带入worker,可以不用import()，但还是先分开
6. 和vue对接，通过ref.$el移动组件
# 待处理
1. 数据结构转换&复制粘贴逻辑，能否脱离dom挂载，看起来主要是用了getComponentStyle
2. 按题目二级分块
3. 界面交互：公式点击编辑
4. 界面构建