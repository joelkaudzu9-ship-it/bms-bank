import os
import re
import time
import requests
from pathlib import Path
from datetime import datetime
import cloudinary
import cloudinary.uploader
import json

# ============================================
# CONFIGURATION
# ============================================
CLOUDINARY_CLOUD_NAME = "dhnmrojr2"
CLOUDINARY_API_KEY = "686188139346171"
CLOUDINARY_API_SECRET = "8un8_iuJU7NSa-Ao8pV_XIkKPwY"

SUPABASE_URL = "https://vmfdwlmjvaswmxkiqgvk.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZmR3bG1qdmFzd214a2lxZ3ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAwMjYxMSwiZXhwIjoyMDk4NTc4NjExfQ.RfZssnWZhRBUWnTOIq2I1yL1dk8ozlcu38Z0kJpAgBk"

# YOUR PATH - Update this
BASE_PATH = r"C:\Users\joelk\Desktop\MBBS 1"

# ============================================
# CATEGORY MAPPING (from folder names)
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

# ============================================
# WEEK MAPPING (from folder structure + timetable)
# ============================================
def get_week_from_path(file_path):
    """Determine week number from file path using your folder structure"""
    path = str(file_path).lower()
    
    # SEM 1 - Half 1 (Weeks 1-8)
    if "sem 1" in path and "half 1" in path:
        if "anatomy" in path: return 1
        elif "biochemistry" in path: return 2
        elif "microbiology" in path: return 3
        elif "pathology" in path: return 4
        elif "pharmacology" in path: return 5
        elif "physiology" in path: return 6
        elif "public health" in path: return 7
        elif "clinical" in path: return 8
        else: return 1
    
    # SEM 1 - Half 2 (Weeks 9-16)
    elif "sem 1" in path and "half 2" in path:
        if "anatomy" in path: return 9
        elif "biochemistry" in path: return 10
        elif "microbiology" in path: return 11
        elif "pathology" in path: return 12
        elif "pharmacology" in path: return 13
        elif "physiology" in path: return 14
        elif "public health" in path: return 15
        elif "clinical" in path: return 16
        else: return 9
    
    # SEM 2 (Weeks 17-19)
    elif "sem 2" in path:
        if "anatomy" in path: return 17
        elif "physiology" in path: return 18
        elif "pharmacology" in path: return 19
        else: return 17
    
    else:
        return 1

# ============================================
# LECTURER EXTRACTION (from filename + timetable)
# ============================================
# Built from your timetable
LECTURER_MAP = {
    "dr. sylvester chabunya": "Dr. Sylvester Chabunya",
    "dr. yohane gadama": "Dr. Yohane Gadama",
    "prof e umar": "Prof E Umar",
    "dr. jana": "Dr. Jana",
    "dr. charles mangani": "Dr. Charles Mangani",
    "dr. lucinda manda": "Dr. Lucinda Manda",
    "dr. a mwakikunga": "Dr. A Mwakikunga",
    "dr. r mkakosya": "Dr. R Mkakosya",
    "blessings thuboy": "Blessings Thuboy",
    "mr. lh tembo": "Mr. LH Tembo",
    "t. nyondo": "T. Nyondo",
    "w. phiri": "W. Phiri",
    "s. nayupe": "S. Nayupe",
    "dr. j manda": "Dr. J Manda",
    "dr. mulenga": "Dr. M Mulenga",
    "dr. tinashe tizifa": "Dr. Tinashe Tizifa",
    "dr. yankho zolowere": "Dr. Yankho Zolowere",
    "dr. chikondi mwale": "Dr. Chikondi Mwale",
    "dr. timothy kachitosi": "Dr. Timothy Kachitosi",
    "dr. manjatika": "Dr. Manjatika",
    "dr. gwedela": "Dr. Mayeso Gwedela",
}

def extract_lecturer(filename, file_path):
    """Extract lecturer from filename using multiple methods"""
    name = filename.replace("_", " ").replace("-", " ").lower()
    
    # Method 1: Direct match from LECTURER_MAP
    for key, value in LECTURER_MAP.items():
        if key in name:
            return value
    
    # Method 2: Look for Dr., Prof., Mr., Ms.
    patterns = ["dr.", "dr", "prof.", "prof", "mr.", "ms.", "mrs."]
    for pattern in patterns:
        if pattern in name:
            parts = name.split(pattern)
            if len(parts) > 1:
                rest = parts[1].strip()
                if rest:
                    name_parts = rest.split()[:2]
                    if name_parts:
                        return f"{pattern.capitalize()} {' '.join(name_parts)}"
    
    # Method 3: Check if folder name matches a lecturer
    path_parts = str(file_path).split(os.sep)
    for part in path_parts:
        for key, value in LECTURER_MAP.items():
            if key in part.lower():
                return value
    
    return ""

# ============================================
# DAY/TIME EXTRACTION (from filename)
# ============================================
def extract_day_time(filename):
    """Try to extract day/time from filename"""
    name = filename.replace("_", " ").replace("-", " ")
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    day = ""
    for d in days:
        if d in name.lower():
            day = d.capitalize()
            break
    
    # Look for time patterns like "9am", "10-11", etc.
    time_pattern = re.compile(r'(\d{1,2})(?:-|to)?(\d{1,2})?(?:am|pm)?', re.IGNORECASE)
    time_match = time_pattern.search(name)
    time = time_match.group(0) if time_match else ""
    
    return day, time

# ============================================
# CLEAN TITLE
# ============================================
def clean_title(filename):
    """Clean up filename to get a proper title"""
    name = filename.replace("_", " ").replace("-", " ")
    
    # Remove numbers at start (e.g., "1.", "2.", etc.)
    name = re.sub(r'^\d+\.\s*', '', name)
    name = re.sub(r'^\d+\s*', '', name)
    
    # Remove common suffixes
    suffixes = [".pptx", ".ppt", ".pdf", ".docx", ".doc", ".txt"]
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    
    # Remove MBBS1, BCHD, etc.
    prefixes = ["MBBS1", "BCHD", "BSC", "2023", "2022", "2021", "2020", "DAHS"]
    for prefix in prefixes:
        if name.startswith(prefix):
            name = name[len(prefix):].strip()
        if name.endswith(prefix):
            name = name[:-len(prefix)].strip()
    
    # Capitalize first letter of each word
    name = ' '.join(word.capitalize() for word in name.split())
    
    return name.strip() if name.strip() else filename

# ============================================
# INITIALIZE CLOUDINARY
# ============================================
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

print("☁️ Cloudinary configured successfully!")
print("")

# ============================================
# UPLOAD FUNCTIONS
# ============================================
def upload_to_cloudinary(file_path, week):
    try:
        result = cloudinary.uploader.upload(
            file_path,
            folder=f"bms-bank/week_{week}",
            resource_type="auto",
            use_filename=True,
            unique_filename=False,
            overwrite=False,
            use_filename_as_display_name=True
        )
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
            'bytes': result.get('bytes', 0)
        }
    except Exception as e:
        print(f"   ❌ Cloudinary upload failed: {e}")
        return None

def save_to_supabase(data, file_url):
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
                'week_number': data['week'],
                'day_of_week': data.get('day', ''),
                'time_slot': data.get('time', ''),
                'title': data['title'],
                'lecturer_name': data.get('lecturer', ''),
                'category': data['category'],
                'description': data.get('description', ''),
                'file_url': file_url,
                'google_drive_link': None,
                'uploaded_by': 'Bulk Upload Auto-Sorted',
                'created_at': datetime.now().isoformat()
            }
        )
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"   ❌ Supabase save failed: {e}")
        return False

# ============================================
# MAIN SCAN AND UPLOAD
# ============================================
def scan_and_upload():
    print("\n" + "="*70)
    print("📦 BMS BANK - AUTO-ORGANIZED BULK UPLOAD")
    print("="*70)
    print(f"📁 Source: {BASE_PATH}")
    print("="*70 + "\n")
    
    if not os.path.exists(BASE_PATH):
        print(f"❌ ERROR: Path not found: {BASE_PATH}")
        return
    
    all_files = []
    supported_extensions = {'.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'}
    
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
    
    success_count = 0
    fail_count = 0
    
    for i, file_path in enumerate(all_files, 1):
        filename = os.path.basename(file_path)
        
        # AUTO-DETECT EVERYTHING
        week = get_week_from_path(file_path)
        category = get_category_from_path(file_path)
        lecturer = extract_lecturer(filename, file_path)
        title = clean_title(filename)
        day, time = extract_day_time(filename)
        
        print(f"\n[{i}/{len(all_files)}] 📤 {filename}")
        print(f"   📅 Week {week} | 📂 {category}")
        print(f"   👨‍🏫 {lecturer or 'Unknown'}")
        print(f"   📝 {title}")
        if day:
            print(f"   📆 {day} {time}")
        
        # Upload
        upload_result = upload_to_cloudinary(file_path, week)
        
        if upload_result:
            data = {
                'week': week,
                'category': category,
                'lecturer': lecturer,
                'title': title,
                'day': day,
                'time': time,
                'description': f"Auto-organized from: {filename}"
            }
            
            if save_to_supabase(data, upload_result['url']):
                print(f"   ✅ Uploaded and saved!")
                success_count += 1
            else:
                fail_count += 1
        else:
            fail_count += 1
        
        if i % 10 == 0:
            print(f"\n⏳ Progress: {i}/{len(all_files)} files...")
            time.sleep(0.5)
    
    print("\n" + "="*70)
    print("📊 UPLOAD COMPLETE")
    print("="*70)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"📁 Total files: {len(all_files)}")
    print("="*70 + "\n")

# ============================================
# RUN
# ============================================
if __name__ == "__main__":
    print("\n⚠️  This will upload ALL files in your MBBS folder to Cloudinary.")
    print("   Files will be auto-organized by week, category, and lecturer.")
    print("")
    
    if not os.path.exists(BASE_PATH):
        print(f"❌ ERROR: BASE_PATH not found: {BASE_PATH}")
        print("Please update BASE_PATH in the script.")
        print("")
        input("Press ENTER to exit...")
        exit()
    
    input("Press ENTER to start uploading...")
    scan_and_upload()