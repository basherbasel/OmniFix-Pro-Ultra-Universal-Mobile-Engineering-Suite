import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';

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
    position: [0, 0.1, 0], 
    size: [2, 0.2, 2], 
    color: '#334155',
    descriptionAr: 'المعالج الرئيسي: قلب الجهاز المسؤول عن العمليات الحسابية.',
    descriptionEn: 'Main Processor: The core of the device responsible for all computation.'
  },
  { 
    id: 'pmic', 
    name: 'Main PMIC', 
    position: [-1.5, 0.05, 1.5], 
    size: [0.8, 0.1, 0.8], 
    color: '#475569',
    descriptionAr: 'آيسي الباور الرئيسي: المسؤول عن توزيع الجهد لكافة القطع.',
    descriptionEn: 'Primary Power Management IC: Distributes voltage to all components.'
  },
  { 
    id: 'storage', 
    name: 'UFS 4.0 Storage', 
    position: [1.8, 0.05, -0.5], 
    size: [1.2, 0.1, 1.5], 
    color: '#1e293b',
    descriptionAr: 'ذاكرة التخزين: مساحة تخزين النظام والبيانات.',
    descriptionEn: 'Storage Memory: House for the OS and user data.'
  },
  { 
    id: 'wifi', 
    name: 'Wi-Fi/BT Module', 
    position: [-2, 0.05, -1.8], 
    size: [0.7, 0.1, 0.7], 
    color: '#64748b',
    descriptionAr: 'وحدة الاتصال: المسؤولة عن شبكات الواي فاي والبلوتوث.',
    descriptionEn: 'Connectivity Module: Responsible for Wi-Fi and Bluetooth.'
  },
  { 
    id: 'rf-transceiver', 
    name: 'RF Transceiver', 
    position: [2.2, 0.05, 1.8], 
    size: [0.6, 0.1, 0.6], 
    color: '#475569',
    descriptionAr: 'ترانسفير الشبكة: معالج ترددات الراديو.',
    descriptionEn: 'Radio Frequency Transceiver: Processes cellular signals.'
  }
];

function Board({ highlightedId }: { highlightedId?: string | null }) {
  return (
    <group>
      {/* Main Board Substrate */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <boxGeometry args={[6, 5, 0.1]} />
        <meshStandardMaterial color="#064e3b" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Decorative Traces */}
      <gridHelper args={[6, 20, 0x065f46, 0x065f46]} position={[0, 0.01, 0]} rotation={[0, 0, 0]} />

      {/* Components */}
      {PCB_COMPONENTS.map((comp) => {
        const isHighlighted = highlightedId === comp.id;
        return (
          <group key={comp.id} position={comp.position}>
            <mesh castShadow>
              <boxGeometry args={comp.size} />
              <meshStandardMaterial 
                color={isHighlighted ? '#fbbf24' : comp.color} 
                emissive={isHighlighted ? '#fbbf24' : '#000000'}
                emissiveIntensity={isHighlighted ? 0.5 : 0}
                roughness={0.2}
              />
            </mesh>
            {isHighlighted && (
              <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text
                  position={[0, comp.size[1] + 0.5, 0]}
                  fontSize={0.2}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFM8nzAZZ-P7V4_kP_n6-Q_mD_mD_mD.woff"
                >
                  {comp.name}
                </Text>
              </Float>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function Interactive3dBoardViewer({ 
  highlightComponentId, 
  lang 
}: { 
  highlightComponentId?: string | null; 
  lang: 'en' | 'ar' 
}) {
  const isAr = lang === 'ar';
  const selectedComp = PCB_COMPONENTS.find(c => c.id === highlightComponentId);

  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-800 relative shadow-2xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10 pointer-events-none z-10" />
      
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

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={40} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          
          <Board highlightedId={highlightComponentId} />
          
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 6} 
            maxPolarAngle={Math.PI / 2.1} 
            autoRotate={!highlightComponentId} 
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

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
              <button className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                {isAr ? 'فحص الممانعة' : 'DIODE TEST'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500" />
             <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">3D ENGINE ACTIVE</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">REAL-TIME SHADERS</span>
           </div>
        </div>
      </div>
    </div>
  );
}
