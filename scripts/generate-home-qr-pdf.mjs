import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QRS_DIR = './public/qrs';
const OUTPUT_PATH = './public/home-qr.pdf';

// Function to normalize Unicode characters for PDF
function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function generatePDF() {
    try {
        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 40, bottom: 40, left: 40, right: 40 }
        });

        // Pipe output to file
        const stream = fs.createWriteStream(OUTPUT_PATH);
        doc.pipe(stream);

        const qrSize = 108; // 1.5 inches in points (1 inch = 72 points)

        // Center QR code on page
        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = (pageHeight - qrSize) / 2 - 30; // Slightly above center to make room for name

        // Check if QR code file exists
        const qrPath = path.join(__dirname, '..', QRS_DIR, 'home_qr.png');
        const qrExists = fs.existsSync(qrPath);

        // Draw QR code centered
        if (qrExists) {
            doc.image(qrPath, qrX, qrY, { width: qrSize, height: qrSize });
        } else {
            doc.rect(qrX, qrY, qrSize, qrSize).fill('#f3f4f6');
            doc.fontSize(10).fillColor('#9ca3af').text('QR Not Found', qrX + 10, qrY + 45, { width: qrSize - 20, align: 'center' });
            doc.fillColor('#000000');
        }

        // Draw name below QR code
        const name = 'BEFORE THE SILENCE';
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text(name, 40, qrY + qrSize + 30, { width: pageWidth - 80, align: 'center' });

        // Finalize PDF
        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                console.log(`✓ PDF generated successfully: ${OUTPUT_PATH}`);
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
