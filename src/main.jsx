import React, { useRef, useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Sky, Html, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import "./styles.css";

// ============================================
// TEXTURES
// ============================================
function useTexture(url) {
  return useLoader(TextureLoader, url);
}

const TEXTURES = {
  metalRusty: "https://threejs.org/examples/textures/hardwood2_diffuse.jpg",
  concrete: "https://threejs.org/examples/textures/concrete_diffuse.jpg",
  grass: "https://threejs.org/examples/textures/grass.jpg",
  epdm: "https://threejs.org/examples/textures/rubber.jpg",
  wood: "https://threejs.org/examples/textures/wood.jpg",
};

// ============================================
// DONNÉES : Étapes du processus
// ============================================
const STAGES = [
  { id: "collecte", label: "01 · Collecte", title: "Collecte des déchets", text: "Les déchets organiques sont réunis comme matière première du processus.", color: "#B88955", position: [-20, 0, 0] },
  { id: "tri", label: "02 · Réception / Tri", title: "Réception et tri", text: "Les éléments indésirables (pierres, sable, produits chimiques) sont retirés avant d'entrer dans le processus.", color: "#B88955", position: [-12, 0, 0] },
  { id: "pretraitement", label: "03 · Prétraitement", title: "Prétraitement", text: "Le substrat est broyé, mélangé et homogénéisé pour faciliter la digestion.", color: "#C99A61", position: [-4, 0, 0] },
  { id: "methaniseur", label: "04 · Méthaniseur", title: "Digestion anaérobie", text: "Cœur du système : les micro-organismes décomposent la matière organique en absence d'oxygène.", color: "#68B58C", position: [4, 0, 0] },
  { id: "hydrolyse", label: "04a · Hydrolyse", title: "Hydrolyse", text: "Décomposition des glucides, protéines et lipides en molécules simples.", color: "#C99A61", position: [4, 0, 0] },
  { id: "acidogenese", label: "04b · Acidogenèse", title: "Acidogenèse", text: "Transformation des molécules simples en acides organiques, alcools, CO₂ et H₂.", color: "#D88961", position: [4, 0, 0] },
  { id: "acetogenese", label: "04c · Acétogenèse", title: "Acétogenèse", text: "Conversion des acides et alcools en acétate, H₂ et CO₂.", color: "#B7C66D", position: [4, 0, 0] },
  { id: "methanogenese", label: "04d · Méthanogenèse", title: "Méthanogenèse", text: "Production de CH₄ (biogaz) à partir d'acétate, H₂ et CO₂.", color: "#D8A93E", position: [4, 0, 0] },
  { id: "traitement_biogaz", label: "05 · Traitement du biogaz", title: "Épuration et stockage", text: "Le biogaz est épuré (H₂S, CO₂, humidité) puis stocké sous un dôme EPDM.", color: "#D8A93E", position: [12, 0, 0] },
  { id: "cogeneration", label: "06 · Cogénération", title: "Production d'énergie", text: "Le biogaz alimente un moteur de cogénération (35% électricité, 65% chaleur).", color: "#DE7248", position: [20, 0, 0] },
  { id: "separation_phases", label: "07 · Séparation de phases", title: "Traitement du digestat", text: "Le digestat est séparé en phase solide et liquide pour épandage agronomique.", color: "#58C993", position: [28, 0, 0] },
  { id: "torchere", label: "08 · Torchère", title: "Sécurité", text: "La torchère brûle l'excédent de biogaz en cas de surproduction.", color: "#FF5722", position: [36, 0, 0] },
];

// ============================================
// COMPOSANTS RÉUTILISABLES
// ============================================

// --- Label 3D ---
function Label({ children, position = [0, 0, 0], color = "#65C99A", style = {} }) {
  return (
    <Html center position={position} distanceFactor={10}>
      <div className="scene-label" style={{ color, borderColor: color, ...style }}>
        {children}
      </div>
    </Html>
  );
}

// --- Tuyau avec flux ---
function Pipe({ from, to, color = "#65C99A", pulse = false, width = 0.1 }) {
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
        <meshStandardMaterial color="#314047" metalness={0.8} roughness={0.3} />
      </mesh>
      {pulse && <FlowParticle from={from} to={to} color={color} />}
    </group>
  );
}

// --- Particule de flux ---
function FlowParticle({ from, to, color }) {
  const ref = useRef();
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = (clock.getElapsedTime() * 0.32) % 1;
      ref.current.position.lerpVectors(a, b, t);
    }
  });
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.15, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
    </mesh>
  );
}

// --- Sol en béton texturé ---
function ConcreteGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#5A6A72"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

// --- Herbe autour du sol ---
function Grass() {
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
function Tree({ position = [0, 0, 0] }) {
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
function Fence({ position = [0, 0, 0], length = 10 }) {
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
function SolarPanel({ position = [0, 0, 0] }) {
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
function Truck({ position = [0, 0, 0] }) {
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
function Smoke({ position = [0, 0, 0], color = "#808080" }) {
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
function Worker({ position = [0, 0, 0] }) {
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
function Spotlight({ position = [0, 0, 0], color = "#FFFFFF", intensity = 1 }) {
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

// ============================================
// COMPOSANTS DES POSTES
// ============================================

// --- 1. Tas de déchets (Collecte) ---
// --- 1. Tas de déchets (Collecte) ---
function WastePile({ onClick }) {  // <-- Ajout de la prop onClick
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
    <group position={[-20, 0, 0]} onClick={onClick}>  {/* <-- onClick sur le group */}
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
// --- 2. Station de tri ---
// --- 2. Station de tri ---
function SortingStation({ onClick }) {  // <-- Ajout de la prop onClick
  return (
    <group position={[-12, 0, 0]} onClick={onClick}>  {/* <-- onClick sur le group */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[4.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.5, 1.6]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[4.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.8} />
      </mesh>
      <group position={[0, 1.6, 1.6]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh
            key={i}
            position={[(i - 4) * 0.5, 0.1, 0]}
            scale={[0.3, 0.15, 0.3]}
            castShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#66747A" : "#765B3D"}
              metalness={0.3}
            />
          </mesh>
        ))}
      </group>
      <Label position={[0, 4, 0]} color="#B88955">
        RÉCEPTION / TRI
      </Label>
      <Label position={[0, 3.5, 0]} color="#B88955" style={{ fontSize: "10px" }}>
        (Séparation des indésirables)
      </Label>
      <Worker position={[1, 0, -1]} />
    </group>
  );
}

// --- 3. Broyeur / Mélangeur ---
// --- 3. Broyeur / Mélangeur ---
function Mixer({ onClick }) {  // <-- Ajout de la prop onClick
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 1.2;
  });

  return (
    <group position={[-4, 0, 0]} onClick={onClick}>  {/* <-- onClick sur le group */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2, 3, 48]} />
        <meshStandardMaterial color="#46555A" metalness={0.8} roughness={0.3} />
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
// --- 4. Méthaniseur (avec dôme EPDM et agitateurs) ---
function Digester({ onClick }) {
  const domeRef = useRef();
  const agitatorRef = useRef();

  useFrame(({ clock }) => {
    if (domeRef.current) {
      domeRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
    if (agitatorRef.current) {
      agitatorRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[4, 0, 0]} onClick={onClick}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 5, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#24433A"
          transparent
          opacity={0.3}
          transmission={0.2}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={domeRef} position={[0, 4.5, 0]} castShadow>
        <sphereGeometry args={[3.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#1A2A20"
          emissive="#005500"
          emissiveIntensity={0.2}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <group ref={agitatorRef} position={[0, 1.5, 0]}>
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
      <mesh position={[-3.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <mesh position={[3.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.8} />
      </mesh>
      <Label position={[0, 6, 0]} color="#68B58C">
        MÉTHANISEUR
      </Label>
      <Label position={[0, 5.5, 0]} color="#68B58C" style={{ fontSize: "10px" }}>
        (Digestion anaérobie + Dôme EPDM)
      </Label>
      <Worker position={[3, 0, -2]} />
    </group>
  );
}
// --- Vue en coupe du méthaniseur ---
function DigesterCutView({ stage }) {
  const cfg = {
    hydrolyse: { color: "#C99A61", left: ["Glucides", "Protéines", "Lipides"], right: ["Sucres", "Acides aminés", "Acides gras"] },
    acidogenese: { color: "#D88961", left: ["Molécule simples"], right: ["Acides organiques", "Alcools", "CO₂ + H₂"] },
    acetogenese: { color: "#B7C66D", left: ["Acides + alcools"], right: ["Acétate", "H₂", "CO₂"] },
    methanogenese: { color: "#D8A93E", left: ["Acétate", "H₂ + CO₂"], right: ["CH₄", "Biogaz brut"] },
  }[stage];

  const isMeth = stage === "methanogenese";

  return (
    <group position={[4, 0, 0]}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[3, 3, 5, 64, 1, true, 0, Math.PI]} />
        <meshPhysicalMaterial
          color="#24433A"
          transparent
          opacity={0.2}
          transmission={0.3}
          side={THREE.DoubleSide}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[3.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1A2A20" transparent opacity={0.4} roughness={0.8} />
      </mesh>
      <group position={[-1.5, 0, 0]}>
        {cfg?.left?.map((t, i) => (
          <Molecule key={t} label={t} y={(i - (cfg.left.length - 1) / 2) * 1.2} color="#B88955" />
        ))}
      </group>
      <group position={[1.5, 0, 0]}>
        {cfg?.right?.map((t, i) => (
          <Molecule key={t} label={t} y={(i - (cfg.right.length - 1) / 2) * 1.2} color={isMeth ? "#D8A93E" : "#65C99A"} />
        ))}
      </group>
      <ArrowFlow color={cfg?.color || "#65C99A"} />
      {isMeth && <GasCloud />}
      <Label position={[0, 5, 0]} color={cfg?.color || "#65C99A"}>
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
function GasTreatment({ onClick }) {
  return (
    <group position={[12, 0, 0]} onClick={onClick}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 2]} />
        <meshStandardMaterial color="#34464C" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[3.2, 0.2, 2.2]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.6} />
      </mesh>
      <mesh position={[-1.5, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.8} />
      </mesh>
      <mesh position={[1.5, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1A2A20" emissive="#005500" emissiveIntensity={0.2} roughness={0.8} />
      </mesh>
      <Label position={[0, 4, 0]} color="#D8A93E">
        TRAITEMENT DU BIOGAZ
      </Label>
            <Label position={[0, 3.5, 0]} color="#D8A93E" style={{ fontSize: "10px" }}>
        (Épuration H₂S/CO₂ + Stockage)
      </Label>
      <Worker position={[1, 0, -1]} />
    </group>
  );
}

// --- 6. Cogénération ---
function Cogeneration({ onClick }) {
  return (
    <group position={[20, 0, 0]} onClick={onClick}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.5, 3]} />
        <meshStandardMaterial color="#2C3E44" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <boxGeometry args={[4.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#3C4C51" metalness={0.7} />
      </mesh>
      <SolarPanel position={[0, 3.2, 0]} />
      <SolarPanel position={[0, 3.2, 1.5]} />
      <SolarPanel position={[0, 3.2, -1.5]} />
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.9} />
      </mesh>
      <mesh position={[2, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.2, 1.5, 1]} />
        <meshStandardMaterial color="#DE7248" emissive="#8A3B00" emissiveIntensity={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[-2, 1.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1.5]} />
        <meshStandardMaterial color="#E2B93E" emissive="#8A6B00" emissiveIntensity={0.5} metalness={0.7} />
      </mesh>
      <Smoke position={[0, 5.5, 0]} color="#808080" />
      <Label position={[0, 4, 0]} color="#DE7248">
        COGÉNÉRATION
      </Label>
      <Label position={[0, 3.5, 0]} color="#DE7248" style={{ fontSize: "10px" }}>
        (35% électricité, 65% chaleur)
      </Label>
      <Worker position={[-2, 0, -1]} />
      <Spotlight position={[3, 5, 0]} color="#FFEB3B" intensity={0.8} />
    </group>
  );
}

// --- 7. Séparation de phases ---
function PhaseSeparation({ onClick }) {
  return (
    <group position={[28, 0, 0]} onClick={onClick}>
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#5A6A72" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-1.5, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#4F6845" roughness={0.8} />
      </mesh>
      <mesh position={[1.5, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 3, 32]} />
        <meshStandardMaterial color="#34464C" metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 3, 32]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.7} />
      </mesh>
      <Label position={[0, 3, 0]} color="#58C993">
        SÉPARATION DE PHASES
      </Label>
      <Label position={[0, 2.5, 0]} color="#58C993" style={{ fontSize: "10px" }}>
        (Solide → dalle | Liquide → cuve)
      </Label>
      <Worker position={[1, 0, -1]} />
    </group>
  );
}

// --- 8. Torchère de sécurité ---
function Torchere({ onClick }) {
  const flameRef = useRef();
  useFrame(({ clock }) => {
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      flameRef.current.scale.x = 0.8 + Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
      flameRef.current.scale.z = 0.8 + Math.sin(clock.getElapsedTime() * 1.2) * 0.1;
    }
  });

  return (
    <group position={[36, 0, 0]} onClick={onClick}>
      <Fence position={[0, 0, -3]} length={8} />
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 8, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.9} />
      </mesh>
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1, 1, 16]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.8} />
      </mesh>
      <mesh ref={flameRef} position={[0, 9.5, 0]} castShadow>
        <coneGeometry args={[0.8, 2.5, 16]} />
        <meshStandardMaterial
          color="#FF5722"
          emissive="#FF8C00"
          emissiveIntensity={1.5}
        />
      </mesh>
      <Smoke position={[0, 11, 0]} color="#666666" />
      <Label position={[0, 11, 0]} color="#FF5722">
        TORCHÈRE DE SÉCURITÉ
      </Label>
      <Label position={[0, 10.5, 0]} color="#FF5722" style={{ fontSize: "10px" }}>
        (Brûlage des excédents)
      </Label>
      <Spotlight position={[-3, 5, 0]} color="#FFEB3B" intensity={1} />
    </group>
  );
}
// ============================================
// SCÈNE PRINCIPALE (avec fixes des 3 bugs)
// ============================================
function Scene({ currentStage, setCurrentStage, isTourActive, tourWaypoints, setTourProgress, setCurrentWaypoint, tourElapsedTime }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const waypointDuration = 5;
  const cameraSpeed = 0.1;

  // useEffect pour observer currentStage
  useEffect(() => {
    if (!isTourActive) {
      const stage = STAGES.find(s => s.id === currentStage);
      if (stage) moveToPost(stage.position);
    }
  }, [currentStage, isTourActive]);

  const handleStageClick = (stageId) => {
    if (!isTourActive) setCurrentStage(stageId);
  };

  const moveToPost = (position) => {
    if (controlsRef.current) {
      const [x, y, z] = position;
      targetPosition.current.set(x, y + 3, z + 8);
      targetLookAt.current.set(x, y + 1, z);
      isMoving.current = true;
    }
  };

  useFrame((_, delta) => {
  if (isMoving.current && controlsRef.current?.target && !isTourActive) {
    const currentPos = new THREE.Vector3();
    const currentLook = new THREE.Vector3();
    camera.getWorldPosition(currentPos);
    currentLook.copy(controlsRef.current.target);  // ✅ Safe avec ?.

    const lerpFactor = 1 - Math.exp(-cameraSpeed * delta * 60);
    currentPos.lerp(targetPosition.current, lerpFactor);
    currentLook.lerp(targetLookAt.current, lerpFactor);

    camera.position.copy(currentPos);
    controlsRef.current.target.copy(currentLook);
    controlsRef.current.update();

    if (currentPos.distanceTo(targetPosition.current) < 0.1) {
      isMoving.current = false;
    }
  }

  // Mode visite guidée
  if (isTourActive && controlsRef.current?.target) {
    tourElapsedTime.current += delta;
    const totalDuration = tourWaypoints.length * waypointDuration;
    const progress = Math.min(tourElapsedTime.current / totalDuration, 1);
    setTourProgress(progress);

    const currentWaypointIndex = Math.min(
      Math.floor(tourElapsedTime.current / waypointDuration),
      tourWaypoints.length - 1
    );
    setCurrentWaypoint(currentWaypointIndex);

    const startWaypoint = tourWaypoints[currentWaypointIndex];
    const endWaypoint = tourWaypoints[Math.min(currentWaypointIndex + 1, tourWaypoints.length - 1)];

    const localProgress = (tourElapsedTime.current % waypointDuration) / waypointDuration;
    const currentPos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...startWaypoint.cameraPos),
      new THREE.Vector3(...endWaypoint.cameraPos),
      localProgress
    );
    const currentLook = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...startWaypoint.target),
      new THREE.Vector3(...endWaypoint.target),
      localProgress
    );

    camera.position.copy(currentPos);
    controlsRef.current.target.copy(currentLook);
    controlsRef.current.update();

    if (startWaypoint.stage) {
      setCurrentStage(startWaypoint.stage);
    }
  }
});

  return (
  <>
    {/* Éclairage */}
    <ambientLight intensity={0.6} />
    <directionalLight
      position={[10, 20, 10]}
      intensity={1.5}
      castShadow
      shadowMapSizeWidth={2048}
      shadowMapSizeHeight={2048}
      shadowCameraNear={0.5}
      shadowCameraFar={100}
      shadowCameraLeft={-50}
      shadowCameraRight={50}
      shadowCameraTop={50}
      shadowCameraBottom={-50}
    />
    <pointLight position={[0, 10, 0]} intensity={0.5} color="#65C99A" />

    {/* Sol et environnement */}
    <ConcreteGround />
    <Grass />
    <Tree position={[-25, 0, -10]} />
    <Tree position={[-25, 0, -20]} />
    <Tree position={[-25, 0, -30]} />
    <Tree position={[40, 0, -10]} />
    <Tree position={[40, 0, -20]} />
    <Tree position={[40, 0, -30]} />
    <Sky
      distance={450000}
      sunPosition={[10, 20, 10]}
      inclination={0}
      azimuth={0.25}
      rayleigh={0.1}
      turbidity={0.2}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />

    {/* Postes de l'installation (avec onClick) */}
    <WastePile onClick={() => !isTourActive && handleStageClick("collecte")} />
    <SortingStation onClick={() => !isTourActive && handleStageClick("tri")} />
    <Mixer onClick={() => !isTourActive && handleStageClick("pretraitement")} />
    {["hydrolyse", "acidogenese", "acetogenese", "methanogenese"].includes(currentStage) ? (
      <DigesterCutView stage={currentStage} />
    ) : (
      <Digester onClick={() => !isTourActive && handleStageClick("methaniseur")} />
    )}
    <GasTreatment onClick={() => !isTourActive && handleStageClick("traitement_biogaz")} />
    <Cogeneration onClick={() => !isTourActive && handleStageClick("cogeneration")} />
    <PhaseSeparation onClick={() => !isTourActive && handleStageClick("separation_phases")} />
    <Torchere onClick={() => !isTourActive && handleStageClick("torchere")} />

    {/* Clôtures */}
    <Fence position={[-20, 0, 5]} length={10} />
    <Fence position={[36, 0, 5]} length={10} />

    {/* Connexions entre les postes */}
    <Pipe from={[-17, 0.75, 0]} to={[-14, 1.5, 0]} color="#B88955" pulse />
    <Pipe from={[-10, 1.5, 0]} to={[-6, 2.5, 0]} color="#C99A61" pulse />
    <Pipe from={[-2, 0.5, 0]} to={[2, 2.5, 0]} color="#68B58C" pulse />
    <Pipe from={[6, 4.5, 0]} to={[10, 2.5, 0]} color="#D8A93E" pulse />
    <Pipe from={[14, 2.5, 0]} to={[18, 2.5, 0]} color="#D8A93E" pulse />
    <Pipe from={[22, 1.5, 0]} to={[26, 1.5, 0]} color="#68B58C" pulse />

    {/* Contrôles de caméra */}
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={100}
      enablePan={!isTourActive}
      enableRotate={!isTourActive}
    />
  </>
);
}
// ============================================
// APPLICATION PRINCIPALE
// ============================================
function App() {
  const [currentStage, setCurrentStage] = useState("collecte");
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [tourProgress, setTourProgress] = useState(0);

  // Waypoints pour la visite guidée (incluant les sous-étapes du méthaniseur)
  const tourWaypoints = [
    {
      cameraPos: [-5, 10, 50],
      target: [0, 0, 0],
      text: "Bienvenue dans cette visite guidée d'une installation de méthanisation. Nous allons explorer chaque étape du processus.",
      stage: null,
    },
    {
      cameraPos: [-25, 8, 0],
      target: [-20, 0, 0],
      text: "Ici, les déchets organiques (fumier, déchets alimentaires, résidus agricoles) sont collectés avant d'entrer dans le processus.",
      stage: "collecte",
    },
    {
      cameraPos: [-17, 8, 0],
      target: [-12, 0, 0],
      text: "Dans cette station, les éléments indésirables (pierres, sable, produits chimiques) sont retirés pour éviter de perturber le processus.",
      stage: "tri",
    },
    {
      cameraPos: [-9, 8, 0],
      target: [-4, 0, 0],
      text: "Le substrat est broyé, mélangé et homogénéisé pour faciliter la digestion dans le méthaniseur.",
      stage: "pretraitement",
    },
    {
      cameraPos: [0, 10, 8],
      target: [4, 0, 0],
      text: "C'est le cœur du système ! Voici le méthaniseur où les micro-organismes décomposent la matière organique en absence d'oxygène.",
      stage: "methaniseur",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Première étape de la digestion : l'hydrolyse, où les glucides, protéines et lipides sont décomposés en molécules simples.",
      stage: "hydrolyse",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Deuxième étape : l'acidogenèse, où les molécules simples sont transformées en acides organiques, alcools, CO₂ et H₂.",
      stage: "acidogenese",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Troisième étape : l'acétogenèse, où les acides et alcools sont convertis en acétate, H₂ et CO₂.",
      stage: "acetogenese",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Dernière étape : la méthanogenèse, où l'acétate, H₂ et CO₂ sont transformés en CH₄ (biogaz).",
      stage: "methanogenese",
    },
    {
      cameraPos: [8, 10, 8],
      target: [12, 0, 0],
      text: "Le biogaz est épuré (H₂S, CO₂, humidité) puis stocké sous un dôme EPDM à faible pression.",
      stage: "traitement_biogaz",
    },
    {
      cameraPos: [16, 10, 8],
      target: [20, 0, 0],
      text: "Le biogaz alimente un moteur de cogénération, produisant 35% d'électricité et 65% de chaleur.",
      stage: "cogeneration",
    },
    {
      cameraPos: [24, 10, 8],
      target: [28, 0, 0],
      text: "Le digestat est séparé en phase solide (dalle béton) et phase liquide (cuve de stockage) pour épandage agronomique.",
      stage: "separation_phases",
    },
    {
      cameraPos: [32, 10, 8],
      target: [36, 0, 0],
      text: "La torchère brûle l'excédent de biogaz en cas de surproduction ou de maintenance, pour des raisons de sécurité.",
      stage: "torchere",
    },
    {
      cameraPos: [0, 15, 50],
      target: [0, 0, 0],
      text: "Merci d'avoir visité cette installation de méthanisation ! Vous savez maintenant comment les déchets organiques sont transformés en énergie renouvelable.",
      stage: null,
    },
  ];

  const tourElapsedTime = useRef(0);
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  const changeStage = (index) => {
    if (!isTourActive) {
      const newStage = STAGES[Math.max(0, Math.min(STAGES.length - 1, index))].id;
      setCurrentStage(newStage);
    }
  };

  // FIX 3: Réinitialiser tourElapsedTime lors des contrôles de la visite
  const startTour = () => {
    tourElapsedTime.current = 0;
    setIsTourActive(true);
    setCurrentWaypoint(0);
    setTourProgress(0);
  };

  const pauseTour = () => {
    setIsTourActive(false);
  };

  const resumeTour = () => {
    setIsTourActive(true);
  };

  const stopTour = () => {
    setIsTourActive(false);
    setCurrentWaypoint(0);
    setTourProgress(0);
    tourElapsedTime.current = 0; // Réinitialiser le temps accumulé
  };

  return (
    <div className="app">
      <header>
        <div>
          <div className="eyebrow">BIOFLOW 3D · VISITE GUIDÉE</div>
          <h1>Visite virtuelle d'une installation de méthanisation</h1>
          <p>
            {isTourActive
              ? tourWaypoints[currentWaypoint]?.text
              : "Explorez chaque poste en cliquant sur les étapes ou lancez la visite guidée."}
          </p>
        </div>
        <div className="controls">
          {!isTourActive ? (
            <>
              <button onClick={() => changeStage(currentIndex - 1)} disabled={currentIndex === 0}>
                ← Précédent
              </button>
              <button onClick={() => changeStage(currentIndex + 1)} disabled={currentIndex === STAGES.length - 1}>
                Suivant →
              </button>
              <button onClick={() => changeStage(0)}>Réinitialiser</button>
              <button onClick={startTour} className="tour-button">
                 Démarrer la visite
              </button>
            </>
          ) : (
            <>
              <button onClick={pauseTour} className="tour-button">
                ⏸ Pause
              </button>
              <button onClick={resumeTour} className="tour-button">
                ▶ Reprise
              </button>
              <button onClick={stopTour} className="tour-button">
                ⏹ Arrêter
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="viewport">
         <Canvas
          camera={{ position: [-5, 10, 50], fov: 50, near: 0.1, far: 1000 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#87CEEB");  // Fond cyan
          }}
    >
      <Scene
        currentStage={currentStage}
        setCurrentStage={setCurrentStage}
        isTourActive={isTourActive}
        tourWaypoints={tourWaypoints}
        setTourProgress={setTourProgress}
        setCurrentWaypoint={setCurrentWaypoint}
        tourElapsedTime={tourElapsedTime}
      />
    </Canvas>
          <div className="hint">
            {isTourActive
              ? `Visite en cours : ${Math.round(tourProgress * 100)}%`
              : "Glisser = rotation · Molette = zoom · Clic droit = déplacement · Clic sur une étape = centrer la caméra"}
          </div>
          {isTourActive && (
            <div className="tour-progress">
              <div
                className="tour-progress-bar"
                style={{ width: `${tourProgress * 100}%` }}
              />
            </div>
          )}
        </section>

        <aside>
          <div className="panel">
            <div className="panel-title">
              {isTourActive ? "VISITE GUIDÉE" : "ÉTAPE ACTUELLE"}
            </div>
            {isTourActive ? (
              <div className="tour-info">
                <p>
                  <strong>Étape {currentWaypoint + 1}/{tourWaypoints.length}</strong>
                </p>
                <p>{tourWaypoints[currentWaypoint]?.text}</p>
              </div>
            ) : (
              <>
                <div className="stage-number">
                  {String(currentIndex + 1).padStart(2, "0")}
                </div>
                <h2>{STAGES.find(s => s.id === currentStage)?.title}</h2>
                <p>{STAGES.find(s => s.id === currentStage)?.text}</p>
                <div className="progress">
                  <span
                    style={{
                      width: `${((currentIndex + 1) / STAGES.length) * 100}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="panel">
            <div className="panel-title">CHAÎNE DU PROCESSUS</div>
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                className={"stage-row " + (i === currentIndex ? "selected" : "")}
                onClick={() => !isTourActive && setCurrentStage(s.id)}
                disabled={isTourActive}
              >
                <span className="dot" style={{ background: s.color }} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="panel facts">
            <div>
              <b>Biogaz</b>
              <span>CH₄ (50-75%) + CO₂ + H₂S</span>
            </div>
            <div>
              <b>Digestat</b>
              <span>Phase solide + liquide</span>
            </div>
            <div>
              <b>Cogénération</b>
              <span>35% électricité, 65% chaleur</span>
            </div>
            <div>
              <b>Pression gazomètre</b>
              <span>Quelques mbar (dôme EPDM)</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
