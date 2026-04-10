import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = './public/data.json';
const OUTPUT_PATH = './public/painting-labels.pdf';

// Function to normalize Unicode characters for PDF
function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function generateLabelsPDF() {
    try {
        // Read artwork data
        const rawData = fs.readFileSync(DATA_PATH, 'utf8');
        const artworks = JSON.parse(rawData);

        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 20, bottom: 20, left: 20, right: 20 }
        });

        // Pipe output to file
        const stream = fs.createWriteStream(OUTPUT_PATH);
        doc.pipe(stream);

        // Layout settings
        const labelWidth = 500; // Width of each label in points (increased for two-column layout)
        const labelHeight = 380; // Height of each label in points (increased to prevent overflow)
        const labelsPerPage = 1; // 1 label per page

        let labelIndex = 0;

        for (let i = 0; i < artworks.length; i++) {
            const item = artworks[i];

            // Add new page for each label
            if (labelIndex !== 0) {
                doc.addPage();
            }

            // Center label on page
            const pageWidth = 595.28; // A4 width in points
            const pageHeight = 841.89; // A4 height in points
            const x = (pageWidth - labelWidth) / 2;
            const y = (pageHeight - labelHeight) / 2;

            // Draw decorative border with rounded corners effect
            doc.rect(x, y, labelWidth, labelHeight).lineWidth(2).stroke('#0d9488');
            doc.rect(x + 3, y + 3, labelWidth - 6, labelHeight - 6).lineWidth(0.5).stroke('#d4d4d4');

            // Add subtle background matching website
            doc.rect(x + 3, y + 3, labelWidth - 6, labelHeight - 6).fill('#f8f8f9');

            // Padding inside label
            const padding = 20;
            const leftColumnWidth = 200;
            const rightColumnWidth = labelWidth - leftColumnWidth - (padding * 3);
            const leftX = x + padding;
            const rightX = x + padding + leftColumnWidth + padding;
            let currentY = y + padding;

            // Add decorative header bar with vibrant accent color
            doc.rect(x + 3, y + 3, labelWidth - 6, 3).fill('#0d9488');

            // Serial number with decorative badge
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#18181b').text(`ARTWORK #${item.id}`, leftX, currentY);
            currentY = doc.y + 15;

            // Title with elegant typography
            const normalizedTitle = normalizeText(item.title || 'Untitled');
            doc.fontSize(18).font('Helvetica-Bold').fillColor('#18181b').text(normalizedTitle, leftX, currentY, { width: labelWidth - (padding * 2), lineBreak: true });
            currentY = doc.y + 18;

            // Add decorative line below title with vibrant accent
            doc.moveTo(leftX, currentY).lineTo(x + labelWidth - padding, currentY).lineWidth(1).stroke('#0d9488');
            currentY = currentY + 15;

            // Draw vertical separator line
            doc.moveTo(x + padding + leftColumnWidth + padding / 2, currentY).lineTo(x + padding + leftColumnWidth + padding / 2, y + labelHeight - padding).lineWidth(1).stroke('#e0e0e0');

            // Left column: Details
            let leftY = currentY;
            const leftColumnX = leftX;

            // Medium with enhanced styling
            if (item.medium) {
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#71717a').text('MEDIUM', leftColumnX, leftY);
                leftY = doc.y + 3;
                doc.fontSize(10).font('Helvetica').fillColor('#18181b').text(item.medium, leftColumnX, leftY);
                leftY = doc.y + 12;
            }

            // Size with enhanced styling
            if (item.size) {
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#71717a').text('DIMENSIONS', leftColumnX, leftY);
                leftY = doc.y + 3;
                doc.fontSize(10).font('Helvetica').fillColor('#18181b').text(item.size, leftColumnX, leftY);
                leftY = doc.y + 12;
            }

            // Year with enhanced styling
            if (item.year) {
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#71717a').text('YEAR', leftColumnX, leftY);
                leftY = doc.y + 3;
                doc.fontSize(10).font('Helvetica').fillColor('#18181b').text(item.year, leftColumnX, leftY);
                leftY = doc.y + 12;
            }

            // Series with enhanced styling
            if (item.series) {
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#71717a').text('SERIES', leftColumnX, leftY);
                leftY = doc.y + 3;
                doc.fontSize(10).font('Helvetica-Oblique').fillColor('#0d9488').text(item.series, leftColumnX, leftY, { width: leftColumnWidth, lineBreak: true });
            }

            // Right column: Description with enhanced styling
            let rightY = currentY;
            if (item.description) {
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#71717a').text('ABOUT THIS ARTWORK', rightX, rightY);
                rightY = doc.y + 5;
                const normalizedDescription = normalizeText(item.description);
                doc.fontSize(9).font('Helvetica').fillColor('#71717a').text(normalizedDescription, rightX, rightY, { width: rightColumnWidth, align: 'justify', lineBreak: true });
            }

            labelIndex++;
        }

        // Finalize PDF
        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                console.log(`✓ PDF generated successfully: ${OUTPUT_PATH}`);
                console.log(`✓ Total labels: ${artworks.length}`);
                console.log(`✓ Pages: ${Math.ceil(artworks.length / labelsPerPage)}`);
                resolve();
            });
            stream.on('error', reject);
        });

    } catch (error) {
        console.error('Error generating labels PDF:', error);
        throw error;
    }
}

generateLabelsPDF().catch(console.error);
