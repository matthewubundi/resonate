import React, { useEffect, useRef } from 'react';

const HeroBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = container.clientWidth;
        let height = container.clientHeight;
        let particles: Particle[] = [];
        let animationFrameId: number;

        const mouse = { x: -1000, y: -1000 };

        // Configuration
        const particleCount = 60; // Adjust for density
        const connectionDistance = 150;
        const moveSpeed = 0.5;
        const color = '#2563EB'; // Azure Blue

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * moveSpeed;
                this.vy = (Math.random() - 0.5) * moveSpeed;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (200 - distance) / 200;
                    const directionX = forceDirectionX * force * 0.5;
                    const directionY = forceDirectionY * force * 0.5;

                    this.x += directionX;
                    this.y += directionY;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.5;
                ctx.fill();
            }
        }

        const init = () => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;

            particles = [];
            const count = Math.floor((width * height) / 15000); // Responsive density
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        // Opacity based on distance
                        const opacity = 1 - distance / connectionDistance;
                        ctx.globalAlpha = opacity * 0.2; // Low opacity for airy feel
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none" // pointer-events-none allows clicks to pass through, but we need events for mousemove? 
        // Actually, if we want mouse interaction, we need pointer-events-auto on the canvas or capture it on window/parent.
        // The requirement says "React to mouse position".
        // If I put pointer-events-none, the canvas won't receive mouse events.
        // If I put pointer-events-auto, it might block clicks on underlying elements if z-index is higher (but it serves as background).
        // Since it is behind content (z-index 0 vs content 10), it should be fine if it doesn't block interaction.
        // However, usually backgrounds don't block text selection or button clicks.
        // Let's use pointer-events-none for the container but listen to mouse move on the window or parent if possible, or make the canvas allow pass-through but tracking it might be hard if it doesn't receive events.
        // Better approach: Listen to mousemove on the PARENT container or window, or make the canvas transparent to clicks?
        // CSS `pointer-events: none` makes it ignore mouse events completely.
        // So I'll attach the mouse listener to the window in the effect, relative to the canvas position?
        // Or I can just let the canvas capture events and set `pointer-events: none` on the CSS, and attach the event listener to `window`.
        // Let's attach to `window` for smoother interaction anyway.
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
            />
        </div>
    );
};

export default HeroBackground;
