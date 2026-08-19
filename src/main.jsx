import React, { useRef, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

// ============================================
// DONNÉES : Étapes du processus
// ============================================
const STAGES = [
  { id: "collecte", label: "01 · Collecte", title: "Collecte des déchets", text: "Les déchets organiques sont réunis comme matière première du processus.", color: "#B88955", position: [-12, 0, 0] },
  { id: "tri", label: "02 · Réception / Tri", title: "Réception et tri", text: "Les éléments indésirables (pierres, sable, produits chimiques) sont retirés avant d'entrer dans le processus.", color: "#B88955", position: [-6, 0, 0] },
  { id: "pretraitement", label: "03 · Prétraitement", title: "Prétraitement", text: "Le substrat est broyé, mélangé et homogénéisé pour faciliter la digestion.", color: "#C99A61", position: [0, 0, 0] },
  { id: "methaniseur", label: "04 · Méthaniseur", title: "Digestion anaérobie", text: "Cœur du système : les micro-organismes décomposent la matière organique en absence d'oxygène (hydrolyse → acidogenèse → acétogenèse → méthanogenèse).", color: "#68B58C", position: [6, 0, 0] },
  { id: "traitement_biogaz", label: "05 · Traitement du biogaz", title: "Épuration et stockage", text: "Le biogaz est épuré (H₂S, CO₂, humidité) puis stocké sous un dôme EPDM à faible pression (quelques mbar).", color: "#D8A93E", position: [12, 0, 0] },
  { id: "cogeneration", label: "06 · Cogénération", title: "Production d'énergie", text: "Le biogaz alimente un moteur de cogénération (rendement électrique ~35%, le reste en chaleur).", color: "#DE7248", position: [18, 0, 0] },
  { id: "separation_phases", label: "07 · Séparation de phases", title: "Traitement du digestat", text: "Le digestat est séparé en phase solide (dalle béton) et phase liquide (cuve de stockage) pour épandage agronomique.", color: "#58C993", position: [24, 0, 0] },
  { id: "torchere", label: "08 · Torchère", title: "Sécurité", text: "La torchère brûle l'excédent de biogaz en cas de surproduction ou de maintenance.", color: "#FF5722", position: [30, 0, 0] },
];

// ============================================
// COMPOSANTS RÉUTILISABLES
// ============================================

// --- Label 3D ---
function Label({ children, position = [0, 0, 0], color = "#65C99A" }) {
  return (
    <Html center position={position} distanceFactor={10}>
      <div className="scene-label" style={{ color, borderColor: color }}>
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
        <meshStandardMaterial color="#314047" metalness={0.6} roughness={0.4} />
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

// --- Sol en béton ---
function ConcreteGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#5A6A72" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// ============================================
// COMPOSANTS DES POSTES
// ============================================

// --- 1. Tas de déchets (Collecte) ---
function WastePile() {
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
    <group position={[-12, 0.75, 0]}>
      {items.map((d, i) => (
        <mesh key={i} position={d.p} rotation={d.r} scale={d.s} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={i % 4 === 0 ? "#4F6845" : i % 3 === 0 ? "#8C6A43" : "#6D5338"}
            roughness={0.9}
          />
        </mesh>
      ))}
      <Label position={[0, 2.5, 0]} color="#B88955">
        DÉCHETS ORGANIQUES
      </Label>
      <Label position={[0, 2, 0]} color="#B88955" style={{ fontSize: "10px" }}>
        (Fumier, déchets alimentaires, résidus agricoles)
      </Label>
    </group>
  );
}

// --- 2. Station de tri ---
function SortingStation() {
  return (
    <group position={[-6, 0, 0]}>
      {/* Bâtiment de tri */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 3]} />
        <meshStandardMaterial color="#28363B" metalness={0.35} roughness={0.7} />
      </mesh>
      {/* Toit */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[4.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#3C4C51" />
      </mesh>
      {/* Convoyeur */}
      <mesh position={[0, 1.5, 1.6]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[4.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.5} />
      </mesh>
      {/* Éléments sur le convoyeur */}
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
    </group>
  );
}

// --- 3. Broyeur / Mélangeur ---
function Mixer() {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 1.2;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Cuve du broyeur */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2, 3, 48]} />
        <meshStandardMaterial color="#46555A" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Couvercle */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[2.1, 2.1, 0.2, 48]} />
        <meshStandardMaterial color="#69C799" emissive="#163B2A" emissiveIntensity={0.6} />
      </mesh>
      {/* Agitateur (pales) */}
      <group ref={ref} position={[0, 1.5, 0]}>
        {/* Arbre central */}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 4.5, 16]} />
          <meshStandardMaterial color="#3A4A52" metalness={0.7} />
        </mesh>
        {/* Pales */}
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} position={[0, (i - 1.5) * 1.2, 0]} rotation={[0, 0, i * (Math.PI / 2)]}>
            <mesh castShadow>
              <boxGeometry args={[1.8, 0.1, 0.15]} />
              <meshStandardMaterial color="#5A6A72" metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Entrée du substrat */}
      <mesh position={[-2.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.6} />
      </mesh>
      {/* Sortie vers le méthaniseur */}
      <mesh position={[2.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.6} />
      </mesh>
      <Label position={[0, 4, 0]} color="#C99A61">
        BROYEUR / MÉLANGEUR
      </Label>
      <Label position={[0, 3.5, 0]} color="#C99A61" style={{ fontSize: "10px" }}>
        (Homogénéisation du substrat)
      </Label>
    </group>
  );
}

// --- 4. Méthaniseur (avec dôme EPDM et agitateurs) ---
function Digester({ onClick }) {
  const domeRef = useRef();
  const agitatorRef = useRef();

  // Animation du dôme (légère pulsation pour simuler le gaz)
  useFrame(({ clock }) => {
    if (domeRef.current) {
      domeRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
    if (agitatorRef.current) {
      agitatorRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[6, 0, 0]} onClick={onClick}>
      {/* Cuve du digesteur (cylindre principal) */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 5, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#24433A"
          transparent
          opacity={0.3}
          transmission={0.2}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Dôme EPDM (gazomètre) */}
      <mesh ref={domeRef} position={[0, 4.5, 0]} castShadow>
        <sphereGeometry args={[3.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#1A2A20"
          emissive="#005500"
          emissiveIntensity={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Agitateurs (2 pales visibles à travers la paroi) */}
      <group ref={agitatorRef} position={[0, 1.5, 0]}>
        {/* Arbre central */}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 4.5, 16]} />
          <meshStandardMaterial color="#3A4A52" metalness={0.7} />
        </mesh>
        {/* Pales */}
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} position={[0, (i - 1.5) * 1.2, 0]} rotation={[0, 0, i * (Math.PI / 2)]}>
            <mesh castShadow>
              <boxGeometry args={[1.8, 0.1, 0.15]} />
              <meshStandardMaterial color="#5A6A72" metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Entrée du substrat */}
      <mesh position={[-3.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.6} />
      </mesh>

      {/* Sortie du digestat */}
      <mesh position={[3.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.6} />
      </mesh>

      {/* Sortie du biogaz (vers le dôme) */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#314047" metalness={0.6} />
      </mesh>

      <Label position={[0, 6, 0]} color="#68B58C">
        MÉTHANISEUR
      </Label>
      <Label position={[0, 5.5, 0]} color="#68B58C" style={{ fontSize: "10px" }}>
        (Digestion anaérobie + Dôme EPDM)
      </Label>
    </group>
  );
}

// --- Vue en coupe du méthaniseur (pour les étapes biologiques) ---
function DigesterCutView({ stage }) {
  const cfg = {
    hydrolyse: { color: "#C99A61", left: ["Glucides", "Protéines", "Lipides"], right: ["Sucres", "Acides aminés", "Acides gras"] },
    acidogenese: { color: "#D88961", left: ["Molécule simples"], right: ["Acides organiques", "Alcools", "CO₂ + H₂"] },
    acetogenese: { color: "#B7C66D", left: ["Acides + alcools"], right: ["Acétate", "H₂", "CO₂"] },
    methanogenese: { color: "#D8A93E", left: ["Acétate", "H₂ + CO₂"], right: ["CH₄", "Biogaz brut"] },
  }[stage];

  const isMeth = stage === "methanogenese";

  return (
    <group position={[6, 0, 0]}>
      {/* Cuve en coupe (transparente) */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[3, 3, 5, 64, 1, true, 0, Math.PI]} />
        <meshPhysicalMaterial
          color="#24433A"
          transparent
          opacity={0.2}
          transmission={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dôme EPDM */}
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[3.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1A2A20" transparent opacity={0.4} />
      </mesh>

      {/* Molécules à gauche */}
      <group position={[-1.5, 0, 0]}>
        {cfg?.left?.map((t, i) => (
          <Molecule key={t} label={t} y={(i - (cfg.left.length - 1) / 2) * 1.2} color="#B88955" />
        ))}
      </group>

      {/* Molécules à droite */}
      <group position={[1.5, 0, 0]}>
        {cfg?.right?.map((t, i) => (
          <Molecule key={t} label={t} y={(i - (cfg.right.length - 1) / 2) * 1.2} color={isMeth ? "#D8A93E" : "#65C99A"} />
        ))}
      </group>

      {/* Flèches de flux */}
      <ArrowFlow color={cfg?.color || "#65C99A"} />
      {isMeth && <GasCloud />}

      {/* Titre de l'étape */}
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
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
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
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
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
          />
        </mesh>
      ))}
    </group>
  );
}

// --- 5. Traitement du biogaz (Épuration + Stockage) ---
function GasTreatment() {
  return (
    <group position={[12, 0, 0]}>
      {/* Bâtiment d'épuration */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 2]} />
        <meshStandardMaterial color="#34464C" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Toit */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[3.2, 0.2, 2.2]} />
        <meshStandardMaterial color="#4A5A62" />
      </mesh>

      {/* Filtre à H₂S (cylindre avec particules) */}
      <mesh position={[-1.5, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.6} />
      </mesh>

      {/* Stockage sous dôme EPDM (plus petit) */}
      <mesh position={[1.5, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1A2A20" emissive="#005500" emissiveIntensity={0.2} />
      </mesh>

      {/* Tuyau d'entrée (depuis le méthaniseur) */}
      <Pipe from={[3, 2.5, 0]} to={[4.5, 2.5, 0]} color="#D8A93E" pulse />

      {/* Tuyau de sortie (vers la cogénération) */}
      <Pipe from={[-4.5, 2.5, 0]} to={[-3, 2.5, 0]} color="#D8A93E" pulse />

      <Label position={[0, 4, 0]} color="#D8A93E">
        TRAITEMENT DU BIOGAZ
      </Label>
      <Label position={[0, 3.5, 0]} color="#D8A93E" style={{ fontSize: "10px" }}>
        (Épuration H₂S/CO₂ + Stockage)
      </Label>
    </group>
  );
}

// --- 6. Cogénération (moteur industriel) ---
function Cogeneration() {
  return (
    <group position={[18, 0, 0]}>
      {/* Conteneur technique (moteur) */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.5, 3]} />
        <meshStandardMaterial color="#2C3E44" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Toit du conteneur */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <boxGeometry args={[4.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#3C4C51" />
      </mesh>

      {/* Échappement (cheminée) */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.7} />
      </mesh>

      {/* Radiateur (pour la chaleur) */}
      <mesh position={[2, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.2, 1.5, 1]} />
        <meshStandardMaterial color="#DE7248" emissive="#8A3B00" emissiveIntensity={0.5} />
      </mesh>

      {/* Générateur (électricité) */}
      <mesh position={[-2, 1.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1.5]} />
        <meshStandardMaterial color="#E2B93E" emissive="#8A6B00" emissiveIntensity={0.5} />
      </mesh>

      {/* Tuyau d'entrée (biogaz) */}
      <Pipe from={[-3, 2.5, 0]} to={[-4.5, 2.5, 0]} color="#D8A93E" pulse />

      {/* Sortie chaleur */}
      <Pipe from={[2, 1.5, 0]} to={[3.5, 1.5, 0]} color="#DE7248" pulse />

      {/* Sortie électricité */}
      <Pipe from={[-2, 1.5, 0]} to={[-3.5, 1.5, 0]} color="#E2B93E" pulse />

      <Label position={[0, 4, 0]} color="#DE7248">
        COGÉNÉRATION
      </Label>
      <Label position={[0, 3.5, 0]} color="#DE7248" style={{ fontSize: "10px" }}>
        (35% électricité, 65% chaleur)
      </Label>
    </group>
  );
}

// --- 7. Séparation de phases (digestat) ---
function PhaseSeparation() {
  return (
    <group position={[24, 0, 0]}>
      {/* Dalle béton (phase solide) */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#5A6A72" roughness={0.9} />
      </mesh>

      {/* Tas de digestat solide */}
      <mesh position={[-1.5, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#4F6845" roughness={0.8} />
      </mesh>

      {/* Cuve de stockage (phase liquide) */}
      <mesh position={[1.5, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 3, 32]} />
        <meshStandardMaterial color="#34464C" metalness={0.4} />
      </mesh>

      {/* Séparateur (cylindre horizontal) */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 3, 32]} />
        <meshStandardMaterial color="#4A5A62" metalness={0.5} />
      </mesh>

      {/* Tuyau d'entrée (depuis le méthaniseur) */}
      <Pipe from={[-3, 1.5, 0]} to={[-4.5, 1.5, 0]} color="#68B58C" pulse />

      <Label position={[0, 3, 0]} color="#58C993">
        SÉPARATION DE PHASES
      </Label>
      <Label position={[0, 2.5, 0]} color="#58C993" style={{ fontSize: "10px" }}>
        (Solide → dalle | Liquide → cuve)
      </Label>
    </group>
  );
}

// --- 8. Torchère de sécurité ---
function Torchere() {
  const flameRef = useRef();

  // Animation de la flamme
  useFrame(({ clock }) => {
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      flameRef.current.scale.x = 0.8 + Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
      flameRef.current.scale.z = 0.8 + Math.sin(clock.getElapsedTime() * 1.2) * 0.1;
    }
  });

  return (
    <group position={[30, 0, 0]}>
      {/* Structure de la torchère (plus grande) */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 8, 16]} />
        <meshStandardMaterial color="#3A4A52" metalness={0.7} />
      </mesh>

      {/* Brûleur (partie supérieure) */}
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1, 1, 16]} />
        <meshStandardMaterial color="#5A6A72" metalness={0.6} />
      </mesh>

      {/* Flamme (plus grande) */}
      <mesh ref={flameRef} position={[0, 9.5, 0]} castShadow>
        <coneGeometry args={[0.8, 2.5, 16]} />
        <meshStandardMaterial
          color="#FF5722"
          emissive="#FF8C00"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Tuyau d'entrée (biogaz excédentaire) */}
      <Pipe from={[-3, 3, 0]} to={[0, 3, 0]} color="#D8A93E" pulse />

      <Label position={[0, 11, 0]} color="#FF5722">
        TORCHÈRE DE SÉCURITÉ
      </Label>
      <Label position={[0, 10.5, 0]} color="#FF5722" style={{ fontSize: "10px" }}>
        (Brûlage des excédents)
      </Label>
    </group>
  );
}

// ============================================
// SCÈNE PRINCIPALE
// ============================================

function Scene({ currentStage, setCurrentStage }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  // Déplacement de la caméra vers un poste
  const moveToPost = (position) => {
    if (controlsRef.current) {
      controlsRef.current.setLookAt(
        position.x,
        position.y + 2,
        position.z + 5,
        position.x,
        position.y + 1,
        position.z,
        true
      );
    }
  };

  // Gestion du clic sur les postes
  const handlePostClick = (stageId) => {
    setCurrentStage(stageId);
    const stage = STAGES.find(s => s.id === stageId);
    if (stage) moveToPost(stage.position);
  };

  return (
    <>
      {/* Éclairage extérieur réaliste */}
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

      {/* Lumière ambiante */}
      <ambientLight intensity={0.6} />

      {/* Lumière directionnelle (soleil) */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Lumière ponctuelle pour les détails */}
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#65C99A" />

      {/* Sol en béton */}
      <ConcreteGround />

      {/* Postes de l'installation */}
      <WastePile />
      <SortingStation />
      <Mixer />

      {/* Méthaniseur (affichage normal ou en coupe) */}
      {currentStage === "hydrolyse" || currentStage === "acidogenese" || currentStage === "acetogenese" || currentStage === "methanogenese" ? (
        <DigesterCutView stage={currentStage} />
      ) : (
        <Digester onClick={() => handlePostClick("methaniseur")} />
      )}

      <GasTreatment />
      <Cogeneration />
      <PhaseSeparation />
      <Torchere />

      {/* Connexions entre les postes */}
      <Pipe from={[-9, 0.75, 0]} to={[-3.5, 1.5, 0]} color="#B88955" pulse />
      <Pipe from={[-3.5, 1.5, 0]} to={[0, 2.5, 0]} color="#C99A61" pulse />
      <Pipe from={[2.5, 0.5, 0]} to={[3.5, 2.5, 0]} color="#68B58C" pulse />
      <Pipe from={[8.5, 4.5, 0]} to={[10, 2.5, 0]} color="#D8A93E" pulse />
      <Pipe from={[14.5, 2.5, 0]} to={[16, 2.5, 0]} color="#D8A93E" pulse />
      <Pipe from={[20.5, 1.5, 0]} to={[22, 1.5, 0]} color="#68B58C" pulse />

      {/* Contrôles de caméra */}
      <OrbitControls
        ref={controlsRef}
        rotateSpeed={1.5}
        zoomSpeed={1.2}
        panSpeed={0.8}
        minDistance={5}
        maxDistance={50}
        enablePan={true}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ============================================
// APPLICATION PRINCIPALE
// ============================================

function App() {
  const [currentStage, setCurrentStage] = useState("collecte");

  // Trouver l'index de l'étape actuelle
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  // Changer d'étape
  const changeStage = (index) => {
    const newStage = STAGES[Math.max(0, Math.min(STAGES.length - 1, index))].id;
    setCurrentStage(newStage);
  };

  return (
    <div className="app">
      <header>
        <div>
          <div className="eyebrow">BIOFLOW 3D · SIMULATION RÉALISTE</div>
          <h1>Visite virtuelle d'une installation de méthanisation</h1>
          <p>Explorez chaque poste en cliquant sur les étapes ou en naviguant dans la scène 3D.</p>
        </div>
        <div className="controls">
          <button onClick={() => changeStage(currentIndex - 1)} disabled={currentIndex === 0}>
            ← Précédent
          </button>
          <button onClick={() => changeStage(currentIndex + 1)} disabled={currentIndex === STAGES.length - 1}>
            Suivant →
          </button>
          <button onClick={() => changeStage(0)}>Réinitialiser</button>
        </div>
      </header>

      <main>
        <section className="viewport">
          <Canvas
            camera={{ position: [-5, 10, 25], fov: 50 }}
            shadows
          >
            <color attach="background" args={["#87CEEB"]} />
            <Scene currentStage={currentStage} setCurrentStage={setCurrentStage} />
          </Canvas>
          <div className="hint">
            Glisser = rotation · Molette = zoom · Clic droit = déplacement · Clic sur une étape = centrer la caméra
          </div>
        </section>

        <aside>
          <div className="panel">
            <div className="panel-title">ÉTAPE ACTUELLE</div>
            <div className="stage-number">{String(currentIndex + 1).padStart(2, "0")}</div>
            <h2>{STAGES.find(s => s.id === currentStage)?.title}</h2>
            <p>{STAGES.find(s => s.id === currentStage)?.text}</p>
            <div className="progress">
              <span style={{ width: `${((currentIndex + 1) / STAGES.length) * 100}%` }} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">CHAÎNE DU PROCESSUS</div>
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                className={"stage-row " + (i === currentIndex ? "selected" : "")}
                onClick={() => setCurrentStage(s.id)}
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