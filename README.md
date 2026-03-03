# ApexSync | Cloud Importer

A minimalist, high-performance web tool for syncing visual assets to Cloudinary. Designed with a monochrome aesthetic inspired by Vercel and Linear, optimized for both desktop and mobile.

![ApexSync Banner](https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=1000&auto=format&fit=crop)

## ✨ Features

- **Monochrome UI**: Clean, technical design with a Vercel-inspired dot-grid background and high-contrast typography.
- **Client-Side Persistence**: Enter your Cloudinary credentials once; they are stored securely in your browser's `localStorage`.
- **Universal Upload**: Designed for any digital asset (images, icons, UI components).
- **Mobile Optimized**: Fully responsive interface with touch-ready action buttons.
- **Vercel Ready**: Pre-configured for seamless hosting on Vercel's serverless runtime.
- **One-Tap Copy**: Instant clipboard copying for the generated Cloudinary URLs.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- A Cloudinary account

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/apexsync/cloudinary_image_hoster.git
   cd cloudinary_image_hoster
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python main.py
   ```
   Open [http://127.0.0.1:5001](http://127.0.0.1:5001) in your browser.

4. **Initialize**:
   On first load, enter your `Cloud Name`, `API Key`, and `API Secret` from your Cloudinary Dashboard.

## ☁️ Deployment

This repository is pre-configured for **Vercel**.

1. Connect your GitHub repository to the [Vercel Dashboard](https://vercel.com).
2. Vercel will detect `vercel.json` and deploy it as a Serverless Function automatically.
3. (Optional) Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` as Environment Variables in Vercel to ship a "ready-to-use" pre-configured version.

## 🛠 Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Inter Font Family)
- **Image Storage**: Cloudinary SDK
- **Hosting**: Vercel

## ⚙️ Configuration

To update your credentials at any time, click the **Settings** button in the top-right corner of the application.

---

*Part of the ApexSync Productivity Suite.*
