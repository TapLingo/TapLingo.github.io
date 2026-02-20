import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as tts from 'google-tts-api';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHARACTERS_FILE = path.join(__dirname, 'src', 'utils', 'characters.js');
const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();
app.use(express.json());
// Serve the public directory so we can preview images
app.use('/public', express.static(PUBLIC_DIR));

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(PUBLIC_DIR, 'animals', 'zootopia');
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

function parseZootopiaAnimals() {
    const content = fs.readFileSync(CHARACTERS_FILE, 'utf-8');
    const match = content.match(/export const ZOOTOPIA_ANIMALS = (\[[\s\S]*?\]);/);
    if (!match) return [];

    try {
        // using Function to parse the JS array object safely instead of eval
        return new Function(`return ${match[1]}`)();
    } catch (e) {
        console.error('Failed to parse ZOOTOPIA_ANIMALS', e);
        return [];
    }
}

function saveZootopiaAnimals(dataList) {
    let content = fs.readFileSync(CHARACTERS_FILE, 'utf-8');

    // Serialize the data list properly to match formatting
    const formattedDataString = '[\n' + dataList.map(item => {
        return `  { english: '${item.english.replace(/'/g, "\\'")}', korean: '${item.korean.replace(/'/g, "\\'")}', character: '${item.character.replace(/'/g, "\\'")}', image: '${item.image}' }`;
    }).join(',\n') + '\n]';

    const replaced = content.replace(/export const ZOOTOPIA_ANIMALS = \[\s*[\s\S]*?\s*\];/, `export const ZOOTOPIA_ANIMALS = ${formattedDataString};`);
    fs.writeFileSync(CHARACTERS_FILE, replaced, 'utf-8');
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
            fs.unlinkSync(p);
        }
    });
}

async function downloadAudio(text, lang, outputDirRelative) {
    if (!text) return;
    const name = safeName(text);
    const outputDir = path.join(PUBLIC_DIR, outputDirRelative);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${name}.mp3`);

    console.log(`Downloading audio to ${outputPath}`);
    const url = tts.getAudioUrl(text, {
        lang: lang,
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
}

// API Routes
app.get('/api/animals', (req, res) => {
    res.json(parseZootopiaAnimals());
});

app.post('/api/animals', upload.single('imageFile'), (req, res) => {
    const { originalEnglish, originalCharacter, english, korean, character, image } = req.body;
    const animals = parseZootopiaAnimals();

    // Find index by checking both originalEnglish and originalCharacter (so we don't pick the wrong Elephant or Lynx)
    const index = animals.findIndex(a => a.english === originalEnglish && a.character === originalCharacter);

    let newImageUrl = image;

    // Handle image replacement
    if (req.file) {
        newImageUrl = `/animals/zootopia/${req.file.filename}`;
    }

    if (index === -1) {
        // Add new item
        if (!english) return res.status(400).json({ error: 'English name required' });

        animals.push({
            english: english,
            korean: korean || '',
            character: character || '',
            image: newImageUrl || ''
        });
        saveZootopiaAnimals(animals);
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

    saveZootopiaAnimals(animals);
    res.json({ success: true, data: animals[index] });
});

app.delete('/api/animals/:english/:character', (req, res) => {
    const { english, character } = req.params;
    let animals = parseZootopiaAnimals();
    const index = animals.findIndex(a => a.english === english && a.character === character);
    if (index === -1) return res.status(404).json({ error: 'Animal not found' });

    const oldImage = animals[index].image;
    if (oldImage) {
        const oldImagePath = path.join(__dirname, 'public', oldImage);
        if (fs.existsSync(oldImagePath)) {
            try { fs.unlinkSync(oldImagePath); } catch (e) { }
        }
    }

    animals.splice(index, 1);
    saveZootopiaAnimals(animals);
    res.json({ success: true });
});

app.post('/api/audio-update', async (req, res) => {
    const { oldEnglish, oldCharacter, newEnglish, newCharacter } = req.body;

    try {
        // Folders to clean: requested tfcs and the actual game audio paths
        const foldersToClean = ['animals/zootopia_en', 'animals/zootopia_char', 'tfcs'];

        // Remove old audio files
        if (oldEnglish) removeAudioIfExists(foldersToClean, oldEnglish);
        if (oldCharacter) removeAudioIfExists(foldersToClean, oldCharacter);

        // Download new audio files
        // Save to the folders Game.jsx uses (and also tfcs just in case per user request)
        if (newEnglish) {
            await downloadAudio(newEnglish, 'en-US', 'audio/animals/zootopia_en');
            await downloadAudio(newEnglish, 'en-US', 'audio/tfcs');
        }
        if (newCharacter) {
            await downloadAudio(newCharacter, 'en-US', 'audio/animals/zootopia_char');
            await downloadAudio(newCharacter, 'en-US', 'audio/tfcs');
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
      <title>주토피아 등장인물 리스트 관리</title>
      <style>
    <style>
      body { font-family: 'Apple SD Gothic Neo', sans-serif; background: #f5f5f7; margin: 0; padding: 20px; color: #333; }
      h1 { text-align: center; }
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
    <h1>주토피아 관리자 (Zootopia Admin)</h1>
      <button class="btn-add" onclick="showAddForm()">새 캐릭터 추가하기 ➕</button>
      <div id="add-form-container" style="display:none; justify-content:center; margin-bottom:20px;">
        <div class="card add-card" style="border: 2px dashed #007aff;">
          <h3 style="margin-top:0;">새 캐릭터 추가</h3>
          <span class="paste-hint">💡 이 칸을 클릭한 뒤 클립보드 이미지를 붙여넣기(Ctrl+V) 할 수 있습니다.</span>
          <label>이름 (English) *</label><input type="text" id="add-eng" />
          <label>캐릭터명 (Character)</label><input type="text" id="add-char" />
          <label>한국어 (Korean)</label><input type="text" id="add-kor" />
          <label>이미지</label><input type="file" id="add-file" class="file-input" accept="image/*" />
          <div id="add-preview" style="font-size:12px; color:green; display:none; margin-bottom:10px;">✅ 이미지가 클립보드에서 준비되었습니다.</div>
          <button class="btn-update" onclick="addAnimal()">추가하기</button>
          <button style="background: #ccc; color: #333;" onclick="document.getElementById('add-form-container').style.display='none'">취소</button>
        </div>
      </div>
      <div class="card-container" id="container"></div>

      <script>
        async function loadAnimals() {
          const res = await fetch('/api/animals');
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
            
            card.innerHTML = \`
              <img src="/public\${animal.image}" alt="\${animal.english}" id="img-\${animal.english}">
              <span class="paste-hint">💡 이 카드를 선택 후 클립보드 이미지를 붙여넣기 할 수 있습니다.</span>
              <label>이름 (English)</label>
              <input type="text" id="eng-\${animal.english}" value="\${animal.english}" />
              
              <label>캐릭터명 (Character)</label>
              <input type="text" id="char-\${animal.english}" value="\${animal.character}" />
              
              <label>한국어 (Korean)</label>
              <input type="text" id="kor-\${animal.english}" value="\${animal.korean}" />
              
              <label>이미지 변경</label>
              <input type="file" id="file-\${animal.english}" class="file-input" accept="image/*" />
              
              <button class="btn-update" onclick="updateAnimal('\${animal.english}', '\${animal.character}')">데이터/이미지 저장</button>
              <button class="btn-audio" onclick="updateAudio('\${animal.english}', '\${animal.character}')">음성파일 업데이트</button>
              <button class="btn-delete" onclick="deleteAnimal('\${animal.english}', '\${animal.character}')">삭제</button>
            \`;
            container.appendChild(card);
          });
        }

        async function updateAnimal(originalEnglish, originalCharacter) {
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

          const res = await fetch('/api/animals', {
            method: 'POST',
            body: formData
          });
          const result = await res.json();
          if (result.success) {
            alert('저장되었습니다.');
            loadAnimals();
          } else {
            alert('오류 발생');
          }
        }

        async function addAnimal() {
          const engInput = document.getElementById('add-eng').value;
          const charInput = document.getElementById('add-char').value;
          const korInput = document.getElementById('add-kor').value;
          const fileInput = document.getElementById('add-file').files[0];

          if (!engInput) return alert('영어 이름은 필수입니다.');
          
          const formData = new FormData();
          formData.append('originalEnglish', ''); // Triggers addition
          formData.append('english', engInput);
          formData.append('character', charInput);
          formData.append('korean', korInput);
          if (fileInput) formData.append('imageFile', fileInput);

          const res = await fetch('/api/animals', { method: 'POST', body: formData });
          const result = await res.json();
          if (result.success) {
            alert('추가되었습니다.');
            document.getElementById('add-form-container').style.display='none';
            document.getElementById('add-eng').value = '';
            document.getElementById('add-char').value = '';
            document.getElementById('add-kor').value = '';
            document.getElementById('add-file').value = '';
            document.getElementById('add-preview').style.display = 'none';
            loadAnimals();
          } else {
            alert('오류 발생: ' + (result.error || ''));
          }
        }

        async function deleteAnimal(english, character) {
          if (!confirm(\`정말 '\${english}' - '\${character}' 항목을 삭제하시겠습니까?\`)) return;
          const res = await fetch(\`/api/animals/\${encodeURIComponent(english)}/\${encodeURIComponent(character)}\`, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            alert('삭제되었습니다.');
            loadAnimals();
          } else {
            alert('오류 발생');
          }
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

        async function updateAudio(originalEnglish, originalCharacter) {
          const engInput = document.getElementById(\`eng-\${originalEnglish}\`).value;
          const charInput = document.getElementById(\`char-\${originalEnglish}\`).value;

          const res = await fetch('/api/audio-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              oldEnglish: originalEnglish, 
              oldCharacter: originalCharacter,
              newEnglish: engInput,
              newCharacter: charInput
            })
          });
          const result = await res.json();
          if (result.success) {
            alert('음성이 성공적으로 업데이트/다운로드 되었습니다 (tfcs 포함).');
          } else {
            alert('음성 업데이트 실패');
          }
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

          // Determine which card is active
          let activeCard = document.querySelector('.card.active');
          
          // Fallback to focus-within
          if (!activeCard && document.activeElement) {
            activeCard = document.activeElement.closest('.card');
          }

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
