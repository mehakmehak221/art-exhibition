'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMenuOpen]);

    return (
        <nav className="glass-nav">
            <div className="nav-container">
                <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
                    BTS // EXHIBITION
                </Link>
                <div className="nav-links desktop-only">
                    <Link href="/#gallery" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                        Gallery
                    </Link>
                </div>

                {/* Hamburger Button */}
                <button 
                    className={`nav-hamburger ${isMenuOpen ? 'open' : ''}`} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
                    <div className="mobile-menu-links">
                        <Link 
                            href="/#gallery" 
                            className={`mobile-nav-link ${pathname === '/' ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="link-text">Gallery</span>
                        </Link>
                        <Link 
                            href="/#artist" 
                            className="mobile-nav-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="link-text">The Artist</span>
                        </Link>
                    </div>

                    <div className="mobile-menu-footer">
                        <div className="mobile-menu-info">
                            <span className="info-label">Current Exhibition</span>
                            <span className="info-value">Before The Silence // Dr. Bharat Thakur</span>
                            <span className="info-value">The Stainless Gallery, New Delhi</span>
                            <span className="info-value">April 11 — 20, 2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
