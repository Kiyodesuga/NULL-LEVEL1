
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, particles;
let positions, velocities, targets;
const numParticles = 3000;
const colorList = [0x8952d1, 0x8b079e, 0x5a6873, 0x4a3215, 0x3c938a, 0xbbbeab, 0x004557, 0xf080fb, 0x50996d, 0x12482c, 0x15ffcc, 0xe4e25a, 0xd083fb, 0xacf25a, 0xad782a, 0x427628, 0x44d8e8, 0xbaa877, 0xf6086f, 0xc2f0f1, 0x6fb707, 0x92317e, 0x674139, 0x606ec9, 0x060457, 0xdac572, 0x7426a3, 0xb17ff5, 0x5e1184, 0xf19e78];
let currentColorIndex = 0;
let material;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 300;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  positions = new Float32Array(numParticles * 3);
  velocities = new Float32Array(numParticles * 3);
  targets = new Float32Array(numParticles * 3);

  generateSpiral();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  material = new THREE.PointsMaterial({
    color: colorList[currentColorIndex],
    size: 2.5,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });
  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('keydown', onKeyDown);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;

  for (let i = 0; i < numParticles; i++) {
    const i3 = i * 3;
    let dx = targets[i3 + 0] + Math.sin(time * 2.0 + i3 * 0.001) * 3 + Math.sin(i3 + time * 3.0) * 1.2 - positions[i3 + 0];
    let dy = targets[i3 + 1] + Math.sin(time * 1.5 + i3 * 0.002) * 3 + Math.cos(i3 + time * 2.0) * 1.2 - positions[i3 + 1];
    let dz = targets[i3 + 2] + Math.cos(time * 1.2 + i3 * 0.0015) * 3 + Math.sin(i3 + time * 2.5) * 1.2 - positions[i3 + 2];

    velocities[i3 + 0] += dx * 0.005;
    velocities[i3 + 1] += dy * 0.005;
    velocities[i3 + 2] += dz * 0.005;

    velocities[i3 + 0] *= 0.9;
    velocities[i3 + 1] *= 0.9;
    velocities[i3 + 2] *= 0.9;

    positions[i3 + 0] += velocities[i3 + 0];
    positions[i3 + 1] += velocities[i3 + 1];
    positions[i3 + 2] += velocities[i3 + 2];
  }

  particles.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

function onKeyDown(event) {
  const key = event.key.toUpperCase();
  const phrases = {'R': '人は自由なものとして生まれた。しかし至る所で鎖につながれている', 'K': '意志は自らを法とする', 'N': '神は死んだ。われわれが殺したのだ', 'H': '万人の万人に対する闘争', 'S': '存在とは何か', 'M': '哲学者たちは世界をさまざまに解釈してきた。重要なのはそれを変えることだ'};
  if (phrases[key]) {
    generateTextShape(phrases[key]);
  }
}

function generateSpiral() {
  for (let i = 0; i < numParticles; i++) {
    const angle = i * 0.1;
    const radius = 100;
    const height = (i / numParticles) * 600 - 300;
    positions[i * 3 + 0] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    targets[i * 3 + 0] = positions[i * 3 + 0];
    targets[i * 3 + 1] = positions[i * 3 + 1];
    targets[i * 3 + 2] = positions[i * 3 + 2];
  }
}

function generateTextShape(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const textPositions = [];
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const i = (y * canvas.width + x) * 4;
      const alpha = imageData[i + 3];
      if (alpha > 128) {
        const nx = x - canvas.width / 2;
        const ny = canvas.height / 2 - y;
        textPositions.push([nx * 0.5, ny * 0.5, 0]);
      }
    }
  }

  for (let i = 0; i < numParticles; i++) {
    const tp = textPositions[i % textPositions.length];
    targets[i * 3 + 0] = tp[0];
    targets[i * 3 + 1] = tp[1];
    targets[i * 3 + 2] = tp[2];
  }

  currentColorIndex = (currentColorIndex + 1) % colorList.length;
  material.color.setHex(colorList[currentColorIndex]);
}
