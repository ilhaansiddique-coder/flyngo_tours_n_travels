"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  CITIES,
  ROUTES,
  arcCurve,
  landPointCloud,
  latLonToVector3,
} from "@/lib/geo";
import Plane from "./Plane";

const RADIUS = 1;

/* ------------------------------------------------------------------ dots -- */

const dotVertex = /* glsl */ `
  attribute float aRnd;
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  varying float vTwinkle;

  void main() {
    vTwinkle = 0.6 + 0.4 * sin(uTime * 1.2 + aRnd * 6.2831);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // uSize is the dot's CSS-pixel size at the default camera distance.
    gl_PointSize = uSize * uDpr * (3.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const dotFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vTwinkle;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = dot(c, c);
    if (d > 0.25) discard;
    float edge = smoothstep(0.25, 0.04, d);
    gl_FragColor = vec4(uColor * (0.9 + vTwinkle * 0.45), edge * (0.7 + vTwinkle * 0.3));
  }
`;

function LandDots() {
  const material = useRef<THREE.ShaderMaterial>(null);

  const { positions, randoms } = useMemo(() => {
    const positions = landPointCloud(RADIUS * 1.002);
    const count = positions.length / 3;
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random so the pattern is stable across renders.
      randoms[i] = ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1;
    }
    return { positions, randoms };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 2.4 },
      uDpr: { value: 1 },
      uColor: { value: new THREE.Color("#1881ff") },
    }),
    [],
  );

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
      material.current.uniforms.uDpr.value = state.gl.getPixelRatio();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRnd" args={[randoms, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={dotVertex}
        fragmentShader={dotFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* ----------------------------------------------------------- atmosphere -- */

const glowVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(clamp(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.2);
    gl_FragColor = vec4(uColor, 1.0) * intensity * 1.6;
  }
`;

function Atmosphere() {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#1881ff") } }),
    [],
  );

  return (
    <mesh scale={1.14}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <shaderMaterial
        vertexShader={glowVertex}
        fragmentShader={glowFragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ----------------------------------------------------------------- arcs -- */

const arcVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const arcFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOffset;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float head = fract(uTime * uSpeed + uOffset);
    float d = head - vUv.x;
    if (d < 0.0) d += 1.0;
    float comet = exp(-d * 11.0);
    // Fade both ends so arcs melt into the surface instead of stopping dead.
    float ends = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
    float alpha = clamp(0.14 + comet, 0.0, 1.0) * ends;
    gl_FragColor = vec4(uColor + comet * 0.6, alpha);
  }
`;

function Arc({
  from,
  to,
  offset,
  color,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  offset: number;
  color: string;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const curve = arcCurve(from, to, RADIUS);
    return new THREE.TubeGeometry(curve, 72, 0.0035, 6, false);
  }, [from, to]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.18 + offset * 0.12 },
      uOffset: { value: offset },
      uColor: { value: new THREE.Color(color) },
    }),
    [offset, color],
  );

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={arcVertex}
        fragmentShader={arcFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------- markers -- */

function Marker({ position, delay }: { position: THREE.Vector3; delay: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const ringMaterial = useRef<THREE.MeshBasicMaterial>(null);

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
    return q;
  }, [position]);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.6 + delay) % 1;
    if (ring.current) ring.current.scale.setScalar(1 + t * 5);
    if (ringMaterial.current) ringMaterial.current.opacity = (1 - t) * 0.7;
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial color="#f36523" toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.014, 0.019, 24]} />
        <meshBasicMaterial
          ref={ringMaterial}
          color="#f36523"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- scene -- */

function GlobeScene({ withPlanes }: { withPlanes: boolean }) {
  const group = useRef<THREE.Group>(null);

  const cityPoints = useMemo(
    () => CITIES.map((c) => latLonToVector3(c.lat, c.lon, RADIUS * 1.005)),
    [],
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={group} rotation={[0.25, 0, 0.15]}>
      {/* Opaque core so dots on the far side stay hidden */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.995, 64, 64]} />
        <meshBasicMaterial color="#021935" />
      </mesh>

      {/* Faint graticule */}
      <lineSegments>
        <wireframeGeometry args={[new THREE.SphereGeometry(RADIUS * 0.997, 24, 16)]} />
        <lineBasicMaterial color="#0c6fdf" transparent opacity={0.3} />
      </lineSegments>

      <LandDots />
      <Atmosphere />

      {ROUTES.map(([a, b], i) => (
        <Arc
          key={`${a}-${b}`}
          from={cityPoints[a]}
          to={cityPoints[b]}
          offset={(i / ROUTES.length) * 0.9}
          color={i % 3 === 0 ? "#f36523" : "#5fa9ff"}
        />
      ))}

      {withPlanes &&
        ROUTES.map(([a, b], i) => (
          <Plane
            key={`plane-${a}-${b}`}
            from={cityPoints[a]}
            to={cityPoints[b]}
            offset={(i / ROUTES.length) * 1.4}
            color={i % 3 === 0 ? "#f36523" : "#ffffff"}
          />
        ))}

      {cityPoints.map((p, i) => (
        <Marker key={CITIES[i].name} position={p} delay={i / CITIES.length} />
      ))}
    </group>
  );
}

export default function Globe({ withPlanes = true }: { withPlanes?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.1], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <GlobeScene withPlanes={withPlanes} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.4}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
      />
    </Canvas>
  );
}
