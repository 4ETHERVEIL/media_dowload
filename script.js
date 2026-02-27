// Function untuk Fetch Data Media
async function fetchMedia() {
    const input = document.getElementById('urlInput');
    const btn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorCard = document.getElementById('error-msg');
    const errorText = document.getElementById('error-text');
    const url = input.value.trim();

    if (!url) return;

    // Reset UI
    btn.disabled = true;
    loading.classList.remove('hidden');
    resultDiv.innerHTML = '';
    errorCard.classList.add('hidden');

    try {
        const response = await fetch('/api/index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            throw new Error(json.error || 'Media tidak ditemukan / Link Invalid.');
        }

        renderResult(json.data);

    } catch (err) {
        errorText.textContent = err.message;
        errorCard.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
    }
}

// UPDATE: Render HTML yang lebih "RAME"
function renderResult(medias) {
    const resultDiv = document.getElementById('result');

    medias.forEach((media, index) => {
        const card = document.createElement('div');
        card.className = 'cyber-card result-card';
        // Animasi muncul
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.4s ease';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);

        let typeTitle = 'MEDIA_FILE';
        let mediaPreview = '';
        const ext = media.extension || 'mp4';
        const filename = `Sann404_DL_${Date.now()}_${index}.${ext}`;

        if (media.type === 'video') {
            typeTitle = `VIDEO_DATA [${media.quality || 'HD'}]`;
            mediaPreview = `
                <div style="background:#000; padding:5px; border:2px solid #000;">
                    <video controls poster="${media.thumbnail || ''}" playsinline style="border:none; margin:0;">
                        <source src="${media.url}" type="video/mp4">
                    </video>
                </div>`;
        } else if (media.type === 'image') {
            typeTitle = 'IMAGE_DATA';
            mediaPreview = `<img src="${media.url}" alt="Result">`;
        } else if (media.type === 'audio') {
            typeTitle = 'AUDIO_STREAM';
            mediaPreview = `<audio controls style="width:100%;"><source src="${media.url}" type="audio/mpeg"></audio>`;
        }

        card.innerHTML = `
            <div class="result-header">
                <span>${typeTitle}</span>
                <span class="result-badge">SUCCESS</span>
            </div>
            <div class="result-body">
                ${mediaPreview}
                <div style="margin: 15px 0; font-family: 'JetBrains Mono'; font-size: 0.8rem; border-top: 2px dashed #ccc; padding-top: 10px;">
                    > FILENAME: ${filename} <br>
                    > SIZE: UNKNOWN
                </div>
                <button class="cyber-button" style="background: var(--accent-tertiary); color:white; border-color:black;"
                    onclick="forceDownload('${media.url}', '${filename}', this)">
                    DOWNLOAD NOW
                </button>
            </div>
        `;

        resultDiv.appendChild(card);
    });
}

// Function Force Direct Download (TIDAK BERUBAH)
async function forceDownload(url, filename, btnElement) {
    const originalText = btnElement.innerText;
    btnElement.innerText = "DOWNLOADING...";
    btnElement.disabled = true;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error");
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        
        a.click();
        
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);

    } catch (e) {
        console.error("Direct download failed, opening in new tab", e);
        window.location.href = url; 
    } finally {
        btnElement.innerText = "COMPLETED";
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.disabled = false;
        }, 2000);
    }
}
