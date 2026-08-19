import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function TestScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <OrbitControls />
    </>
  );
}

export default function TestApp() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#87CEEB");
      }}
    >
      <TestScene />
    </Canvas>
  );
}