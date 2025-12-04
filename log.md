# 已加上
1. svg渲染
2. 基于mathjax3的latex转svg
3. 分栏：可能有bug
4.基于foreignObject的html元素渲染
5. 分离formatElements避免mathjax被带入worker,可以不用import()，但还是先分开
6. 和vue对接，通过ref.$el移动组件
7. element=>html：createDomFromElementList，结构还原基础
8. html=>element: createElementListFromHTML，结构转换基础
# 待处理
1. 粘贴，能否脱离dom挂载，看起来主要是用了getComponentStyle
粘贴(结构转换):基于getElementListByHTML，能否脱离dom使用，以及公式的处理，图片
2. 按题目二级分块，不需要定位，dom层级上的一层包装
elementlist有大量的使用
3. 界面交互：公式点击编辑
4. 数据结构处理&界面构建