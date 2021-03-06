// index.js
// 获取应用实例
// require('../../jsm/three.module.js');
import {
  initShaders,
  getMousePosInWebgl,
  ScaleLinear,
  SinFn
} from '../../jsm/Utils.js';
// import {
//   Matrix4,
//   Vector3,
//   Quaternion,
//   Plane,
//   Ray,
//   Color
// } from '../../jsm/three.js';
// const three = require('../../jsm/three.js')
import Poly from '../../jsm/Poly.js';
const {	  
  Matrix4,
  Vector3,
  Quaternion,
  Plane,
  Ray,
  Color} = require('../../jsm/three.js')
Page({
  data: {
    aaa: 'webGL水波纹效果'
  },
  // 事件处理函数
  btnTap() {
    wx.navigateTo({
      url: '/pages/page2/page2'
    })
  },
  initData(gl, canvas) {
    const vertexShader = `    
      attribute vec4 a_Position;
      attribute vec4 a_Color;
      varying vec4 v_Color;
      uniform mat4 u_ViewMatrix;
      void main(){
      gl_Position = u_ViewMatrix*a_Position;
      gl_PointSize=3.0;
      v_Color = a_Color;
    }`;
    const fragmentShader = `
      precision mediump float;
      varying vec4 v_Color;
      void main(){
      gl_FragColor=v_Color;
    }`;
    initShaders(gl, vertexShader, fragmentShader);
    /* 视图矩阵 */
    const viewMatrix = new Matrix4().lookAt(
      new Vector3(0.2, 0.3, 1),
      new Vector3(),
      new Vector3(0, 1, 0)
  )
/* x,z 方向的空间坐标极值 */
const [minPosX, maxPosX, minPosZ, maxPosZ] = [
  -0.7, 0.8, -1, 1
]
const [minAngX, maxAngX, minAngZ, maxAngZ] = [
  0, Math.PI * 4, 0, Math.PI * 2
]

const scalerX = ScaleLinear(minPosX, minAngX, maxPosX, maxAngX);
const scalerZ = ScaleLinear(minPosZ, minAngZ, maxPosZ, maxAngZ);

/* y 方向的坐标极值 */
const [a1, a2] = [0.1, 0.03]
const a12 = a1 + a2
const [minY, maxY] = [-a12, a12]

/* 色相极值 */
const [minH, maxH] = [0.1, 0.55]

/* 比例尺：将y坐标和色相相映射 */
const scalerC = ScaleLinear(minY, minH, maxY, maxH)

/* 颜色对象，可通过HSL获取颜色 */
const color = new Color()

/* 波浪对象的行数和列数 */
const [rows, cols] = [50, 50]

/* 波浪对象的两个attribute变量，分别是位置和颜色 */
const a_Position = { size: 3, index: 0 }
const a_Color = { size: 4, index: 3 }

/* 类目尺寸 */
const categorySize = a_Position.size + a_Color.size

/* 波浪对象 */
const wave = new Poly({
  gl,
  source: getSource(
      cols, rows,
      minPosX, maxPosX, minPosZ, maxPosZ
  ),
  uniforms: {
      u_ViewMatrix: {
          type: 'uniformMatrix4fv',
          value: viewMatrix.elements
      },
  },
  attributes: {
      a_Position,
      a_Color,
  }
})



// 渲染
render()

/* 动画:偏移phi */
let offset = 0
!(function ani() {
  offset += 0.08
  updateSource(offset)
  wave.updateAttribute()
  render()
  canvas.requestAnimationFrame(ani)
})()

/* 渲染 */
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  wave.draw()
}

function getSource(cols, rows, minPosX, maxPosX, minPosZ, maxPosZ) {
  const source = []
  const spaceZ = (maxPosZ - minPosZ) / rows
  const spaceX = (maxPosX - minPosX) / cols
  for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
          const px = x * spaceX + minPosX
          const pz = z * spaceZ + minPosZ
          source.push(px, 0, pz, 1, 1, 1, 1)
      }
  }
  return source
}
/* 更新顶点高度和颜色 */
function updateSource(offset = 0) {
  const { source, categorySize } = wave
  for (let i = 0; i < source.length; i += categorySize) {
      const [posX, posZ] = [source[i], source[i + 2]]
      const angZ = scalerZ(posZ)
      const Omega = 2
      const a = Math.sin(angZ) * a1 + a2
      const phi = scalerX(posX) + offset
      const y = SinFn(a, Omega, phi)(angZ)
      source[i + 1] = y
      const h = scalerC(y)
      const { r, g, b } = color.setHSL(h, 1, 0.6)
      source[i + 3] = r
      source[i + 4] = g
      source[i + 5] = b
  }
}
  },
  onLoad() {
    let canvas = null;
    const query = wx.createSelectorQuery()
    query.select('#canvas').node().exec((res) => {
      canvas = res[0].node
      const gl = canvas.getContext('webgl')
      this.initData(gl, canvas)
      // gl.clearColor(1, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    })
    return canvas;
  },
})