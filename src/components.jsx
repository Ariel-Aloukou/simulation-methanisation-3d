import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GLOSSARY } from "./glossary";

// --- Label 3D ---
export function Label({ children, position = [0, 0, 0], color = "#65C99A", style = {} }) {
  return (
    <Html center position={position} distanceFactor={10}>
      <div className="scene-label" style={{ color, borderColor: color, ...style }}>
        {children}
      </div>
    </Html>
  );
}

// --- Terme glossaire avec tooltip ---
export function GlossaryTerm({ term, children }) {
  const [hovered, setHovered] = useState(false);
  const entry = GLOSSARY[term];
  if (!entry) return <>{children || term}</>;
  return (
    <span
      className="glossary-term"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", borderBottom: "1px dotted #65C99A", cursor: "help" }}
    >
      {children || entry.term}
      {hovered && (
        <span className="glossary-tooltip">
          <strong>{entry.term}</strong><br />
          {entry.shortDef}
        </span>
      )}
    </span>
  );
}

// --- Panneau glossaire complet ---
export function GlossaryPanel({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="glossary-overlay" onClick={onClose}>
      <div className="glossary-panel" onClick={e => e.stopPropagation()}>
        <div className="glossary-panel-header">
          <span className="panel-title">GLOSSAIRE TECHNIQUE</span>
          <button className="glossary-close" onClick={onClose}>✕</button>
        </div>
        <div className="glossary-list">
          {Object.entries(GLOSSARY).map(([key, entry]) => (
            <div key={key} className="glossary-item">
              <div className="glossary-item-term">{entry.term}</div>
              <div className="glossary-item-def">{entry.definition}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Tuyau avec flux ---
export function Pipe({ from, to, color = "#65C99A", pulse = false, width = 0.15, xray }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

  return (
    <group>
      <mesh position={mid} quaternion={q} castShadow receiveShadow>
        <cylinderGeometry args={[width, width, len, 16]} />
        {xray
          ? <meshPhysicalMaterial color={color} transparent opacity={0.2} roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
          : <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />}
      </mesh>
      <mesh position={from} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={to} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      {pulse && <FlowParticle from={from} to={to} color={color} count={8} />}
    </group>
  );
}

// --- Particules de flux (multi-particules) ---
function FlowParticle({ from, to, color, count = 8 }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <SingleParticle key={i} a={a} b={b} color={color} offset={i / count} />
      ))}
    </group>
  );
}

function SingleParticle({ a, b, color, offset }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = (offset + clock.getElapsedTime() * 0.25) % 1;
      ref.current.position.lerpVectors(a, b, t);
      const glow = 0.8 + Math.sin(clock.getElapsedTime() * 4 + offset * 10) * 0.4;
      ref.current.material.emissiveIntensity = glow;
      ref.current.scale.setScalar(0.7 + Math.sin(clock.getElapsedTime() * 3 + offset * 8) * 0.3);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 10, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.9} />
    </mesh>
  );
}

// --- Sol multi-zones ---
export function ConcreteGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[70, 20]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 12]} receiveShadow>
        <planeGeometry args={[70, 6]} />
        <meshStandardMaterial color="#8A8A7A" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -8]} receiveShadow>
        <planeGeometry args={[70, 6]} />
        <meshStandardMaterial color="#8A8A7A" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.07, 7]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#7A7A6A" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -20]} receiveShadow>
        <planeGeometry args={[100, 30]} />
        <meshStandardMaterial color="#6B5B4A" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 30]} receiveShadow>
        <planeGeometry args={[100, 30]} />
        <meshStandardMaterial color="#6B5B4A" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

// --- Herbe autour du sol ---
export function Grass() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, -0.05, -25]} receiveShadow>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, -0.05, -25]} receiveShadow>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -25]} receiveShadow>
        <planeGeometry args={[50, 10]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
    </group>
  );
}

// --- Arbre simple ---
export function Tree({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.2, 3, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

// --- Clôture de sécurité ---
export function Fence({ position = [0, 0, 0], length = 10 }) {
  return (
    <group position={position}>
      {Array.from({ length: Math.floor(length / 2) }, (_, i) => (
        <group key={i} position={[i * 2, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshStandardMaterial color="#5A6A72" metalness={0.6} />
          </mesh>
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[2, 0.1, 0.1]} />
            <meshStandardMaterial color="#5A6A72" metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- Panneaux solaires ---
export function SolarPanel({ position = [0, 0, 0] }) {
  return (
    <group position={position} rotation={[Math.PI / 4, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#1A237E" metalness={0.8} />
      </mesh>
    </group>
  );
}

// --- Camion de collecte ---
export function Truck({ position = [0, 0, 0] }) {
  const wheelRef = useRef();
  useFrame(({ clock }) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x += 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[3, 1.5, 1.5]} />
        <meshStandardMaterial color="#FF5722" metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <group ref={wheelRef}>
        <mesh position={[-1, 0.5, 0.8]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-1, 0.5, -0.8]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[1, 0.5, 0.8]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[1, 0.5, -0.8]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    </group>
  );
}

// --- Fumée (particules animées) ---
export function Smoke({ position = [0, 0, 0], color = "#808080" }) {
  const particles = useMemo(() => {
    const count = 50;
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * 2,
        Math.random() * 3,
        (Math.random() - 0.5) * 2,
      ]);
    }
    return positions;
  }, []);

  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.children.forEach((particle, i) => {
        particle.position.y += 0.02 + Math.sin(clock.getElapsedTime() * 2 + i) * 0.01;
        particle.position.x += Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.01;
        particle.position.z += Math.cos(clock.getElapsedTime() * 0.3 + i) * 0.01;
        if (particle.position.y > 5) {
          particle.position.y = 0;
        }
      });
    }
  });

  return (
    <group ref={ref} position={position}>
      {particles.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- Opérateur (personnage simple) ---
export function Worker({ position = [0, 0, 0] }) {
  const headRef = useRef();
  const armRef = useRef();
  useFrame(({ clock }) => {
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
    if (armRef.current) {
      armRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.5) * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial color="#1E88E5" />
      </mesh>
      <mesh ref={headRef} position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFC107" />
      </mesh>
      <group ref={armRef} position={[0, 1, 0]}>
        <mesh position={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#1E88E5" />
        </mesh>
        <mesh position={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#1E88E5" />
        </mesh>
      </group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
}

// --- Projecteur (éclairage local) ---
export function Spotlight({ position = [0, 0, 0], color = "#FFFFFF", intensity = 1 }) {
  return (
    <group position={position}>
      <spotLight
        color={color}
        intensity={intensity}
        distance={20}
        angle={Math.PI / 6}
        penumbra={0.5}
        castShadow
      />
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
    </group>
  );
}
