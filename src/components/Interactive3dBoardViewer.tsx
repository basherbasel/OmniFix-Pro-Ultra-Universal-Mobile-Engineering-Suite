import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PcbComponent {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  descriptionAr: string;
  descriptionEn: string;
}

const PCB_COMPONENTS: PcbComponent[] = [
  { 
    id: 'cpu', 
    name: 'CPU (Qualcomm SM8650)', 
    position: [0, 0.15, 0], 
    size: [2, 0.25, 2], 
    color: '#334155',
    descriptionAr: 'المعالج الرئيسي: قلب الجهاز المسؤول عن العمليات الحسابية والصناعية.',
    descriptionEn: 'Main Processor: The core of the device responsible for all computation.'
  },
  { 
    id: 'pmic', 
    name: 'Main PMIC', 
    position: [-1.5, 0.1, 1.5], 
    size: [0.8, 0.15, 0.8], 
    color: '#475569',
    descriptionAr: 'آيسي الباور الرئيسي: المسؤول عن توزيع الجهد لكافة القطع والدوائر الفرعية.',
    descriptionEn: 'Primary Power Management IC: Distributes power rails to all logic subsystems.'
  },
  { 
    id: 'storage', 
    name: 'UFS 4.0 Storage', 
    position: [1.8, 0.1, -0.5], 
    size: [1.2, 0.15, 1.5], 
    color: '#1e293b',
    descriptionAr: 'ذاكرة التخزين الدائمة: مساحة تخزين نظام التشغيل وملفات الفيرموير.',
    descriptionEn: 'Flash Storage: High-speed NAND storing OS partition images.'
  },
  { 
    id: 'wifi', 
    name: 'Wi-Fi/BT Module', 
    position: [-2, 0.1, -1.8], 
    size: [0.7, 0.12, 0.7], 
    color: '#64748b',
    descriptionAr: 'وحدة الاتصالات اللاسلكية: معالج ترددات الواي فاي والبلوتوث.',
    descriptionEn: 'Connectivity Module: Integrated Wi-Fi and Bluetooth transceiver.'
  },
  { 
    id: 'rf-transceiver', 
    name: 'RF Transceiver', 
    position: [2.2, 0.1, 1.8], 
    size: [0.6, 0.12, 0.6], 
    color: '#475569',
    descriptionAr: 'ترانسفير الشبكة: معالج ترددات الراديو والربط مع المودم.',
    descriptionEn: 'Radio Frequency Transceiver: Filters and processes cellular RF bands.'
  }
];

export function Interactive3dBoardViewer({ 
  highlightComponentId, 
  lang 
}: { 
  highlightComponentId?: string | null; 
  lang: 'en' | 'ar' 
}) {
  const isAr = lang === 'ar';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedComp = PCB_COMPONENTS.find(c => c.id === highlightComponentId);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Slate-950

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 6, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.autoRotate = !highlightComponentId;
    controls.autoRotateSpeed = 1.0;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2, 10);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);

    // Main PCB Board
    const boardGeo = new THREE.BoxGeometry(6, 0.15, 5);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.3,
      metalness: 0.2
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.set(0, -0.075, 0);
    boardMesh.receiveShadow = true;
    scene.add(boardMesh);

    // Grid / Copper Traces Grid
    const gridHelper = new THREE.GridHelper(6, 24, 0x065f46, 0x042f2e);
    gridHelper.position.set(0, 0.01, 0);
    scene.add(gridHelper);

    // Render Components
    const meshesMap = new Map<string, THREE.Mesh>();
    PCB_COMPONENTS.forEach((comp) => {
      const geo = new THREE.BoxGeometry(...comp.size);
      const isHighlighted = highlightComponentId === comp.id;
      
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(isHighlighted ? '#fbbf24' : comp.color),
        emissive: new THREE.Color(isHighlighted ? '#f59e0b' : '#000000'),
        emissiveIntensity: isHighlighted ? 0.6 : 0,
        roughness: 0.2,
        metalness: 0.5
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...comp.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshesMap.set(comp.id, mesh);
    });
    meshesMapRef.current = meshesMap;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsate highlighted mesh
      if (highlightComponentId && meshesMap.has(highlightComponentId)) {
        const targetMesh = meshesMap.get(highlightComponentId);
        if (targetMesh && targetMesh.material instanceof THREE.MeshStandardMaterial) {
          const pulse = (Math.sin(elapsedTime * 6) + 1) / 2;
          targetMesh.material.emissiveIntensity = 0.3 + pulse * 0.7;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [highlightComponentId]);

  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-800 relative shadow-2xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10 pointer-events-none z-10" />
      
      {/* Header Info */}
      <div className="absolute top-6 left-6 z-20 space-y-1">
        <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">
          {isAr ? 'محاكاة البوردة ثلاثية الأبعاد' : '3D PCB NEURAL SIMULATOR'}
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          {isAr ? 'عرض المكونات والمسارات التفاعلية' : 'Interactive Component & Trace Visualizer'}
        </p>
      </div>

      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <div className="px-3 py-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full text-[9px] font-black text-emerald-400 tracking-widest">
          {isAr ? 'وضع التشخيص' : 'DIAGNOSTIC MODE'}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Selected Component Card overlay */}
      <AnimatePresence>
        {selectedComp && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute bottom-6 right-6 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl z-20 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <div className="w-4 h-4 bg-amber-500 rounded-sm animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-black text-xs uppercase tracking-wider">{selectedComp.name}</h4>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">FAULT DETECTED</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              {isAr ? selectedComp.descriptionAr : selectedComp.descriptionEn}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ref ID: {selectedComp.id.toUpperCase()}</span>
              <button className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors">
                {isAr ? 'فحص الممانعة' : 'DIODE TEST'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engine Status Indicators */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500" />
             <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">3D WEBGL ENGINE ACTIVE</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">HARDWARE SHADERS ACTIVE</span>
           </div>
        </div>
      </div>
    </div>
  );
}
