import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as tts from 'google-tts-api';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHARACTERS_FILE = path.join(__dirname, 'src', 'utils', 'characters.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();
app.use(express.json());
// Serve the public directory so we can preview images
app.use('/public', express.static(PUBLIC_DIR));

const CATEGORY_MAP = {
    'zootopia': { arrayName: 'ZOOTOPIA_ANIMALS', folder: 'zootopia' },
    'zootopia2': { arrayName: 'ZOOTOPIA2_ANIMALS', folder: 'zootopia2' },
    'sea': { arrayName: 'SEA_ANIMALS', folder: 'sea' },
    'land': { arrayName: 'LAND_ANIMALS', folder: 'land' },
    'insects': { arrayName: 'INSECT_ANIMALS', folder: 'insects' }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const cat = req.params.category || 'zootopia';
        const folder = CATEGORY_MAP[cat]?.folder || cat;
        const dir = path.join(PUBLIC_DIR, 'animals', folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

function parseAnimals(category) {
    const arrayName = CATEGORY_MAP[category].arrayName;
    try {
        const content = fs.readFileSync(CHARACTERS_FILE, 'utf-8');
        const data = JSON.parse(content);
        return data[arrayName] || [];
    } catch (e) {
        console.error(`Failed to parse ${arrayName}`, e);
        return [];
    }
}

function saveAnimals(category, dataList) {
    const arrayName = CATEGORY_MAP[category].arrayName;
    try {
        const content = fs.readFileSync(CHARACTERS_FILE, 'utf-8');
        const data = JSON.parse(content);
        data[arrayName] = dataList;
        fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error(`Failed to save ${arrayName}`, e);
    }
}

// Helpers from generated audio script
function safeName(text) {
    if (!text) return '';
    return text.toString().trim()
        .replace(/\//g, '')
        .replace(/[?<>:*|"\\/]/g, '')
        .replace(/\s+/g, '_');
}

function removeAudioIfExists(folderList, text) {
    const name = safeName(text);
    if (!name) return;
    folderList.forEach(folder => {
        const p = path.join(PUBLIC_DIR, 'audio', folder, `${name}.mp3`);
        if (fs.existsSync(p)) {
            console.log(`Deleting old audio: ${p}`);
            try { fs.unlinkSync(p); } catch (e) { }
        }
    });
}

async function downloadAudio(text, lang, outputDirRelative) {
    if (!text) return;
    const name = safeName(text);
    const outputDir = path.join(PUBLIC_DIR, outputDirRelative);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${name}.mp3`);

    console.log(`Downloading audio to ${outputPath} (lang: ${lang || 'en-US'})`);
    try {
        const url = tts.getAudioUrl(text, {
            lang: lang || 'en-US',
            slow: false,
            host: 'https://translate.google.com',
        });

        const response = await axios({ method: 'get', url: url, responseType: 'stream' });
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e) {
        console.error("Google TTS failed:", e);
    }
}

// API Routes
app.get('/api/animals/:category', (req, res) => {
    const { category } = req.params;
    if (!CATEGORY_MAP[category]) return res.status(400).json({ error: 'Invalid category' });
    res.json(parseAnimals(category));
});

app.post('/api/animals/:category', upload.single('imageFile'), (req, res) => {
    const { category } = req.params;
    if (!CATEGORY_MAP[category]) return res.status(400).json({ error: 'Invalid category' });

    const animals = parseAnimals(category);
    let index = -1;

    let newImageUrl = req.body.image;
    if (req.file) {
        newImageUrl = `/animals/${CATEGORY_MAP[category].folder}/${req.file.filename}`;
    }

    if (category.startsWith('zootopia')) {
        const { originalEnglish, originalCharacter, english, korean, character, character_en, role, role_en, desc } = req.body;
        index = animals.findIndex(a => a.english === originalEnglish && a.character === originalCharacter);

        if (index === -1) {
            if (!english) return res.status(400).json({ error: 'English name required' });
            animals.push({
                english: english,
                korean: korean || '',
                character: character || '',
                character_en: character_en || '',
                role: role || '',
                role_en: role_en || '',
                desc: desc || '',
                image: newImageUrl || ''
            });
            saveAnimals(category, animals);
            return res.json({ success: true, data: animals[animals.length - 1] });
        }

        const oldImage = animals[index].image;
        if (req.file) {
            if (oldImage && oldImage !== newImageUrl) {
                const oldImagePath = path.join(__dirname, 'public', oldImage);
                if (fs.existsSync(oldImagePath)) {
                    try { fs.unlinkSync(oldImagePath); } catch (e) { }
                }
            }
        }

        animals[index] = {
            ...animals[index],
            english: english || animals[index].english,
            korean: korean !== undefined ? korean : animals[index].korean,
            character: character !== undefined ? character : animals[index].character,
            character_en: character_en !== undefined ? character_en : animals[index].character_en,
            role: role !== undefined ? role : animals[index].role,
            role_en: role_en !== undefined ? role_en : animals[index].role_en,
            desc: desc !== undefined ? desc : animals[index].desc,
            image: newImageUrl || oldImage
        };
    } else {
        const { originalName, name } = req.body;
        index = animals.findIndex(a => a.name === originalName);

        if (index === -1) {
            if (!name) return res.status(400).json({ error: 'Name required' });
            animals.push({
                name: name,
                image: newImageUrl || ''
            });
            saveAnimals(category, animals);
            return res.json({ success: true, data: animals[animals.length - 1] });
        }

        const oldImage = animals[index].image;
        if (req.file) {
            if (oldImage && oldImage !== newImageUrl) {
                const oldImagePath = path.join(__dirname, 'public', oldImage);
                if (fs.existsSync(oldImagePath)) {
                    try { fs.unlinkSync(oldImagePath); } catch (e) { }
                }
            }
        }

        animals[index] = {
            ...animals[index],
            name: name || animals[index].name,
            image: newImageUrl || oldImage
        };
    }

    saveAnimals(category, animals);
    res.json({ success: true, data: animals[index] });
});

const handleDelete = (req, res) => {
    const { category, id1, id2 } = req.params;
    if (!CATEGORY_MAP[category]) return res.status(400).json({ error: 'Invalid category' });

    let animals = parseAnimals(category);
    let index = -1;

    if (category.startsWith('zootopia')) {
        index = animals.findIndex(a => a.english === id1 && a.character === (id2 === 'undefined' ? '' : id2));
    } else {
        index = animals.findIndex(a => a.name === id1);
    }

    if (index === -1) return res.status(404).json({ error: 'Animal not found' });

    const oldImage = animals[index].image;
    if (oldImage) {
        const oldImagePath = path.join(__dirname, 'public', oldImage);
        if (fs.existsSync(oldImagePath)) {
            try { fs.unlinkSync(oldImagePath); } catch (e) { }
        }
    }

    animals.splice(index, 1);
    saveAnimals(category, animals);
    res.json({ success: true });
};

app.delete('/api/animals/:category/:id1', handleDelete);
app.delete('/api/animals/:category/:id1/:id2', handleDelete);

app.post('/api/audio-update/:category', async (req, res) => {
    const { category } = req.params;

    try {
        if (category.startsWith('zootopia')) {
            const { oldEnglish, oldCharacter, newEnglish, newCharacter, lang } = req.body;
            const targetLang = lang || 'en-US';
            const foldersToClean = [`animals/${category}_en`, `animals/${category}_char`, 'tfcs'];

            if (oldEnglish) removeAudioIfExists(foldersToClean, oldEnglish);
            if (oldCharacter) removeAudioIfExists(foldersToClean, oldCharacter);

            if (newEnglish) {
                await downloadAudio(newEnglish, targetLang, `audio/animals/${category}_en`);
                await downloadAudio(newEnglish, targetLang, 'audio/tfcs');
            }
            if (newCharacter) {
                await downloadAudio(newCharacter, targetLang, `audio/animals/${category}_char`);
                await downloadAudio(newCharacter, targetLang, 'audio/tfcs');
            }
        } else {
            const { oldName, newName, lang } = req.body;
            const targetLang = lang || 'en-US';
            const foldersToClean = ['animals/basic'];

            if (oldName) removeAudioIfExists(foldersToClean, oldName);
            if (newName) await downloadAudio(newName, targetLang, 'audio/animals/basic');
        }

        res.json({ success: true, message: 'Audio updated successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Audio update failed' });
    }
});

// Serve frontend HTML directly
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>동물 리스트 관리 (Animal Admin)</title>
      <style>
        body { font-family: 'Apple SD Gothic Neo', sans-serif; background: #f5f5f7; margin: 0; padding: 20px; color: #333; }
        h1 { text-align: center; }
        .tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
        .tab-btn { padding: 10px 20px; border-radius: 20px; background: #ddd; color: #333; border: none; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .tab-btn.active { background: #007aff; color: #fff; }
        .card-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
        .card { background: #fff; border-radius: 12px; padding: 20px; width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; cursor: pointer; border: 2px solid transparent; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
        .card.active { border-color: #007aff; box-shadow: 0 0 0 4px rgba(0,122,255,0.2); }
        .card img { width: 100%; height: 200px; object-fit: contain; background: #000; border-radius: 8px; margin-bottom: 10px; }
        input[type="text"] { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        label { font-size: 12px; color: #666; font-weight: bold; }
        button { width: 100%; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 5px; }
        .btn-update { background: #007aff; color: #fff; }
        .btn-audio { background: #34c759; color: #fff; }
        .btn-delete { background: #ff3b30; color: #fff; }
        .btn-add { background: #5856d6; color: #fff; margin-bottom: 20px; font-size: 16px; padding: 15px; }
        .file-input { margin-bottom: 15px; font-size: 12px; }
        .paste-hint { font-size: 11px; color: #888; margin-top: -10px; margin-bottom: 10px; display: block; }
        .toast {
            visibility: hidden;
            min-width: 250px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 16px;
            position: fixed;
            z-index: 1000;
            left: 50%;
            bottom: 30px;
            transform: translateX(-50%);
            font-size: 14px;
            box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
            transition: opacity 0.3s, bottom 0.3s;
            opacity: 0;
            pointer-events: none;
        }
        .toast.show {
            visibility: visible;
            opacity: 1;
            bottom: 50px;
        }
        .toast.error {
            background-color: #ff3b30;
        }
      </style>
    </head>
    <body>
      <h1>동물 리스트 관리 (Animal Admin)</h1>
      
      <div class="tabs">
        <button class="tab-btn active" onclick="switchCategory('zootopia')">주토피아</button>
        <button class="tab-btn" onclick="switchCategory('zootopia2')">주토피아2</button>
        <button class="tab-btn" onclick="switchCategory('sea')">바다동물</button>
        <button class="tab-btn" onclick="switchCategory('land')">육지동물</button>
        <button class="tab-btn" onclick="switchCategory('insects')">곤충</button>
      </div>

      <button class="btn-add" onclick="showAddForm()">새 항목 추가하기 ➕</button>
      
      <div id="add-form-container" style="display:none; justify-content:center; margin-bottom:20px;">
        <div class="card add-card" style="border: 2px dashed #007aff;">
          <h3 style="margin-top:0;">새 항목 추가</h3>
          <span class="paste-hint">💡 이 칸을 클릭한 뒤 클립보드 이미지를 붙여넣기(Ctrl+V) 할 수 있습니다.</span>
          
          <div id="add-fields-zootopia">
            <label>이름</label>
            <div style="display:flex; gap:5px; margin-bottom:10px;">
              <input type="text" id="add-char" placeholder="한국어" style="margin-bottom:0;" />
              <input type="text" id="add-char-en" placeholder="영어" style="margin-bottom:0;" />
            </div>
            <label>직책, 배역</label>
            <div style="display:flex; gap:5px; margin-bottom:10px;">
              <input type="text" id="add-role" placeholder="한국어" style="margin-bottom:0;" />
              <input type="text" id="add-role-en" placeholder="영어" style="margin-bottom:0;" />
            </div>
            <label>동물 종(한국어) / 동물 종(영어) * (영어 필수)</label>
            <div style="display:flex; gap:5px; margin-bottom:10px;">
              <input type="text" id="add-kor" placeholder="한국어" style="margin-bottom:0;" />
              <input type="text" id="add-eng" placeholder="영어" style="margin-bottom:0;" />
            </div>
            <label>간략한 인물 설명(한국어)</label><input type="text" id="add-desc" />
          </div>
          
          <div id="add-fields-basic" style="display:none;">
            <label>이름 (English) *</label><input type="text" id="add-name" />
          </div>

          <label>이미지</label><input type="file" id="add-file" class="file-input" accept="image/*" />
          <div id="add-preview" style="font-size:12px; color:green; display:none; margin-bottom:10px;">✅ 이미지가 클립보드에서 준비되었습니다.</div>
          <button class="btn-update" onclick="addAnimal()">추가하기</button>
          <button style="background: #ccc; color: #333;" onclick="document.getElementById('add-form-container').style.display='none'">취소</button>
        </div>
      </div>

      <div class="card-container" id="container"></div>

      <script>
        let currentCategory = 'zootopia';
        let toastTimeout;

        function showToast(msg, isError = false) {
            let toast = document.getElementById('toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toast';
                toast.className = 'toast';
                document.body.appendChild(toast);
            }
            toast.textContent = msg;
            if (isError) toast.classList.add('error');
            else toast.classList.remove('error');
            
            toast.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        function safeNameFront(text) {
            if (!text) return '';
            return text.toString().trim()
                .replace(/\\//g, '')
                .replace(/[?<>:*|"\\\\/]/g, '')
                .replace(/\\s+/g, '_');
        }

        function playAudioFeedback(btn, basePath, textValue) {
            if (!textValue) return;
            const url = basePath + safeNameFront(textValue) + '.mp3';
            const audio = new Audio(url);
            
            const originalText = btn.innerHTML;
            const originalOpacity = btn.style.opacity || '1';
            
            btn.innerHTML = '🔊';
            btn.style.opacity = '0.5';
            btn.disabled = true;

            let isRestored = false;
            const restoreBtn = () => {
                if (isRestored) return;
                isRestored = true;
                btn.innerHTML = originalText;
                btn.style.opacity = originalOpacity;
                btn.disabled = false;
            };

            audio.onended = restoreBtn;
            audio.onerror = () => {
                 setTimeout(() => {
                     showToast('음성 파일을 찾을 수 없습니다. (먼저 음성파일 재생성 버튼을 눌러주세요)', true);
                 }, 10);
                 restoreBtn();
            };
            audio.play().catch(e => {
                console.error(e);
                restoreBtn();
                if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
                    setTimeout(() => {
                        showToast('재생 오류가 발생했습니다.', true);
                    }, 10);
                }
            });
        }

        function switchCategory(cat) {
            currentCategory = cat;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(\`.tab-btn[onclick="switchCategory('\${cat}')"]\`).classList.add('active');
            
            if (currentCategory.startsWith('zootopia')) {
                document.getElementById('add-fields-zootopia').style.display = 'block';
                document.getElementById('add-fields-basic').style.display = 'none';
            } else {
                document.getElementById('add-fields-zootopia').style.display = 'none';
                document.getElementById('add-fields-basic').style.display = 'block';
            }
            
            document.getElementById('add-form-container').style.display = 'none';
            loadAnimals();
        }

        async function loadAnimals() {
          const res = await fetch(\`/api/animals/\${currentCategory}\`);
          const data = await res.json();
          const container = document.getElementById('container');
          container.innerHTML = '';
          
          data.forEach((animal, idx) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = function() {
              document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
              this.classList.add('active');
            };
            
            if (currentCategory.startsWith('zootopia')) {
                card.innerHTML = \`
                <img src="/public\${animal.image}" alt="\${animal.english}" id="img-zoo-\${idx}">
                <span class="paste-hint">💡 이 카드를 선택 후 클립보드 이미지를 붙여넣기 할 수 있습니다.</span>
                
                <label>이름(한국어) / 이름(영어)</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="char-zoo-\${idx}" value="\${animal.character || ''}" placeholder="한국어" style="margin-bottom:0;" />
                    <input type="text" id="char-en-zoo-\${idx}" value="\${animal.character_en || ''}" placeholder="영어" style="margin-bottom:0;" />
                    <button type="button" data-name="\${(animal.character_en||animal.character||'').replace(/\"/g, '&quot;')}" onclick="playAudioFeedback(this, '/public/audio/animals/' + currentCategory + '_char/', this.getAttribute('data-name'))" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:16px; margin-bottom:0;" title="듣기">▶️</button>
                </div>

                <label>직책, 배역(한국어) / 직책, 배역(영어)</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="role-zoo-\${idx}" value="\${animal.role || ''}" placeholder="한국어" style="margin-bottom:0;" />
                    <input type="text" id="role-en-zoo-\${idx}" value="\${animal.role_en || ''}" placeholder="영어" style="margin-bottom:0;" />
                </div>

                <label>동물 종(한국어) / 동물 종(영어)</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="kor-zoo-\${idx}" value="\${animal.korean || ''}" placeholder="한국어" style="margin-bottom:0;" />
                    <input type="text" id="eng-zoo-\${idx}" value="\${animal.english || ''}" placeholder="영어" style="margin-bottom:0;" />
                    <button type="button" data-name="\${(animal.english||'').replace(/\"/g, '&quot;')}" onclick="playAudioFeedback(this, '/public/audio/animals/' + currentCategory + '_en/', this.getAttribute('data-name'))" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:16px; margin-bottom:0;" title="듣기">▶️</button>
                </div>

                <label>간략한 인물 설명(한국어)</label>
                <input type="text" id="desc-zoo-\${idx}" value="\${animal.desc || ''}" style="margin-bottom:10px;" />
                
                <label>이미지 변경</label>
                <input type="file" id="file-zoo-\${idx}" class="file-input" accept="image/*" />
                
                <div style="display:flex; gap:5px; margin-bottom: 5px;">
                    <select id="lang-zoo-\${idx}" style="flex:1; padding:5px; border-radius:4px;">
                        <option value="en-US">영어 (미국식)</option>
                        <option value="ko-KR">한국어 (한국식)</option>
                    </select>
                </div>
                
                <button class="btn-update" onclick="updateAnimalZoo('\${animal.english.replace(/'/g, \"\\\\'\")}', '\${(animal.character||'').replace(/'/g, \"\\\\'\")}', \${idx})">데이터/이미지 저장</button>
                <button class="btn-audio" onclick="updateAudioZoo('\${animal.english.replace(/'/g, \"\\\\'\")}', '\${(animal.character||'').replace(/'/g, \"\\\\'\")}', \${idx})">음성파일 재생성</button>
                <button class="btn-delete" onclick="deleteAnimal('\${animal.english.replace(/'/g, \"\\\\'\")}', '\${(animal.character||'').replace(/'/g, \"\\\\'\")}')">삭제</button>
                \`;
            } else {
                card.innerHTML = \`
                <img src="/public\${animal.image}" alt="\${animal.name}" id="img-basic-\${idx}">
                <span class="paste-hint">💡 이 카드를 선택 후 클립보드 이미지를 붙여넣기 할 수 있습니다.</span>
                
                <label>이름 (English)</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="name-basic-\${idx}" value="\${animal.name}" style="margin-bottom:0;" />
                    <button type="button" data-name="\${animal.name.replace(/\"/g, '&quot;')}" onclick="playAudioFeedback(this, '/public/audio/animals/basic/', this.getAttribute('data-name'))" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:16px; margin-bottom:0;" title="듣기">▶️</button>
                </div>
                
                <label>이미지 변경</label>
                <input type="file" id="file-basic-\${idx}" class="file-input" accept="image/*" />
                
                <div style="display:flex; gap:5px; margin-bottom: 5px;">
                    <select id="lang-basic-\${idx}" style="flex:1; padding:5px; border-radius:4px;">
                        <option value="en-US">영어 (미국식)</option>
                        <option value="ko-KR">한국어 (한국식)</option>
                    </select>
                </div>
                
                <button class="btn-update" onclick="updateAnimalBasic('\${animal.name.replace(/'/g, \"\\\\'\")}', \${idx})">데이터/이미지 저장</button>
                <button class="btn-audio" onclick="updateAudioBasic('\${animal.name.replace(/'/g, \"\\\\'\")}', \${idx})">음성파일 재생성</button>
                <button class="btn-delete" onclick="deleteAnimal('\${animal.name.replace(/'/g, \"\\\\'\")}', '')">삭제</button>
                \`;
            }
            container.appendChild(card);
          });
        }

        async function updateAnimalZoo(originalEnglish, originalCharacter, idx) {
          const engInput = document.getElementById(\`eng-zoo-\${idx}\`).value;
          const charInput = document.getElementById(\`char-zoo-\${idx}\`).value;
          let charEnInput = '';
          const charEnEl = document.getElementById(\`char-en-zoo-\${idx}\`);
          if (charEnEl) charEnInput = charEnEl.value;

          const korInput = document.getElementById(\`kor-zoo-\${idx}\`).value;
          const roleInput = document.getElementById(\`role-zoo-\${idx}\`).value;
          
          let roleEnInput = '';
          const roleEnEl = document.getElementById(\`role-en-zoo-\${idx}\`);
          if (roleEnEl) roleEnInput = roleEnEl.value;
          
          const descInput = document.getElementById(\`desc-zoo-\${idx}\`).value;
          const fileInput = document.getElementById(\`file-zoo-\${idx}\`).files[0];
          
          const formData = new FormData();
          formData.append('originalEnglish', originalEnglish);
          formData.append('originalCharacter', originalCharacter);
          formData.append('english', engInput);
          formData.append('character', charInput);
          formData.append('character_en', charEnInput);
          formData.append('korean', korInput);
          formData.append('role', roleInput);
          formData.append('role_en', roleEnInput);
          formData.append('desc', descInput);
          if (fileInput) formData.append('imageFile', fileInput);

          const res = await fetch(\`/api/animals/\${currentCategory}\`, { method: 'POST', body: formData });
          const result = await res.json();
          if (result.success) {
            showToast('저장되었습니다.');
            loadAnimals();
          } else { showToast('오류 발생', true); }
        }

        async function updateAnimalBasic(originalName, idx) {
          const nameInput = document.getElementById(\`name-basic-\${idx}\`).value;
          const fileInput = document.getElementById(\`file-basic-\${idx}\`).files[0];
          
          const formData = new FormData();
          formData.append('originalName', originalName);
          formData.append('name', nameInput);
          if (fileInput) formData.append('imageFile', fileInput);

          const res = await fetch(\`/api/animals/\${currentCategory}\`, { method: 'POST', body: formData });
          const result = await res.json();
          if (result.success) {
            showToast('저장되었습니다.');
            loadAnimals();
          } else { showToast('오류 발생', true); }
        }

        async function addAnimal() {
          const formData = new FormData();
          const fileInput = document.getElementById('add-file').files[0];
          if (fileInput) formData.append('imageFile', fileInput);

          if (currentCategory.startsWith('zootopia')) {
              const engInput = document.getElementById('add-eng').value;
              const charInput = document.getElementById('add-char').value;
              const charEnInput = document.getElementById('add-char-en').value;
              const korInput = document.getElementById('add-kor').value;
              const roleInput = document.getElementById('add-role').value;
              const roleEnInput = document.getElementById('add-role-en').value;
              const descInput = document.getElementById('add-desc').value;
              if (!engInput) { showToast('동물 종(영어)은 필수입니다.', true); return; }
              
              formData.append('originalEnglish', ''); 
              formData.append('english', engInput);
              formData.append('character', charInput);
              formData.append('character_en', charEnInput);
              formData.append('korean', korInput);
              formData.append('role', roleInput);
              formData.append('role_en', roleEnInput);
              formData.append('desc', descInput);
          } else {
              const nameInput = document.getElementById('add-name').value;
              if (!nameInput) { showToast('영어 이름은 필수입니다.', true); return; }
              
              formData.append('originalName', '');
              formData.append('name', nameInput);
          }

          const res = await fetch(\`/api/animals/\${currentCategory}\`, { method: 'POST', body: formData });
          const result = await res.json();
          if (result.success) {
            showToast('추가되었습니다.');
            document.getElementById('add-form-container').style.display='none';
            document.getElementById('add-eng').value = '';
            document.getElementById('add-char').value = '';
            if(document.getElementById('add-char-en')) document.getElementById('add-char-en').value = '';
            document.getElementById('add-kor').value = '';
            if(document.getElementById('add-role')) document.getElementById('add-role').value = '';
            if(document.getElementById('add-role-en')) document.getElementById('add-role-en').value = '';
            if(document.getElementById('add-desc')) document.getElementById('add-desc').value = '';
            document.getElementById('add-name').value = '';
            document.getElementById('add-file').value = '';
            document.getElementById('add-preview').style.display = 'none';
            loadAnimals();
          } else { showToast('오류 발생: ' + (result.error || ''), true); }
        }

        async function deleteAnimal(id1, id2) {
          if (!confirm(\`정말 삭제하시겠습니까?\`)) return;
          let url = \`/api/animals/\${currentCategory}/\${encodeURIComponent(id1)}\`;
          if (currentCategory.startsWith('zootopia')) url += \`/\${encodeURIComponent(id2)}\`;
          
          const res = await fetch(url, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            showToast('삭제되었습니다.');
            loadAnimals();
          } else { showToast('오류 발생', true); }
        }

        function showAddForm() {
          document.getElementById('add-form-container').style.display = 'flex';
          const addCard = document.querySelector('.add-card');
          if (addCard) {
            document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
            addCard.classList.add('active');
            addCard.onclick = function() {
              document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
              this.classList.add('active');
            };
          }
        }

        async function updateAudioZoo(originalEnglish, originalCharacter, idx) {
          const engInput = document.getElementById(\`eng-zoo-\${idx}\`).value;
          const charEnEl = document.getElementById(\`char-en-zoo-\${idx}\`);
          const charInput = charEnEl && charEnEl.value ? charEnEl.value : document.getElementById(\`char-zoo-\${idx}\`).value;
          const lang = document.getElementById(\`lang-zoo-\${idx}\`).value;

          const res = await fetch(\`/api/audio-update/\${currentCategory}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              oldEnglish: originalEnglish, oldCharacter: originalCharacter,
              newEnglish: engInput, newCharacter: charInput,
              lang
            })
          });
          const result = await res.json();
          if (result.success) showToast('음성이 재생성/업데이트 되었습니다.');
          else showToast('음성 재생성/업데이트 실패', true);
        }

        async function updateAudioBasic(originalName, idx) {
          const nameInput = document.getElementById(\`name-basic-\${idx}\`).value;
          const lang = document.getElementById(\`lang-basic-\${idx}\`).value;

          const res = await fetch(\`/api/audio-update/\${currentCategory}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName: originalName, newName: nameInput, lang })
          });
          const result = await res.json();
          if (result.success) showToast('음성이 재생성/업데이트 되었습니다.');
          else showToast('음성 재생성/업데이트 실패', true);
        }

        loadAnimals();

        // Handle Paste Event globally to assign images to file inputs based on active card
        document.addEventListener('paste', e => {
          const items = (e.clipboardData || e.originalEvent.clipboardData).items;
          let imageFile = null;
          
          for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
              imageFile = item.getAsFile();
              break;
            }
          }
          
          if (!imageFile) return;

          let activeCard = document.querySelector('.card.active');
          if (!activeCard && document.activeElement) activeCard = document.activeElement.closest('.card');

          if (!activeCard) {
             showToast('업데이트할 캐릭터 카드를 먼저 클릭하여 선택한 후 붙여넣기 해주세요.', true);
             return;
          }

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(imageFile);

          if (activeCard.classList.contains('add-card')) {
             const fileInput = document.getElementById('add-file');
             fileInput.files = dataTransfer.files;
             document.getElementById('add-preview').style.display = 'block';
             showToast('클립보드 이미지가 추가 항목에 임시 입력되었습니다.');
             return;
          }
          
          const fileInput = activeCard.querySelector('.file-input');
          if (fileInput) {
             fileInput.files = dataTransfer.files;
             const imgElement = activeCard.querySelector('img');
             if (imgElement) {
                const blobUrl = URL.createObjectURL(imageFile);
                imgElement.src = blobUrl;
             }
             showToast('클립보드 이미지가 교체 대기열에 들어갔습니다. 저장을 눌러 반영하세요.');
          }
        });
      </script>
    </body>
    </html>
  `);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Zootopia Admin site running at http://localhost:${PORT}`);
});
