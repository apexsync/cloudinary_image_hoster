# ApexSync | Cloud Importer

A luxury, monochrome Cloudinary toolkit for syncing visual assets to the cloud. Upload images, convert aspect ratios, resize, and generate permanent URLs. Designed with a Vercel-inspired aesthetic, optimized for both desktop and mobile.

![ApexSync Banner](https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=1000&auto=format&fit=crop)

## ✨ Features

- **Monochrome Luxury UI**: Clean, technical React frontend with a dark theme, dot-grid background, glassmorphism, and gradient typography.
- **Aspect Ratio Converter**: Transform images to any preset ratio (1:1, 4:3, 3:2, 16:9, 9:16, 21:9, 4:5, 2:1) or custom dimensions.
- **Quick Upload**: Instant image-to-URL conversion with drag-and-drop support.
- **Advanced Options**: Crop mode (fill, fit, crop, thumb, scale), quality control, and format conversion (WebP, PNG, JPEG, AVIF).
- **Client-Side Persistence**: Credentials stored securely in your browser's `localStorage`.
- **Original + Transformed URLs**: Get both the original and transformed Cloudinary URLs.
- **One-Tap Copy**: Instant clipboard copying for generated URLs.
- **Mobile Optimized**: Fully responsive interface with touch-ready action buttons.
- **Vercel Ready**: Pre-configured for seamless hosting on Vercel's serverless runtime.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- A Cloudinary account

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/apexsync/cloudinary_image_hoster.git
   cd cloudinary_image_hoster
   ```

2. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Start the backend** (from root):
   ```bash
   python main.py
   ```

5. **Start the frontend** (from `frontend/`):
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Initialize**:
   On first load, enter your `Cloud Name`, `API Key`, and `API Secret` from your Cloudinary Dashboard.

## 🔄 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/upload` | POST | Upload an image and get the Cloudinary URL |
| `/transform` | POST | Upload + transform with aspect ratio, resize, and format conversion |
| `/api/presets` | GET | Get available aspect ratio presets |

### Transform Parameters

| Parameter | Values | Default |
|---|---|---|
| `aspect_ratio` | `1:1`, `4:3`, `3:2`, `16:9`, `9:16`, `21:9`, `4:5`, `2:1` | — |
| `width` | Any integer (px) | — |
| `height` | Any integer (px) | — |
| `crop` | `fill`, `fit`, `crop`, `thumb`, `scale` | `fill` |
| `quality` | `auto`, `100`, `80`, `60`, `40` | `auto` |
| `format` | `auto`, `webp`, `png`, `jpg`, `avif` | `auto` |
| `gravity` | `auto`, `face`, `center` | `auto` |

## ☁️ Deployment

This repository is pre-configured for **Vercel**.

1. Connect your GitHub repository to the [Vercel Dashboard](https://vercel.com).
2. Vercel will detect `vercel.json` and deploy it as a Serverless Function automatically.
3. (Optional) Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` as Environment Variables in Vercel to ship a "ready-to-use" pre-configured version.

## 🛠 Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React (Vite), Vanilla CSS, Inter & JetBrains Mono fonts
- **Image Storage**: Cloudinary SDK (with eager transformations)
- **Hosting**: Vercel

## ⚙️ Configuration

To update your credentials at any time, click the **Settings** button in the top-right corner of the application.

---

*Part of the ApexSync Productivity Suite.*
