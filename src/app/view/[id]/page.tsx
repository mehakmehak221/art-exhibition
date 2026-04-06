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

let cachedData: Artwork[] | null = null;

export default function ArtworkDetail({ params: paramsPromise }: PageProps) {
    const params = use(paramsPromise);
    const id = params.id;

    const [artwork, setArtwork] = useState<Artwork | null>(() => {
        if (cachedData) return cachedData.find(a => a.id === id) || null;
        return null;
    });

    const [nav, setNav] = useState(() => {
        if (cachedData) {
            const index = cachedData.findIndex(a => a.id === id);
            if (index !== -1) {
                const prevIdx = (index - 1 + cachedData.length) % cachedData.length;
                const nextIdx = (index + 1) % cachedData.length;
                return { prev: cachedData[prevIdx].id, next: cachedData[nextIdx].id, current: index + 1, total: cachedData.length };
            }
        }
        return { prev: '', next: '', current: 0, total: 0 };
    });

    const [lightbox, setLightbox] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState('');

    const cardRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleData = (data: Artwork[]) => {
            const index = data.findIndex((a: Artwork) => a.id === id);
            if (index === -1) { router.push('/'); return; }
            setArtwork(data[index]);
            const prevIdx = (index - 1 + data.length) % data.length;
            const nextIdx = (index + 1) % data.length;
            setNav({ prev: data[prevIdx].id, next: data[nextIdx].id, current: index + 1, total: data.length });
        };
        if (cachedData) {
            handleData(cachedData);
        } else {
            fetch('/data.json')
                .then(res => res.json())
                .then((data: Artwork[]) => { cachedData = data; handleData(data); })
                .catch(err => console.error('Error loading artwork:', err));
        }
    }, [id, router]);

    useEffect(() => {
        const card = cardRef.current;
        if (artwork && card) {
            gsap.set(card, { opacity: 0 });
            gsap.to(card, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        }
    }, [artwork]);

    // Escape key closes lightbox
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    
    useEffect(() => {
        document.body.style.overflow = lightbox ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightbox]);

    if (!artwork) return null;

    const baseImagePath = `/images/${artwork.id}`;

    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const t = e.currentTarget;
        if (t.src.endsWith('.jpg'))      t.src = t.src.replace('.jpg', '.JPG');
        else if (t.src.endsWith('.JPG')) t.src = t.src.replace('.JPG', '.png');
        else                             t.src = 'https://placehold.co/800x800/f9f9f9/ddd?text=Coming+Soon';
    };

    const openLightbox = (e: React.MouseEvent<HTMLImageElement>) => {
        setLightboxSrc(e.currentTarget.src);
        setLightbox(true);
    };

    return (
        <main className="detail-container">
            <div ref={cardRef} className="detail-card">

                
                <div className="artwork-image-container">
                    <img
                        src={`${baseImagePath}.jpg`}
                        alt={artwork.title}
                        style={{ cursor: 'zoom-in' }}
                        onClick={openLightbox}
                        onError={handleImgError}
                    />
                </div>

                <div className="artwork-info">
                    <span className="series-tag">{artwork.series || 'Art Portfolio'}</span>
                    {/* <h1 className="artwork-title">{artwork.title || 'Untitled'}</h1> */}

                    <div className="artwork-specs">
                        <div className="spec-row">
                            <span className="spec-label">Title</span>
                            <span className="spec-value">{artwork.title || 'Untitled'}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Medium</span>
                            <span className="spec-value">{artwork.medium || 'N/A'}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Size</span>
                            <span className="spec-value">{artwork.size || 'N/A'}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Year</span>
                            <span className="spec-value">{artwork.year || '2025'}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Serial No.</span>
                            <span className="spec-value">#{artwork.id}</span>
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

            {/* ── Fullscreen Lightbox ── */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.96)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-out',
                        animation: 'lbFadeIn 0.22s ease',
                    }}
                >
                    <img
                        src={lightboxSrc}
                        alt={artwork.title}
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: '95vw', maxHeight: '95vh',
                            objectFit: 'contain',
                            borderRadius: '3px',
                            boxShadow: '0 0 80px rgba(0,0,0,0.7)',
                            cursor: 'default',
                        }}
                    />
                    <button
                        onClick={() => setLightbox(false)}
                        aria-label="Close"
                        style={{
                            position: 'fixed', top: '1rem', right: '1rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            color: '#fff', width: '2.5rem', height: '2.5rem',
                            borderRadius: '50%', fontSize: '1.1rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >✕</button>
                </div>
            )}

            <style>{`@keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

            {/* Preloader */}
            <div style={{ display: 'none' }} aria-hidden="true">
                {nav.prev && <img src={`/images/${nav.prev}.jpg`} alt="" />}
                {nav.next && <img src={`/images/${nav.next}.jpg`} alt="" />}
            </div>
        </main>
    );
}