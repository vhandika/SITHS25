import React, { useEffect, useRef } from 'react';

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

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
    particleOpacity = 0.8,
    connectionOpacity = 0.35,
    lineWidth = 1.2,
    particleColor = '250, 204, 21',
    maxParticles = 100,
    connectionDistance = 140
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(Math.floor(window.innerWidth / 12), maxParticles);

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    radius: Math.random() * 2 + 1
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];

                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particleColor}, ${particleOpacity})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const particle2 = particles[j];
                    const dx = particle.x - particle2.x;
                    const dy = particle.y - particle2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        const opacity = connectionOpacity - (dist / connectionDistance) * connectionOpacity;
                        ctx.strokeStyle = `rgba(${particleColor}, ${opacity})`;
                        ctx.lineWidth = lineWidth;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particle2.x, particle2.y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [connectionDistance, connectionOpacity, lineWidth, maxParticles, particleColor, particleOpacity]);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default ParticleBackground;