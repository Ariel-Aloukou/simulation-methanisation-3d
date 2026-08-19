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
function Pipe({ from, to, color = "#65C99A", pulse = false, width = 0.15 }) {
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
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={from} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={to} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
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

// --- Sol multi-zones ---
function ConcreteGround() {
  return (
    <group>
      {/* Main concrete pad under equipment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[70, 20]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Gravel access roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 12]} receiveShadow>
        <planeGeometry args={[70, 6]} />
        <meshStandardMaterial color="#8A8A7A" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Gravel road — front */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -8]} receiveShadow>
        <planeGeometry args={[70, 6]} />
        <meshStandardMaterial color="#8A8A7A" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Gravel turning area in front of sorting */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.07, 7]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#7A7A6A" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Dark earth around perimeter */}
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
function WastePile({ onClick }) {
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
function SortingStation({ onClick }) {
  return (
    <group position={[-12, 0, 0]} onClick={onClick}>
      {/* Main building — metal-clad industrial hall */}
      <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 4.5, 5]} />
        <meshStandardMaterial color="#7A8A92" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Corrugated metal walls (vertical stripes) */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`wall-${i}`} position={[-3 + i * 0.6, 2.25, 2.51]} castShadow>
          <boxGeometry args={[0.05, 4.5, 0.1]} />
          <meshStandardMaterial color="#8A9AA2" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* Peaked roof — two angled panels */}
      <mesh position={[0, 4.6, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[6.2, 0.12, 3]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.6, 0]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[6.2, 0.12, 3]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Ridge beam */}
      <mesh position={[0, 4.8, 0]} castShadow>
        <boxGeometry args={[6.3, 0.15, 0.2]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.6} />
      </mesh>
      {/* Garage door */}
      <mesh position={[0, 1.3, 2.52]} castShadow>
        <boxGeometry args={[2.5, 2.6, 0.1]} />
        <meshStandardMaterial color="#6A7A82" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Door panels */}
      {[0, 0.65, 1.3].map((y, i) => (
        <mesh key={`panel-${i}`} position={[0, 0.65 + y, 2.57]} castShadow>
          <boxGeometry args={[2.4, 0.03, 0.02]} />
          <meshStandardMaterial color="#5A6A72" metalness={0.4} />
        </mesh>
      ))}
      {/* Conveyor belt exiting building — inclined */}
      <group position={[4.5, 1.5, 0]} rotation={[0, 0, 0.4]}>
        {/* Belt frame */}
        <mesh castShadow>
          <boxGeometry args={[4, 0.6, 0.8]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Belt surface */}
        <mesh position={[0, 0.31, 0]} castShadow>
          <boxGeometry args={[3.8, 0.05, 0.6]} />
          <meshStandardMaterial color="#2A2A2A" roughness={0.8} />
        </mesh>
        {/* Rollers */}
        {[-1.2, 0, 1.2].map((x, i) => (
          <mesh key={`roller-${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.8, 12]} />
            <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Conveyor motor */}
      <mesh position={[3.5, 3.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Concrete apron in front */}
      <mesh position={[0, 0.02, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Waste bins next to building */}
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
function Mixer({ onClick }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 1.2;
  });

  return (
    <group position={[-4, 0, 0]} onClick={onClick}>
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

// --- 4. Méthaniseur (cuve béton, dôme EPDM, agitateurs) ---
function Digester({ onClick }) {
  const domeRef = useRef();
  const sideAgitatorRef = useRef();
  const topAgitatorRef = useRef();

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
  });

  return (
    <group position={[4, 0, 0]} onClick={onClick}>
      {/* Foundation floor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.2, 64]} />
        <meshStandardMaterial color="#8A9296" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Main tank (cuve) — solid concrete cylinder */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 4, 7, 64]} />
        <meshStandardMaterial color="#B0B8BC" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Formwork lines */}
      {[1.5, 3, 4.5, 6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <torusGeometry args={[4.02, 0.06, 8, 64]} />
          <meshStandardMaterial color="#9AA0A4" roughness={0.8} metalness={0.15} />
        </mesh>
      ))}

      {/* Ring beam at top */}
      <mesh position={[0, 7, 0]} castShadow>
        <cylinderGeometry args={[4.1, 4.1, 0.3, 64]} />
        <meshStandardMaterial color="#A0A8AC" roughness={0.8} metalness={0.15} />
      </mesh>

      {/* Dome EPDM */}
      <mesh ref={domeRef} position={[0, 7, 0]} castShadow>
        <sphereGeometry args={[4.1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Clamping ring */}
      <mesh position={[0, 7, 0]} castShadow>
        <torusGeometry args={[4.1, 0.12, 8, 64]} />
        <meshStandardMaterial color="#6D6D6D" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Dome seams — 6 thin boxes radiating from top */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`seam-${i}`} position={[Math.sin(angle) * 2, 7.8, Math.cos(angle) * 2]} rotation={[0, -angle, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.02, 3, 0.02]} />
            <meshStandardMaterial color="#C8C8C8" roughness={0.5} metalness={0.3} />
          </mesh>
        );
      })}

      {/* Manhole at dome top */}
      <mesh position={[0, 8.3, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Gas outlet pipe */}
      <mesh position={[0, 11.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Side agitator — horizontal shaft through wall */}
      <mesh position={[-4.2, 4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.9} />
      </mesh>
      {/* Flanged penetration on wall */}
      <mesh position={[-4.05, 4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#6D6D6D" metalness={0.7} />
      </mesh>
      {/* Side agitator motor — OUTSIDE the tank */}
      <mesh position={[-5, 4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Side agitator internal blades */}
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

      {/* Top agitator — vertical shaft from dome */}
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3.5, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.9} />
      </mesh>
      {/* Top agitator motor — on TOP of dome */}
      <mesh position={[0, 10.8, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Top agitator internal blades */}
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

      {/* Access ladder */}
      <group position={[4.1, 0, 0]}>
        {/* Left rail */}
        <mesh position={[0, 3.5, 0.15]} castShadow>
          <boxGeometry args={[0.05, 7, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Right rail */}
        <mesh position={[0, 3.5, -0.15]} castShadow>
          <boxGeometry args={[0.05, 7, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Rungs */}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[0, 0.7 + i * 0.7, 0]} castShadow>
            <boxGeometry args={[0.05, 0.05, 0.35]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Safety cage half-rings */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`cage-${i}`} position={[0, 4 + i * 0.7, 0]} castShadow>
            <torusGeometry args={[0.3, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Access platform at top */}
      <mesh position={[4.5, 7.2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Platform guard rails */}
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

      {/* Pipe connections — horizontal pipes exiting the tank wall */}
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

      {/* Labels */}
      <Label position={[0, 12, 0]} color="#68B58C">
        MÉTHANISEUR
      </Label>
      <Label position={[0, 11.5, 0]} color="#68B58C" style={{ fontSize: "10px" }}>
        (Digestion anaérobie + Dôme EPDM)
      </Label>
      <Worker position={[5, 0, -2]} />
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
      {/* Heating coils — stainless steel spirals near bottom */}
      {[1.5, 2.5, 3.5].map((y, i) => (
        <mesh key={`coil-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, i * 0.5]}>
          <torusGeometry args={[2.5 - i * 0.3, 0.08, 8, 32, Math.PI * 1.5]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Coil inlet pipe */}
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
function GasTreatment({ onClick }) {
  return (
    <group position={[12, 0, 0]} onClick={onClick}>
      {/* Small building/base */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 2, 2.5]} />
        <meshStandardMaterial color="#34464C" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[3.7, 0.15, 2.7]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Scrubbing column */}
      <mesh position={[-1, 3, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 6, 32]} />
        <meshStandardMaterial color="#B0B8BC" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Column top cap */}
      <mesh position={[-1, 6.1, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial color="#A0A8AC" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Activated carbon filter */}
      <mesh position={[1.5, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 3, 32]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Gas pipe connecting column to filter */}
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
function Cogeneration({ onClick }) {
  return (
    <group position={[20, 0, 0]} onClick={onClick}>
      {/* Container body — Jenbacher yellow */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 2.8, 2.6]} />
        <meshStandardMaterial color="#D4A017" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Roof plate */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[8.1, 0.1, 2.7]} />
        <meshStandardMaterial color="#C09010" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Ventilation louvers — 4 on the side */}
      {[-1.5, 0, 1.5, 3].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 1.31]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.15]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Engine visible through louvers */}
      <mesh position={[0, 1, 1.2]} castShadow>
        <boxGeometry args={[3, 1.2, 0.4]} />
        <meshStandardMaterial color="#4A7C59" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Radiator grille — front end (cooling fan housing) */}
      <mesh position={[4.05, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1, 1, 0.15, 32]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Side personnel door */}
      <mesh position={[-2, 1, 1.31]} castShadow>
        <boxGeometry args={[0.05, 1.8, 0.9]} />
        <meshStandardMaterial color="#B89010" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Exhaust stack — stainless steel insulated */}
      <mesh position={[2, 4.65, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3.5, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Heat pipes — 2 exiting container toward digester */}
      <mesh position={[4.1, 0.8, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#D84315" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[4.1, 0.8, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#D84315" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Smoke at top of exhaust stack */}
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
function PhaseSeparation({ onClick }) {
  return (
    <group position={[28, 0, 0]} onClick={onClick}>
      {/* Concrete base pad */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Elevated support frame — steel structure */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[3.5, 0.15, 1.2]} />
        <meshStandardMaterial color="#3A7D44" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Support legs */}
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
      {/* Screw press body — horizontal stainless steel cylinder */}
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 3.6, 32]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Perforated screen section (middle of press) */}
      <mesh position={[0.3, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 1.5, 32]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.6} roughness={0.4} wireframe />
      </mesh>
      {/* Drive motor — blue */}
      <mesh position={[-2.2, 1.8, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#2E5090" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Motor coupling */}
      <mesh position={[-1.8, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 16]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
      </mesh>
      {/* Feed hopper on top */}
      <mesh position={[1, 2.8, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Hopper funnel */}
      <mesh position={[1, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.35, 0.4, 16]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.5} />
      </mesh>
      {/* Liquid discharge — bottom pipe */}
      <mesh position={[-0.5, 1.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 16]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.7} />
      </mesh>
      {/* Solid discharge chute — right end */}
      <mesh position={[2.2, 1.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.5} />
      </mesh>
      {/* Solid output pile */}
      <mesh position={[2.8, 0.3, 0]} castShadow>
        <coneGeometry args={[0.5, 0.6, 12]} />
        <meshStandardMaterial color="#8B6B4A" roughness={0.9} />
      </mesh>
      {/* Liquid collection tank */}
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
function Torchere({ onClick }) {
  return (
    <group position={[36, 0, 0]} onClick={onClick}>
      <Fence position={[0, 0, -3]} length={8} />
      {/* Concrete pad */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.3, 3]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Yellow warning ring */}
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.6, 0.05, 8, 32]} />
        <meshStandardMaterial color="#FFC107" emissive="#FFC107" emissiveIntensity={0.3} metalness={0.5} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 5.3, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 10, 32]} />
        <meshStandardMaterial color="#6D6D6D" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Top head */}
      <mesh position={[0, 10.5, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.0, 1, 32]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Base access door */}
      <mesh position={[1.01, 0.8, 0]} castShadow>
        <boxGeometry args={[0.05, 0.8, 0.5]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Air louvers — 4 near base for combustion air intake */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 1.02, 0.6, Math.cos(angle) * 1.02]} rotation={[0, -angle, 0.3]} castShadow>
            <boxGeometry args={[0.4, 0.06, 0.1]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.6} roughness={0.3} />
          </mesh>
        );
      })}
      {/* Ladder with safety cage */}
      <group position={[1.05, 0, 0]}>
        {/* Left rail */}
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[0.05, 10, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
        </mesh>
        {/* Right rail */}
        <mesh position={[0.2, 5, 0]} castShadow>
          <boxGeometry args={[0.05, 10, 0.05]} />
          <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
        </mesh>
        {/* Rungs */}
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[0.1, 0.8 + i * 0.7, 0]} castShadow>
            <boxGeometry args={[0.25, 0.04, 0.04]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
          </mesh>
        ))}
        {/* Safety cage half-rings */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={`cage-${i}`} position={[0.1, 4 + i * 0.7, 0]} castShadow>
            <torusGeometry args={[0.2, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.6} />
          </mesh>
        ))}
      </group>
      {/* Ground safety markings — red circle + yellow square */}
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
function ControlBuilding({ onClick }) {
  return (
    <group position={[0, 0, 12]} onClick={onClick}>
      {/* Concrete slab */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Container body — white prefab */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.8, 2.4]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[6.1, 0.1, 2.5]} />
        <meshStandardMaterial color="#D0D0D0" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Door */}
      <mesh position={[2.5, 1, 1.21]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.08]} />
        <meshStandardMaterial color="#B0B0B0" metalness={0.4} />
      </mesh>
      {/* Door handle */}
      <mesh position={[2.7, 1, 1.26]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.05]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      {/* Windows — 3 blue-tinted glass panels */}
      {[-1.8, 0, 1.8].map((x, i) => (
        <group key={`win-${i}`}>
          <mesh position={[x, 1.8, 1.21]} castShadow>
            <boxGeometry args={[1, 0.8, 0.08]} />
            <meshStandardMaterial color="#4A6FA5" metalness={0.3} roughness={0.2} transparent opacity={0.7} />
          </mesh>
          {/* Window frame */}
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
      {/* SCADA screens visible through windows (glowing rectangles) */}
      {[-1.8, 0, 1.8].map((x, i) => (
        <mesh key={`screen-${i}`} position={[x, 1.8, 1.15]}>
          <boxGeometry args={[0.7, 0.5, 0.02]} />
          <meshStandardMaterial color={i === 0 ? "#22C55E" : i === 1 ? "#3B82F6" : "#F59E0B"} emissive={i === 0 ? "#22C55E" : i === 1 ? "#3B82F6" : "#F59E0B"} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Solar panel on roof (backup power) */}
      <mesh position={[-1.5, 3.15, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.05, 1]} />
        <meshStandardMaterial color="#1A237E" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Panel frame */}
      <mesh position={[-1.5, 3.13, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.55, 0.03, 1.05]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.7} />
      </mesh>
      {/* Cable tray running to equipment */}
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
function AtexSigns() {
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
          {/* Sign post */}
          <mesh position={[0, -1, 0]} castShadow>
            <boxGeometry args={[0.08, 2, 0.08]} />
            <meshStandardMaterial color="#8A8A8A" metalness={0.7} />
          </mesh>
          {/* Sign board */}
          <mesh castShadow>
            <boxGeometry args={[1.2, 0.6, 0.05]} />
            <meshStandardMaterial color={s.color} metalness={0.3} roughness={0.5} />
          </mesh>
          {/* Sign text */}
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
function ContainmentBerm() {
  return (
    <group position={[0, 0, 0]}>
      {/* Retention berm around digester — semi-circular wall */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        return (
          <mesh key={`berm-${i}`} position={[Math.sin(angle) * 5.5, 0.4, Math.cos(angle) * 5.5]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[1.8, 0.8, 0.25]} />
            <meshStandardMaterial color="#9AA0A4" roughness={0.9} metalness={0.1} />
          </mesh>
        );
      })}
      {/* Inner floor (slightly depressed) */}
      <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.5, 48]} />
        <meshStandardMaterial color="#8A9094" roughness={0.95} metalness={0.05} />
      </mesh>
    </group>
  );
}

// --- 15. Instrumentation visible (jauges, vannes, capteurs) ---
function Instrumentation() {
  return (
    <group>
      {/* Manomètres sur pipes gaz */}
      <group position={[8, 2.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
          <meshStandardMaterial color="#F5F5F5" metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
          <meshStandardMaterial color="#FF0000" metalness={0.2} />
        </mesh>
      </group>
      <group position={[16, 1.8, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
          <meshStandardMaterial color="#F5F5F5" metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
          <meshStandardMaterial color="#FF0000" metalness={0.2} />
        </mesh>
      </group>
      {/* Vannes à volant sur pipes substrate */}
      <group position={[-8, 1.3, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
          <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
          <meshStandardMaterial color="#5A5A5A" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshStandardMaterial color="#5A5A5A" metalness={0.7} />
        </mesh>
      </group>
      <group position={[-4, 1.8, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
          <meshStandardMaterial color="#5A5A5A" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
          <meshStandardMaterial color="#5A5A5A" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshStandardMaterial color="#5A5A5A" metalness={0.7} />
        </mesh>
      </group>
      {/* Capteur de T° sur pipe chaleur */}
      <group position={[20, 1.8, 0]}>
        <mesh>
          <boxGeometry args={[0.12, 0.25, 0.12]} />
          <meshStandardMaterial color="#D84315" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// --- 16. Détecteurs gaz CH₄/H₂S ---
function GasDetector({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.15]} />
        <meshStandardMaterial color="#FF6B00" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0.08]}>
        <boxGeometry args={[0.2, 0.12, 0.02]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#8A8A8A" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// --- 17. Sirène / gyrophare animé ---
function Siren({ position = [0, 0, 0] }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const flash = Math.sin(clock.getElapsedTime() * 8) > 0 ? 2 : 0;
      ref.current.material.emissiveIntensity = flash;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 6, 12]} />
        <meshStandardMaterial color="#7A7A7A" metalness={0.7} />
      </mesh>
      <mesh position={[0, 6.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#FF5722" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, 6.5, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#FF5722" emissive="#FF5722" emissiveIntensity={0} />
      </mesh>
      <mesh position={[0, 6.0, 0.2]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.2, 12]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
      </mesh>
    </group>
  );
}

// --- 18. Panneaux de contrôle (armoirs électriques) ---
function ControlPanel({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1, 0.15]} />
        <meshStandardMaterial color="#7A7A7A" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0.08]}>
        <boxGeometry args={[0.5, 0.8, 0.01]} />
        <meshStandardMaterial color="#6A6A6A" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[-0.15, 0.7, 0.09]}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.15, 0.55, 0.09]}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.15, 0.4, 0.09]}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// --- 19. Éclairage sécurité (lampadaires) ---
function LightPole({ position = [0, 0, 0] }) {
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

// --- 20. Pompe à digestat ---
function DigestatePump({ position = [0, 0, 0] }) {
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
    currentLook.copy(controlsRef.current.target);

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
    <ControlBuilding onClick={() => !isTourActive && handleStageClick("controle")} />
    <AtexSigns />
    <ContainmentBerm />
    <Instrumentation />
    <GasDetector position={[6, 0, 3]} />
    <GasDetector position={[13, 0, 3]} />
    <GasDetector position={[18, 0, 3]} />
    <Siren position={[32, 0, -4]} />
    <ControlPanel position={[-20, 0, -2.5]} />
    <ControlPanel position={[-12, 0, -2.5]} />
    <ControlPanel position={[4, 0, -2.5]} />
    <ControlPanel position={[12, 0, -2.5]} />
    <ControlPanel position={[20, 0, -2.5]} />
    <ControlPanel position={[28, 0, -2.5]} />
    <LightPole position={[-18, 0, 7]} />
    <LightPole position={[-3, 0, 7]} />
    <LightPole position={[12, 0, 7]} />
    <LightPole position={[27, 0, 7]} />
    <DigestatePump position={[16, 0, 2]} />

    {/* Clôtures */}
    <Fence position={[-20, 0, 5]} length={10} />
    <Fence position={[36, 0, 5]} length={10} />

    {/* Connexions entre les postes */}
    {/* GAS pipes (yellow) */}
    <Pipe from={[4, 4.5, 0]} to={[12, 2, 0]} color="#FFC107" pulse width={0.15} />
    <Pipe from={[14, 2, 0]} to={[16, 1.5, 0]} color="#FFC107" pulse width={0.15} />
    <Pipe from={[4, 4.5, 0]} to={[32, 1.5, 0]} color="#FFC107" pulse width={0.15} />
    {/* SUBSTRATE pipes (black) */}
    <Pipe from={[-17, 0.75, 0]} to={[-14, 1, 0]} color="#2A2A2A" pulse width={0.15} />
    <Pipe from={[-10, 1, 0]} to={[-6, 1.5, 0]} color="#2A2A2A" pulse width={0.15} />
    <Pipe from={[-2, 1.5, 0]} to={[0, 2, 0]} color="#2A2A2A" pulse width={0.15} />
    {/* HEAT pipes (red) */}
    <Pipe from={[24, 1.5, 0]} to={[8, 2, 0]} color="#D84315" width={0.15} />
    {/* DIGESTATE pipe (dark grey) */}
    <Pipe from={[8, 1, 0]} to={[24, 1.5, 0]} color="#4A4A4A" width={0.15} />

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
    tourElapsedTime.current = 0;
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
            gl.setClearColor("#87CEEB");
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
