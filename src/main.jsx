import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, TrackballControls } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

const STAGES = [
  { id:"collecte", label:"01 · Collecte", title:"Collecte des déchets", text:"Les déchets organiques sont réunis comme matière première du procédé.", color:"#B88955" },
  { id:"tri", label:"02 · Réception / tri", title:"Réception et tri", text:"Les éléments indésirables sont retirés avant d'entrer dans le procédé.", color:"#B88955" },
  { id:"pretraitement", label:"03 · Prétraitement", title:"Prétraitement", text:"Le substrat est broyé, mélangé et homogénéisé pour faciliter la digestion.", color:"#C99A61" },
  { id:"hydrolyse", label:"04 · Hydrolyse", title:"Hydrolyse", text:"Les glucides, protéines et lipides complexes deviennent des molécules plus simples.", color:"#68B58C" },
  { id:"acidogenese", label:"05 · Acidogenèse", title:"Acidogenèse", text:"Les molécules simples sont transformées en acides organiques, alcools, CO₂ et H₂.", color:"#68B58C" },
  { id:"acetogenese", label:"06 · Acétogenèse", title:"Acétogenèse", text:"Les intermédiaires sont convertis principalement en acétate, H₂ et CO₂.", color:"#68B58C" },
  { id:"methanogenese", label:"07 · Méthanogenèse", title:"Méthanogenèse", text:"Les archées méthanogènes produisent le méthane qui donne sa valeur énergétique au biogaz.", color:"#D8A93E" },
  { id:"valorisation", label:"08 · Valorisation", title:"Traitement et valorisation", text:"Le biogaz est traité puis utilisé pour produire chaleur, électricité ou biométhane.", color:"#58C993" }
];

function Label({children, position=[0,0,0], color="#65C99A"}) {
  return <Html center position={position} distanceFactor={8}><div className="scene-label" style={{color,borderColor:color}}>{children}</div></Html>;
}

function Pipe({from,to,color="#65C99A",pulse=false}) {
  const a=new THREE.Vector3(...from), b=new THREE.Vector3(...to), mid=a.clone().add(b).multiplyScalar(.5);
  const dir=b.clone().sub(a), len=dir.length();
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
  return <group><mesh position={mid} quaternion={q}><cylinderGeometry args={[.055,.055,len,16]}/><meshStandardMaterial color="#314047" metalness={.6}/></mesh>{pulse&&<FlowParticle from={from} to={to} color={color}/>}</group>;
}

function FlowParticle({from,to,color}) {
  const ref=useRef(); const a=new THREE.Vector3(...from), b=new THREE.Vector3(...to);
  useFrame(({clock})=>{ if(ref.current){ const t=(clock.getElapsedTime()*.32)%1; ref.current.position.lerpVectors(a,b,t); }});
  return <mesh ref={ref}><sphereGeometry args={[.11,12,12]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2}/></mesh>;
}

function WastePile({stage}) {
  const items=useMemo(()=>Array.from({length:28},(_,i)=>({
    p:[(Math.random()-.5)*2.2, Math.random()*1.2-.45, (Math.random()-.5)*1.6],
    s:.18+Math.random()*.22, r:[Math.random()*2,Math.random()*2,Math.random()*2]
  })),[]);
  return <group position={[-1.8,0,0]}>
    {items.map((d,i)=><mesh key={i} position={d.p} rotation={d.r} scale={d.s}>
      <dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={i%4===0?"#4F6845":i%3===0?"#8C6A43":"#6D5338"} roughness={.9}/>
    </mesh>)}
    <Label position={[0,1.25,0]} color="#B88955">DÉCHETS ORGANIQUES</Label>
    <Pipe from={[1.1,0,0]} to={[2.7,0,0]} color="#B88955" pulse={stage==="collecte"}/>
  </group>;
}

function SortingStation({stage}) {
  return <group>
    <mesh position={[0,0,0]}><boxGeometry args={[3.1,1.5,2.2]}/><meshStandardMaterial color="#28363B" metalness={.35}/></mesh>
    <mesh position={[0,.83,0]}><boxGeometry args={[3.25,.12,2.35]}/><meshStandardMaterial color="#3C4C51"/></mesh>
    <group position={[0,.9,0]}>{Array.from({length:10},(_,i)=><mesh key={i} position={[(i-4.5)*.28,.08,0]} scale={[.12,.22,.12]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color={i%3===0?"#66747A":"#765B3D"}/></mesh>)}</group>
    <Label position={[0,1.35,0]} color="#B88955">{stage==="tri"?"TRI / SÉPARATION":"PRÉPARATION"}</Label>
    <Pipe from={[-2.8,0,0]} to={[-1.55,0,0]} color="#B88955" pulse={stage!=="collecte"}/>
    <Pipe from={[1.55,0,0]} to={[2.8,0,0]} color="#C99A61" pulse/>
  </group>;
}

function Mixer({stage}) {
  const ref=useRef();
  useFrame((_,dt)=>{if(ref.current && stage==="pretraitement") ref.current.rotation.y+=dt*1.5});
  return <group>
    <mesh position={[0,-.1,0]}><cylinderGeometry args={[1.65,1.65,2.3,48]}/><meshStandardMaterial color="#46555A" metalness={.5}/></mesh>
    <mesh position={[0,1.1,0]}><torusGeometry args={[1.48,.08,12,48]}/><meshStandardMaterial color="#69C799" emissive="#163B2A" emissiveIntensity={.6}/></mesh>
    <group ref={ref}>{Array.from({length:12},(_,i)=><mesh key={i} position={[Math.cos(i*.52)*.9,.15,Math.sin(i*.52)*.9]} rotation={[0,i*.52,0]}><boxGeometry args={[.08,.9,.08]}/><meshStandardMaterial color="#C99A61"/></mesh>)}</group>
    <Label position={[0,1.55,0]} color="#C99A61">BROYEUR / MÉLANGEUR</Label>
  </group>;
}

function MolecularScene({stage}) {
  const cfg={
    hydrolyse:{color:"#C99A61",left:["Glucides","Protéines","Lipides"],right:["Sucres","Acides aminés","Acides gras"]},
    acidogenese:{color:"#D88961",left:["Molécules simples"],right:["Acides organiques","Alcools","CO₂ + H₂"]},
    acetogenese:{color:"#B7C66D",left:["Acides + alcools"],right:["Acétate","H₂","CO₂"]},
    methanogenese:{color:"#D8A93E",left:["Acétate","H₂ + CO₂"],right:["CH₄","Biogaz brut"]}
  }[stage];
  const isMeth=stage==="methanogenese";
 return (
    <group>
      <mesh position={[0,0,0]}>
        <cylinderGeometry args={[2.25,2.25,4.6,64,1,true]}/>
        <meshPhysicalMaterial color="#24433A" transparent opacity={.28} transmission={.2} side={THREE.DoubleSide}/>
      </mesh>
      <mesh position={[0,2.35,0]}>
        <sphereGeometry args={[2.28,64,24,0,Math.PI*2,0,Math.PI/2]}/>
        <meshStandardMaterial color="#31524A" transparent opacity={.5}/>
      </mesh>
      <Label position={[0,2.75,0]} color={cfg.color}>
        {STAGES.find(s=>s.id===stage)?.title.toUpperCase()}
      </Label>
      <group position={[-1.2,0,0]}>
        {cfg.left.map((t,i)=><Molecule key={t} label={t} y={(i-(cfg.left.length-1)/2)*.8} color="#B88955"/>)}
      </group>
      <group position={[1.2,0,0]}>
        {cfg.right.map((t,i)=><Molecule key={t} label={t} y={(i-(cfg.right.length-1)/2)*.8} color={isMeth?"#D8A93E":"#65C99A"}/>)}
      </group>
      <ArrowFlow color={cfg.color}/>
      {isMeth&&<GasCloud/>}
    </group>
  );
}

function Molecule({label,y,color}) {
  return <group position={[0,y,0]}>
    <mesh><icosahedronGeometry args={[.28,1]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.25}/></mesh>
    <Label position={[0,.43,0]} color={color}>{label}</Label>
  </group>;
}
function ArrowFlow({color}) { return <group>{[-.8,0,.8].map((y,i)=><mesh key={i} position={[0,y,.05]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.09,.3,8]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.7}/></mesh>)}</group>; }
function GasCloud(){ const data=useMemo(()=>Array.from({length:24},()=>[(Math.random()-.5)*2.8,Math.random()*1.7-.5,(Math.random()-.5)*1.8]),[]); return <group>{data.map((p,i)=><mesh key={i} position={p} scale={.05+Math.random()*.08}><sphereGeometry args={[1,10,10]}/><meshStandardMaterial color={i%2?"#59CB91":"#D8A93E"} emissive={i%2?"#0A4B30":"#5A4000"} emissiveIntensity={1}/></mesh>)}</group>; }

function Valorisation(){
  return <group>
    <mesh position={[0,0,0]}><cylinderGeometry args={[1.6,1.6,2.2,48]}/><meshStandardMaterial color="#34464C" metalness={.5}/></mesh>
    <Label position={[0,1.45,0]} color="#65C99A">TRAITEMENT DU BIOGAZ</Label>
    <Pipe from={[-4,0,0]} to={[-1.65,0,0]} color="#D8A93E" pulse/>
    <group position={[3.1,0,0]}>
      <ValorBox y={1.35} label="CHALEUR" color="#DE7248"/>
      <ValorBox y={0} label="ÉLECTRICITÉ" color="#E2B93E"/>
      <ValorBox y={-1.35} label="BIOMÉTHANE" color="#58C993"/>
    </group>
    <Pipe from={[1.65,0,0]} to={[2.3,1.35,0]} color="#DE7248" pulse/>
    <Pipe from={[1.65,0,0]} to={[2.3,0,0]} color="#E2B93E" pulse/>
    <Pipe from={[1.65,0,0]} to={[2.3,-1.35,0]} color="#58C993" pulse/>
  </group>;
}
function ValorBox({y,label,color}){return <group position={[0,y,0]}><mesh><boxGeometry args={[1.8,.8,1.3]}/><meshStandardMaterial color="#17242A" emissive={color} emissiveIntensity={.12}/></mesh><Label position={[0,0,0]} color={color}>{label}</Label></group>}

function ProcessScene({stage,running}) {
  return <group>
    {stage==="collecte"&&<WastePile stage={stage}/>} 
    {stage==="tri"&&<SortingStation stage={stage}/>} 
    {stage==="pretraitement"&&<Mixer stage={stage}/>} 
    {["hydrolyse","acidogenese","acetogenese","methanogenese"].includes(stage)&&<MolecularScene stage={stage}/>} 
    {stage==="valorisation"&&<Valorisation/>}
    {running&&<OrbitingFlow stage={stage}/>} 
  </group>;
}
function OrbitingFlow({stage}){ const ref=useRef(); useFrame((_,dt)=>{if(ref.current)ref.current.rotation.y+=dt*.8}); return <group ref={ref}>{Array.from({length:6},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/3)*3.2,Math.sin(i*Math.PI/3)*1.5,Math.sin(i*Math.PI/3)*1.2]}><sphereGeometry args={[.07,10,10]}/><meshStandardMaterial color={stage==="methanogenese"?"#D8A93E":"#65C99A"} emissive="#65C99A" emissiveIntensity={.8}/></mesh>)}</group> }

function Scene({stage,running}){
  return <>
    <Environment preset="warehouse"/>
    <ambientLight intensity={1.05}/><directionalLight position={[5,8,5]} intensity={2.3}/><pointLight position={[-4,3,4]} intensity={1.6} color="#65C99A"/>
    <ProcessScene stage={stage} running={running}/>
    <TrackballControls rotateSpeed={3.2} zoomSpeed={1.2} panSpeed={.8} noPan={false} staticMoving={false} minDistance={3.5} maxDistance={16}/>
  </>;
}

function App(){
  const [running,setRunning]=useState(false); const [index,setIndex]=useState(0); const stage=STAGES[index];
  const changeStage=(n)=>{setIndex(Math.max(0,Math.min(STAGES.length-1,n)));setRunning(false)};
  return <div className="app">
    <header><div><div className="eyebrow">BIOFLOW 3D · MODE APPRENTISSAGE</div><h1>De déchet organique à biogaz</h1><p>Chaque étape possède maintenant sa propre représentation 3D.</p></div><div className="controls"><button onClick={()=>setRunning(v=>!v)}>{running?"Pause":"Animer"}</button><button onClick={()=>{setRunning(false);setIndex(0)}}>Réinitialiser</button></div></header>
    <main><section className="viewport"><Canvas camera={{position:[7,4.5,8],fov:45}}><color attach="background" args={["#0D1418"]}/><Scene stage={stage.id} running={running}/></Canvas><div className="hint">Glisser dans n'importe quelle direction = rotation 3D · Molette = zoom · Clic droit = déplacement</div></section>
      <aside><div className="panel"><div className="panel-title">ÉTAPE ACTUELLE</div><div className="stage-number">{String(index+1).padStart(2,"0")}</div><h2>{stage.title}</h2><p>{stage.text}</p><div className="progress"><span style={{width:`${((index+1)/STAGES.length)*100}%`}}/></div><div className="nav"><button disabled={index===0} onClick={()=>changeStage(index-1)}>←</button><button disabled={index===STAGES.length-1} onClick={()=>changeStage(index+1)}>→</button></div></div>
      <div className="panel"><div className="panel-title">CHAÎNE DU PROCESSUS</div>{STAGES.map((s,i)=><button key={s.id} className={"stage-row "+(i===index?"selected":"")} onClick={()=>changeStage(i)}><span className="dot" style={{background:s.color}}/><span>{s.label}</span></button>)}</div>
      <div className="panel facts"><div><b>Sorties</b><span>Biogaz + digestat</span></div><div><b>Biogaz</b><span>CH₄ + CO₂ + traces</span></div><div><b>Principe</b><span>Digestion sans O₂</span></div></div></aside>
    </main>
  </div>
}
createRoot(document.getElementById("root")).render(<App/>);
