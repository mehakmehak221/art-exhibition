import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = './public/data.json';
const OUTPUT_PATH = './public/painting-labels.pdf';
const QRS_DIR = './public/qrs';

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

        // Layout settings - 4 x 3 inches (horizontal landscape)
        const labelWidth = 288; // 4 inches in points (1 inch = 72 points)
        const fixedHeight = 216; // 3 inches in points (1 inch = 72 points)
        const labelsPerPage = 1; // 1 label per page

        // Page dimensions
        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points

        // Label position (centered on page)
        const labelX = (pageWidth - labelWidth) / 2;
        const labelY = (pageHeight - fixedHeight) / 2;

        let labelIndex = 0;

        for (let i = 0; i < artworks.length; i++) {
            const item = artworks[i];

            // Add new page for each label (except first)
            if (labelIndex !== 0) {
                doc.addPage();
            }

            // --- Layout constants ---
            const padding = 8;
            const qrSize = 108; // 1.5 inch QR code
            const rowFontSize = 6;
            const descFontSize = 5;
            const separatorGap = 6;      // space above separator
            const separatorToDesc = 4;   // space from separator to description text

            // Left column widths
            const leftColX = labelX + padding;
            const leftColWidth = labelWidth - (padding * 2) - qrSize - 14;
            const labelColWidth = 45;
            const valueWidth = leftColWidth - labelColWidth - 4;
            const fullWidth = labelWidth - (padding * 2);

            // --- QR quiet zone calculation ---
            // QR images have margin:4 modules. For version 4 QR (33 modules + 8 margin = 41 total),
            // the quiet zone is 4/41 of the image size ≈ 10.5pt at 108pt.
            const qrQuietZone = Math.round((4 / 41) * qrSize); // ~10pt

            // Text rows align with the QR PATTERN (inside quiet zone), not the image edge
            const qrPatternHeight = qrSize - (2 * qrQuietZone); // ~88pt
            const totalItems = item.series ? 6 : 5;
            const itemHeight = qrPatternHeight / totalItems; // Each row fits within QR pattern area

            // --- Measure description height ---
            let descHeight = 0;
            let separatorBlockHeight = 0;
            if (item.description) {
                const normalizedDescription = normalizeText(item.description);
                doc.fontSize(descFontSize).font('Times-Italic');
                descHeight = doc.heightOfString(normalizedDescription, { width: fullWidth, align: 'justify' });
                separatorBlockHeight = separatorGap + 1 + separatorToDesc + descHeight; // gap + line + gap + text
            }

            // --- Total content height ---
            // Info block = full QR image height (108pt), text fits within its pattern area
            const infoBlockHeight = qrSize;
            const totalContentHeight = infoBlockHeight + separatorBlockHeight;

            // --- Vertical centering offset ---
            // This ensures equal top and bottom padding inside the label border
            const contentStartY = labelY + (fixedHeight - totalContentHeight) / 2;

            // --- Draw label border ---
            doc.rect(labelX, labelY, labelWidth, fixedHeight).lineWidth(1.5).stroke('#1a1a1a');
            doc.rect(labelX + 1.5, labelY + 1.5, labelWidth - 3, fixedHeight - 3).fill('#ffffff');

            // --- QR code (top-right of content block) ---
            const qrX = labelX + labelWidth - padding - qrSize;
            const qrY = contentStartY;

            // Check if QR code file exists
            const cleanTitle = (item.title || 'Untitled').replace(/[^a-z0-9]/gi, '_');
            const qrFileName = `${item.id}_${cleanTitle}.png`;
            const qrPath = path.join(__dirname, '..', QRS_DIR, qrFileName);
            const qrExists = fs.existsSync(qrPath);

            if (qrExists) {
                doc.image(qrPath, qrX, qrY, { width: qrSize, height: qrSize });
            } else {
                doc.rect(qrX, qrY, qrSize, qrSize).fill('#f3f4f6');
                doc.fontSize(5).fillColor('#9ca3af').text('QR', qrX + 8, qrY + 12);
                doc.fillColor('#000000');
            }

            // --- Left column rows (aligned with QR pattern, not image edge) ---
            // Offset by qrQuietZone so text top = QR black squares top
            let currentY = contentStartY + qrQuietZone;

            // Series (if exists) — takes 1 item slot
            if (item.series) {
                doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#666666')
                    .text(item.series.toUpperCase(), leftColX, currentY, { width: leftColWidth });
                currentY += itemHeight;
            }

            // Title
            const titleText = normalizeText(item.title || 'Untitled');
            doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#888888')
                .text('TITLE', leftColX, currentY, { width: labelColWidth });
            doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#1a1a1a')
                .text(titleText, leftColX + labelColWidth + 4, currentY, { width: valueWidth, lineBreak: true, align: 'left' });
            // Use actual height if title wraps to multiple lines, otherwise fixed itemHeight
            const titleH = doc.heightOfString(titleText, { width: valueWidth, lineBreak: true });
            currentY += Math.max(itemHeight, titleH + 2);

            // Medium
            if (item.medium) {
                doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#888888')
                    .text('MEDIUM', leftColX, currentY, { width: labelColWidth });
                doc.fontSize(rowFontSize).font('Helvetica').fillColor('#1a1a1a')
                    .text(item.medium, leftColX + labelColWidth + 4, currentY, { width: valueWidth, lineBreak: true, align: 'left' });
                currentY += itemHeight;
            }

            // Size
            if (item.size) {
                doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#888888')
                    .text('SIZE', leftColX, currentY, { width: labelColWidth });
                doc.fontSize(rowFontSize).font('Helvetica').fillColor('#1a1a1a')
                    .text(item.size, leftColX + labelColWidth + 4, currentY, { width: valueWidth, lineBreak: true, align: 'left' });
                currentY += itemHeight;
            }

            // Year
            if (item.year) {
                doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#888888')
                    .text('YEAR', leftColX, currentY, { width: labelColWidth });
                doc.fontSize(rowFontSize).font('Helvetica').fillColor('#1a1a1a')
                    .text(item.year, leftColX + labelColWidth + 4, currentY, { width: valueWidth, lineBreak: true, align: 'left' });
                currentY += itemHeight;
            }

            // Serial No.
            doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#888888')
                .text('SERIAL NO.', leftColX, currentY, { width: labelColWidth });
            doc.fontSize(rowFontSize).font('Helvetica-Bold').fillColor('#1a1a1a')
                .text(`#${item.id}`, leftColX + labelColWidth + 4, currentY, { width: valueWidth, lineBreak: true, align: 'left' });
            currentY += itemHeight;

            // --- Description (below QR + info block, full width) ---
            if (item.description) {
                const normalizedDescription = normalizeText(item.description);

                // currentY is now at bottom of info block (qrY + qrSize)
                // Use max to ensure we never overlap the QR
                const sepY = Math.max(currentY, qrY + qrSize) + separatorGap;

                // Full-width separator line
                doc.moveTo(labelX + padding, sepY)
                    .lineTo(labelX + labelWidth - padding, sepY)
                    .lineWidth(0.3).stroke('#e0e0e0');

                // Description text
                doc.fontSize(descFontSize).font('Times-Italic').fillColor('#555555');
                doc.text(normalizedDescription, labelX + padding, sepY + separatorToDesc, {
                    width: fullWidth,
                    align: 'justify',
                    lineBreak: true
                });
            }

            labelIndex++;
        }

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
