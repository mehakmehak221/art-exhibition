import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const DATA_PATH = './public/data.json';
const OUTPUT_DIR = './public/qrs';
const BASE_URL = 'https://art-exhibition-omega.vercel.app/view/';

async function generateQRs() {
    try {
        // 1. Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // 2. Read artwork data
        const rawData = fs.readFileSync(DATA_PATH, 'utf8');
        const artworks = JSON.parse(rawData);

        console.log(`Starting QR generation for ${artworks.length} artworks...`);

        for (const item of artworks) {
            const cleanTitle = (item.title || 'Untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${item.id}_${cleanTitle}.png`;
            const filePath = path.join(OUTPUT_DIR, fileName);
            const targetUrl = `${BASE_URL}${item.id}`;

            // Generate QR Code with high quality
            await QRCode.toFile(filePath, targetUrl, {
                width: 600,
                margin: 4,
                color: {
                    dark: '#18181b', // Deep charcoal to match theme
                    light: '#ffffff'
                }
            });

            console.log(`✓ Generated: ${fileName} -> ${targetUrl}`);
        }

        console.log('\nSuccess: All 88 QR codes updated to production URL.');

    } catch (error) {
        console.error('Error generating QR codes:', error);
    }
}

generateQRs();
