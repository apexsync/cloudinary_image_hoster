import os
import traceback
import cloudinary
import cloudinary.uploader
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
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

@app.route('/')
def index():
    return render_template('index.html')

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

if __name__ == '__main__':
    # Running on port 5001
    print("ApexSync Cloud Importer running on http://127.0.0.1:5001")
    app.run(debug=True, port=5001)
