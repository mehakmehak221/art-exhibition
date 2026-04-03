import './globals.css';
import Navbar from '@/components/Navbar';
import NeuralCanvas from '@/components/NeuralCanvas';
import TracingBeam from '@/components/TracingBeam';

export const metadata = {
  title: 'Before The Silence | Artist Exhibition Catalog',
  description: 'An immersive digital catalog of abstract explorations and temporal shifts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NeuralCanvas />
        <TracingBeam />
        <Navbar />
        {children}
        
        {/* Footer */}
        <footer className="exhibition-footer">
          <div className="container footer-content">
            <div className="footer-brand">
              <h2>BEFORE THE SILENCE</h2>
              <p>Experimental Art Catalog System</p>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2025 Art Catalog System. High-resolution QR verification active.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
