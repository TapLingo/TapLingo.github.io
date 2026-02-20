import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as tts from 'google-tts-api';
import axios from 'axios';

const chars = JSON.parse(fs.readFileSync(new URL('./src/utils/characters.json', import.meta.url), 'utf-8'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_ROOT = path.join(__dirname, 'public', 'audio');

// Helper: Sanitize filename
function safeName(text) {
    if (!text) return '';
    return text.toString().trim()
        .replace(/\//g, '')
        .replace(/[?<>:*|"\\/]/g, '')
        .replace(/\s+/g, '_');
}

// Helper: Download audio
async function downloadAudio(text, lang, category, subCategory = '', filenameText = null) {
    if (!text) return;

    const outputDir = path.join(AUDIO_ROOT, category, subCategory);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Use filenameText if provided (for phonics mapping), otherwise use text
    const safeText = filenameText || text;
    const filename = `${safeName(safeText)}.mp3`;
    const outputPath = path.join(outputDir, filename);

    // Force overwrite (always download)
    // if (fs.existsSync(outputPath)) return;

    try {
        const url = tts.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✅ Saved: [${category}/${subCategory}] ${text} -> ${filename}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (err) {
        console.error(`❌ Error downloading ${text}:`, err.message);
    }
}

// Main execution function
async function main() {
    console.log('🎙 Google TTS Audio Generation Started (US English)...');

    // 1. English Alphabet (en-US)
    for (const char of chars.ENGLISH_ALPHABET) {
        await downloadAudio(char, 'en-US', 'english', 'alphabet');
        await downloadAudio(char.toLowerCase(), 'en-US', 'english', 'alphabet');
    }

    // 2. Phonics: handled by TFCS (see process_tfcs.mjs)

    // 3. Hangul (ko)
    const hangulCategories = [
        ['names', chars.HANGUL_CONSONANT_NAMES],
        ['sounds', chars.HANGUL_CONSONANT_SOUNDS],
        ['syllables', chars.HANGUL_SYLLABLES],
        ['vowels', chars.HANGUL_VOWEL_NAMES],
        ['double_names', chars.HANGUL_DOUBLE_CONSONANT_NAMES],
        ['double_sounds', chars.HANGUL_DOUBLE_CONSONANT_SOUNDS]
    ];
    for (const [sub, list] of hangulCategories) {
        for (const char of list) await downloadAudio(char, 'ko', 'hangul', sub);
    }

    // 4. Numbers (en-US for English, ko for Korean)
    for (const num of chars.NUMBERS_KOREAN_NATIVE) await downloadAudio(num, 'ko', 'number', 'native');
    for (const num of chars.NUMBERS_KOREAN_SINO) await downloadAudio(num, 'ko', 'number', 'sino');
    for (const num of chars.NUMBERS_ENGLISH) await downloadAudio(num, 'en-US', 'number', 'english');
    for (const num of chars.PLACE_VALUES_KOREAN) await downloadAudio(num, 'ko', 'number', 'place_ko');
    for (let i = 10; i <= 100; i++) {
        await downloadAudio(i.toString(), 'en-US', 'number', 'random_en');
    }

    // 5. Animals (en-US)
    const allBasicAnimals = [
        ...chars.SEA_ANIMALS,
        ...chars.LAND_ANIMALS,
        ...chars.INSECT_ANIMALS
    ];
    for (const animal of allBasicAnimals) {
        await downloadAudio(animal.name, 'en-US', 'animals', 'basic');
    }

    // 6. Zootopia (en-US)
    if (chars.ZOOTOPIA_ANIMALS) {
        for (const z of chars.ZOOTOPIA_ANIMALS) {
            await downloadAudio(z.english, 'en-US', 'animals', 'zootopia_en');
            await downloadAudio(z.character, 'en-US', 'animals', 'zootopia_char');
        }
    }

    console.log('🎉 All audio files generated!');
}

main();
