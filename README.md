# Inspector

基于threejs最新版的[Inspector](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/inspector)修改而来。

## 修改点

1、Setting.js的Extensions由加载json文件改为直接import TSLGraphEditor类，以避免打包后因找不到json文件导致的加载错误；

2、ParametersGroup类新增open、remove、removeFolder方法，addNumber方法添加step参数，在add方法添加类型为number的值时增加对params[0]和params[1]参数是否为undefined的判断，修复listen时未对数值类型属性精度做判断的问题，修复addButton传入的函数this指向错误的问题；

3、Item类新增open函数；

4、ValueNumber类新增min、max、step方法，并修复鼠标上下滑动时stepSize计算错误的问题；

5、ValueSlider类新增min、max方法；

## 安装

```bash
npm install @lijuhong1981/inspector
```

## 使用

```js
import { WebGPURenderer, Color, Vector3 } from "three/webgpu";
import Inspector from "@lijuhong1981/inspector";
...
const renderer = new WebGPURenderer();
renderer.inspector = new Inspector();
...
const gui = renderer.inspector.createParameters('Settings');
const selectList = {
    value0: 'value0',
    value1: 'value1',
    value2: 'value2',
};
const params = {
    enabled: true,
    distance: 10,
    rotate: 0,
    select: selectList.value0,
    color: new Color(0xff0000),
    func: function() {
        ...
    }
};
gui.add(params, 'enabled').name("启用").onChange((value)=>{...});
gui.add(params, 'distance').name("距离").onChange((value)=>{...});
gui.add(params, 'rotate', -360, 360, 1).name("旋转").onChange((value)=>{...});
gui.add(params, 'select', selectList).name("选择").onChange((value)=>{...});
const colorItem = gui.addColor(params, 'color');
gui.add(params, 'func');
// colorItem.remove(); //移除color选项
// gui.remove(colorItem); //移除color选项
// gui.open(); //展开
// gui.close(); //关闭
const position = new Vector3();
const folder = gui.addFolder("位置");
folder.add(position, 'x').step(0.1);
folder.add(position, 'y').step(0.1);
const zItem = folder.add(position, 'z').step(0.1);
// zItem.remove(); //移除z值选项
// folder.remove(zItem); //移除z值选项
// folder.open(); //展开
// folder.close(); //关闭
// gui.removeFolder(folder); //移除folder
...
```
