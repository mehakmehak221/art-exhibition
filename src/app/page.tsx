'use client';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ArtworkCard from '@/components/ArtworkCard';

interface Artwork {
    id: string;
    series?: string;
    title: string;
    year: string;
    medium: string;
    size: string;
}

export default function Home() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [filtered, setFiltered] = useState<Artwork[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const heroTitleRef = useRef<HTMLHeadingElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const scrollIndicatorRef = useRef<HTMLDivElement>(null);

    // 1. DATA FETCHING
    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(data => {
                setArtworks(data);
                setFiltered(data);
            })
            .catch(err => console.error("Error loading artworks:", err));
    }, []);

    // 2. HERO ANIMATIONS
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.8 } });
        
        // Initial build of title structure (words and characters)
        const title = heroTitleRef.current;
        if (title) {
            const text = title.innerText.trim();
            const wordsArr = text.split(/\s+/);
            title.innerHTML = wordsArr.map(word => {
                const chars = word.split('').map(char => `<span class="char">${char}</span>`).join('');
                return `<span class="word" style="display: inline-block; white-space: nowrap;">${chars}</span>`;
            }).join(' ');

            // Animate it
            tl.to(badgeRef.current, { opacity: 1, y: 0, delay: 0.4 })
              .fromTo('.char', { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 1 }, "-=1.2")
              .to(subtitleRef.current, { opacity: 1, y: 0 }, "-=1.2")
              .to(statsRef.current, { opacity: 1, y: 0 }, "-=1.4")
              .to(scrollIndicatorRef.current, { opacity: 1, y: 0 }, "-=1.5");
        }

        // Magnetic Hover Effect
        const handleMouseMove = (e: MouseEvent) => {
            if (!title) return;
            const chars = title.querySelectorAll('.char');
            const rect = title.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;

            chars.forEach((char) => {
                const charElement = char as HTMLElement;
                const charRect = charElement.getBoundingClientRect();
                const charX = charRect.left - rect.left + charRect.width / 2;
                const dist = Math.abs(mouseX - charX);
                const power = Math.max(0, 1 - dist / 180);

                gsap.to(charElement, {
                    y: -25 * power,
                    color: power > 0.4 ? '#0d9488' : '#18181b',
                    fontWeight: power > 0.6 ? '600' : '400',
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
        };

        const handleMouseLeave = () => {
            gsap.to('.char', { y: 0, color: '#18181b', fontWeight: '400', duration: 0.8, stagger: 0.02 });
        };

        if (title) {
            title.addEventListener('mousemove', handleMouseMove as EventListener);
            title.addEventListener('mouseleave', handleMouseLeave as EventListener);
        }

        return () => {
            if (title) {
                title.removeEventListener('mousemove', handleMouseMove as EventListener);
                title.removeEventListener('mouseleave', handleMouseLeave as EventListener);
            }
        };
    }, []);

    // 3. SEARCH FILTERING
    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const results = artworks.filter(item =>
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.series && item.series.toLowerCase().includes(query)) ||
            (item.id && item.id.toString().includes(query))
        );
        setFiltered(results);
    }, [searchQuery, artworks]);

    return (
        <main>
            {/* Hero Section */}
            <section className="hero" style={{ position: 'relative' }}>
                <div className="hero-content" style={{ width: '100%' }}>
                    <div ref={badgeRef} className="badge-container">
                        <span className="exhibition-badge">The Stainless Gallery // April 11–20</span>
                    </div>
                    <h1 ref={heroTitleRef} className="hero-title" id="hero-title">
                        BEFORE THE SILENCE
                    </h1>
                    <p ref={subtitleRef} className="hero-subtitle">
                        An immersive digital catalog of abstract explorations and temporal shifts.
                    </p>
                    <div ref={statsRef} className="hero-stats">
                        <div className="hero-stat-item">
                            <span className="stat-num">{artworks.length}</span>
                            <span className="stat-desc">Curated Pieces</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat-item">
                            <span className="stat-num">12+</span>
                            <span className="stat-desc">Artistic Series</span>
                        </div>
                    </div>
                </div>
                <div ref={scrollIndicatorRef} className="scroll-indicator">
                    <div className="mouse">
                        <div className="wheel"></div>
                    </div>
                    <span>Discover</span>
                </div>
            </section>

            {/* Search Section */}
            <div className="search-container" id="gallery">
                <div className="search-wrapper">
                    <div className="search-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        id="searchInput" 
                        placeholder="Search the collection..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="container" style={{ minHeight: '600px' }}>
                <div className="artwork-grid">
                    {filtered.map((item, index) => (
                        <ArtworkCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            </div>

            {/* Artist Section */}
            <section id="artist" className="artist-section">
                <div className="container artist-content">
                    <div className="artist-text">
                        <span className="section-label">Featured Artist</span>
                        <h2 className="section-title">DR. BHARAT&nbsp;&nbsp;THAKUR</h2>
                        <div className="artist-bio">
                            <p>
                                Dr. Bharat Thakur is a yoga master, founder of Artistic Yoga, and a self-taught 
                                visual artist working across painting and sculpture. Trained in the Himalayas 
                                under his mentor Sukhdev Brahmachari, his practice is shaped by years of 
                                spiritual discipline and observation.
                            </p>
                            <p>
                                His work is intuitive and process-led, drawing from yogic philosophy and 
                                exploring ideas of stillness, detachment, and inner awareness. Positioned at 
                                the intersection of art and lived experience, his practice reflects an ongoing 
                                engagement with translating internal states into visual form.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
