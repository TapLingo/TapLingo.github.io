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

    if (category === 'zootopia') {
        const { originalEnglish, originalCharacter, english, korean, character } = req.body;
        index = animals.findIndex(a => a.english === originalEnglish && a.character === originalCharacter);

        if (index === -1) {
            if (!english) return res.status(400).json({ error: 'English name required' });
            animals.push({
                english: english,
                korean: korean || '',
                character: character || '',
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
            korean: korean || animals[index].korean,
            character: character || animals[index].character,
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

    if (category === 'zootopia') {
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
        if (category === 'zootopia') {
            const { oldEnglish, oldCharacter, newEnglish, newCharacter, lang } = req.body;
            const targetLang = lang || 'en-US';
            const foldersToClean = ['animals/zootopia_en', 'animals/zootopia_char', 'tfcs'];

            if (oldEnglish) removeAudioIfExists(foldersToClean, oldEnglish);
            if (oldCharacter) removeAudioIfExists(foldersToClean, oldCharacter);

            if (newEnglish) {
                await downloadAudio(newEnglish, targetLang, 'audio/animals/zootopia_en');
                await downloadAudio(newEnglish, targetLang, 'audio/tfcs');
            }
            if (newCharacter) {
                await downloadAudio(newCharacter, targetLang, 'audio/animals/zootopia_char');
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
      </style>
    </head>
    <body>
      <h1>동물 리스트 관리 (Animal Admin)</h1>
      
      <div class="tabs">
        <button class="tab-btn active" onclick="switchCategory('zootopia')">주토피아</button>
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
            <label>이름 (English) *</label><input type="text" id="add-eng" />
            <label>캐릭터명 (Character)</label><input type="text" id="add-char" />
            <label>한국어 (Korean)</label><input type="text" id="add-kor" />
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
            const originalBg = btn.style.backgroundColor;
            const originalColor = btn.style.color;
            
            btn.innerHTML = '🔊 재생 중...';
            btn.style.backgroundColor = '#ff9500';
            btn.style.color = '#fff';
            btn.disabled = true;

            const restoreBtn = () => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = originalBg;
                btn.style.color = originalColor;
                btn.disabled = false;
            };

            audio.onended = restoreBtn;
            audio.onerror = () => {
                 alert('음성 파일을 찾을 수 없습니다. (먼저 음성파일 재생성 버튼을 눌러주세요)');
                 restoreBtn();
            };
            audio.play().catch(e => {
                console.error(e);
                alert('재생 오류가 발생했습니다.');
                restoreBtn();
            });
        }

        function switchCategory(cat) {
            currentCategory = cat;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(\`.tab-btn[onclick="switchCategory('\${cat}')"]\`).classList.add('active');
            
            if (currentCategory === 'zootopia') {
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
          
          data.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = function() {
              document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
              this.classList.add('active');
            };
            
            if (currentCategory === 'zootopia') {
                card.innerHTML = \`
                <img src="/public\${animal.image}" alt="\${animal.english}" id="img-\${animal.english}">
                <span class="paste-hint">💡 이 카드를 선택 후 클립보드 이미지를 붙여넣기 할 수 있습니다.</span>
                
                <label>이름 (English)</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="eng-\${animal.english}" value="\${animal.english}" style="margin-bottom:0;" />
                    <button type="button" data-name="\${animal.english.replace(/"/g, '&quot;')}" onclick="playAudioFeedback(this, '/public/audio/animals/zootopia_en/', this.getAttribute('data-name'))" style="width:auto; font-size:12px; margin-bottom:0;">▶️ 듣기</button>
                </div>
                
                <label>캐릭터명 (Character)</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="char-\${animal.english}" value="\${animal.character}" style="margin-bottom:0;" />
                    <button type="button" data-name="\${(animal.character||'').replace(/"/g, '&quot;')}" onclick="playAudioFeedback(this, '/public/audio/animals/zootopia_char/', this.getAttribute('data-name'))" style="width:auto; font-size:12px; margin-bottom:0;">▶️ 듣기</button>
                </div>
                
                <label>한국어 (Korean)</label>
                <input type="text" id="kor-\${animal.english}" value="\${animal.korean}" />
                
                <label>이미지 변경</label>
                <input type="file" id="file-\${animal.english}" class="file-input" accept="image/*" />
                
                <div style="display:flex; gap:5px; margin-bottom: 5px;">
                    <select id="lang-\${animal.english}" style="flex:1; padding:5px; border-radius:4px;">
                        <option value="en-US">영어 (미국식)</option>
                        <option value="ko-KR">한국어 (한국식)</option>
                    </select>
                </div>
                
                <button class="btn-update" onclick="updateAnimalZoo('\${animal.english.replace(/'/g, \"\\\\'\")}', '\${(animal.character||'').replace(/'/g, \"\\\\'\")}')">데이터/이미지 저장</button>
                <button class="btn-audio" onclick="updateAudioZoo('\${animal.english.replace(/'/g, \"\\\\'\")}', '\${(animal.character||'').replace(/'/g, \"\\\\'\")}')">음성파일 재생성</button>
                <button class="btn-delete" onclick="deleteAnimal('\${animal.english.replace(/'/g, \"\\\\'\")}', '\${(animal.character||'').replace(/'/g, \"\\\\'\")}')">삭제</button>
                \`;
            } else {
                card.innerHTML = \`
                <img src="/public\${animal.image}" alt="\${animal.name}" id="img-\${animal.name}">
                <span class="paste-hint">💡 이 카드를 선택 후 클립보드 이미지를 붙여넣기 할 수 있습니다.</span>
                
                <label>이름 (English)</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="name-\${animal.name}" value="\${animal.name}" style="margin-bottom:0;" />
                    <button type="button" data-name="\${animal.name.replace(/"/g, '&quot;')}" onclick="playAudioFeedback(this, '/public/audio/animals/basic/', this.getAttribute('data-name'))" style="width:auto; font-size:12px; margin-bottom:0;">▶️ 듣기</button>
                </div>
                
                <label>이미지 변경</label>
                <input type="file" id="file-\${animal.name}" class="file-input" accept="image/*" />
                
                <div style="display:flex; gap:5px; margin-bottom: 5px;">
                    <select id="lang-\${animal.name}" style="flex:1; padding:5px; border-radius:4px;">
                        <option value="en-US">영어 (미국식)</option>
                        <option value="ko-KR">한국어 (한국식)</option>
                    </select>
                </div>
                
                <button class="btn-update" onclick="updateAnimalBasic('\${animal.name.replace(/'/g, \"\\\\'\")}')">데이터/이미지 저장</button>
                <button class="btn-audio" onclick="updateAudioBasic('\${animal.name.replace(/'/g, \"\\\\'\")}')">음성파일 재생성</button>
                <button class="btn-delete" onclick="deleteAnimal('\${animal.name.replace(/'/g, \"\\\\'\")}', '')">삭제</button>
                \`;
            }
            container.appendChild(card);
          });
        }

        async function updateAnimalZoo(originalEnglish, originalCharacter) {
          const engInput = document.getElementById(\`eng-\${originalEnglish}\`).value;
          const charInput = document.getElementById(\`char-\${originalEnglish}\`).value;
          const korInput = document.getElementById(\`kor-\${originalEnglish}\`).value;
          const fileInput = document.getElementById(\`file-\${originalEnglish}\`).files[0];
          
          const formData = new FormData();
          formData.append('originalEnglish', originalEnglish);
          formData.append('originalCharacter', originalCharacter);
          formData.append('english', engInput);
          formData.append('character', charInput);
          formData.append('korean', korInput);
          if (fileInput) formData.append('imageFile', fileInput);

          const res = await fetch(\`/api/animals/\${currentCategory}\`, { method: 'POST', body: formData });
          const result = await res.json();
          if (result.success) {
            alert('저장되었습니다.');
            loadAnimals();
          } else { alert('오류 발생'); }
        }

        async function updateAnimalBasic(originalName) {
          const nameInput = document.getElementById(\`name-\${originalName}\`).value;
          const fileInput = document.getElementById(\`file-\${originalName}\`).files[0];
          
          const formData = new FormData();
          formData.append('originalName', originalName);
          formData.append('name', nameInput);
          if (fileInput) formData.append('imageFile', fileInput);

          const res = await fetch(\`/api/animals/\${currentCategory}\`, { method: 'POST', body: formData });
          const result = await res.json();
          if (result.success) {
            alert('저장되었습니다.');
            loadAnimals();
          } else { alert('오류 발생'); }
        }

        async function addAnimal() {
          const formData = new FormData();
          const fileInput = document.getElementById('add-file').files[0];
          if (fileInput) formData.append('imageFile', fileInput);

          if (currentCategory === 'zootopia') {
              const engInput = document.getElementById('add-eng').value;
              const charInput = document.getElementById('add-char').value;
              const korInput = document.getElementById('add-kor').value;
              if (!engInput) return alert('영어 이름은 필수입니다.');
              
              formData.append('originalEnglish', ''); 
              formData.append('english', engInput);
              formData.append('character', charInput);
              formData.append('korean', korInput);
          } else {
              const nameInput = document.getElementById('add-name').value;
              if (!nameInput) return alert('영어 이름은 필수입니다.');
              
              formData.append('originalName', '');
              formData.append('name', nameInput);
          }

          const res = await fetch(\`/api/animals/\${currentCategory}\`, { method: 'POST', body: formData });
          const result = await res.json();
          if (result.success) {
            alert('추가되었습니다.');
            document.getElementById('add-form-container').style.display='none';
            document.getElementById('add-eng').value = '';
            document.getElementById('add-char').value = '';
            document.getElementById('add-kor').value = '';
            document.getElementById('add-name').value = '';
            document.getElementById('add-file').value = '';
            document.getElementById('add-preview').style.display = 'none';
            loadAnimals();
          } else { alert('오류 발생: ' + (result.error || '')); }
        }

        async function deleteAnimal(id1, id2) {
          if (!confirm(\`정말 삭제하시겠습니까?\`)) return;
          let url = \`/api/animals/\${currentCategory}/\${encodeURIComponent(id1)}\`;
          if (currentCategory === 'zootopia') url += \`/\${encodeURIComponent(id2)}\`;
          
          const res = await fetch(url, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            alert('삭제되었습니다.');
            loadAnimals();
          } else { alert('오류 발생'); }
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

        async function updateAudioZoo(originalEnglish, originalCharacter) {
          const engInput = document.getElementById(\`eng-\${originalEnglish}\`).value;
          const charInput = document.getElementById(\`char-\${originalEnglish}\`).value;
          const lang = document.getElementById(\`lang-\${originalEnglish}\`).value;

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
          if (result.success) alert('음성이 재생성/업데이트 되었습니다.');
          else alert('음성 재생성/업데이트 실패');
        }

        async function updateAudioBasic(originalName) {
          const nameInput = document.getElementById(\`name-\${originalName}\`).value;
          const lang = document.getElementById(\`lang-\${originalName}\`).value;

          const res = await fetch(\`/api/audio-update/\${currentCategory}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName: originalName, newName: nameInput, lang })
          });
          const result = await res.json();
          if (result.success) alert('음성이 재생성/업데이트 되었습니다.');
          else alert('음성 재생성/업데이트 실패');
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
             alert('업데이트할 캐릭터 카드를 먼저 클릭하여 선택한 후 붙여넣기 해주세요.');
             return;
          }

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(imageFile);

          if (activeCard.classList.contains('add-card')) {
             const fileInput = document.getElementById('add-file');
             fileInput.files = dataTransfer.files;
             document.getElementById('add-preview').style.display = 'block';
             alert('클립보드 이미지가 추가 항목에 임시 입력되었습니다.');
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
             alert('클립보드 이미지가 교체 대기열에 들어갔습니다. 저장을 눌러 반영하세요.');
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
