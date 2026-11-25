'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function ThreeDatabaseScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.022);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe4e4e7, 1.4);
    dirLight.position.set(6, 12, 10);
    scene.add(dirLight);

    const dbPointLight = new THREE.PointLight(0x38bdf8, 4.5, 16);
    dbPointLight.position.set(-7.5, 1, 3);
    scene.add(dbPointLight);

    const corePointLight = new THREE.PointLight(0xa1a1aa, 3.0, 12);
    corePointLight.position.set(0, 0, 3);
    scene.add(corePointLight);

    const s3PointLight = new THREE.PointLight(0x10b981, 5.0, 16);
    s3PointLight.position.set(7.5, 1, 3);
    scene.add(s3PointLight);

    // Subtle Perspective Floor Grid
    const gridHelper = new THREE.GridHelper(42, 28, 0x27272a, 0x18181b);
    gridHelper.position.y = -4.2;
    scene.add(gridHelper);

    // Root Group for Mouse Parallax
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // =========================================================================
    // 1. LEFT NODE: EC2 Database Cluster (Stacked Platters + WAL Ring)
    // =========================================================================
    const dbGroup = new THREE.Group();
    dbGroup.position.set(-7.5, 0, 0);
    rootGroup.add(dbGroup);

    const platterGeo = track(new THREE.CylinderGeometry(2.0, 2.0, 0.48, 32));
    const platterMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.75,
        roughness: 0.28,
      })
    );
    const rimGeo = track(new THREE.TorusGeometry(2.02, 0.035, 12, 48));
    const rimMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
      })
    );

    [-1.1, 0, 1.1].forEach((yOffset) => {
      const platter = new THREE.Mesh(platterGeo, platterMat);
      platter.position.y = yOffset;
      dbGroup.add(platter);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = yOffset + 0.24;
      dbGroup.add(rim);
    });

    const dbGyroGeo = track(new THREE.TorusGeometry(2.85, 0.04, 12, 64));
    const dbGyroMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
      })
    );
    const dbGyro = new THREE.Mesh(dbGyroGeo, dbGyroMat);
    dbGyro.rotation.x = Math.PI / 3;
    dbGroup.add(dbGyro);

    // =========================================================================
    // 2. CENTER NODE: VaultEngine Compression & Encryption Core
    // =========================================================================
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0.3, 0);
    rootGroup.add(coreGroup);

    const prismGeo = track(new THREE.OctahedronGeometry(1.15, 0));
    const prismMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xe4e4e7,
        metalness: 0.85,
        roughness: 0.18,
        emissive: 0x10b981,
        emissiveIntensity: 0.35,
      })
    );
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    coreGroup.add(prismMesh);

    const prismWireGeo = track(new THREE.OctahedronGeometry(1.45, 0));
    const prismWireMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      })
    );
    const prismWire = new THREE.Mesh(prismWireGeo, prismWireMat);
    coreGroup.add(prismWire);

    const ringOuterGeo = track(new THREE.TorusGeometry(2.15, 0.03, 12, 64));
    const ringOuterMat = track(
      new THREE.MeshBasicMaterial({
        color: 0xa1a1aa,
        transparent: true,
        opacity: 0.4,
      })
    );
    const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
    coreGroup.add(ringOuter);

    const ringInnerGeo = track(new THREE.TorusGeometry(1.8, 0.03, 12, 64));
    const ringInnerMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.55,
      })
    );
    const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
    ringInner.rotation.y = Math.PI / 2;
    coreGroup.add(ringInner);

    // =========================================================================
    // 3. RIGHT NODE: Amazon S3 Immutable Vault
    // =========================================================================
    const s3Group = new THREE.Group();
    s3Group.position.set(7.5, 0, 0);
    rootGroup.add(s3Group);

    const s3CoreGeo = track(new THREE.DodecahedronGeometry(1.6, 0));
    const s3CoreMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x064e3b,
        metalness: 0.65,
        roughness: 0.22,
        emissive: 0x10b981,
        emissiveIntensity: 0.55,
      })
    );
    const s3Core = new THREE.Mesh(s3CoreGeo, s3CoreMat);
    s3Group.add(s3Core);

    const s3ShieldGeo = track(new THREE.IcosahedronGeometry(2.45, 1));
    const s3ShieldMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
    );
    const s3Shield = new THREE.Mesh(s3ShieldGeo, s3ShieldMat);
    s3Group.add(s3Shield);

    const s3OrbitGeo = track(new THREE.TorusGeometry(2.9, 0.035, 12, 64));
    const s3OrbitMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.4,
      })
    );
    const s3Orbit = new THREE.Mesh(s3OrbitGeo, s3OrbitMat);
    s3Orbit.rotation.x = -Math.PI / 3;
    s3Group.add(s3Orbit);

    // =========================================================================
    // 4. MULTI-LANE 3D CURVED WAL/BINLOG STREAM + VERTEX-COLORED PACKETS
    // =========================================================================
    const curves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7.5, 0.8, 0),
        new THREE.Vector3(-3.8, 2.3, 1.2),
        new THREE.Vector3(0, 0.3, 0),
        new THREE.Vector3(3.8, 2.1, -1.0),
        new THREE.Vector3(7.5, 0.6, 0),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7.5, 0, 0),
        new THREE.Vector3(-3.8, 0.4, -1.4),
        new THREE.Vector3(0, 0.3, 0),
        new THREE.Vector3(3.8, 0.3, 1.3),
        new THREE.Vector3(7.5, 0, 0),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7.5, -0.8, 0),
        new THREE.Vector3(-3.8, -1.8, 0.8),
        new THREE.Vector3(0, 0.3, 0),
        new THREE.Vector3(3.8, -1.7, -0.9),
        new THREE.Vector3(7.5, -0.6, 0),
      ]),
    ];

    curves.forEach((curve, idx) => {
      const pts = curve.getPoints(64);
      const lineGeo = track(new THREE.BufferGeometry().setFromPoints(pts));
      const lineMat = track(
        new THREE.LineBasicMaterial({
          color: idx === 1 ? 0x10b981 : 0x38bdf8,
          transparent: true,
          opacity: idx === 1 ? 0.28 : 0.16,
        })
      );
      rootGroup.add(new THREE.Line(lineGeo, lineMat));
    });

    const packetCount = 420;
    const packetGeo = track(new THREE.BufferGeometry());
    const packetPos = new Float32Array(packetCount * 3);
    const packetCol = new Float32Array(packetCount * 3);
    const packetProgress = new Float32Array(packetCount);
    const packetSpeed = new Float32Array(packetCount);
    const packetLane = new Uint8Array(packetCount);

    const colorRaw = new THREE.Color(0x38bdf8);
    const colorMid = new THREE.Color(0xfafafa);
    const colorEnc = new THREE.Color(0x10b981);
    const tempColor = new THREE.Color();
    const tempVec = new THREE.Vector3();

    for (let i = 0; i < packetCount; i++) {
      packetProgress[i] = Math.random();
      packetSpeed[i] = 0.0022 + Math.random() * 0.0032;
      packetLane[i] = i % 3;
      curves[packetLane[i]].getPointAt(packetProgress[i], tempVec);
      packetPos[i * 3] = tempVec.x;
      packetPos[i * 3 + 1] = tempVec.y;
      packetPos[i * 3 + 2] = tempVec.z;
    }

    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    packetGeo.setAttribute('color', new THREE.BufferAttribute(packetCol, 3));

    const glowTexture = track(createGlowTexture());
    const packetMat = track(
      new THREE.PointsMaterial({
        size: 0.42,
        map: glowTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const packetSystem = new THREE.Points(packetGeo, packetMat);
    rootGroup.add(packetSystem);

    // Subtle Ambient Depth Dust
    const dustCount = 120;
    const dustGeo = track(new THREE.BufferGeometry());
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 32;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = track(
      new THREE.PointsMaterial({
        size: 0.12,
        color: 0x52525b,
        transparent: true,
        opacity: 0.5,
      })
    );
    rootGroup.add(new THREE.Points(dustGeo, dustMat));

    // Mouse Parallax
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / (rect.width || 1) - 0.5) * 2;
      targetY = -((e.clientY - rect.top) / (rect.height || 1) - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate EC2 Database Node
      dbGroup.position.y = Math.sin(elapsed * 1.1) * 0.22;
      dbGyro.rotation.z += delta * 0.45;
      dbGyro.rotation.y += delta * 0.25;

      // Animate Center VaultEngine Core
      prismMesh.rotation.y += delta * 0.7;
      prismMesh.rotation.x += delta * 0.35;
      prismWire.rotation.y -= delta * 0.45;
      ringOuter.rotation.x += delta * 0.5;
      ringOuter.rotation.y += delta * 0.3;
      ringInner.rotation.z -= delta * 0.65;
      ringInner.rotation.x += delta * 0.25;

      // Animate S3 Vault Node
      s3Group.position.y = Math.cos(elapsed * 1.0) * 0.22;
      s3Core.rotation.y -= delta * 0.4;
      s3Shield.rotation.y += delta * 0.22;
      s3Shield.rotation.z += delta * 0.15;
      s3Orbit.rotation.z -= delta * 0.5;

      // Smooth Parallax
      rootGroup.rotation.y += (targetX * 0.18 - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (-targetY * 0.1 - rootGroup.rotation.x) * 0.05;

      // Update Transaction Stream Packets
      const posAttr = packetGeo.attributes.position as THREE.BufferAttribute;
      const colAttr = packetGeo.attributes.color as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      for (let i = 0; i < packetCount; i++) {
        let p = packetProgress[i] + packetSpeed[i];
        if (p > 1.0) p -= 1.0;
        packetProgress[i] = p;

        curves[packetLane[i]].getPointAt(p, tempVec);
        posArr[i * 3] = tempVec.x;
        posArr[i * 3 + 1] = tempVec.y;
        posArr[i * 3 + 2] = tempVec.z;

        if (p < 0.45) {
          tempColor.copy(colorRaw).lerp(colorMid, p / 0.45);
        } else if (p < 0.55) {
          tempColor.copy(colorMid).lerp(colorEnc, (p - 0.45) / 0.1);
        } else {
          tempColor.copy(colorEnc);
        }

        colArr[i * 3] = tempColor.r;
        colArr[i * 3 + 1] = tempColor.g;
        colArr[i * 3 + 2] = tempColor.b;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 800;
      const newHeight = container.clientHeight || 380;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden bg-[#09090b] border border-zinc-800/80">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Minimal Telemetry HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 px-4 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800/80 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>EC2 HOST · WAL / BINLOG</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800/80 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
          <span>VAULTENGINE · ZSTD + AES-256</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800/80 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AMAZON S3 · IMMUTABLE PITR</span>
        </div>
      </div>
    </div>
  );
}
