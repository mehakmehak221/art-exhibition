'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TracingBeam() {
    const trackRef = useRef<HTMLDivElement>(null);
    const beamRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = trackRef.current;
        const beam = beamRef.current;
        const glow = glowRef.current;
        if (!track || !beam || !glow) return;

        gsap.set(beam, { scaleY: 0, transformOrigin: 'top center' });
        gsap.set(glow, { opacity: 0 });

        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            onUpdate: (self) => {
                const progress = self.progress;
                gsap.set(beam, { scaleY: progress });
                gsap.set(glow, {
                    top: `${Math.min(progress * 100, 97)}%`,
                    opacity: progress > 0.005 ? 1 : 0,
                });
            },
        });

        return () => { ScrollTrigger.getAll().forEach(s => s.kill()); };
    }, []);

    return (
        <div ref={trackRef} className="tracing-beam">
            <div ref={beamRef} className="beam-line" />
            <div ref={glowRef} className="beam-dot" />
        </div>
    );
}
