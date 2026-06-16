import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const STATUS_COLORS = {
  safe:    "#10b981",
  warning: "#f59e0b",
  danger:  "#f43f5e",
};

/* Animated particles around cylinder */
function Particles({ status, level }) {
  const particlesRef = useRef();
  const particleCount = 100;
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const color = new THREE.Color(STATUS_COLORS[status]);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      const height = -2 + Math.random() * 4;
      
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    
    return [pos, col];
  }, [status]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y += 0.001;
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Holographic rings */
function HoloRings({ status }) {
  const ringsRef = useRef([]);
  const color = STATUS_COLORS[status];

  useFrame((state) => {
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.z = state.clock.elapsedTime * 0.3 * (i % 2 ? 1 : -1);
        ring.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime + i) * 0.2;
      }
    });
  });

  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => (ringsRef.current[i] = el)}
          position={[0, -1.5 + i * 1.5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1.8 + i * 0.2, 0.02, 16, 100]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

/* Tick marks on the side of the cylinder */
function Ticks() {
  const ticks = [0.25, 0.5, 0.75, 1.0];
  return (
    <>
      {ticks.map((t) => {
        const y = -1.5 + t * 3;
        return (
          <group key={t}>
            <mesh position={[1.05, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.04, 0.15, 0.04]} />
              <meshStandardMaterial color="#0e2a40" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-1.05, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.04, 0.15, 0.04]} />
              <meshStandardMaterial color="#0e2a40" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/* Animated gas fill with bubble effect */
function GasFill({ level, status }) {
  const meshRef = useRef();
  const bubblesRef = useRef();
  const target = (level / 100) * 3;
  const color = STATUS_COLORS[status] || STATUS_COLORS.safe;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const current = meshRef.current.scale.y;
    const next = current + (target - current) * Math.min(delta * 2.5, 1);
    meshRef.current.scale.y = next;
    meshRef.current.position.y = -1.5 + next / 2;

    // Bubble animation
    if (bubblesRef.current) {
      bubblesRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, -1.5, 0]} scale={[1, 0.001, 1]}>
        <cylinderGeometry args={[0.88, 0.88, 3, 48]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Bubbles inside gas */}
      <group ref={bubblesRef}>
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 0.6,
              -1.5 + (level / 100) * 1.5,
              Math.sin((i / 8) * Math.PI * 2) * 0.6,
            ]}
          >
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.4}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* Outer shell with reflections */
function Shell() {
  return (
    <>
      {/* Transparent body */}
      <mesh>
        <cylinderGeometry args={[1, 1, 3, 48]} />
        <meshPhysicalMaterial
          color="#0a2540"
          transparent
          opacity={0.15}
          roughness={0.05}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Metallic edge rings */}
      {[-1.5, 1.5].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[1, 0.05, 16, 64]} />
          <meshStandardMaterial
            color="#1e4a6e"
            metalness={0.95}
            roughness={0.1}
            emissive="#00d4ff"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Enhanced valve on top */}
      <group position={[0, 1.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.22, 0.25, 24]} />
          <meshStandardMaterial
            color="#1a3a56"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <torusGeometry args={[0.15, 0.03, 16, 32]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0.2}
          />
        </mesh>
      </group>
    </>
  );
}

/* Floating platform */
function Platform() {
  const platformRef = useRef();

  useFrame((state) => {
    if (platformRef.current) {
      platformRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={platformRef} position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.5, 64]} />
      <meshStandardMaterial
        color="#0a2540"
        metalness={0.8}
        roughness={0.2}
        emissive="#00d4ff"
        emissiveIntensity={0.1}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function Scene({ level, status }) {
  return (
    <>
      <color attach="background" args={["#060a10"]} />
      <fog attach="fog" args={["#060a10", 5, 15]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, -3, -3]} intensity={0.4} color="#00d4ff" />
      <pointLight position={[0, 2, 3]} intensity={0.8} color="#00d4ff" distance={8} />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        color={STATUS_COLORS[status]}
        castShadow
      />

      <Environment preset="night" />

      <group rotation={[0, 0.3, 0]}>
        <Shell />
        <GasFill level={level} status={status} />
        <Ticks />
        <Platform />
        <HoloRings status={status} />
        <Particles status={status} level={level} />
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        maxDistance={6}
        minDistance={3}
      />
    </>
  );
}

export default function Cylinder3D({ level = 0, status = "safe" }) {
  return (
    <Canvas
      style={{ height: 280, width: "100%" }}
      shadows
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={35} />
      <Scene level={level} status={status} />
    </Canvas>
  );
}