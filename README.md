# Inspector

基于threejs最新版的[Inspector](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/inspector)修改而来。

## 修改点

> 本工程已同步 three.js `dev` 分支最新版 Inspector（含 Color Grading 扩展、Overdraw 渲染、console 未读徽章等），并在其上保留/新增以下定制：

1、扩展加载：`Settings.js` 由官方动态 `import(url)` 改为静态 `import` 扩展类（Color Grading、TSL Graph），避免打包后因找不到文件导致的加载错误；

2、导入路径：官方代码的 `three/addons/inspector/...` 引用统一改为相对路径，适配 npm 包独立发布；

3、`ParametersGroup`：新增 `open`、`remove`、`removeFolder` 方法，`addNumber` 增加 `step` 参数，`add` 对 number 类型增加 `params[0]`/`params[1]` 非 undefined 判断，修复 `listen` 数值精度判断、`addButton` 的 `this` 指向问题；

4、`Item`：新增 `open` 方法；

5、`ValueNumber`：新增 `min`、`max`、`step` 方法，修复鼠标上下滑动时 `stepSize` 计算错误的问题；`ValueSlider`：新增 `min`、`max` 方法；

6、three 版本兼容：支持 three 0.181～0.186+，自动适配以下版本差异——时间戳查询 `hasTimestampQuery`（0.186+）/`hasTimestamp`（0.181～0.185）自动探测、`info.memory` 字段全量兜底、`RenderPipeline`（0.183+）与 `WebGLBackend`（0.184+）导出缺失降级、`InspectorBase` 继承 `EventDispatcher`（0.184+）缺失时自动混入（0.181 以下无 WebGPU Inspector 基础设施，无法兼容）。

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

## 本地测试

```bash
node server.js          # 默认 8000 端口，可传端口号覆盖
# 浏览器打开 http://localhost:8000/test/
```

测试页（[test/](test/)）含一个 WebGPU 场景（NodeMaterial 立方体/球体 + 光照）与参数面板，覆盖布尔/数字/滑块/颜色/下拉/按钮/folder，以及 `step`/`min`/`max`/`remove`/`removeFolder`/`open`/`close` 等定制 API；左上角下拉框可切换 three 版本（0.181.0～0.186.1，走 unpkg CDN），用于验证跨版本兼容。

> 需使用支持 WebGPU 的浏览器（Chrome 113+ / Edge，开启硬件加速）；TSL Graph / Color Grading 扩展需在 Settings Tab 勾选启用（TSL Graph 依赖联网加载 `tsl-graph.xyz`）。
