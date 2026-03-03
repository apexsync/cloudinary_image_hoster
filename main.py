import os
import cloudinary
import cloudinary.uploader
from flask import Flask, render_template_string, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration - Using keys from environment or fallbacks
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "dctmapb3t"), 
    api_key = os.getenv("CLOUDINARY_API_KEY", "284726674155177"), 
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "Q79hvURv2EqobW6UO_8i2ALusrM"),
    secure=True
)

# Premium UI Template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ApexSync | Image to Cloudinary URL</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --bg: #0f172a;
            --card: #1e293b;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --border: #334155;
            --success: #10b981;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 600px;
            padding: 2rem;
        }

        .card {
            background-color: var(--card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            text-align: center;
            transition: transform 0.3s ease;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(to right, #818cf8, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p {
            color: var(--text-muted);
            margin-bottom: 2rem;
        }

        #drop-zone {
            border: 2px dashed var(--border);
            border-radius: 16px;
            padding: 3rem 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            background: rgba(15, 23, 42, 0.3);
        }

        #drop-zone.dragover {
            border-color: var(--primary);
            background: rgba(99, 102, 241, 0.1);
            transform: scale(1.02);
        }

        .upload-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
            margin-top: 1rem;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        #result-area {
            margin-top: 2rem;
            display: none;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #preview-img {
            max-width: 100%;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border);
        }

        .url-box {
            background: var(--bg);
            border: 1px solid var(--border);
            padding: 1rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 1rem;
        }

        .url-box input {
            background: transparent;
            border: none;
            color: var(--primary);
            width: 100%;
            font-family: inherit;
            font-size: 0.9rem;
        }

        .copy-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            cursor: pointer;
            white-space: nowrap;
        }

        .loading-spinner {
            display: none;
            justify-content: center;
            margin: 1rem 0;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .status-msg {
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Cloudinary Tool</h1>
            <p>Drag & drop, paste, or click to upload</p>
            
            <div id="drop-zone">
                <div class="upload-icon">📸</div>
                <div>Drop image here or <span style="color: var(--primary)">browse</span></div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.6;">(Ctrl + V to paste)</div>
                <input type="file" id="file-input" hidden accept="image/*">
            </div>

            <div class="loading-spinner" id="spinner">
                <div class="spinner"></div>
            </div>
            <div id="status" class="status-msg"></div>

            <div id="result-area">
                <img id="preview-img" src="" alt="Preview">
                <div class="url-box">
                    <input type="text" id="image-url" readonly>
                    <button class="copy-btn" id="copy-btn">Copy URL</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const spinner = document.getElementById('spinner');
        const status = document.getElementById('status');
        const resultArea = document.getElementById('result-area');
        const previewImg = document.getElementById('preview-img');
        const imageUrlInput = document.getElementById('image-url');
        const copyBtn = document.getElementById('copy-btn');

        // Drag and Drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                uploadImage(file);
            }
        });

        // Paste support
        window.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    uploadImage(blob);
                    break;
                }
            }
        });

        // Click to browse
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files[0]) {
                uploadImage(fileInput.files[0]);
            }
        });

        async function uploadImage(file) {
            const formData = new FormData();
            formData.append('file', file);

            // UI state
            resultArea.style.display = 'none';
            spinner.style.display = 'flex';
            status.textContent = 'Uploading to Cloudinary...';
            status.style.color = 'var(--text-muted)';

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.secure_url) {
                    previewImg.src = data.secure_url;
                    imageUrlInput.value = data.secure_url;
                    resultArea.style.display = 'block';
                    status.textContent = 'Upload Successful!';
                    status.style.color = 'var(--success)';
                } else {
                    throw new Error(data.error || 'Upload failed');
                }
            } catch (err) {
                status.textContent = 'Error: ' + err.message;
                status.style.color = '#ef4444';
            } finally {
                spinner.style.display = 'none';
            }
        }

        copyBtn.addEventListener('click', () => {
            imageUrlInput.select();
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy URL'; }, 2000);
        });
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(file)
        return jsonify(upload_result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running on port 5001 to avoid conflict with the backend
    app.run(debug=True, port=5001)