# done
1. svg渲染
2. 基于mathjax3的latex转svg
3. 分栏：可能有bug
4.基于foreignObject的html元素渲染
5. 分离formatElements避免mathjax被带入worker,可以不用import()，但还是先分开
6. 和vue对接，通过ref.$el移动组件，能够挂载，具体形式可以视实际情况再调整
7. element=>html：createDomFromElementList，结构还原基础
  浮动图片定位=>给放在了嵌入型的位置上，还原后应该没有原始的效果了
8. html=>element: createElementListFromHTML，结构转换基础，根据具体情况补充处理
  基于dom渲染的解构，因为有getComputedStyle，如果要脱离dom需要替换这一部分
9. 分块：可以用area类型分块，get area by id,但是界面上是分开的，若界面需要其他定位再做特殊处理
# todo
3. 界面交互：公式点击编辑
4. 数据结构处理&界面构建