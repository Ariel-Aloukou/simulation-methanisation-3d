import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Label, Truck, Worker, Fence, Smoke, Spotlight } from "./components";
import { ManholeCover } from "./details";
import { STAGES } from "./data";

// --- 1. Tas de déchets (Collecte) ---
export function WastePile({ onClick }) {
  const items = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        p: [(Math.random() - 0.5) * 3, Math.random() * 1.5, (Math.random() - 0.5) * 2],
        s: 0.2 + Math.random() * 0.3,
        r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      })),
    []
  );

  return (
    <group position={[-20, 0, 0]} onClick={onClick}>
      <group position={[-1, 0, 0]}>
        {items.map((d, i) => (
          <mesh key={i} position={d.p} rotation={d.r} scale={d.s} castShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={i % 4 === 0 ? "#4F6845" : i % 3 === 0 ? "#8C6A43" : "#6D5338"}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>
      <Truck position={[2, 0, 1]} />
      <Label position={[0, 2.5, 0]} color="#B88955">
        DÉCHETS ORGANIQUES
      </Label>
      <Label position={[0, 2, 0]} color="#B88955" style={{ fontSize: "10px" }}>
        (Fumier, déchets alimentaires, résidus agricoles)
      </Label>
      <Worker position={[1, 0, -1]} />
    </group>
  );
}

// --- 2. Station de tri (hangar industriel réaliste) ---
export function SortingStation({ onClick, xray }) {
  return (
    <group position={[-12, 0, 0]} onClick={onClick}>
      <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 4.5, 5]} />
        {xray
          ? <meshPhysicalMaterial color="#8A9AA2" transparent opacity={0.2} transmission={0.3} roughness={0.6} metalness={0.3} side={THREE.DoubleSide} />
          : <meshStandardMaterial color="#7A8A92" metalness={0.4} roughness={0.6} />}
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`wall-${i}`} position={[-3 + i * 0.6, 2.25, 2.51]} castShadow>
          <boxGeometry args={[0.05, 4.5, 0.1]} />
          <meshStandardMaterial color="#8A9AA2" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 4.6, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[6.2, 0.12, 3]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.6, 0]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[6.2, 0.12, 3]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.8, 0]} castShadow>
        <boxGeometry args={[6.3, 0.15, 0.2]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.3, 2.52]} castShadow>
        <boxGeometry args={[2.5, 2.6, 0.1]} />
        <meshStandardMaterial color="#6A7A82" metalness={0.3} roughness={0.5} />
      </mesh>
      {[0, 0.65, 1.3].map((y, i) => (
        <mesh key={`panel-${i}`} position={[0, 0.65 + y, 2.57]} castShadow>
          <boxGeometry args={[2.4, 0.03, 0.02]} />
          <meshStandardMaterial color="#5A6A72" metalness={0.4} />
        </mesh>
      ))}
      <group position={[4.5, 1.5, 0]} rotation={[0, 0, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[4, 0.6, 0.8]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.31, 0]} castShadow>
          <boxGeometry args={[3.8, 0.05, 0.6]} />
          <meshStandardMaterial color="#2A2A2A" roughness={0.8} />
        </mesh>
        {[-1.2, 0, 1.2].map((x, i) => (
          <mesh key={`roller-${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.8, 12]} />
            <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
          </mesh>
        ))}
      </group>
      <mesh position={[3.5, 3.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-3.5, 0.5, 1]} castShadow>
        <boxGeometry args={[1.2, 1, 1]} />
        <meshStandardMaterial color="#4A7C59" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-3.5, 0.5, -0.5]} castShadow>
        <boxGeometry args={[1.2, 1, 1]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
      </mesh>
      <Label position={[0, 5.5, 0]} color="#B88955">
        RÉCEPTION / TRI
      </Label>
      <Label position={[0, 5, 0]} color="#B88955" style={{ fontSize: "10px" }}>
        (Hangar industriel — séparation des indésirables)
      </Label>
      <Worker position={[2, 0, -1.5]} />
    </group>
  );
}

// --- 3. Broyeur / Mélangeur ---
export function Mixer({ onClick, xray }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 1.2;
  });

  return (
    <group position={[-4, 0, 0]} onClick={onClick}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2, 3, 48]} />
        {xray
          ? <meshPhysicalMaterial color="#5A7A88" transparent opacity={0.25} transmission={0.3} roughness={0.6} metalness={0.3} side={THREE.DoubleSide} />
          : <meshStandardMaterial color="#46555A" metalness={0.8} roughness={0.3} />}
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[2.1, 2.1, 0.2, 48]} />
        <meshStandardMaterial color="#69C799" emissive="#163B2A" emissiveIntensity={0.6} metalness={0.7} />
      </mesh>
      <group ref={ref} position={[0, 1.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 4.5, 16]} />
          <meshStandardMaterial color="#3A4A52" metalness={0.9} />
        </mesh>
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} position={[0, (i - 1.5) * 1.2, 0]} rotation={[0, 0, i * (Math.PI / 2)]}>
            <mesh castShadow>
              <boxGeometry args={[1.8, 0.1, 0.15]} />
              <meshStandardMaterial color="#5A6A72" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[-2.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <mesh position={[2.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <Label position={[0, 4, 0]} color="#C99A61">
        BROYEUR / MÉLANGEUR
      </Label>
      <Label position={[0, 3.5, 0]} color="#C99A61" style={{ fontSize: "10px" }}>
        (Homogénéisation du substrat)
      </Label>
      <Worker position={[2, 0, -1]} />
    </group>
  );
}

// --- 4. Méthaniseur (cuve béton, dôme EPDM, agitateurs) ---
export function Digester({ onClick, xray }) {
  const domeRef = useRef();
  const sideAgitatorRef = useRef();
  const topAgitatorRef = useRef();
  const bubblesRef = useRef();

  useFrame(({ clock }) => {
    if (domeRef.current) {
      domeRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.005;
    }
    if (sideAgitatorRef.current) {
      sideAgitatorRef.current.rotation.y += 0.005;
    }
    if (topAgitatorRef.current) {
      topAgitatorRef.current.rotation.y += 0.008;
    }
    if (bubblesRef.current && xray) {
      bubblesRef.current.children.forEach((b, i) => {
        b.position.y += 0.015 + Math.sin(clock.getElapsedTime() * 2 + i) * 0.005;
        if (b.position.y > 6.5) b.position.y = 0.5;
      });
    }
  });

  const bodyMat = xray
    ? <meshPhysicalMaterial color="#88A8A0" transparent opacity={0.35} transmission={0.25} roughness={0.8} metalness={0.1} side={THREE.DoubleSide} />
    : <meshStandardMaterial color="#B0B8BC" roughness={0.85} metalness={0.1} />;

  const domeMat = xray
    ? <meshStandardMaterial color="#D0D8DC" transparent opacity={0.25} roughness={0.7} metalness={0.05} />
    : <meshStandardMaterial color="#E0E0E0" roughness={0.7} metalness={0.05} />;

  return (
    <group position={[4, 0, 0]} onClick={onClick}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.2, 64]} />
        <meshStandardMaterial color="#8A9296" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 4, 7, 64]} />
        {bodyMat}
      </mesh>
      {[1.5, 3, 4.5, 6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <torusGeometry args={[4.02, 0.06, 8, 64]} />
          <meshStandardMaterial color="#9AA0A4" roughness={0.8} metalness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, 7, 0]} castShadow>
        <cylinderGeometry args={[4.1, 4.1, 0.3, 64]} />
        <meshStandardMaterial color="#A0A8AC" roughness={0.8} metalness={0.15} />
      </mesh>
      <mesh ref={domeRef} position={[0, 7, 0]} castShadow>
        <sphereGeometry args={[4.1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {domeMat}
      </mesh>
      <mesh position={[0, 7, 0]} castShadow>
        <torusGeometry args={[4.1, 0.12, 8, 64]} />
        <meshStandardMaterial color="#6D6D6D" metalness={0.7} roughness={0.3} />
      </mesh>
      {xray && (
        <>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[3.8, 3.8, 5.5, 48]} />
            <meshStandardMaterial color="#4A6B3A" transparent opacity={0.5} roughness={0.6} />
          </mesh>
          <mesh position={[0, 5.8, 0]}>
            <cylinderGeometry args={[3.8, 3.8, 0.3, 48]} />
            <meshStandardMaterial color="#5A8048" transparent opacity={0.35} roughness={0.5} />
          </mesh>
          <group ref={bubblesRef}>
            {Array.from({ length: 15 }, (_, i) => (
              <mesh key={i} position={[(Math.random() - 0.5) * 5, 0.5 + Math.random() * 6, (Math.random() - 0.5) * 5]}>
                <sphereGeometry args={[0.08 + Math.random() * 0.12, 8, 8]} />
                <meshStandardMaterial color="#B8D8A0" transparent opacity={0.5} emissive="#5A8048" emissiveIntensity={0.3} />
              </mesh>
            ))}
          </group>
        </>
      )}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`seam-${i}`} position={[Math.sin(angle) * 2, 7.8, Math.cos(angle) * 2]} rotation={[0, -angle, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.02, 3, 0.02]} />
            <meshStandardMaterial color="#C8C8C8" roughness={0.5} metalness={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, 8.3, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.6} roughness={0.4} />
      </mesh>
      <ManholeCover position={[2, 8.2, 1.5]} />
      <ManholeCover position={[-2, 8.2, 1.5]} />
      <mesh position={[0, 11.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-4.2, 4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.9} />
      </mesh>
      <mesh position={[-4.05, 4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#6D6D6D" metalness={0.7} />
      </mesh>
      <mesh position={[-5, 4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={sideAgitatorRef} position={[0, 4, 0]}>
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} rotation={[0, 0, i * (Math.PI / 2)]}>
            <mesh castShadow>
              <boxGeometry args={[3.5, 0.1, 0.15]} />
              <meshStandardMaterial color="#5A6A72" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3.5, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.9} />
      </mesh>
      <mesh position={[0, 10.8, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={topAgitatorRef} position={[0, 5.5, 0]}>
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} rotation={[0, i * (Math.PI / 2), 0]}>
            <mesh castShadow>
              <boxGeometry args={[2.5, 0.1, 0.3]} />
              <meshStandardMaterial color="#5A6A72" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      <group position={[4.1, 0, 0]}>
        <mesh position={[0, 3.5, 0.15]} castShadow>
          <boxGeometry args={[0.05, 7, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.5, -0.15]} castShadow>
          <boxGeometry args={[0.05, 7, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} roughness={0.3} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[0, 0.7 + i * 0.7, 0]} castShadow>
            <boxGeometry args={[0.05, 0.05, 0.35]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`cage-${i}`} position={[0, 4 + i * 0.7, 0]} castShadow>
            <torusGeometry args={[0.3, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
          </mesh>
        ))}
      </group>
      <mesh position={[4.5, 7.2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[4.5, 7.7, 0.7]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.05]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
      </mesh>
      <mesh position={[4.5, 7.7, -0.7]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.05]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
      </mesh>
      <mesh position={[5.2, 7.7, 0]} castShadow>
        <boxGeometry args={[0.05, 0.8, 1.5]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
      </mesh>
      <mesh position={[-4, 2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <mesh position={[4, 2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <mesh position={[0, 1, 4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <Label position={[0, 12, 0]} color="#68B58C">
        MÉTHANISEUR
      </Label>
      <Label position={[0, 11.5, 0]} color="#68B58C" style={{ fontSize: "10px" }}>
        (Digestion anaérobie + Dôme EPDM)
      </Label>
      <group position={[-4.5, 5, 2]}>
        <Html center style={{ pointerEvents: "none" }}>
          <div style={{ background: "#0d1418dd", border: "1px solid #68B58C", borderRadius: "5px", padding: "6px 10px", fontFamily: "'Space Mono', monospace", fontSize: "10px", whiteSpace: "nowrap", color: "#68B58C" }}>
            <div style={{ fontWeight: 700, marginBottom: "2px" }}>CONDITIONS</div>
            <div>T° : <span style={{ color: "#F87171" }}>37.4°C</span> · pH : <span style={{ color: "#FBBF24" }}>7.1</span></div>
            <div>TRH : <span style={{ color: "#C6D0D5" }}>30 jours</span> · <span style={{ color: "#C6D0D5" }}>Mésophile</span></div>
          </div>
        </Html>
      </group>
      <group position={[-4.5, 3, 2]}>
        <Html center style={{ pointerEvents: "none" }}>
          <div style={{ background: "#0d1418dd", border: "1px solid #D8A93E", borderRadius: "5px", padding: "5px 8px", fontFamily: "'Space Mono', monospace", fontSize: "9px", whiteSpace: "nowrap", color: "#D8A93E" }}>
            <div>CH₄ : <span style={{ color: "#65C99A" }}>50–75%</span></div>
            <div>CO₂ : <span style={{ color: "#8B989F" }}>25–50%</span></div>
            <div>Δ : <span style={{ color: "#C6D0D5" }}>~120 m³/t MS</span></div>
          </div>
        </Html>
      </group>
      <Worker position={[5, 0, -2]} />
    </group>
  );
}

// --- Vue en coupe du méthaniseur ---
export function DigesterCutView({ stage }) {
  const cfg = {
    hydrolyse: { color: "#C99A61", left: ["Glucides", "Protéines", "Lipides"], right: ["Sucres", "Acides aminés", "Acides gras"] },
    acidogenese: { color: "#D88961", left: ["Molécule simples"], right: ["Acides organiques", "Alcools", "CO₂ + H₂"] },
    acetogenese: { color: "#B7C66D", left: ["Acides + alcools"], right: ["Acétate", "H₂", "CO₂"] },
    methanogenese: { color: "#D8A93E", left: ["Acétate", "H₂ + CO₂"], right: ["CH₄", "Biogaz brut"] },
  }[stage];

  const isMeth = stage === "methanogenese";

  return (
    <group position={[4, 0, 0]}>
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[4, 4, 7, 64, 1, true, 0, Math.PI]} />
        <meshPhysicalMaterial
          color="#B0B8BC"
          transparent
          opacity={0.2}
          transmission={0.3}
          side={THREE.DoubleSide}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 7, 0]}>
        <sphereGeometry args={[4.1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#E0E0E0" transparent opacity={0.4} roughness={0.8} />
      </mesh>
      <group position={[-2, 0, 0]}>
        {cfg?.left?.map((t, i) => (
          <Molecule key={t} label={t} y={(i - (cfg.left.length - 1) / 2) * 1.2} color="#B88955" />
        ))}
      </group>
      <group position={[2, 0, 0]}>
        {cfg?.right?.map((t, i) => (
          <Molecule key={t} label={t} y={(i - (cfg.right.length - 1) / 2) * 1.2} color={isMeth ? "#D8A93E" : "#65C99A"} />
        ))}
      </group>
      <ArrowFlow color={cfg?.color || "#65C99A"} />
      {isMeth && <GasCloud />}
      {[1.5, 2.5, 3.5].map((y, i) => (
        <mesh key={`coil-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, i * 0.5]}>
          <torusGeometry args={[2.5 - i * 0.3, 0.08, 8, 32, Math.PI * 1.5]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 1.5, 3.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
        <meshStandardMaterial color="#D84315" metalness={0.7} />
      </mesh>
      <Label position={[0, 6, 0]} color={cfg?.color || "#65C99A"}>
        {STAGES.find(s => s.id === stage)?.title.toUpperCase()}
      </Label>
    </group>
  );
}

// --- Molécule (pour la vue en coupe) ---
function Molecule({ label, y, color }) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} metalness={0.3} />
      </mesh>
      <Label position={[0, 0.6, 0]} color={color}>
        {label}
      </Label>
    </group>
  );
}

// --- Flux de flèches ---
function ArrowFlow({ color }) {
  return (
    <group>
      {[-1, 0, 1].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[0.12, 0.4, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// --- Nuage de gaz (pour la méthanogenèse) ---
function GasCloud() {
  const data = useMemo(
    () => Array.from({ length: 30 }, () => [(Math.random() - 0.5) * 3.5, Math.random() * 2.5 - 0.5, (Math.random() - 0.5) * 2.5]),
    []
  );
  return (
    <group>
      {data.map((p, i) => (
        <mesh key={i} position={p} scale={0.08 + Math.random() * 0.1}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial
            color={i % 2 ? "#59CB91" : "#D8A93E"}
            emissive={i % 2 ? "#0A4B30" : "#5A4000"}
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- 5. Traitement du biogaz ---
export function GasTreatment({ onClick, xray }) {
  return (
    <group position={[12, 0, 0]} onClick={onClick}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 2, 2.5]} />
        {xray
          ? <meshPhysicalMaterial color="#4A5A62" transparent opacity={0.25} transmission={0.3} roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
          : <meshStandardMaterial color="#34464C" metalness={0.5} roughness={0.4} />}
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[3.7, 0.15, 2.7]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-1, 3, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 6, 32]} />
        {xray
          ? <meshPhysicalMaterial color="#B8C0C8" transparent opacity={0.3} transmission={0.25} roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
          : <meshStandardMaterial color="#B0B8BC" metalness={0.6} roughness={0.3} />}
      </mesh>
      <mesh position={[-1, 6.1, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial color="#A0A8AC" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.5, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 3, 32]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.25, 3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.5, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} roughness={0.3} />
      </mesh>
      <Label position={[0, 4, 0]} color="#D8A93E">
        TRAITEMENT DU BIOGAZ
      </Label>
      <Label position={[0, 3.5, 0]} color="#D8A93E" style={{ fontSize: "10px" }}>
        (Épuration H₂S/CO₂ + Stockage)
      </Label>
      <Worker position={[2, 0, -1]} />
    </group>
  );
}

// --- 6. Cogénération (container CHP 40 pieds) ---
export function Cogeneration({ onClick, xray }) {
  return (
    <group position={[20, 0, 0]} onClick={onClick}>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 2.8, 2.6]} />
        {xray
          ? <meshPhysicalMaterial color="#D4A017" transparent opacity={0.2} transmission={0.25} roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
          : <meshStandardMaterial color="#D4A017" metalness={0.3} roughness={0.5} />}
      </mesh>
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[8.1, 0.1, 2.7]} />
        <meshStandardMaterial color="#C09010" metalness={0.3} roughness={0.5} />
      </mesh>
      {[-1.5, 0, 1.5, 3].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 1.31]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.15]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1, 1.2]} castShadow>
        <boxGeometry args={[3, 1.2, 0.4]} />
        <meshStandardMaterial color="#4A7C59" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[4.05, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1, 1, 0.15, 32]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2, 1, 1.31]} castShadow>
        <boxGeometry args={[0.05, 1.8, 0.9]} />
        <meshStandardMaterial color="#B89010" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[2, 4.65, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3.5, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[4.1, 0.8, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#D84315" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[4.1, 0.8, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#D84315" metalness={0.6} roughness={0.4} />
      </mesh>
      <Smoke position={[2, 7.5, 0]} color="#808080" />
      <Label position={[0, 4, 0]} color="#DE7248">
        COGÉNÉRATION
      </Label>
      <Label position={[0, 3.5, 0]} color="#DE7248" style={{ fontSize: "10px" }}>
        (35% électricité, 65% chaleur)
      </Label>
      <Worker position={[-3, 0, -1]} />
      <Spotlight position={[3, 5, 0]} color="#FFEB3B" intensity={0.8} />
    </group>
  );
}

// --- 7. Séparation de phases (séparateur à vis réaliste) ---
export function PhaseSeparation({ onClick, xray }) {
  return (
    <group position={[28, 0, 0]} onClick={onClick}>
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[3.5, 0.15, 1.2]} />
        <meshStandardMaterial color="#3A7D44" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-1.5, 0, 1.5].map((x, i) => (
        <React.Fragment key={`leg-${i}`}>
          <mesh position={[x, 0.4, 0.5]} castShadow>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshStandardMaterial color="#3A7D44" metalness={0.6} />
          </mesh>
          <mesh position={[x, 0.4, -0.5]} castShadow>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshStandardMaterial color="#3A7D44" metalness={0.6} />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 3.6, 32]} />
        {xray
          ? <meshPhysicalMaterial color="#C8C8C8" transparent opacity={0.3} transmission={0.25} roughness={0.4} metalness={0.4} side={THREE.DoubleSide} />
          : <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />}
      </mesh>
      <mesh position={[0.3, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 1.5, 32]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.6} roughness={0.4} wireframe />
      </mesh>
      <mesh position={[-2.2, 1.8, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-1.8, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 16]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
      </mesh>
      <mesh position={[1, 2.8, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[1, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.35, 0.4, 16]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.5} />
      </mesh>
      <mesh position={[-0.5, 1.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.7} />
      </mesh>
      <mesh position={[2.2, 1.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.5} />
      </mesh>
      <mesh position={[2.8, 0.3, 0]} castShadow>
        <coneGeometry args={[0.5, 0.6, 12]} />
        <meshStandardMaterial color="#8B6B4A" roughness={0.9} />
      </mesh>
      <mesh position={[-2, 0.6, 2]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 24]} />
        <meshStandardMaterial color="#34464C" metalness={0.5} roughness={0.5} />
      </mesh>
      <Label position={[0, 3.5, 0]} color="#58C993">
        SÉPARATION DE PHASES
      </Label>
      <Label position={[0, 3, 0]} color="#58C993" style={{ fontSize: "10px" }}>
        (Séparateur à vis — Solid/Liquide)
      </Label>
      <Worker position={[2, 0, -1.5]} />
    </group>
  );
}

// --- 8. Torchère de sécurité (combustion interne — pas de flamme visible) ---
export function Torchere({ onClick }) {
  return (
    <group position={[36, 0, 0]} onClick={onClick}>
      <Fence position={[0, 0, -3]} length={8} />
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.3, 3]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.6, 0.05, 8, 32]} />
        <meshStandardMaterial color="#FFC107" emissive="#FFC107" emissiveIntensity={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 5.3, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 10, 32]} />
        <meshStandardMaterial color="#6D6D6D" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 10.5, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.0, 1, 32]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.01, 0.8, 0]} castShadow>
        <boxGeometry args={[0.05, 0.8, 0.5]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.5} roughness={0.4} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 1.02, 0.6, Math.cos(angle) * 1.02]} rotation={[0, -angle, 0.3]} castShadow>
            <boxGeometry args={[0.4, 0.06, 0.1]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.6} roughness={0.3} />
          </mesh>
        );
      })}
      <group position={[1.05, 0, 0]}>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[0.05, 10, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
        </mesh>
        <mesh position={[0.2, 5, 0]} castShadow>
          <boxGeometry args={[0.05, 10, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
        </mesh>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[0.1, 0.8 + i * 0.7, 0]} castShadow>
            <boxGeometry args={[0.25, 0.04, 0.04]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
          </mesh>
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={`cage-${i}`} position={[0.1, 4 + i * 0.7, 0]} castShadow>
            <torusGeometry args={[0.2, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.08, 8, 32]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.12, 4]} />
        <meshStandardMaterial color="#FFC107" emissive="#FFC107" emissiveIntensity={0.2} />
      </mesh>
      <Html position={[0, 0.05, 3.5]} rotation={[-Math.PI / 2, 0, 0]} center style={{ pointerEvents: "none" }}>
        <div style={{ color: "#FF0000", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace", whiteSpace: "nowrap" }}>
          ZONE SÉCURITÉ
        </div>
      </Html>
      <Label position={[0, 12, 0]} color="#FF5722">
        TORCHÈRE DE SÉCURITÉ
      </Label>
      <Label position={[0, 11.5, 0]} color="#FF5722" style={{ fontSize: "10px" }}>
        (Combustion interne — pas de flamme visible)
      </Label>
      <Spotlight position={[-3, 5, 0]} color="#FFEB3B" intensity={1} />
    </group>
  );
}

// --- 9. Bâtiment de contrôle (container prefab SCADA) ---
export function ControlBuilding({ onClick }) {
  return (
    <group position={[0, 0, 12]} onClick={onClick}>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.8, 2.4]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[6.1, 0.1, 2.5]} />
        <meshStandardMaterial color="#D0D0D0" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[2.5, 1, 1.21]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.08]} />
        <meshStandardMaterial color="#B0B0B0" metalness={0.4} />
      </mesh>
      <mesh position={[2.7, 1, 1.26]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.05]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      {[-1.8, 0, 1.8].map((x, i) => (
        <group key={`win-${i}`}>
          <mesh position={[x, 1.8, 1.21]} castShadow>
            <boxGeometry args={[1, 0.8, 0.08]} />
            <meshStandardMaterial color="#4A6FA5" metalness={0.3} roughness={0.2} transparent opacity={0.7} />
          </mesh>
          <mesh position={[x, 1.8, 1.22]}>
            <boxGeometry args={[1.05, 0.05, 0.02]} />
            <meshStandardMaterial color="#A0A0A0" metalness={0.6} />
          </mesh>
          <mesh position={[x, 1.8, 1.22]}>
            <boxGeometry args={[0.05, 0.85, 0.02]} />
            <meshStandardMaterial color="#A0A0A0" metalness={0.6} />
          </mesh>
        </group>
      ))}
      {[-1.8, 0, 1.8].map((x, i) => (
        <mesh key={`screen-${i}`} position={[x, 1.8, 1.15]}>
          <boxGeometry args={[0.7, 0.5, 0.02]} />
          <meshStandardMaterial color={i === 0 ? "#22C55E" : i === 1 ? "#3B82F6" : "#F59E0B"} emissive={i === 0 ? "#22C55E" : i === 1 ? "#3B82F6" : "#F59E0B"} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <mesh position={[-1.5, 3.15, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.05, 1]} />
        <meshStandardMaterial color="#1A237E" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.5, 3.13, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.55, 0.03, 1.05]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 3]} castShadow>
        <boxGeometry args={[0.2, 0.15, 6]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.5} />
      </mesh>
      <Label position={[0, 4.2, 0]} color="#3B82F6">
        BÂTIMENT DE CONTRÔLE
      </Label>
      <Label position={[0, 3.8, 0]} color="#3B82F6" style={{ fontSize: "10px" }}>
        (Supervision SCADA 24/7)
      </Label>
      <Worker position={[-2, 0, 2]} />
    </group>
  );
}

// --- Panneaux ATEX de sécurité ---
export function AtexSigns() {
  const signs = [
    { pos: [-18, 2.5, 5], color: "#FFC107", text: "ATEX ZONE" },
    { pos: [-8, 2.5, 5], color: "#FF6B00", text: "GAZ INFLAMMABLE" },
    { pos: [8, 2.5, 5], color: "#FF0000", text: "DÉFENSE DE FUMER" },
    { pos: [18, 2.5, 5], color: "#FFC107", text: "ATEX ZONE" },
    { pos: [30, 2.5, 5], color: "#FF6B00", text: "HAUTE TENSION" },
  ];
  return (
    <group>
      {signs.map((s, i) => (
        <group key={i} position={s.pos}>
          <mesh position={[0, -1, 0]} castShadow>
            <boxGeometry args={[0.08, 2, 0.08]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[1.2, 0.6, 0.05]} />
            <meshStandardMaterial color={s.color} metalness={0.3} roughness={0.5} />
          </mesh>
          <Html position={[0, 0, 0.05]} center style={{ pointerEvents: "none" }}>
            <div style={{ color: s.color === "#FFC107" || s.color === "#FF6B00" ? "#000" : "#FFF", fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap", fontFamily: "monospace" }}>
              {s.text}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// --- Bacs de rétention béton ---
export function ContainmentBerm() {
  return (
    <group position={[0, 0, 0]}>
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        return (
          <mesh key={`berm-${i}`} position={[Math.sin(angle) * 5.5, 0.4, Math.cos(angle) * 5.5]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[1.8, 0.8, 0.25]} />
            <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.5, 48]} />
        <meshStandardMaterial color="#8A9094" roughness={0.95} metalness={0.05} />
      </mesh>
    </group>
  );
}
