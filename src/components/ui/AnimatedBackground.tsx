'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Constants ─── */
const PARTICLE_COUNT = 200;
const CONNECTION_DISTANCE = 1.8;
const MOUSE_INFLUENCE_RADIUS = 3.0;
const MOUSE_PUSH_STRENGTH = 0.02;

/* ─── Floating Particles ─── */
function Particles() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const mousePos = useRef(new THREE.Vector2(9999, 9999));
    const mouse3D = useRef(new THREE.Vector3(9999, 9999, 0));
    const { viewport, camera } = useThree();

    // Generate particle data
    const particlesData = useMemo(() => {
        const data = [];
        const spread = Math.max(viewport.width, viewport.height) * 0.8;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            data.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * spread * 1.5,
                    (Math.random() - 0.5) * spread * 1.5,
                    (Math.random() - 0.5) * 3
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.003,
                    (Math.random() - 0.5) * 0.003,
                    (Math.random() - 0.5) * 0.001
                ),
                baseScale: Math.random() * 0.03 + 0.01,
                phase: Math.random() * Math.PI * 2,
                // Color: purple to pink gradient
                color: new THREE.Color().setHSL(
                    0.75 + Math.random() * 0.1, // hue: purple to pink
                    0.6 + Math.random() * 0.3,   // saturation
                    0.5 + Math.random() * 0.3    // lightness
                ),
            });
        }
        return data;
    }, [viewport]);

    // Connection lines geometry
    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const maxConnections = PARTICLE_COUNT * 10;
        const positions = new Float32Array(maxConnections * 6); // 2 points * 3 coords
        const colors = new Float32Array(maxConnections * 6);    // 2 points * 3 color
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setDrawRange(0, 0);
        return geometry;
    }, []);

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
            // Convert to 3D world space
            mouse3D.current.set(mousePos.current.x, mousePos.current.y, 0.5);
            mouse3D.current.unproject(camera);
            const dir = mouse3D.current.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            mouse3D.current.copy(camera.position).add(dir.multiplyScalar(distance));
        };

        const handleMouseLeave = () => {
            mousePos.current.set(9999, 9999);
            mouse3D.current.set(9999, 9999, 0);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [camera]);

    // Dummy object for instanced mesh transforms
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // Set initial colors
    useEffect(() => {
        if (!meshRef.current) return;
        particlesData.forEach((p, i) => {
            meshRef.current!.setColorAt(i, p.color);
        });
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    }, [particlesData]);

    // Animation loop
    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;
        const positions = lineGeometry.attributes.position.array as Float32Array;
        const colors = lineGeometry.attributes.color.array as Float32Array;
        let lineIndex = 0;
        const maxLines = Math.floor(positions.length / 6);
        const bounds = Math.max(viewport.width, viewport.height) * 0.9;

        // Update particles
        particlesData.forEach((p, i) => {
            // Gentle floating motion
            p.position.x += p.velocity.x + Math.sin(time * 0.3 + p.phase) * 0.001;
            p.position.y += p.velocity.y + Math.cos(time * 0.2 + p.phase) * 0.001;
            p.position.z += p.velocity.z;

            // Wrap around bounds
            if (p.position.x > bounds) p.position.x = -bounds;
            if (p.position.x < -bounds) p.position.x = bounds;
            if (p.position.y > bounds) p.position.y = -bounds;
            if (p.position.y < -bounds) p.position.y = bounds;
            if (p.position.z > 2) p.position.z = -2;
            if (p.position.z < -2) p.position.z = 2;

            // Mouse interaction: gentle push away
            const dx = p.position.x - mouse3D.current.x;
            const dy = p.position.y - mouse3D.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_INFLUENCE_RADIUS && dist > 0.01) {
                const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * MOUSE_PUSH_STRENGTH;
                p.position.x += (dx / dist) * force;
                p.position.y += (dy / dist) * force;
            }

            // Pulsing scale
            const scale = p.baseScale * (1 + Math.sin(time * 1.5 + p.phase) * 0.3);

            dummy.position.copy(p.position);
            dummy.scale.setScalar(scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;

        // Build connection lines between nearby particles
        for (let i = 0; i < particlesData.length && lineIndex < maxLines; i++) {
            for (let j = i + 1; j < particlesData.length && lineIndex < maxLines; j++) {
                const dx = particlesData[i].position.x - particlesData[j].position.x;
                const dy = particlesData[i].position.y - particlesData[j].position.y;
                const dz = particlesData[i].position.z - particlesData[j].position.z;
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
                    const alpha = 1 - Math.sqrt(distSq) / CONNECTION_DISTANCE;
                    const idx = lineIndex * 6;

                    positions[idx] = particlesData[i].position.x;
                    positions[idx + 1] = particlesData[i].position.y;
                    positions[idx + 2] = particlesData[i].position.z;
                    positions[idx + 3] = particlesData[j].position.x;
                    positions[idx + 4] = particlesData[j].position.y;
                    positions[idx + 5] = particlesData[j].position.z;

                    // Purple connection lines with fade
                    const r = 0.55 * alpha * 0.3;
                    const g = 0.32 * alpha * 0.3;
                    const b = 1.0 * alpha * 0.3;
                    colors[idx] = r; colors[idx + 1] = g; colors[idx + 2] = b;
                    colors[idx + 3] = r; colors[idx + 4] = g; colors[idx + 5] = b;

                    lineIndex++;
                }
            }
        }

        lineGeometry.setDrawRange(0, lineIndex * 2);
        lineGeometry.attributes.position.needsUpdate = true;
        lineGeometry.attributes.color.needsUpdate = true;
    });

    return (
        <>
            {/* Particles as glowing spheres */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial
                    transparent
                    opacity={0.8}
                    toneMapped={false}
                />
            </instancedMesh>

            {/* Connection lines */}
            <lineSegments ref={linesRef} geometry={lineGeometry}>
                <lineBasicMaterial
                    vertexColors
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
        </>
    );
}

/* ─── Gentle Floating Glow Orbs ─── */
function GlowOrbs() {
    const ref = useRef<THREE.Group>(null);

    const orbs = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                -2 - Math.random() * 2
            ),
            scale: 0.8 + Math.random() * 1.2,
            speed: 0.2 + Math.random() * 0.3,
            phase: Math.random() * Math.PI * 2,
            color: new THREE.Color().setHSL(0.75 + Math.random() * 0.1, 0.5, 0.3),
        }));
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.elapsedTime;
        ref.current.children.forEach((mesh, i) => {
            const orb = orbs[i];
            mesh.position.x = orb.position.x + Math.sin(time * orb.speed + orb.phase) * 1.5;
            mesh.position.y = orb.position.y + Math.cos(time * orb.speed * 0.7 + orb.phase) * 1;
            const pulseFactor = 1 + Math.sin(time * 0.5 + orb.phase) * 0.15;
            mesh.scale.setScalar(orb.scale * pulseFactor);
        });
    });

    return (
        <group ref={ref}>
            {orbs.map((orb, i) => (
                <mesh key={i} position={orb.position}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial
                        color={orb.color}
                        transparent
                        opacity={0.08}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

/* ─── Main Background Component ─── */
export function AnimatedBackground() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Deep space base gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118]" />

            {/* Three.js Canvas */}
            {isClient && (
                <div className="absolute inset-0">
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 60 }}
                        dpr={[1, 1.5]}
                        gl={{
                            antialias: false,
                            alpha: true,
                            powerPreference: 'low-power',
                        }}
                        style={{ background: 'transparent' }}
                    >
                        <Particles />
                        <GlowOrbs />
                    </Canvas>
                </div>
            )}

            {/* Gradient vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(10,1,24,0.7)_100%)]" />

            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }} />
        </div>
    );
}
