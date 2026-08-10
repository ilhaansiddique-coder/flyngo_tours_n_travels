"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  CITIES,
  ROUTES,
  arcCurve,
  landPointCloud,
  latLonToVector3,
  type City,
} from "@/lib/geo";
import Plane from "./Plane";

const RADIUS = 1;

export type GlobeRoute = {
  id: string;
  fromCityId: string;
  toCityId: string;
  fromCity?: City & { id: string };
  toCity?: City & { id: string };
  isActive: boolean;
  sortOrder: number;
};

/* Single palette used for both light and dark themes — the dark
   globe reads well on both navy and cream hero backgrounds. */
const PALETTE = {
  core: "#021935",
  land: "#1881ff",
  landGlow: "#7fd0ff",
  graticule: "#0c6fdf",
  atmosphere: "#1881ff",
  atmosphereScale: 1.06,
  atmosphereIntensity: 0.9,
  arcPrimary: "#f36523",
  arcSecondary: "#5fa9ff",
  planePrimary: "#f36523",
  planeSecondary: "#ffffff",
  marker: "#f36523",
  arcBlending: THREE.AdditiveBlending as THREE.Blending,
} as const;

type Palette = typeof PALETTE;

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
  uniform vec3 uGlow;
  varying float vTwinkle;

  void main() {
    // p is in [-0.5, 0.5] across the point sprite.
    vec2 p = gl_PointCoord - vec2(0.5);

    // L1 norm (Manhattan distance) gives a diamond directly — no rotation
    // needed. |x| + |y| <= 0.5 is the inscribed diamond of the unit quad.
    float diamond = abs(p.x) + abs(p.y);
    if (diamond > 0.5) discard;

    // Soft edge falloff, then a brighter inner core.
    float edge  = smoothstep(0.5, 0.28, diamond);
    float core  = smoothstep(0.5, 0.0,  diamond);
    float pulse = 0.7 + vTwinkle * 0.6;

    vec3 col   = mix(uColor, uGlow, core * 0.6) * pulse;
    float a    = edge * (0.85 + vTwinkle * 0.15);

    gl_FragColor = vec4(col, a);
  }
`;

function LandDots({ palette }: { palette: Palette }) {
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
      uColor: { value: new THREE.Color(palette.land) },
      uGlow: { value: new THREE.Color(palette.landGlow) },
    }),
    [palette],
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
  uniform float uIntensity;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(clamp(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 4.0);
    gl_FragColor = vec4(uColor, 1.0) * intensity * uIntensity;
  }
`;

function Atmosphere({ palette }: { palette: Palette }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(palette.atmosphere) },
      uIntensity: { value: palette.atmosphereIntensity },
    }),
    [palette],
  );

  return (
    <mesh scale={palette.atmosphereScale}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <shaderMaterial
        vertexShader={glowVertex}
        fragmentShader={glowFragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        blending={THREE.NormalBlending}
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
  blending,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  offset: number;
  color: string;
  blending: THREE.Blending;
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
        blending={blending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------- markers -- */

function Marker({ position, delay, color }: { position: THREE.Vector3; delay: number; color: string }) {
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
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.014, 0.019, 24]} />
        <meshBasicMaterial
          ref={ringMaterial}
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------- surface shading -- */

/* ---------------------------------------------------------------- scene -- */


function GlobeScene({
  withPlanes,
  palette,
  cities,
  routes,
}: {
  withPlanes: boolean;
  palette: Palette;
  cities: (City & { id?: string })[];
  routes: { id?: string; fromCityId: string; toCityId: string }[];
}) {
  const group = useRef<THREE.Group>(null);

  const cityPoints = useMemo(
    () => cities.map((c) => latLonToVector3(c.lat, c.lon, RADIUS * 1.005)),
    [cities],
  );

  const cityIndex = useMemo(() => {
    const map = new Map<string, number>();
    cities.forEach((c, i) => {
      if (c.id) map.set(c.id, i);
    });
    return map;
  }, [cities]);

  const routePairs = useMemo(() => {
    return routes
      .map((r) => {
        const a = cityIndex.get(r.fromCityId);
        const b = cityIndex.get(r.toCityId);
        if (a == null || b == null) return null;
        return { a, b, id: r.id ?? `${a}-${b}` };
      })
      .filter((r): r is { a: number; b: number; id: string } => r !== null);
  }, [routes, cityIndex]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={group} rotation={[0.25, 0, 0.15]}>
      {/* Opaque core so dots on the far side stay hidden */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.995, 64, 64]} />
        <meshBasicMaterial color={palette.core} />
      </mesh>

      {/* Faint graticule */}
      <lineSegments>
        <wireframeGeometry args={[new THREE.SphereGeometry(RADIUS * 0.997, 24, 16)]} />
        <lineBasicMaterial color={palette.graticule} transparent opacity={0.18} />
      </lineSegments>

      <LandDots palette={palette} />
      <Atmosphere palette={palette} />

      {routePairs.map((r, i) => (
        <Arc
          key={r.id}
          from={cityPoints[r.a]}
          to={cityPoints[r.b]}
          offset={(i / Math.max(routePairs.length, 1)) * 0.9}
          color={i % 3 === 0 ? palette.arcPrimary : palette.arcSecondary}
          blending={palette.arcBlending}
        />
      ))}

      {withPlanes &&
        routePairs.map((r, i) => (
          <Plane
            key={`plane-${r.id}`}
            from={cityPoints[r.a]}
            to={cityPoints[r.b]}
            offset={(i / Math.max(routePairs.length, 1)) * 1.4}
            color={i % 3 === 0 ? palette.planePrimary : palette.planeSecondary}
          />
        ))}

      {cityPoints.map((p, i) => (
        <Marker key={i} position={p} delay={i / Math.max(cityPoints.length, 1)} color={palette.marker} />
      ))}
    </group>
  );
}

export default function Globe({
  withPlanes = true,
  cities: citiesProp,
  routes: routesProp,
}: {
  withPlanes?: boolean;
  cities?: (City & { id?: string })[];
  routes?: GlobeRoute[];
}) {
  const palette: Palette = PALETTE;

  const cities = citiesProp && citiesProp.length > 0 ? citiesProp : (CITIES as (City & { id?: string })[]);
  const routesFromApi = routesProp && routesProp.length > 0 ? routesProp : null;
  const staticRoutes = ROUTES.map(([a, b], i) => ({
    id: `static-${i}`,
    fromCityId: String(a),
    toCityId: String(b),
    isActive: true,
    sortOrder: i,
  }));
  const routes = routesFromApi ?? staticRoutes;

  // Memoize to avoid forcing R3F reconciliation on every render of the parent
  const memoCities = useMemo(() => cities, [cities]);
  const memoRoutes = useMemo(() => routes, [routes]);

  return (
    <Canvas
      camera={{ position: [0, 0, 3.1], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <GlobeScene
        withPlanes={withPlanes}
        palette={palette}
        cities={memoCities}
        routes={memoRoutes as { id?: string; fromCityId: string; toCityId: string }[]}
      />
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
