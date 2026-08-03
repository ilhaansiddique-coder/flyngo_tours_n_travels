"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { arcCurve } from "@/lib/geo";

const RADIUS = 1;
const PLANE_LENGTH = 0.05;
const PLANE_SCALE = 0.012;

/**
 * Small airplane that rides one route arc from origin to destination. Advances
 * `t` in useFrame, samples the same quadratic bezier curve the arc shader uses,
 * orients with lookAt so the plane banks through the curve, and loops on a
 * per-route offset so several planes are always mid-flight around the globe.
 *
 * Rendered as a child of the rotating globe group, so the planes inherit the
 * globe's spin and stay anchored to its surface.
 */
export default function Plane({
  from,
  to,
  offset,
  color = "#ffffff",
  duration = 9,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  offset: number;
  color?: string;
  duration?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const ahead = useMemo(() => new THREE.Vector3(), []);

  const curve = useMemo(() => arcCurve(from, to, RADIUS), [from, to]);

  useFrame((state) => {
    if (!group.current) return;
    const elapsed = state.clock.elapsedTime + offset * duration;
    const t = (elapsed % duration) / duration;

    const p = curve.getPoint(t);
    const tNext = Math.min(1, t + 0.01);
    curve.getPoint(tNext, ahead);

    group.current.position.copy(p);
    if (p.distanceToSquared(ahead) > 1e-6) {
      const m = new THREE.Matrix4().lookAt(p, ahead, group.current.up);
      group.current.quaternion.setFromRotationMatrix(m);
    }
  });

  return (
    <group ref={group} scale={PLANE_SCALE}>
      {/* Fuselage — thin nose-forward triangle */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                PLANE_LENGTH, 0, 0,
                -PLANE_LENGTH * 0.6, PLANE_LENGTH * 0.18, 0,
                -PLANE_LENGTH * 0.6, -PLANE_LENGTH * 0.18, 0,
              ]),
              3,
            ]}
          />
          <bufferAttribute
            attach="attributes-normal"
            args={[
              new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
              3,
            ]}
          />
        </bufferGeometry>
        <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Tail fin — small vertical wedge so the silhouette reads as a plane */}
      <mesh position={[-PLANE_LENGTH * 0.45, 0, 0]} rotation={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                0, 0, 0,
                -PLANE_LENGTH * 0.35, PLANE_LENGTH * 0.35, 0,
                0, PLANE_LENGTH * 0.18, 0,
              ]),
              3,
            ]}
          />
          <bufferAttribute
            attach="attributes-normal"
            args={[
              new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
              3,
            ]}
          />
        </bufferGeometry>
        <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Wings — short horizontal bar */}
      <mesh position={[-PLANE_LENGTH * 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[PLANE_LENGTH * 0.7, PLANE_LENGTH * 0.08]} />
        <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
