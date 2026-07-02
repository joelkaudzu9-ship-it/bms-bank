import os
import time
import requests
from pathlib import Path
from datetime import datetime

# ============================================
# CONFIGURATION
# ============================================
API_URL = "http://localhost:5000/api/upload"  # Change to your hosted URL later
ADMIN_PASSWORD = "BMS2026Admin"

# Path to your MBBS notes folder
BASE_PATH = r"C:\Users\joelk\Desktop\Temporary\MBBS1_NOTES\MBBS 1\SEM 1\SEM 1"

# Category mapping based on folder names
CATEGORY_MAP = {
    "Anatomy": "Anatomy",
    "Biochemistry": "Biochemistry",
    "Clinical skills": "Clinical Skills",
    "Microbiology": "Microbiology",
    "Pathology": "Pathology",
    "Pharmacology": "Pharmacology",
    "Physiology": "Physiology",
    "Public Health": "Public Health",
    "Haematology": "Pathology",
    "Psychology": "Life Skills",
    "Textbooks": "Lecture",
    "Course Outline": "Lecture",
    "Clinical Skills": "Clinical Skills",
}

# ============================================
# HELPER FUNCTIONS
# ============================================
def get_week_from_path(file_path):
    """Determine week number from file path"""
    path = str(file_path).lower()
    if "half 1" in path:
        # Half 1: Week 1-8
        if "anatomy" in path:
            return 1
        elif "biochemistry" in path:
            return 2
        elif "microbiology" in path:
            return 3
        elif "pathology" in path:
            return 4
        elif "pharmacology" in path:
            return 5
        elif "physiology" in path:
            return 6
        elif "public health" in path:
            return 7
        elif "clinical" in path:
            return 8
        else:
            return 1
    elif "half 2" in path:
        # Half 2: Week 9-16
        if "anatomy" in path:
            return 9
        elif "biochemistry" in path:
            return 10
        elif "microbiology" in path:
            return 11
        elif "pathology" in path:
            return 12
        elif "pharmacology" in path:
            return 13
        elif "physiology" in path:
            return 14
        elif "public health" in path:
            return 15
        elif "clinical" in path:
            return 16
        else:
            return 9
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
    # Common patterns
    patterns = [
        ("Dr.", "Dr."),
        ("Dr", "Dr."),
        ("Prof.", "Prof."),
        ("Prof", "Prof."),
        ("Mr.", "Mr."),
        ("Ms.", "Ms."),
    ]
    for pattern, title in patterns:
        if pattern in name:
            parts = name.split(pattern)
            if len(parts) > 1:
                # Get the name after the title
                rest = parts[1].strip()
                if rest:
                    # Take first 2 words as name
                    name_parts = rest.split()[:2]
                    if name_parts:
                        return f"{title} {' '.join(name_parts)}"
    return ""

def upload_file(file_path):
    """Upload a single file to the API"""
    filename = os.path.basename(file_path)
    name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
    
    week = get_week_from_path(file_path)
    category = get_category_from_path(file_path)
    lecturer = extract_lecturer(filename)
    
    # Clean up title
    title = name
    # Remove common prefixes
    prefixes = ["MBBS1", "BCHD", "BSC", "2023", "2022", "2021", "2020"]
    for prefix in prefixes:
        if title.startswith(prefix):
            title = title[len(prefix):].strip()
    
    # Prepare data
    data = {
        'week_number': week,
        'day_of_week': '',
        'time_slot': '',
        'title': title,
        'lecturer_name': lecturer,
        'category': category,
        'description': f"Uploaded from: {filename}",
        'google_drive_link': '',
        'uploaded_by': 'Bulk Upload'
    }
    
    # Open and send file
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (filename, f, 'application/octet-stream')}
            
            print(f"📤 Uploading: {filename} → Week {week}, {category}")
            
            response = requests.post(
                API_URL,
                data=data,
                files=files,
                headers={'X-Admin-Password': ADMIN_PASSWORD}
            )
            
            result = response.json()
            if result.get('success'):
                print(f"✅ Uploaded: {filename}")
                return True
            else:
                print(f"❌ Failed: {filename} - {result.get('error', 'Unknown error')}")
                return False
    except Exception as e:
        print(f"❌ Error uploading {filename}: {e}")
        return False

def scan_and_upload():
    """Scan folder and upload all files"""
    print("\n" + "="*60)
    print("📦 BMS BANK - BULK UPLOAD")
    print("="*60)
    print(f"📁 Source: {BASE_PATH}")
    print(f"🌐 API: {API_URL}")
    print("="*60 + "\n")
    
    # Collect all files
    all_files = []
    supported_extensions = {'.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'}
    
    for root, dirs, files in os.walk(BASE_PATH):
        for file in files:
            # Skip temporary files
            if file.startswith('~') or file.startswith('.'):
                continue
            # Check extension
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_extensions:
                full_path = os.path.join(root, file)
                all_files.append(full_path)
    
    print(f"📄 Found {len(all_files)} files to upload")
    print("="*60 + "\n")
    
    if len(all_files) == 0:
        print("❌ No files found! Check your BASE_PATH.")
        return
    
    # Upload files
    success_count = 0
    fail_count = 0
    
    for i, file_path in enumerate(all_files, 1):
        print(f"\n[{i}/{len(all_files)}]", end=" ")
        if upload_file(file_path):
            success_count += 1
        else:
            fail_count += 1
        # Small delay to avoid overwhelming the server
        time.sleep(0.3)
    
    # Summary
    print("\n" + "="*60)
    print("📊 UPLOAD COMPLETE")
    print("="*60)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"📁 Total files: {len(all_files)}")
    print("="*60 + "\n")

# ============================================
# RUN THE UPLOAD
# ============================================
if __name__ == "__main__":
    print("\n⚠️  Make sure your Flask server is running!")
    print(f"   API URL: {API_URL}")
    print("   Press ENTER to start uploading...")
    input()
    
    scan_and_upload()