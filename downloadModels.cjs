const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';

const files = [
    'ssd_mobilenet_v1_model-weights_manifest.json',
    'ssd_mobilenet_v1_model.weights.bin',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model.weights.bin',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model.weights.bin'
];

async function downloadFile(filename) {
    const filePath = path.join(modelsDir, filename);
    const url = baseUrl + filename;
    
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${filename}...`);
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Done: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

async function main() {
    for (const file of files) {
        await downloadFile(file);
    }
    console.log("All models downloaded!");
}

main().catch(console.error);
