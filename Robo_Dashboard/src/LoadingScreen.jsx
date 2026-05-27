import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshDistortMaterial,
  Sparkles,
} from "@react-three/drei";

function LoadingOrb() {
  const orbRef = useRef();
  const ringOneRef = useRef();
  const ringTwoRef = useRef();
  const ringThreeRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (orbRef.current) {
      orbRef.current.rotation.x = time * 0.22;
      orbRef.current.rotation.y = time * 0.42;
      orbRef.current.position.y = Math.sin(time * 1.2) * 0.045;
    }

    if (ringOneRef.current) {
      ringOneRef.current.rotation.z = time * 0.55;
      ringOneRef.current.rotation.x = Math.sin(time * 0.5) * 0.16;
    }

    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.z = -time * 0.85;
      ringTwoRef.current.rotation.y = Math.cos(time * 0.55) * 0.18;
    }

    if (ringThreeRef.current) {
      ringThreeRef.current.rotation.x = time * 0.22;
      ringThreeRef.current.rotation.y = -time * 0.28;
    }
  });

  return (
    <group position={[0, -0.05, 0]} scale={1.18}>
      <Float speed={1.8} rotationIntensity={0.18} floatIntensity={0.28}>
        {/* Main orb */}
        <mesh ref={orbRef}>
          <sphereGeometry args={[1.12, 128, 128]} />
          <MeshDistortMaterial
            color="#7ea7ff"
            emissive="#385cff"
            emissiveIntensity={0.74}
            roughness={0.18}
            metalness={0.72}
            distort={0.22}
            speed={1.5}
            clearcoat={1}
            clearcoatRoughness={0.12}
          />
        </mesh>

        {/* Outer clean ring */}
        <mesh ref={ringOneRef} rotation={[Math.PI / 2.12, 0, 0.05]}>
          <torusGeometry args={[1.82, 0.026, 16, 220]} />
          <meshStandardMaterial
            color="#dbeafe"
            emissive="#77a7ff"
            emissiveIntensity={1.28}
            transparent
            opacity={0.82}
          />
        </mesh>

        {/* Middle tilted ring */}
        <mesh ref={ringTwoRef} rotation={[Math.PI / 2.8, 0.12, -0.28]}>
          <torusGeometry args={[1.45, 0.018, 16, 180]} />
          <meshStandardMaterial
            color="#9df5ff"
            emissive="#4ddcff"
            emissiveIntensity={1.18}
            transparent
            opacity={0.76}
          />
        </mesh>

        {/* Soft background ring */}
        <mesh ref={ringThreeRef} rotation={[0.95, 0.25, 0.3]}>
          <torusGeometry args={[2.0, 0.012, 12, 220]} />
          <meshStandardMaterial
            color="#a5b4fc"
            emissive="#818cf8"
            emissiveIntensity={0.8}
            transparent
            opacity={0.26}
          />
        </mesh>
      </Float>

      <Sparkles
        count={190}
        scale={[8.2, 5.1, 5.1]}
        size={3.2}
        speed={0.34}
        color="#c7d2fe"
        opacity={0.68}
      />
    </group>
  );
}

function LoadingScene() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 9.4],
        fov: 42,
      }}
      gl={{
        antialias: true,
        alpha: true,
      }}
      style={{
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
    >
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 5, 6]} intensity={2.5} />
      <pointLight position={[-4, -2, 4]} intensity={2.2} color="#587cff" />
      <pointLight position={[4, 2, 3]} intensity={1.7} color="#66e8ff" />
      <pointLight position={[0, 4, 3]} intensity={1.25} color="#ffffff" />

      <LoadingOrb />

      <Environment preset="city" />
    </Canvas>
  );
}

export default function LoadingScreen({ fadeOut = false }) {
  return (
    <main
      className={`loading-screen loading-fade-in fixed inset-0 z-[9999] h-screen w-screen overflow-hidden bg-[#02040a] text-white ${
        fadeOut ? "loading-screen-exit" : ""
      }`}
    >
      <div className="loader-bg-base" />
      <div className="loader-aurora-layer aurora-one" />
      <div className="loader-aurora-layer aurora-two" />
      <div className="loader-aurora-layer aurora-three" />

      <div className="loader-light-sweep sweep-one" />
      <div className="loader-light-sweep sweep-two" />
      <div className="loader-light-sweep sweep-three" />

      <div className="loader-orb-glow" />
      <div className="loader-star-field" />
      <div className="loader-vignette" />

      <section className="relative z-10 flex h-screen w-screen items-center justify-center">
        <div className="loading-orb-wrap relative h-[78vh] w-[78vw] max-h-[860px] max-w-[1180px] overflow-visible">
          <LoadingScene />
        </div>
      </section>
    </main>
  );
}