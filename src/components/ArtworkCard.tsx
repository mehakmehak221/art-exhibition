'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

interface Artwork {
    id: string;
    series?: string;
    title: string;
    year?: string;
    medium?: string;
    size?: string;
    description?: string;
}

interface ArtworkCardProps {
    item: Artwork;
    index: number;
}

export default function ArtworkCard({ item, index }: ArtworkCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const cleanTitle = (item.title || 'Untitled').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const qrPath = `/qrs/${item.id}_${cleanTitle}.png`;

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        // Entry Animation
        gsap.fromTo(card, 
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top bottom-=100",
                    toggleActions: "play none none none"
                },
                delay: (index % 3) * 0.05
            }
        );

        return () => {
            gsap.killTweensOf(card);
        };
    }, [index]);

    return (
        <div ref={cardRef} className="artwork-card">
            <div className="card-glow"></div>
            <div className="preview-box">
                <div className="thumb-area">
                    <img 
                        src={`/images/${item.id}.jpg`} 
                        alt={item.title} 
                        loading="lazy"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const img = e.currentTarget;
                            if (img.src.endsWith('.jpg')) {
                                img.src = img.src.replace('.jpg', '.JPG');
                            } else if (img.src.endsWith('.JPG')) {
                                img.src = img.src.replace('.JPG', '.png');
                            } else {
                                img.src = 'https://placehold.co/400x400/f9fafb/d1d5db?text=Coming+Soon';
                            }
                        }}
                    />
                </div>
                <div className="qr-area">
                    <img src={qrPath} alt="QR Code" />
                </div>
            </div>
            <div className="card-info">
                <span className="card-series">{item.series || 'Art Portfolio'}</span>
                <h3 className="card-title">{item.title || 'Untitled'}</h3>
                <div className="card-meta">
                    <div className="meta-item">
                        <span className="meta-label">Series No.</span>
                        <span className="meta-value">#{item.id}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Year</span>
                        <span className="meta-value">{item.year || '2025'}</span>
                    </div>
                </div>
            </div>
            <div className="card-actions">
                <Link href={`/view/${item.id}`} className="btn-card btn-view">
                    Inquire / View
                </Link>
                <a href={qrPath} download={`${item.id}_${cleanTitle}.png`} className="btn-card btn-download">
                    Export QR
                </a>
            </div>
        </div>
    );
}
