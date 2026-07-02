import os
import json
from flask import Flask, request, jsonify, send_from_directory, redirect
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
from datetime import datetime
import traceback
import mimetypes

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../', static_url_path='/')

# Enable CORS for all routes
CORS(app, origins=['*'])

# Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("❌ ERROR: Missing Supabase environment variables!")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Cloudinary - NO PROXY NEEDED ON FLY.IO
cloudinary.config(
    cloud_name=os.getenv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'BMS2026Admin')

# Create uploads folder if it doesn't exist
os.makedirs('uploads', exist_ok=True)

# ============================================
# SERVE FRONTEND
# ============================================
@app.route('/')
def serve_index():
    return send_from_directory('../', 'index.html')

@app.route('/admin')
def serve_admin():
    return send_from_directory('../', 'admin.html')

@app.route('/styles/<path:filename>')
def serve_styles(filename):
    return send_from_directory('../styles', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('../js', filename)

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('../assets', filename)

# ============================================
# API ROUTES
# ============================================
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'ok',
        'message': 'BMS BANK API is running!',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        result = supabase.table('categories').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        print(f"❌ Error fetching categories: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/resources', methods=['GET'])
def get_resources():
    try:
        week = request.args.get('week')
        category = request.args.get('category')
        search = request.args.get('search')
        limit = int(request.args.get('limit', 50))
        page = int(request.args.get('page', 1))
        
        offset = (page - 1) * limit
        
        query = supabase.table('resources').select('*').order('created_at', desc=True)
        
        if week and week != 'all':
            query = query.eq('week_number', int(week))
        if category and category != 'all':
            query = query.eq('category', category)
        if search:
            query = query.ilike('title', f'%{search}%')
        
        query = query.range(offset, offset + limit - 1)
        
        result = query.execute()
        return jsonify(result.data)
    except Exception as e:
        print(f"❌ Error fetching resources: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_resource():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        print("\n" + "="*50)
        print("📤 UPLOAD REQUEST RECEIVED")
        print("="*50)
        
        # Check admin password
        password = request.headers.get('X-Admin-Password')
        print(f"🔑 Password header: {password}")
        
        if password != ADMIN_PASSWORD:
            print("❌ Unauthorized - wrong password")
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get form data
        week_number = request.form.get('week_number')
        day_of_week = request.form.get('day_of_week', '')
        time_slot = request.form.get('time_slot', '')
        title = request.form.get('title')
        lecturer_name = request.form.get('lecturer_name', '')
        category = request.form.get('category')
        description = request.form.get('description', '')
        google_drive_link = request.form.get('google_drive_link', '')
        uploaded_by = request.form.get('uploaded_by', 'Admin')
        
        print(f"📝 Week: {week_number}")
        print(f"📝 Title: {title}")
        print(f"📝 Category: {category}")
        
        # Validate required fields
        if not week_number:
            return jsonify({'error': 'Week number is required'}), 400
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        if not category:
            return jsonify({'error': 'Category is required'}), 400
        
        file_url = None
        file_public_id = None
        
        # Handle file upload
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename:
                print(f"📄 File: {file.filename}")
                
                if file.filename == '':
                    return jsonify({'error': 'Empty file. Please select a valid file.'}), 400
                
                try:
                    # Upload to Cloudinary - WORKS ON FLY.IO!
                    upload_result = cloudinary.uploader.upload(
                        file,
                        folder=f'bms-bank/week_{week_number}',
                        resource_type='auto'
                    )
                    file_url = upload_result.get('secure_url')
                    file_public_id = upload_result.get('public_id')
                    print(f"✅ Uploaded to Cloudinary: {file_url}")
                except Exception as e:
                    print(f"❌ Cloudinary upload failed: {e}")
                    # Fallback: Save locally
                    try:
                        filename = f"week_{week_number}_{file.filename}"
                        file_path = os.path.join('uploads', filename)
                        file.save(file_path)
                        file_url = f"/uploads/{filename}"
                        print(f"✅ Saved locally: {file_path}")
                    except Exception as e2:
                        return jsonify({'error': f'File upload failed: {str(e2)}'}), 500
        
        # Prepare data for Supabase
        resource_data = {
            'week_number': int(week_number),
            'day_of_week': day_of_week,
            'time_slot': time_slot,
            'title': title,
            'lecturer_name': lecturer_name,
            'category': category,
            'description': description,
            'file_url': file_url,
            'file_public_id': file_public_id,
            'google_drive_link': google_drive_link if google_drive_link else None,
            'uploaded_by': uploaded_by,
            'updated_at': datetime.now().isoformat()
        }
        
        print("📊 Saving to Supabase:", resource_data)
        
        # Insert into Supabase
        result = supabase_admin.table('resources').insert(resource_data).execute()
        
        return jsonify({
            'success': True,
            'message': 'Resource uploaded successfully! 📚',
            'data': result.data[0] if result.data else None,
            'file_url': file_url
        })
    except Exception as e:
        print(f"❌ Upload error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/resources/<resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    try:
        password = request.headers.get('X-Admin-Password')
        if password != ADMIN_PASSWORD:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get resource to delete file from Cloudinary
        resource = supabase_admin.table('resources').select('file_public_id').eq('id', resource_id).execute()
        if resource.data and resource.data[0].get('file_public_id'):
            try:
                cloudinary.uploader.destroy(resource.data[0]['file_public_id'])
            except:
                pass
        
        # Delete from Supabase
        supabase_admin.table('resources').delete().eq('id', resource_id).execute()
        
        return jsonify({'success': True, 'message': 'Resource deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve uploaded files (fallback for local storage)
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory('uploads', filename)

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 BMS BANK API Server")
    print("="*50)
    print(f"📡 Admin Password: {ADMIN_PASSWORD}")
    print(f"🌐 Server: http://localhost:5000")
    print(f"📁 Uploads folder: {os.path.abspath('uploads')}")
    print("="*50 + "\n")
    app.run(debug=True, port=8080, host='0.0.0.0')