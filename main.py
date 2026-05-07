import os
import traceback
import cloudinary
import cloudinary.uploader
import cloudinary.utils
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Serve React frontend from /frontend/build if it exists, otherwise templates
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'build', 'static')
BUILD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'build')

app = Flask(__name__, static_folder=STATIC_FOLDER if os.path.exists(STATIC_FOLDER) else 'static')
CORS(app)

# Default configuration from environment variables (Optional)
# Initialize with secure=True even if keys aren't present yet
cloudinary.config(secure=True)

DEFAULT_CONFIG = {
    "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
    "api_key": os.getenv("CLOUDINARY_API_KEY"),
    "api_secret": os.getenv("CLOUDINARY_API_SECRET"),
    "secure": True
}

# Configure default if keys are present
if all([DEFAULT_CONFIG["cloud_name"], DEFAULT_CONFIG["api_key"], DEFAULT_CONFIG["api_secret"]]):
    cloudinary.config(**DEFAULT_CONFIG)

# ─── Aspect Ratio Presets ─────────────────────────────────────────────────────
ASPECT_PRESETS = [
    {"id": "1_1",   "label": "1:1 Square",     "ratio": "1:1",   "description": "Ring close-ups, earring pairs, pendant shots"},
    {"id": "4_3",   "label": "4:3 Standard",    "ratio": "4:3",   "description": "Necklace flat-lays, bangle stack photos"},
    {"id": "3_2",   "label": "3:2 Classic",     "ratio": "3:2",   "description": "Jewelry set displays, bridal collection shots"},
    {"id": "16_9",  "label": "16:9 Widescreen", "ratio": "16:9",  "description": "Model wearing necklaces, earring lifestyle shots"},
    {"id": "9_16",  "label": "9:16 Portrait",   "ratio": "9:16",  "description": "Full pendant drop shots, long necklace displays"},
    {"id": "21_9",  "label": "21:9 Ultrawide",  "ratio": "21:9",  "description": "Wide jewelry spreads, full collection banners"},
    {"id": "4_5",   "label": "4:5 Portrait",    "ratio": "4:5",   "description": "Model wearing sets, bracelet on-wrist shots"},
    {"id": "2_1",   "label": "2:1 Panoramic",   "ratio": "2:1",   "description": "Multi-piece collection layouts, festive spreads"},
    {"id": "custom","label": "Custom",          "ratio": "custom","description": "Define your own dimensions"},
]


@app.route('/')
def index():
    # Serve React build if available, otherwise template
    if os.path.exists(os.path.join(BUILD_FOLDER, 'index.html')):
        return send_from_directory(BUILD_FOLDER, 'index.html')
    return render_template('index.html')


@app.route('/api/presets', methods=['GET'])
def get_presets():
    """Return available aspect ratio presets."""
    return jsonify({"presets": ASPECT_PRESETS}), 200


@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Get credentials from request if provided (client-side persistence)
        cloud_name = request.form.get('cloud_name')
        api_key = request.form.get('api_key')
        api_secret = request.form.get('api_secret')

        if cloud_name and api_key and api_secret:
            # Upload using provided credentials from frontend
            upload_result = cloudinary.uploader.upload(
                file,
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret
            )
        else:
            # Fallback to server-side defaults
            upload_result = cloudinary.uploader.upload(file)
            
        return jsonify(upload_result), 200
    except Exception as e:
        print("--- UPLOAD ERROR ---")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/transform', methods=['POST'])
def transform():
    """
    Upload an image with Cloudinary transformations for aspect ratio conversion.
    Accepts: file, credentials, and transformation params (aspect_ratio, width, 
    height, crop, quality, format).
    Returns both the original and transformed URLs.
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Get credentials
        cloud_name = request.form.get('cloud_name')
        api_key = request.form.get('api_key')
        api_secret = request.form.get('api_secret')

        # Get transformation parameters
        aspect_ratio = request.form.get('aspect_ratio')  # e.g. "16:9", "1:1"
        width = request.form.get('width')                 # target width in px
        height = request.form.get('height')               # target height in px
        crop = request.form.get('crop', 'fill')           # fill, fit, crop, thumb, scale
        quality = request.form.get('quality', 'auto')     # auto, 80, 60, etc.
        output_format = request.form.get('format', 'auto') # auto, webp, png, jpg
        gravity = request.form.get('gravity', 'auto')     # auto, face, center

        # Build the eager transformation
        transformation = {
            "crop": crop,
            "quality": quality,
            "fetch_format": output_format,
            "gravity": gravity,
        }

        if aspect_ratio and aspect_ratio != 'custom':
            transformation["aspect_ratio"] = aspect_ratio
        if width:
            transformation["width"] = int(width)
        if height:
            transformation["height"] = int(height)

        # Build eager transformation for server-side processing
        eager_transform = [transformation]

        upload_params = {
            "eager": eager_transform,
            "eager_async": False,  # Wait for transformation
        }

        if cloud_name and api_key and api_secret:
            upload_params["cloud_name"] = cloud_name
            upload_params["api_key"] = api_key
            upload_params["api_secret"] = api_secret

        upload_result = cloudinary.uploader.upload(file, **upload_params)

        # Extract transformed URL from eager result
        original_url = upload_result.get('secure_url', '')
        transformed_url = original_url  # fallback

        eager_results = upload_result.get('eager', [])
        if eager_results and len(eager_results) > 0:
            transformed_url = eager_results[0].get('secure_url', original_url)

        # Build a manual transformation URL as well for client-side flexibility
        public_id = upload_result.get('public_id', '')
        resource_format = upload_result.get('format', 'jpg')
        
        # Construct the transformation string for the URL
        t_parts = []
        if aspect_ratio and aspect_ratio != 'custom':
            t_parts.append(f"ar_{aspect_ratio.replace(':', '_')}")
        if width:
            t_parts.append(f"w_{width}")
        if height:
            t_parts.append(f"h_{height}")
        t_parts.append(f"c_{crop}")
        t_parts.append(f"q_{quality}")
        t_parts.append(f"g_{gravity}")
        if output_format != 'auto':
            t_parts.append(f"f_{output_format}")

        transform_string = ','.join(t_parts)
        
        # Get the base URL from the original URL
        if '/upload/' in original_url:
            base, rest = original_url.split('/upload/', 1)
            manual_url = f"{base}/upload/{transform_string}/{rest}"
        else:
            manual_url = transformed_url

        return jsonify({
            "original_url": original_url,
            "transformed_url": transformed_url,
            "manual_url": manual_url,
            "public_id": public_id,
            "format": resource_format,
            "width": upload_result.get('width'),
            "height": upload_result.get('height'),
            "bytes": upload_result.get('bytes'),
            "transformation": transformation,
        }), 200

    except Exception as e:
        print("--- TRANSFORM ERROR ---")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Running on port 5001
    print("ApexSync Cloud Importer running on http://127.0.0.1:5001")
    app.run(debug=True, port=5001)
