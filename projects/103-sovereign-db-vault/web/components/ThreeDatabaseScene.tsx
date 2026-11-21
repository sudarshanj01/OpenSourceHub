'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDatabaseScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Database Core Mesh (Left Center)
    const dbGeometry = new THREE.IcosahedronGeometry(4, 1);
    const dbMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const dbMesh = new THREE.Mesh(dbGeometry, dbMaterial);
    dbMesh.position.set(-6, 0, 0);
    scene.add(dbMesh);

    // Inner Glowing Core
    const coreGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    dbMesh.add(coreMesh);

    // 2. Amazon S3 Storage Node (Right Center)
    const s3Geometry = new THREE.OctahedronGeometry(3.5, 1);
    const s3Material = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const s3Mesh = new THREE.Mesh(s3Geometry, s3Material);
    s3Mesh.position.set(6, 0, 0);
    scene.add(s3Mesh);

    // S3 Inner Core
    const s3CoreGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const s3CoreMaterial = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const s3CoreMesh = new THREE.Mesh(s3CoreGeometry, s3CoreMaterial);
    s3Mesh.add(s3CoreMesh);

    // 3. Flowing Transaction Particles (WAL & Binlog stream)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const progress = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      progress[i] = Math.random();
      speeds[i] = 0.003 + Math.random() * 0.005;
      const x = -6 + progress[i] * 12;
      const y = Math.sin(progress[i] * Math.PI) * 2.5 + (Math.random() - 0.5) * 1.2;
      const z = (Math.random() - 0.5) * 2;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xa5b4fc,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 4. Arc connecting DB to S3
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(0, 3.5, 0),
      new THREE.Vector3(6, 0, 0)
    );
    const curvePoints = curve.getPoints(50);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
    });
    const arcLine = new THREE.Line(lineGeo, lineMat);
    scene.add(arcLine);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate Nodes
      dbMesh.rotation.y += delta * 0.4;
      dbMesh.rotation.x += delta * 0.2;
      s3Mesh.rotation.y -= delta * 0.35;
      s3Mesh.rotation.z += delta * 0.2;

      // Parallax smoothly
      scene.rotation.y += (mouseX * 0.2 - scene.rotation.y) * 0.05;
      scene.rotation.x += (-mouseY * 0.15 - scene.rotation.x) * 0.05;

      // Update Particle Stream
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        progress[i] += speeds[i];
        if (progress[i] > 1.0) progress[i] = 0;

        const p = progress[i];
        posArray[i * 3] = -6 + p * 12;
        posArray[i * 3 + 1] = Math.sin(p * Math.PI) * 2.8 + (Math.sin(p * 20 + i) * 0.3);
        posArray[i * 3 + 2] = Math.cos(p * 15 + i) * 0.5;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] flex items-center justify-center overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[11px] font-mono text-zinc-500 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>PostgreSQL / MySQL Cluster</span>
        </div>
        <div className="text-zinc-600">Continuous 0-RPO WAL Stream</div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Amazon S3 Shards</span>
        </div>
      </div>
    </div>
  );
}
