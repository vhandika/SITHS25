import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ParticleBackgroundProps {
    particleOpacity?: number;
    connectionOpacity?: number;
    lineWidth?: number;
    particleColor?: string;
    maxParticles?: number;
    connectionDistance?: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

const DEFAULT_CONFIG: Required<ParticleBackgroundProps> = {
    particleOpacity: 0.8,
    connectionOpacity: 0.35,
    lineWidth: 1.2,
    particleColor: '250, 204, 21',
    maxParticles: 100,
    connectionDistance: 140
};

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;
let animationFrameId: number | null = null;
let particles: Particle[] = [];
let activeInstances = 0;
let initialized = false;
let resizeListenerAttached = false;
let currentConfig: Required<ParticleBackgroundProps> = { ...DEFAULT_CONFIG };

const createParticle = (): Particle => ({
    x: Math.random() * (sharedCanvas?.width || window.innerWidth),
    y: Math.random() * (sharedCanvas?.height || window.innerHeight),
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    radius: Math.random() * 2 + 1
});

const syncParticleCount = () => {
    const targetCount = Math.min(Math.floor(window.innerWidth / 12), currentConfig.maxParticles);

    if (particles.length < targetCount) {
        const missing = targetCount - particles.length;
        for (let i = 0; i < missing; i++) {
            particles.push(createParticle());
        }
    } else if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
    }
};

const ensureCanvas = () => {
    if (sharedCanvas && sharedCtx) return;

    sharedCanvas = document.createElement('canvas');
    sharedCanvas.className = 'fixed inset-0 w-full h-full pointer-events-none z-0';
    document.body.appendChild(sharedCanvas);
    sharedCtx = sharedCanvas.getContext('2d');
};

const resizeCanvas = () => {
    if (!sharedCanvas) return;
    sharedCanvas.width = window.innerWidth;
    sharedCanvas.height = window.innerHeight;
    syncParticleCount();
};

const setCanvasVisibility = (visible: boolean) => {
    if (!sharedCanvas) return;
    sharedCanvas.style.display = visible ? 'block' : 'none';
};

const draw = () => {
    if (!sharedCanvas || !sharedCtx) {
        animationFrameId = null;
        return;
    }

    sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);

    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > sharedCanvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > sharedCanvas.height) particle.vy *= -1;

        sharedCtx.beginPath();
        sharedCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        sharedCtx.fillStyle = `rgba(${currentConfig.particleColor}, ${currentConfig.particleOpacity})`;
        sharedCtx.fill();

        for (let j = i + 1; j < particles.length; j++) {
            const particle2 = particles[j];
            const dx = particle.x - particle2.x;
            const dy = particle.y - particle2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < currentConfig.connectionDistance) {
                sharedCtx.beginPath();
                const opacity = currentConfig.connectionOpacity - (dist / currentConfig.connectionDistance) * currentConfig.connectionOpacity;
                sharedCtx.strokeStyle = `rgba(${currentConfig.particleColor}, ${opacity})`;
                sharedCtx.lineWidth = currentConfig.lineWidth;
                sharedCtx.moveTo(particle.x, particle.y);
                sharedCtx.lineTo(particle2.x, particle2.y);
                sharedCtx.stroke();
            }
        }
    }

    animationFrameId = requestAnimationFrame(draw);
};

const startAnimation = () => {
    if (animationFrameId !== null) return;
    animationFrameId = requestAnimationFrame(draw);
};

const applyConfig = (config: Required<ParticleBackgroundProps>) => {
    const prevMaxParticles = currentConfig.maxParticles;
    currentConfig = config;

    if (prevMaxParticles !== currentConfig.maxParticles) {
        syncParticleCount();
    }
};

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
    particleOpacity = DEFAULT_CONFIG.particleOpacity,
    connectionOpacity = DEFAULT_CONFIG.connectionOpacity,
    lineWidth = DEFAULT_CONFIG.lineWidth,
    particleColor = DEFAULT_CONFIG.particleColor,
    maxParticles = DEFAULT_CONFIG.maxParticles,
    connectionDistance = DEFAULT_CONFIG.connectionDistance
}) => {
    const { theme } = useTheme();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        applyConfig({
            particleOpacity,
            connectionOpacity,
            lineWidth,
            particleColor,
            maxParticles,
            connectionDistance
        });

        if (theme === 'light') {
            setCanvasVisibility(false);
            return;
        }

        ensureCanvas();
        if (!sharedCanvas || !sharedCtx) return;

        const resizeHandler = resizeCanvas;
        
        if (!resizeListenerAttached) {
            window.addEventListener('resize', resizeHandler);
            resizeListenerAttached = true;
        }

        if (!initialized) {
            resizeCanvas();
            initialized = true;
        }

        activeInstances += 1;
        setCanvasVisibility(true);
        startAnimation();

        return () => {
            activeInstances = Math.max(0, activeInstances - 1);
            
            if (activeInstances === 0) {
                setCanvasVisibility(false);
                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        };
    }, [connectionDistance, connectionOpacity, lineWidth, maxParticles, particleColor, particleOpacity, theme]);

    if (theme === 'light') {
        return (
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <div className="theme-light-blob theme-light-blob-red" />
                <div className="theme-light-blob theme-light-blob-green" />
            </div>
        );
    }

    return null;
};

export default ParticleBackground;