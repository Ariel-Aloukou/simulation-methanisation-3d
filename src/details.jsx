import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Label } from "./components";

// --- Jauge animée ---
function AnimatedGauge({ position, unit, baseValue, color, fluctuation = 0.1, decimals = 1 }) {
  const [value, setValue] = useState(baseValue);
  const timer = useRef(0);
  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current > 0.5) {
      timer.current = 0;
      setValue(+(baseValue + (Math.random() - 0.5) * fluctuation * 2).toFixed(decimals));
    }
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      <Html position={[0, 0, 0.15]} center style={{ pointerEvents: "none" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#111", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
          {value}{unit}
        </div>
      </Html>
      <mesh position={[0, 0, 0.08]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#333" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[0.04, 0.5, 0.04]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
      </mesh>
    </group>
  );
}

// --- Instrumentation (manomètres, capteurs, vannes) ---
export function Instrumentation() {
  return (
    <group>
      <AnimatedGauge position={[-2, 5, 4]} unit=" bar" baseValue={1.2} color="#4ADE80" fluctuation={0.05} decimals={1} />
      <AnimatedGauge position={[-2, 5, -4]} unit="°C" baseValue={37.4} color="#F87171" fluctuation={0.3} decimals={1} />
      <group position={[-2, 3, 4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
          <meshStandardMaterial color="#4A5A62" metalness={0.8} />
        </mesh>
        <mesh position={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.06]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
        </mesh>
      </group>
      <group position={[2, 3, -4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
          <meshStandardMaterial color="#4A5A62" metalness={0.8} />
        </mesh>
        <mesh position={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.06]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// --- Détecteur de gaz (sécurité) ---
export function GasDetector({ position = [0, 0, 0] }) {
  const ledRef = useRef();
  useFrame(({ clock }) => {
    if (ledRef.current) {
      ledRef.current.material.emissiveIntensity = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.5;
    }
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.2, 0.15]} />
        <meshStandardMaterial color="#E65100" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh ref={ledRef} position={[0, 0.11, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.08]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[0.04, 0.4, 0.04]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.12, 0.08]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} />
      </mesh>
    </group>
  );
}

// --- Sirène d'alarme animée ---
export function Siren({ position = [0, 0, 0] }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 3;
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 24]} />
        <meshStandardMaterial color="#FF0000" metalness={0.5} roughness={0.4} />
      </mesh>
      <group ref={ref}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <coneGeometry args={[0.25, 0.25, 24]} />
          <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={0.5} metalness={0.4} />
        </mesh>
        <pointLight color="#FF0000" intensity={0.6} distance={5} />
      </group>
      <mesh position={[0, -0.6, 0]} castShadow>
        <boxGeometry args={[0.04, 0.8, 0.04]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
      </mesh>
    </group>
  );
}

// --- Panneau de contrôle local ---
export function ControlPanel({ position = [0, 0, 0] }) {
  const led1 = useRef();
  const led2 = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (led1.current) led1.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.5;
    if (led2.current) led2.current.material.emissiveIntensity = 0.5 + Math.cos(t * 3) * 0.5;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.35]} />
        <meshStandardMaterial color="#7A8A92" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.7, 0.18]} castShadow>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial color="#111" metalness={0.3} />
      </mesh>
      <Html position={[0, 1.7, 0.21]} center style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "9px", color: "#4ADE80", fontFamily: "monospace" }}>OK</div>
      </Html>
      <mesh ref={led1} position={[-0.12, 1.5, 0.18]} castShadow>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={1} />
      </mesh>
      <mesh ref={led2} position={[0.12, 1.5, 0.18]} castShadow>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.3} />
      </mesh>
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 1.25, 0.18]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// --- Mât d'éclairage industriel ---
export function LightPole({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 8, 12]} />
        <meshStandardMaterial color="#7A7A7A" metalness={0.7} />
      </mesh>
      <mesh position={[0, 8.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
        <meshStandardMaterial color="#7A7A7A" metalness={0.7} />
      </mesh>
      <mesh position={[0.5, 8, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#F5F5DC" metalness={0.3} roughness={0.4} />
      </mesh>
      <pointLight position={[0.5, 7.5, 0]} intensity={0.4} color="#FFF8E1" distance={15} />
    </group>
  );
}

// --- Pompe à digestat ---
export function DigestatePump({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.5, 2]} />
        <meshStandardMaterial color="#8A9094" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 20]} />
        <meshStandardMaterial color="#B0B8BC" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.8, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.45]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.5, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 12]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
      </mesh>
      <mesh position={[-0.9, 0.6, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 12]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.7} />
      </mesh>
      <mesh position={[0.9, 0.6, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 12]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.7} />
      </mesh>
    </group>
  );
}

// --- Extincteurs ---
export function Extinguisher({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
        <meshStandardMaterial color="#CC0000" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
        <meshStandardMaterial color="#333333" metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.74, 0.04]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.6} />
      </mesh>
      <mesh position={[0.03, 0.55, 0.07]}>
        <boxGeometry args={[0.06, 0.15, 0.02]} />
        <meshStandardMaterial color="#F5F5F5" metalness={0.2} />
      </mesh>
    </group>
  );
}

// --- Câblage / conduits électriques ---
export function CableTray({ points }) {
  return (
    <group>
      {points.map((p, i) => {
        if (i === points.length - 1) return null;
        const a = new THREE.Vector3(...points[i]);
        const b = new THREE.Vector3(...points[i + 1]);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a);
        const len = dir.length();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return (
          <group key={i}>
            <mesh position={mid} quaternion={q}>
              <boxGeometry args={[0.12, len, 0.06]} />
              <meshStandardMaterial color="#4A4A4A" metalness={0.5} roughness={0.5} />
            </mesh>
            {i % 2 === 0 && (
              <mesh position={[points[i][0], points[i][1] - 0.2, points[i][2]]} castShadow>
                <boxGeometry args={[0.06, 0.4, 0.06]} />
                <meshStandardMaterial color="#6A6A6A" metalness={0.6} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// --- Caniveaux de drainage ---
export function DrainageDitch({ from, to }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return (
    <group>
      <mesh position={[mid.x, mid.y - 0.15, mid.z]} quaternion={q}>
        <boxGeometry args={[0.8, len, 0.3]} />
        <meshStandardMaterial color="#6B6B5A" roughness={0.95} metalness={0.05} transparent opacity={0.7} />
      </mesh>
      <mesh position={[from[0], from[1] - 0.15, from[2]]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#5A5A4A" roughness={0.95} />
      </mesh>
    </group>
  );
}

// --- Vannes à brides ---
export function FlangedValve({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
      </mesh>
      <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
      </mesh>
      <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 16]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.7} />
      </mesh>
    </group>
  );
}

// --- Trappes de visite ---
export function ManholeCover({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 24]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.02, 8, 16]} />
        <meshStandardMaterial color="#6A6A6A" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#6A6A6A" metalness={0.8} />
      </mesh>
    </group>
  );
}

// --- Containment détaillé (double paroi + pompe relevage) ---
export function DetailedContainment({ position = [0, 0, 0], radius = 5.5 }) {
  return (
    <group position={position}>
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x = Math.sin(angle) * (radius + 0.3);
        const z = Math.cos(angle) * (radius + 0.3);
        return (
          <mesh key={`outer-${i}`} position={[x, 0.3, z]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[1.5, 0.6, 0.12]} />
            <meshStandardMaterial color="#A0A8AC" roughness={0.9} metalness={0.1} />
          </mesh>
        );
      })}
      <mesh position={[radius + 0.5, 0.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#2E5090" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[radius + 0.5, 0.35, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
      </mesh>
    </group>
  );
}
