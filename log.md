# 已加上
1. svg渲染
2. 基于mathjax3的latex转svg
3. 分栏：可能有bug
4.基于foreignObject的html元素渲染
5. 分离formatElements避免mathjax被带入worker,可以不用import()，但还是先分开
6. 和vue对接，通过ref.$el移动组件
# 待处理
1. 和vue对接:组件数据刷新的情况
2. 按题目二级分块
3. 数据结构转换&复制粘贴逻辑，能否脱离dom挂载
4. 界面交互：公式点击编辑