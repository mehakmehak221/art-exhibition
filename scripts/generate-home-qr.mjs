import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/qrs';
const TARGET_URL = 'https://art-exhibition-omega.vercel.app/';
const FILE_NAME = 'home_qr.png';

async function generateHomeQR() {
    try {
        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        const filePath = path.join(OUTPUT_DIR, FILE_NAME);

        // Generate QR Code with same settings as artwork QRs
        await QRCode.toFile(filePath, TARGET_URL, {
            width: 600,
            margin: 4,
            color: {
                dark: '#18181b',
                light: '#ffffff'
            }
        });

        console.log(`✓ Generated: ${FILE_NAME} -> ${TARGET_URL}`);
        console.log(`✓ Saved to: ${filePath}`);

    } catch (error) {
        console.error('Error generating home QR code:', error);
    }
}

generateHomeQR();
