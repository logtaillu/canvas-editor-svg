# 已添加
1. 支持svg渲染
2. 添加分栏功能
3. 基于mathjax3的latex转svg渲染公式，不用挂载dom,有其他渲染方式可替换[只考虑svg模式]
4. 基于foreignObject的html元素渲染，可append现有的vue组件[只考虑svg模式]
5. 公式点击编辑修改
# todo
1. 支持readonly：组件不可选中、复制、剪切处理
2. block内部浮动定位
3. block margin
4. 差异化header/footer?
5. html -> element list按需调整，用于初始结构生成和复制
6. element list -> html按需调整，用于复制找他到其他地方，如果需要转回到html也会用到