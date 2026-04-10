import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Function to normalize Unicode characters for PDF
function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = './public/data.json';
const QRS_DIR = './public/qrs';
const OUTPUT_PATH = './public/qr-catalog.pdf';

async function generatePDF() {
    try {
        // Read artwork data
        const rawData = fs.readFileSync(DATA_PATH, 'utf8');
        const artworks = JSON.parse(rawData);

        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 40, bottom: 40, left: 40, right: 40 }
        });

        // Pipe output to file
        const stream = fs.createWriteStream(OUTPUT_PATH);
        doc.pipe(stream);

        const itemsPerPage = 1; // 1 item per page
        const boxSize = 144; // 2 inches in points (1 inch = 72 points)
        const qrSize = 115; // 1.6 inches - slightly smaller to fit name in 2x2 box
        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points

        for (let i = 0; i < artworks.length; i++) {
            const item = artworks[i];
            
            // Add new page for each artwork
            if (i !== 0) {
                doc.addPage();
            }

            // Center the 2x2 box on page
            const boxX = (pageWidth - boxSize) / 2;
            const boxY = (pageHeight - boxSize) / 2;

            // Check if QR code file exists
            const cleanTitle = (item.title || 'Untitled').replace(/[^a-z0-9]/gi, '_');
            const qrFileName = `${item.id}_${cleanTitle}.png`;
            const qrPath = path.join(__dirname, '..', QRS_DIR, qrFileName);
            const qrExists = fs.existsSync(qrPath);

            // Draw QR code centered in the 2x2 box (at top portion)
            const qrX = boxX + (boxSize - qrSize) / 2;
            const qrY = boxY + 5;
            if (qrExists) {
                doc.image(qrPath, qrX, qrY, { width: qrSize, height: qrSize });
            } else {
                doc.rect(qrX, qrY, qrSize, qrSize).fill('#f3f4f6');
                doc.fontSize(10).fillColor('#9ca3af').text('QR Not Found', qrX + 10, qrY + 50, { width: qrSize - 20, align: 'center' });
                doc.fillColor('#000000');
            }

            // Draw artwork name and serial number at bottom of 2x2 box
            const normalizedTitle = normalizeText(item.title || 'Untitled');
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text(`#${item.id} - ${normalizedTitle}`, boxX, boxY + boxSize - 18, { width: boxSize, align: 'center' });
        }

        // Finalize PDF
        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                console.log(`✓ PDF generated successfully: ${OUTPUT_PATH}`);
                console.log(`✓ Total artworks: ${artworks.length}`);
                console.log(`✓ Pages: ${Math.ceil(artworks.length / itemsPerPage)}`);
                resolve();
            });
            stream.on('error', reject);
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

generatePDF().catch(console.error);
