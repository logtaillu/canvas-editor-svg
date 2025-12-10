# 已添加
1. 支持svg渲染
2. 添加分栏功能
3. 基于mathjax3的latex转svg渲染公式，不用挂载dom,有其他渲染方式可替换[只考虑svg模式]
4. 基于foreignObject的html元素渲染，可append现有的vue组件[只考虑svg模式]
5. 公式点击编辑修改
# 已确认
1. createDomFromElementList：element=>html，复制操作，如果希望复制到html编辑器中会需要考虑
还原回html会丢失四周环绕布局等特性，所以数据存储大概不需要还原回去
2. createElementListFromHTML：html=>element，结构转换，用于初始转换和粘贴操作
* 会需要根据实际情况调整
* 因为有getComputedStyle，是基于dom渲染的，初次转换后可以存储下来，只需要执行一次
3. 分块：area类型可以结构上分块，界面上是分开的，若界面需要其他定位再做特殊处理
4. 不可操作：header和footer有editable=false，同时给zone.tipDisabled=true
# todo
1. 不可删除、不可选中、不可复制的元素
2. block内部的四周环绕定位：以block为范围，定位在边缘
3. 差异化的header和footer
对接项目测试，看需要补充什么