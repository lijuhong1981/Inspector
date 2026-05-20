# Inspector

基于threejs最新版的[Inspector](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/inspector)修改而来。

## 修改点

1、Setting.js的Extensions由加载json文件改为直接import TSLGraphEditor类，以避免打包后因找不到json文件导致的加载错误；

2、Item.js新增open函数；

3、Values.js中ValueNumber类新增min、max、step函数，并修复鼠标上下滑动时stepSize计算错误的问题；

4、Values.js中ValueSlider类新增min、max函数；
