import React, { useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

import { Label, Pipe, ConcreteGround, Grass, Tree, Fence } from "./components";
import { STAGES } from "./data";
import {
  WastePile, SortingStation, Mixer, Digester, DigesterCutView,
  GasTreatment, Cogeneration, PhaseSeparation, Torchere,
  ControlBuilding, AtexSigns, ContainmentBerm,
} from "./stations";
import {
  Instrumentation, GasDetector, Siren, ControlPanel, LightPole,
  DigestatePump, Extinguisher, CableTray, DrainageDitch, FlangedValve,
  DetailedContainment,
} from "./details";
import { ProcessFlow } from "./ProcessFlow";
import { GlossaryPanel } from "./components";

function Scene({ currentStage, setCurrentStage, isTourActive, tourWaypoints, setTourProgress, setCurrentWaypoint, tourElapsedTime, xray }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const waypointDuration = 5;
  const cameraSpeed = 0.1;

  const lastClickTime = useRef(0);
  const isDoubleClickPan = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

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

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e) => {
      if (isTourActive || e.button !== 0) return;
      const now = performance.now();
      if (now - lastClickTime.current < 350) {
        isDoubleClickPan.current = true;
        lastMouseX.current = e.clientX;
        lastMouseY.current = e.clientY;
        canvas.classList.add("grabbing");
        if (controlsRef.current) controlsRef.current.enabled = false;
      }
      lastClickTime.current = now;
    };

    const onPointerMove = (e) => {
      if (!isDoubleClickPan.current || !controlsRef.current) return;
      const dx = e.clientX - lastMouseX.current;
      const dy = e.clientY - lastMouseY.current;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
      const dist = camera.position.distanceTo(controlsRef.current.target);
      const panSpeed = 0.004 * dist;
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      right.multiplyScalar(-dx * panSpeed);
      up.multiplyScalar(dy * panSpeed);
      camera.position.add(right).add(up);
      controlsRef.current.target.add(right).add(up);
    };

    const onPointerUp = () => {
      if (isDoubleClickPan.current) {
        isDoubleClickPan.current = false;
        canvas.classList.remove("grabbing");
        if (controlsRef.current) controlsRef.current.enabled = true;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl, camera, isTourActive]);

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

    <WastePile onClick={() => !isTourActive && handleStageClick("collecte")} />
    <SortingStation onClick={() => !isTourActive && handleStageClick("tri")} xray={xray} />
    <Mixer onClick={() => !isTourActive && handleStageClick("pretraitement")} xray={xray} />
    {["hydrolyse", "acidogenese", "acetogenese", "methanogenese"].includes(currentStage) ? (
      <DigesterCutView stage={currentStage} />
    ) : (
      <Digester onClick={() => !isTourActive && handleStageClick("methaniseur")} xray={xray} />
    )}
    <GasTreatment onClick={() => !isTourActive && handleStageClick("traitement_biogaz")} xray={xray} />
    <Cogeneration onClick={() => !isTourActive && handleStageClick("cogeneration")} xray={xray} />
    <PhaseSeparation onClick={() => !isTourActive && handleStageClick("separation_phases")} xray={xray} />
    <Torchere onClick={() => !isTourActive && handleStageClick("torchere")} />
    <ControlBuilding onClick={() => !isTourActive && handleStageClick("controle")} />
    <AtexSigns />
    <ContainmentBerm />
    <DetailedContainment position={[0, 0, 0]} radius={5.5} />
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

    <Extinguisher position={[-19, 0, 3]} />
    <Extinguisher position={[4, 0, -3]} />
    <Extinguisher position={[12, 0, -3]} />
    <Extinguisher position={[20, 0, 3]} />
    <Extinguisher position={[36, 0, -2]} />

    <CableTray points={[[6, 0.3, 3], [6, 0.3, 8], [0, 0.3, 8], [0, 0.3, 12]]} />
    <CableTray points={[[13, 0.3, 3], [13, 0.3, 8], [0, 0.3, 10]]} />
    <CableTray points={[[18, 0.3, 3], [18, 0.3, 8], [0, 0.3, 11]]} />

    <DrainageDitch from={[-22, 0, 9]} to={[42, 0, 9]} />
    <DrainageDitch from={[-22, 0, -6]} to={[42, 0, -6]} />

    <FlangedValve position={[6, 2, 0]} />
    <FlangedValve position={[15, 1.7, 0]} />
    <FlangedValve position={[-9, 1.1, 0]} />
    <FlangedValve position={[24, 1.5, 0]} />

    <Fence position={[-20, 0, 5]} length={10} />
    <Fence position={[36, 0, 5]} length={10} />

    <Pipe from={[4, 4.5, 0]} to={[12, 2, 0]} color="#FFC107" pulse width={0.15} />
    <Pipe from={[14, 2, 0]} to={[16, 1.5, 0]} color="#FFC107" pulse width={0.15} />
    <Pipe from={[4, 4.5, 0]} to={[32, 1.5, 0]} color="#FFC107" pulse width={0.15} />
    <Pipe from={[-17, 0.75, 0]} to={[-14, 1, 0]} color="#2A2A2A" pulse width={0.15} />
    <Pipe from={[-10, 1, 0]} to={[-6, 1.5, 0]} color="#2A2A2A" pulse width={0.15} />
    <Pipe from={[-2, 1.5, 0]} to={[0, 2, 0]} color="#2A2A2A" pulse width={0.15} />
    <Pipe from={[24, 1.5, 0]} to={[8, 2, 0]} color="#D84315" width={0.15} />
    <Pipe from={[8, 1, 0]} to={[24, 1.5, 0]} color="#4A4A4A" width={0.15} />

    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={100}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2.05}
      panSpeed={1.0}
      zoomSpeed={1.2}
      rotateSpeed={0.6}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      enablePan={!isTourActive}
      enableRotate={!isTourActive}
    />
  </>
);
}

function App() {
  const [currentStage, setCurrentStage] = useState("collecte");
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [tourProgress, setTourProgress] = useState(0);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [xrayMode, setXrayMode] = useState(false);

  const tourWaypoints = [
    {
      cameraPos: [-5, 10, 50],
      target: [0, 0, 0],
      text: "Bienvenue dans cette visite guidée d'une installation de méthanisation industrielle. Nous allons explorer chaque étape du processus, de la collecte des déchets organiques à la production d'énergie renouvelable.",
      stage: null,
    },
    {
      cameraPos: [-25, 8, 0],
      target: [-20, 0, 0],
      text: "Étape 1 — Collecte : Les déchets organiques sont acheminés par camions-bennes ou pompiers. Substrats courants : fumier (15–25% MS), marc de pomme, résidus verts, lisiers porcins. Le ratio C/N optimal est de 20–30:1 pour assurer une bonne digestion.",
      stage: "collecte",
    },
    {
      cameraPos: [-17, 8, 0],
      target: [-12, 0, 0],
      text: "Étape 2 — Réception et tri : Les matériaux indésirables (pierres, métaux, plastiques, verre) sont retirés par crible vibrant et tri manuel. Le taux de rejet est de 5–15% du flux brut. C'est une étape essentielle pour protéger le broyeur en aval.",
      stage: "tri",
    },
    {
      cameraPos: [-9, 8, 0],
      target: [-4, 0, 0],
      text: "Étape 3 — Prétraitement : Le substrat est broyé à < 10 mm puis mélangé pour obtenir une homogénéité optimale. La teneur en matière sèche est ajustée à 10–12% par ajout d'eau si nécessaire. Le broyeur consomme 15–30 kW.",
      stage: "pretraitement",
    },
    {
      cameraPos: [0, 10, 8],
      target: [4, 0, 0],
      text: "Étape 4 — Méthaniseur : C'est le cœur du système ! Cette cuve béton de 500–2 000 m³ maintient une température de 35–37°C (régime mésophile) où des archées méthanogènes (Methanosarcina, Methanosaeta) décomposent la matière organique en absence d'oxygène. Le temps de rétention est de 20–40 jours. Le biogaz produit (~120 m³/tonne MS) s'accumule sous le dôme EPDM.",
      stage: "methaniseur",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Hydrolyse — Étape limitante : Les bactéries extracellulaires (Clostridium, Bacteroides) sécrètent des enzymes (cellulases, protéines, lipases) qui décomposent les polymères en monomères. Équation : (C₆H₁₀O₅)ₙ + nH₂O → nC₆H₁₂O₆ (glucose).",
      stage: "hydrolyse",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Acidogenèse : Les bactéries fermentaires (Clostridium, E. coli) transforment les sucres en acides gras volatils (propionique, butyrique), alcools, CO₂ et H₂. Le pH chute à 5.5–6.5. Équation : C₆H₁₂O₆ → 2CH₃COOH + 2CO₂ + 2H₂.",
      stage: "acidogenese",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Acétogenèse : Les bactéries acétogènes (Syntrophomonas) convertissent les AGV en acétate, H₂ et CO₂. Cette étape est en symbiose obligatoire avec les méthanogènes : elle nécessite une pression partielle H₂ < 10⁻⁴ atm pour être favorable.",
      stage: "acetogenese",
    },
    {
      cameraPos: [0, 10, 5],
      target: [4, 0, 0],
      text: "Méthanogenèse — Production de CH₄ : Deux voies par les archées. Voie acétoclastique (CH₃COOH → CH₄ + CO₂, 70%) et voie hydrogénotrope (CO₂ + 4H₂ → CH₄ + 2H₂O, 30%). Rendement : ~350 L CH₄/kg matière volatile.",
      stage: "methanogenese",
    },
    {
      cameraPos: [8, 10, 8],
      target: [12, 0, 0],
      text: "Étape 5 — Épuration du biogaz : Le biogaz brut contient H₂S (50–5 000 ppm, toxique et corrosif). Il est épuré par filtration ferrique ou bioréparation avant stockage sous dôme EPDM souple à 5–30 mbar. Le biométhane (> 95% CH₄) peut être injecté en réseau.",
      stage: "traitement_biogaz",
    },
    {
      cameraPos: [16, 10, 8],
      target: [20, 0, 0],
      text: "Étape 6 — Cogénération : Le biogaz alimente un moteur à combustion interne. Rendement : 35% électricité (100–500 kWe) + 65% chaleur récupérée pour le chauffage ou le séchage. Consommation : ~6 000 m³ biogaz/MWh. Le méthane (GWP = 28×CO₂) est transformé en CO₂ biogénique (neutre en carbone).",
      stage: "cogeneration",
    },
    {
      cameraPos: [24, 10, 8],
      target: [28, 0, 0],
      text: "Étape 7 — Séparation de phases : Le digestat sorti du méthaniseur est séparé par screw press en phase solide (30–40% DS → compost, paillage) et phase liquide (60–70%, 3–5 g/L azote → engrais azoté). Le C/N du compost final est < 20.",
      stage: "separation_phases",
    },
    {
      cameraPos: [32, 10, 8],
      target: [36, 0, 0],
      text: "Étape 8 — Torchère : En cas de surproduction ou maintenance, la torchère brûle l'excédent de CH₄ (~1 000°C). Le méthane (GWP = 28×CO₂) est ainsi transformé en CO₂, réduisant l'impact climatique de 96%. Norme ATEX / EN 1127-1.",
      stage: "torchere",
    },
    {
      cameraPos: [0, 15, 50],
      target: [0, 0, 0],
      text: "Merci d'avoir visité cette installation de méthanisation ! Vous savez maintenant comment 5 000–10 000 tonnes de déchets organiques par an sont transformées en 500 kWe d'électricité renouvelable et en engrais agronomique.",
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
        xray={xrayMode}
      />
    </Canvas>
          <button className={"xray-btn" + (xrayMode ? " active" : "")} onClick={() => setXrayMode(v => !v)}>
            🔍 Mode X-ray
          </button>
          <button className="glossary-btn" onClick={() => setGlossaryOpen(true)}>
            📖 GLOSSAIRE
          </button>
          <ProcessFlow currentStage={currentStage} onStageClick={(id) => !isTourActive && setCurrentStage(id)} />
          <div className="hint">
            {isTourActive
              ? `Visite en cours : ${Math.round(tourProgress * 100)}%`
              : "Clic gauche = Tourner · Double-clic glisser / Clic droit glisser = Déplacer · Molette = Zoom · Clic sur étape = Centrer"}
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
            ) : (() => {
              const stage = STAGES.find(s => s.id === currentStage);
              if (!stage) return null;
              return (
                <>
                  <div className="stage-number">
                    {String(currentIndex + 1).padStart(2, "0")}
                  </div>
                  <h2>{stage.title}</h2>
                  <p>{stage.text}</p>
                  <div className="progress">
                    <span style={{ width: `${((currentIndex + 1) / STAGES.length) * 100}%` }} />
                  </div>
                  {stage.equation && (
                    <div className="stage-extra">
                      <h4>ÉQUATION</h4>
                      <p style={{ fontFamily: "'Space Mono', monospace", color: "#C6D0D5", fontSize: "11px" }}>{stage.equation}</p>
                    </div>
                  )}
                  {stage.bacteria && stage.bacteria !== "—" && (
                    <div className="stage-extra" style={{ borderLeftColor: "#D8A93E", marginTop: "6px" }}>
                      <h4 style={{ color: "#D8A93E" }}>MICRO-ORGANISMES</h4>
                      <p>{stage.bacteria}</p>
                    </div>
                  )}
                  {stage.temperature && stage.temperature !== "Ambiante" && (
                    <div className="stage-metrics">
                      <div className="stage-metric">
                        <div className="stage-metric-label">T°</div>
                        <div className="stage-metric-value">{stage.temperature}</div>
                      </div>
                      <div className="stage-metric">
                        <div className="stage-metric-label">pH</div>
                        <div className="stage-metric-value">{stage.ph}</div>
                      </div>
                      <div className="stage-metric">
                        <div className="stage-metric-label">TRH</div>
                        <div className="stage-metric-value">{stage.retentionTime}</div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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
            <div className="panel-title" style={{ marginBottom: "8px" }}>
              {isTourActive ? "DONNÉES GÉNÉRALES" : `DONNÉES — ${STAGES.find(s => s.id === currentStage)?.title?.toUpperCase() || ""}`}
            </div>
            {isTourActive ? (
              <>
                <div><b>Biogaz</b><span>CH₄ (50-75%) + CO₂ + H₂S</span></div>
                <div><b>Cogénération</b><span>35% électricité, 65% chaleur</span></div>
                <div><b>Pression gazomètre</b><span>Quelques mbar (dôme EPDM)</span></div>
                <div><b>Capacité</b><span>5 000–10 000 t/an</span></div>
              </>
            ) : (() => {
              const stage = STAGES.find(s => s.id === currentStage);
              const facts = stage?.facts;
              if (!facts || facts.length === 0) return <p style={{ fontSize: "12px" }}>Aucune donnée spécifique pour cette étape.</p>;
              return (
                <div className="facts-dynamic">
                  {facts.map((f, i) => (
                    <div key={i} className="fact-row">
                      <span className="fact-label">{f.label}</span>
                      <span className="fact-value">{f.value}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </aside>
      </main>
      <GlossaryPanel isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
