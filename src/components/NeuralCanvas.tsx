'use client';
import { useEffect, useRef } from 'react';

export default function NeuralCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number, height: number, points: { x: number, y: number, originX: number, originY: number }[] = [];
        const spacing = 35; // Increased density
        let mouse = { x: -2000, y: -2000 };

        function resize() {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            points = [];
            for (let x = 0; x < width + spacing; x += spacing) {
                for (let y = 0; y < height + spacing; y += spacing) {
                    points.push({ x, y, originX: x, originY: y });
                }
            }
        }

        const handleResize = () => resize();
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();

        let animationFrame: number;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            points.forEach((p, i) => {
                const dx = mouse.x - p.originX;
                const dy = mouse.y - p.originY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 220;

                if (dist < maxDist) {
                    const angle = Math.atan2(dy, dx);
                    const force = (maxDist - dist) / maxDist;
                    p.x = p.originX - Math.cos(angle) * force * 25;
                    p.y = p.originY - Math.sin(angle) * force * 25;
                    
                    // Draw connections to nearby points
                    for (let j = i + 1; j < points.length; j++) {
                        const p2 = points[j];
                        const dx2 = p.x - p2.x;
                        const dy2 = p.y - p2.y;
                        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                        
                        if (dist2 < spacing * 1.5) {
                            ctx.strokeStyle = `rgba(13, 148, 136, ${(1 - dist2 / (spacing * 1.5)) * force * 0.15})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }

                    ctx.fillStyle = `rgba(13, 148, 136, ${force * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    p.x += (p.originX - p.x) * 0.08;
                    p.y += (p.originY - p.y) * 0.08;
                    ctx.fillStyle = 'rgba(24, 24, 27, 0.04)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrame = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <div className="canvas-container">
            <canvas ref={canvasRef} id="neural-canvas"></canvas>
        </div>
    );
}
