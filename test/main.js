import * as THREE from 'three';
import {
	WebGPURenderer,
	MeshStandardNodeMaterial,
	MeshBasicNodeMaterial,
	DirectionalLight,
	AmbientLight
} from 'three/webgpu';

import Inspector from '../index.js';

// ---------- Renderer ----------
const renderer = new WebGPURenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById( 'canvas-container' ).appendChild( renderer.domElement );

// 挂载 Inspector（赋值即触发 setRenderer）
renderer.inspector = new Inspector();

// ---------- Scene ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
camera.position.set( 0, 1.6, 4 );
camera.lookAt( 0, 0.5, 0 );

scene.add( new AmbientLight( 0xffffff, 0.6 ) );
const dirLight = new DirectionalLight( 0xffffff, 3 );
dirLight.position.set( 3, 5, 2 );
scene.add( dirLight );

// 主立方体：NodeMaterial 带 graphId，可被 Viewer 预览、TSL Graph 编辑
const boxMaterial = new MeshStandardNodeMaterial( { color: 0x00aaff, roughness: 0.35, metalness: 0.2 } );
boxMaterial.name = 'BoxMaterial';
boxMaterial.userData.graphId = 'test-box';
const box = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), boxMaterial );
scene.add( box );

// 球体：测第二个节点
const sphereMaterial = new MeshStandardNodeMaterial( { color: 0xff6644, roughness: 0.6 } );
const sphere = new THREE.Mesh( new THREE.SphereGeometry( 0.5, 64, 32 ), sphereMaterial );
sphere.position.x = - 1.5;
scene.add( sphere );

// 地面
const ground = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), new MeshBasicNodeMaterial( { color: 0x2a2a2a } ) );
ground.rotation.x = - Math.PI / 2;
ground.position.y = - 0.5;
scene.add( ground );

// ---------- 参数面板（覆盖作者定制的 API） ----------
let autoAngle = 0; // 自动旋转的累积角度

const params = {
	enabled: true,
	speed: 1,
	rotate: 0,
	color: boxMaterial.color, // 直接引用材质颜色，addColor 修改即生效
	mode: 'a',
	reset: function () {

		autoAngle = 0;
		box.rotation.set( 0, 0, 0 );
		box.position.set( 0, 0.5, 0 );
		console.log( '[test] reset' );

	}
};

const gui = renderer.inspector.createParameters( '测试参数' );
gui.add( params, 'enabled' ).name( '启用旋转' ).onChange( v => console.log( '[test] enabled =', v ) );
gui.add( params, 'speed', 0, 5, 0.1 ).name( '速度' );
gui.add( params, 'rotate' ).name( '角度' ).step( 1 ).min( - 360 ).max( 360 );
const colorItem = gui.addColor( params, 'color' );
gui.add( params, 'mode', { A: 'a', B: 'b', C: 'c' } ).name( '模式' );
gui.add( params, 'reset' );

const pos = { x: 0, y: 0.5, z: 0 };
const folder = gui.addFolder( '位置' );
folder.add( pos, 'x' ).step( 0.1 );
folder.add( pos, 'y' ).step( 0.1 );
const zItem = folder.add( pos, 'z' ).step( 0.1 );

// 演示作者定制的 remove / removeFolder / open / close（默认不执行，去掉注释即可验证）
// colorItem.remove();
// gui.remove( colorItem );
// zItem.remove();
// folder.remove( zItem );
// folder.open();
// folder.close();
// gui.removeFolder( folder );
// gui.open();
// gui.close();

// ---------- 动画循环 ----------
renderer.setAnimationLoop( () => {

	if ( params.enabled ) {

		autoAngle += 0.01 * params.speed;

	}

	// 角度(rotate)：立方体绕 Y 轴的固定偏转角（度），叠加在自动旋转之上
	box.rotation.y = autoAngle + THREE.MathUtils.degToRad( params.rotate );
	box.rotation.x = 0.004 * autoAngle;
	sphere.rotation.y = 0.008 * autoAngle;

	box.position.set( pos.x, pos.y, pos.z );
	renderer.render( scene, camera );

} );

// ---------- 尺寸自适应 ----------
window.addEventListener( 'resize', () => {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

} );

console.log( '[test] Inspector 已挂载。右下角开关面板；Settings 里可启用 TSL Graph / Color Grading 扩展。' );
