'use client';
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import Link from 'next/link';

interface Artwork {
    id: string;
    series?: string;
    title: string;
    year?: string;
    medium?: string;
    size?: string;
    description?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

// Module-level cache to keep data across page navigations
let cachedData: Artwork[] | null = null;

export default function ArtworkDetail({ params: paramsPromise }: PageProps) {
    const params = use(paramsPromise);
    const id = params.id;
    const [artwork, setArtwork] = useState<Artwork | null>(() => {
        // Find synchronously if we have cached data
        if (cachedData) {
            return cachedData.find(a => a.id === id) || null;
        }
        return null;
    });
    
    const [nav, setNav] = useState(() => {
        if (cachedData) {
            const index = cachedData.findIndex(a => a.id === id);
            if (index !== -1) {
                const prevIdx = (index - 1 + cachedData.length) % cachedData.length;
                const nextIdx = (index + 1) % cachedData.length;
                return {
                    prev: cachedData[prevIdx].id,
                    next: cachedData[nextIdx].id,
                    current: index + 1,
                    total: cachedData.length
                };
            }
        }
        return { prev: '', next: '', current: 0, total: 0 };
    });

    const cardRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleData = (data: Artwork[]) => {
            const index = data.findIndex((a: Artwork) => a.id === id);
            if (index === -1) {
                router.push('/');
                return;
            }
            
            setArtwork(data[index]);
            
            const prevIdx = (index - 1 + data.length) % data.length;
            const nextIdx = (index + 1) % data.length;
            
            setNav({
                prev: data[prevIdx].id,
                next: data[nextIdx].id,
                current: index + 1,
                total: data.length
            });
        };

        if (cachedData) {
            handleData(cachedData);
        } else {
            fetch('/data.json')
                .then(res => res.json())
                .then((data: Artwork[]) => {
                    cachedData = data;
                    handleData(data);
                })
                .catch(err => console.error("Error loading artwork:", err));
        }
    }, [id, router]);

    useEffect(() => {
        const card = cardRef.current;
        if (artwork && card) {
            // Sharper transition for 'instant' feel
            gsap.set(card, { opacity: 0 });
            gsap.to(card, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [artwork]);

    if (!artwork) return null;

    const baseImagePath = `/images/${artwork.id}`;

    return (
        <main className="detail-container">
            <div ref={cardRef} className="detail-card">
                <div className="artwork-image-container">
                    <img 
                        src={`${baseImagePath}.jpg`} 
                        alt={artwork.title}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.currentTarget;
                            if (target.src.endsWith('.jpg')) {
                                target.src = target.src.replace('.jpg', '.JPG');
                            } else if (target.src.endsWith('.JPG')) {
                                target.src = target.src.replace('.JPG', '.png');
                            } else {
                                target.src = 'https://placehold.co/800x800/f9f9f9/ddd?text=Portrait+Coming+Soon';
                            }
                        }}
                    />
                </div>
                <div className="artwork-info">
                    <span className="series-tag">{artwork.series || 'Art Portfolio'}</span>
                    <h1 className="artwork-title">{artwork.title || 'Untitled'}</h1>
                    
                    <div className="artwork-specs">
                        <div className="spec-row">
                            <span className="spec-label">Series No.</span>
                            <span className="spec-value">#{artwork.id}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Period</span>
                            <span className="spec-value">{artwork.year || '2025'}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Medium</span>
                            <span className="spec-value">{artwork.medium || 'N/A'}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Dimensions</span>
                            <span className="spec-value">{artwork.size || 'N/A'}</span>
                        </div>
                    </div>

                    {artwork.description && (
                        <div className="artwork-description">{artwork.description}</div>
                    )}

                    <div className="actions">
                        <div className="nav-controls">
                            <Link href={`/view/${nav.prev}`} className="btn-nav">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6"></path>
                                </svg>
                                <span>Previous</span>
                            </Link>
                            
                            <div className="nav-counter">
                                <span className="current">{nav.current}</span>
                                <span className="of">/</span>
                                <span className="total">{nav.total}</span>
                            </div>

                            <Link href={`/view/${nav.next}`} className="btn-nav">
                                <span>Next</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6"></path>
                                </svg>
                            </Link>
                        </div>
                        
                        <Link href="/" className="btn-secondary full-width">
                            Return to Gallery
                        </Link>
                    </div>
                </div>
            </div>

            {/* Invisible Preloader for Instant Images */}
            <div style={{ display: 'none' }} aria-hidden="true">
                {nav.prev && <img src={`/images/${nav.prev}.jpg`} alt="" />}
                {nav.next && <img src={`/images/${nav.next}.jpg`} alt="" />}
            </div>
        </main>
    );
}
