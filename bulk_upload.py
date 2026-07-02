import os
import time
import requests
from pathlib import Path
from datetime import datetime
import cloudinary
import cloudinary.uploader

# ============================================
# CONFIGURATION
# ============================================
# Your Cloudinary credentials
CLOUDINARY_CLOUD_NAME = "dhnmrojr2"
CLOUDINARY_API_KEY = "686188139346171"
CLOUDINARY_API_SECRET = "8un8_iuJU7NSa-Ao8pV_XIkKPwY"

# Your Supabase API (for storing metadata)
SUPABASE_URL = "https://vmfdwlmjvaswmxkiqgvk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZmR3bG1qdmFzd214a2lxZ3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDI2MTEsImV4cCI6MjA5ODU3ODYxMX0.aTNaA0TyIwVwU7nFU2Q1lL67IP4x53qsH-Rkl3DTAiA"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZmR3bG1qdmFzd214a2lxZ3ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAwMjYxMSwiZXhwIjoyMDk4NTc4NjExfQ.RfZssnWZhRBUWnTOIq2I1yL1dk8ozlcu38Z0kJpAgBk"

# Your files path
BASE_PATH = r"C:\Users\joelk\Desktop\Temporary\MBBS1_NOTES\MBBS 1\SEM 1\SEM 1"

# Admin password for your app
ADMIN_PASSWORD = "BMS2026Admin"

# ============================================
# CATEGORY MAPPING
# ============================================
CATEGORY_MAP = {
    "Anatomy": "Anatomy",
    "Biochemistry": "Biochemistry", 
    "Clinical skills": "Clinical Skills",
    "Clinical Skills": "Clinical Skills",
    "Microbiology": "Microbiology",
    "Pathology": "Pathology",
    "Pharmacology": "Pharmacology",
    "Physiology": "Physiology",
    "Public Health": "Public Health",
    "Haematology": "Pathology",
    "Psychology": "Life Skills",
    "Textbooks": "Lecture",
    "Course Outline": "Lecture",
}

# Week mapping based on folder structure
WEEK_MAP = {
    "Half 1": range(1, 9),   # Weeks 1-8
    "Half 2": range(9, 17),  # Weeks 9-16
}

# ============================================
# INITIALIZE CLOUDINARY
# ============================================
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# ============================================
# HELPER FUNCTIONS
# ============================================
def get_week_from_path(file_path):
    """Determine week number from file path"""
    path = str(file_path).lower()
    
    # Try to extract from folder name
    if "half 1" in path:
        if "anatomy" in path: return 1
        elif "biochemistry" in path: return 2
        elif "microbiology" in path: return 3
        elif "pathology" in path: return 4
        elif "pharmacology" in path: return 5
        elif "physiology" in path: return 6
        elif "public health" in path: return 7
        elif "clinical" in path: return 8
        else: return 1
    elif "half 2" in path:
        if "anatomy" in path: return 9
        elif "biochemistry" in path: return 10
        elif "microbiology" in path: return 11
        elif "pathology" in path: return 12
        elif "pharmacology" in path: return 13
        elif "physiology" in path: return 14
        elif "public health" in path: return 15
        elif "clinical" in path: return 16
        else: return 9
    else:
        return 1

def get_category_from_path(file_path):
    """Determine category from file path"""
    path = str(file_path)
    for folder, category in CATEGORY_MAP.items():
        if folder in path:
            return category
    return "Lecture"

def extract_lecturer(filename):
    """Extract lecturer name from filename if present"""
    name = filename.replace("_", " ").replace("-", " ")
    patterns = ["Dr.", "Dr", "Prof.", "Prof", "Mr.", "Ms.", "Mrs."]
    for pattern in patterns:
        if pattern in name:
            parts = name.split(pattern)
            if len(parts) > 1:
                rest = parts[1].strip()
                if rest:
                    name_parts = rest.split()[:2]
                    if name_parts:
                        return f"{pattern} {' '.join(name_parts)}"
    return ""

def upload_to_cloudinary(file_path, week):
    """Upload file to Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file_path,
            folder=f"bms-bank/week_{week}",
            resource_type="auto"
        )
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
            'bytes': result.get('bytes', 0)
        }
    except Exception as e:
        print(f"❌ Cloudinary upload failed: {e}")
        return None

def save_to_supabase(resource_data, file_url):
    """Save resource metadata to Supabase"""
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/resources",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json={
                'week_number': resource_data['week_number'],
                'day_of_week': resource_data.get('day_of_week', ''),
                'time_slot': resource_data.get('time_slot', ''),
                'title': resource_data['title'],
                'lecturer_name': resource_data.get('lecturer_name', ''),
                'category': resource_data['category'],
                'description': resource_data.get('description', ''),
                'file_url': file_url,
                'google_drive_link': None,
                'uploaded_by': 'Bulk Upload',
                'created_at': datetime.now().isoformat()
            }
        )
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"❌ Supabase save failed: {e}")
        return False

def scan_and_upload():
    """Scan folder and upload all files"""
    print("\n" + "="*70)
    print("📦 BMS BANK - BULK UPLOAD TO CLOUDINARY")
    print("="*70)
    print(f"📁 Source: {BASE_PATH}")
    print(f"☁️ Cloudinary: {CLOUDINARY_CLOUD_NAME}")
    print("="*70 + "\n")
    
    # Collect all files
    all_files = []
    supported_extensions = {
        '.pdf', '.ppt', '.pptx', '.doc', '.docx', 
        '.txt', '.jpg', '.jpeg', '.png', '.gif'
    }
    
    for root, dirs, files in os.walk(BASE_PATH):
        for file in files:
            if file.startswith('~') or file.startswith('.'):
                continue
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_extensions:
                full_path = os.path.join(root, file)
                all_files.append(full_path)
    
    print(f"📄 Found {len(all_files)} files to upload")
    print("="*70 + "\n")
    
    if len(all_files) == 0:
        print("❌ No files found! Check your BASE_PATH.")
        return
    
    # Upload files
    success_count = 0
    fail_count = 0
    total_size = 0
    
    for i, file_path in enumerate(all_files, 1):
        filename = os.path.basename(file_path)
        name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
        
        week = get_week_from_path(file_path)
        category = get_category_from_path(file_path)
        lecturer = extract_lecturer(filename)
        
        # Clean title
        title = name
        prefixes = ["MBBS1", "BCHD", "BSC", "2023", "2022", "2021"]
        for prefix in prefixes:
            if title.startswith(prefix):
                title = title[len(prefix):].strip()
        
        print(f"\n[{i}/{len(all_files)}] 📤 {filename}")
        print(f"   📅 Week {week} | 📂 {category} | 👨‍🏫 {lecturer or 'Unknown'}")
        
        # Upload to Cloudinary
        print(f"   ☁️ Uploading to Cloudinary...")
        upload_result = upload_to_cloudinary(file_path, week)
        
        if upload_result:
            print(f"   ✅ Uploaded: {upload_result['url'][:80]}...")
            
            # Prepare resource data
            resource_data = {
                'week_number': week,
                'day_of_week': '',
                'time_slot': '',
                'title': title if title else filename,
                'lecturer_name': lecturer,
                'category': category,
                'description': f"Uploaded from: {filename}"
            }
            
            # Save to Supabase
            if save_to_supabase(resource_data, upload_result['url']):
                print(f"   ✅ Saved to database")
                success_count += 1
                total_size += upload_result['bytes']
            else:
                print(f"   ❌ Failed to save to database")
                fail_count += 1
        else:
            print(f"   ❌ Failed to upload")
            fail_count += 1
        
        # Small delay to avoid rate limiting
        if i % 10 == 0:
            print(f"\n⏳ Progress: {i}/{len(all_files)} files uploaded...")
            time.sleep(1)
    
    # Summary
    print("\n" + "="*70)
    print("📊 UPLOAD COMPLETE")
    print("="*70)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"📁 Total files: {len(all_files)}")
    print(f"💾 Total size: {total_size / (1024**3):.2f} GB")
    print("="*70 + "\n")

# ============================================
# RUN THE UPLOAD
# ============================================
if __name__ == "__main__":
    print("\n⚠️  Make sure you have cloudinary installed:")
    print("   pip install cloudinary")
    print("")
    input("Press ENTER to start uploading...")
    
    scan_and_upload()