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

function Scene({ currentStage, setCurrentStage, isTourActive, tourWaypoints, setTourProgress, setCurrentWaypoint, tourElapsedTime }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const waypointDuration = 5;
  const cameraSpeed = 0.1;

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
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={100}
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
