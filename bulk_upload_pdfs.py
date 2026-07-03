import os
import re
import time
import requests
from pathlib import Path
from datetime import datetime
import cloudinary
import cloudinary.uploader

# ============================================
# CONFIGURATION
# ============================================
CLOUDINARY_CLOUD_NAME = "dhnmrojr2"
CLOUDINARY_API_KEY = "686188139346171"
CLOUDINARY_API_SECRET = "8un8_iuJU7NSa-Ao8pV_XIkKPwY"

SUPABASE_URL = "https://vmfdwlmjvaswmxkiqgvk.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZmR3bG1qdmFzd214a2lxZ3ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAwMjYxMSwiZXhwIjoyMDk4NTc4NjExfQ.RfZssnWZhRBUWnTOIq2I1yL1dk8ozlcu38Z0kJpAgBk"

BASE_PATH = r"C:\Users\joelk\Desktop\MBBS 1"

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

# ============================================
# LECTURER MAPPING (SAME AS BEFORE)
# ============================================
LECTURER_MAP = {
    # Course Outline
    "Course Outline": "Admin",
    
    # Week 1 - Anatomy
    "Introduction to cells": "Mr. LH Tembo",
    "Cell organelles and intramembrane system": "Mr. LH Tembo",
    "Hist-Intro_BCHD_J. Manda": "Dr. J Manda",
    "The Cytoskeleton": "W. Phiri",
    "Cell Growth, Differentiation and Adaptation": "W. Phiri",
    "Primary tissue 1. Epithelial Tissue and Glands": "L.H Tembo",
    "Epithelial Glands": "H. Tembo",
    "Primary tissue 2, Connective tissue Proper": "Dr. J Manda",
    "Primary Tissue 2 - Blood": "Dr. J Manda",
    "Primary tissue 2, Connective tissue, Cartilage and Bone": "Dr. J Manda",
    "Bone L.Tembo": "L.Tembo",
    "Primary tissue 3 Muscle tissue": "Dr. J Manda",
    "Primary Tissue 4 - Neural Tissue": "L.H Tembo",
    "Review of major body systems - Lymphoreticular": "Dr. J Manda",
    "Review of musculoskeletal sys": "Dr. J Manda",
    "CVS & Respiratory": "Dr. Mwakikunga",
    "Review of Body System - GIT": "L Tembo",
    "introduction to Nervous system": "Dr. Mwakikunga",
    "REVIEW OF MAJOR BODY SYSTEMS - REPRODUCTIVE AND URINARY": "Dr. A Mwakikunga",
    "GIT practical dissection": "Dr. J Manda",
    
    # Week 1 - Biochemistry
    "Introduction to Biomolecules": "Dr. Jana",
    "Chemistry of Carbohydrates": "T. Nyondo",
    "amino acids": "T. Nyondo",
    "Amino acid chromatographs": "T. Nyondo",
    "Vitamins": "T. Nyondo",
    "Nucleic Acids": "S. Nayupe",
    "lipids": "T. Nyondo",
    "DNA Replication": "S. Nayupe",
    "Protein Synthesis": "S. Nayupe",
    "Genetic Code": "S. Nayupe",
    "Ezymes": "T. Nyondo",
    "Chromosome & Chromosome Abnormalities": "S. Nayupe",
    "Glycolysis": "Dr. C Chingwanda",
    "TRICARBOXYLIC_ACID_CYCLE": "Dr. C Chingwanda",
    "Hemoglobin Structure": "Dr. Jana",
    "Action of Hormones": "M. Mlozeni",
    
    # Week 1 - Microbiology
    "Introduction to Microbiology": "Dr. R Mkakosya",
    "Bacterial structure": "Dr. R Mkakosya",
    "Bacterial Growth and Function": "Dr. R Mkakosya",
    "Bacterial Classification": "Dr. R Mkakosya",
    "Introduction to immunology": "Dr. Tonney Nyirenda",
    "Microbial Staining": "Dr. Mkakosya",
    
    # Week 1 - Pathology
    "Cell Injury & Death": "Dr. M Mulenga",
    "Cellular Adapatation and differenciation": "Dr. Mulenga",
    "INTRACELLULAR ACCUMULATIONS": "Dr. M Mulenga",
    "Acute and Chronic Inflammation": "Dr. M Mulenga",
    "Wound healing and repair": "Dr. M Mulenga",
    
    # Week 1 - Pharmacology
    "Introduction to PHARMACOLOGY": "Blessings Thuboy",
    "Pharmacodynamics": "Blessings Thuboy",
    "NSAIDs": "B Thuboy",
    
    # Week 1 - Physiology
    "The Cell Membrane": "T. Mwambyale",
    "Movement across the Cell Membrane": "T. Mwambyale",
    "Homeostasis": "T. Mwambyale",
    "Epithelial function": "T. Mwambyale",
    "Body fluid compartments": "T. Mwambyale",
    "Body Fluid Pressures": "T. Mwambyale",
    
    # Week 1 - Public Health
    "Introduction to public health": "Dr. Charles Mangani",
    "Summarizing Data": "A Kumitawa",
    "Introduction to epidemiology": "Dr. Fatsani Ngwalangwa",
    "Introduction to Medical Ethics": "Dr. Lucinda Manda-Taylor",
    "Professionalism": "Dr. Lucinda Manda-Taylor",
    
    # Week 2 (Half 2) - Anatomy
    "Nerve injuries of the upper limb": "Dr. Manjatika",
    "facts of the upperlimb": "Dr. Manjatika",
    "Back Osteology": "T Kaledzera",
    "Back Muscles": "T Kaledzera",
    "DEVELOPMENT OF THE BACK": "Dr. A Mwakikunga",
    "DEVELOPMENT OF THE UPPER LIMB": "Dr. Mwakikunga",
    "GLUTEAL REGION": "T Kaledzera",
    "Thigh anterior and medial": "T Kaledzera",
    "Thigh posterior and popliteal": "T Kaledzera",
    "Lower limb leg and anterior dorsum": "T Kaledzera",
    "INTRODUCTION TO EMBRYOLOGY": "Dr. A Mwakikunga",
    "Development-week one of life": "Dr. A Mwakikunga",
    "Development weeks 2 & 3": "Dr. A Mwakikunga",
    "THE BREAST AND PECTORAL REGION": "Dr. Manjatika",
    "Nerve injuries of the lower limb": "Dr. Manjatika",
    "Knee Joint": "T Kaledzera",
    "SHOULDER REGION AND SHOULDER JOINT": "Dr. Manjatika",
    "Axilla": "Dr. Manjatika",
    "Axilla Brachial Plexus": "Dr. Manjatika",
    "Arm and Cubital fossa": "Dr. Manjatika",
    "Elbow and wrist joint": "Dr. Manjatika",
    "Anterior and Posterior Forearm": "Dr. Manjatika",
    "The hand": "Dr. Manjatika",
    "Hip joint": "T Kaledzera",
    "MUSCLE Tissue Histology": "Dr. J Manda",
    "POSTERIOR COMPARTMENT OF LEG AND SOLE OF FOOT": "Dr. Manjatika",
    
    # Week 2 - Biochemistry
    "Clinical Enzymology": "Dr. C Chingwanda",
    "Introduction to Chemical Pathology": "S. Nayupe",
    "Tumour Markers": "Dr. C Chingwanda",
    
    # Week 2 - Clinical Skills
    "Vital Signs": "Dr. Yankho Zolowere",
    
    # Week 2 - Microbiology
    "MICROBIAL_GENETICS": "Dr. David Chaima",
    "Intro Mycology": "Dr. R Mkakosya",
    "Mechanisms of action of Antibiotics": "Prof C Msefula",
    "Healthcare associated infections": "Dr. D Kulapani",
    "Introduction to Virology": "Dr. Tonney Nyirenda",
    "Viral Replication": "Dr. Tonney Nyirenda",
    
    # Week 2 - Pathology
    "Neoplasia and carcinogens": "Dr. M Mulenga",
    "viral oncogenes": "Dr. M Mulenga",
    "Autoimmune diseases": "Dr. M Mulenga",
    "Introduction to breast cancer": "Dr. M Mulenga",
    "Inflammatory_bone_&_joint_diseases": "Dr. M Mulenga",
    "Infectious bone and joint diseases": "Dr. M Mulenga",
    "bone tumors": "Dr. M Mulenga",
    "muscle diseases": "Dr. M Mulenga",
    
    # Week 2 - Pharmacology
    "Intro to Antivirals": "B Thuboy",
    "INTRODUCTION TO ANTIBIOTICS": "Prof C Msefula",
    "Cell wall synthesis inhibitors": "Prof C Msefula",
    "protein synthesis inhibitors": "Prof C Msefula",
    "NUCLEIC ACID SYNTHESIS INHIBITORS": "Prof C Msefula",
    "Pharmacokinetics": "B Thuboy",
    "ANS PHARMACOLOGY": "B Thuboy",
    
    # Week 2 - Physiology
    "Structure of neurons": "Dr. M Gwedela",
    "Resting Membrane Potential": "Dr. M Gwedela",
    "Graded And Action Potential": "Dr. M Gwedela",
    "Neural pathways and circuits": "Dr. M Gwedela",
    "Neurotransmitters and neuromodulators": "Dr. Mayeso Gwedela",
    "Muscle types": "Dr. M Gwedela",
    "Excitation Conraction Coupling": "Dr. Mayeso Gwedela",
    "Neuromuscular Juction": "Dr. M Gwedela",
    "The autonomic nervous system": "Dr. Mayeso Gwedela",
    
    # Week 2 - Public Health
    "Introduction to Population Studies": "Dr. Paul Kawale",
    "Measurement_Bias and research": "Dr. Tinashe Tizifa",
    "Hypothesis Testing": "Dr Jessie Khaki Sithole",
    "Populations & Samples": "A Kumitawa",
    "Inference on proportions": "Emma Malonda",
    "Chi square": "Emma Malonda",
    "Regression": "Dr Jessie Khaki Sithole",
    "Epidemiology": "Dr. Seke Kayuni",
    "Demography": "Dr. Paul Kawale",
    "Application of statistics to public health": "Dr. Christopher Stanley",
    
    # SEM 2 - Anatomy
    "MEDIASTINUM": "Dr. A Mwakikunga",
    "GROSS FEATURES OF PERICARDIUM": "Dr. A Mwakikunga",
    "Coronary Circulation": "Dr. A Mwakikunga",
    "VASCULAR_TREE_MORPHOLOGY": "Dr. A Mwakikunga",
    "Histology of blood vessels": "Dr. J Manda",
    "HISTOLOGY OF THE HEART": "Dr. J Manda",
    "Development of the arortic arches": "Dr. A Mwakikunga",
    "Development of the cardiovascular system": "Dr. A Mwakikunga",
    "Development of the Heart": "Dr. A Mwakikunga",
    "FETAL CIRCULATION": "Dr. A Mwakikunga",
    "ANGIOGENESIS AND VASCULAR GENERATION": "Dr. A Mwakikunga",
    "Thoracic wall": "Dr. A Mwakikunga",
    "LUNGS": "Dr. A Mwakikunga",
    "Pulmonary Circulation": "Dr. A Mwakikunga",
    "Development of the respiratory system": "Dr. A Mwakikunga",
    "Histology of Respiratory System": "Dr. J Manda",
    "LYMPHATIC DRAINAGE OF THE THORAX": "Dr. A Mwakikunga",
    
    # SEM 2 - Biochemistry
    "Metabolism in Red Blood Cells": "Dr. Jana",
    "Plasma Proteins In Lab Medicine": "Dr. Jana",
    
    # SEM 2 - Haematology
    "Introduction to Haematology": "Dr. M Mulenga",
    "Haematopoiesis": "Dr. M Mulenga",
    "Haemoglobinopathy": "Dr. M Mulenga",
    "White Blood Cells": "Dr. M Mulenga",
    "blood groups": "Dr. M Mulenga",
    "Platelets": "Dr. M Mulenga",
    "Haemostasis": "Dr. M Mulenga",
    "Laboratory Evaluation of Haemostasis": "Dr. M Mulenga",
    "Lymphoreticular System": "Dr. M Mulenga",
    "Iron metabolism": "Dr. M Mulenga",
    "Anaemia": "Dr. M Mulenga",
    "Haematological malignancies": "Dr. M Mulenga",
    "Coombs Test": "Dr. M Mulenga",
    "Haemophilia": "Dr. M Mulenga",
    
    # SEM 2 - Microbiology
    "Vaccination immunisation": "Dr. Tonney Nyirenda",
    "Hypersensitivity Reactions": "Dr. Tonney Nyirenda",
    "Autoimmunity": "Dr. Tonney Nyirenda",
    "Innate and Adaptive Immunity": "Dr. Tonney Nyirenda",
    "HLA": "Dr. Tonney Nyirenda",
    "Intro parasitology": "Dr. R Mkakosya",
    "Development of B cells and T cells": "Dr. Tonney Nyirenda",
    "Malaria": "Dr. R Mkakosya",
    "Upper respiratory tract infections": "Dr. D Kulapani",
    "LRTI": "Dr. D Kulapani",
    "Tuberculosis": "Dr. D Kulapani",
    "Molecular mechanism of resistance": "Prof C Msefula",
    "Cardiovascular infections": "Dr. D Kulapani",
    "Bacteria.Viral Skin infections": "Dr. D Kulapani",
    
    # SEM 2 - Pathology
    "Lymphoma": "Dr. M Mulenga",
    "HIV AIDS associated Lymphomas": "Dr. M Mulenga",
    "Heart_diseases": "Dr. M Mulenga",
    "Vascular diseases": "Dr. M Mulenga",
    "COPD": "Dr. M Mulenga",
    "Lung Tumors": "Dr. M Mulenga",
    "Pulmonary edema": "Dr. M Mulenga",
    "Respiratory Infections": "Dr. M Mulenga",
    
    # SEM 2 - Pharmacology
    "ANTICOAGULANTS": "B Thuboy",
    "ANTIARRHYTHMIC DRUGS": "B Thuboy",
    "ISCHAEMIC HEART DISEASE": "B Thuboy",
    "CARDIAC HEART FAILURE": "B Thuboy",
    "Dyslipidaemia": "B Thuboy",
    "ANTI-ASTHMATICS": "B Thuboy",
    "ANTITUSSIVES": "B Thuboy",
    "MALAWI TB CONTROL POLICY": "B Thuboy",
    
    # SEM 2 - Physiology
    "Functional organisation of heart": "Dr. M Gwedela",
    "REGULATION OF ARTERIAL BP": "Dr. M Gwedela",
    "MICROCIRCULATION": "Dr. M Gwedela",
    "OEDEMA": "Dr. M Gwedela",
    "CIRCULATION THROUGH SPECIAL REGIONS": "Dr. M Gwedela",
    "Exercise": "Dr. M Gwedela",
    "Hypertension": "Dr. M Gwedela",
    "Shock and hypotension": "Dr. M Gwedela",
    "Cardiac Cycle": "Dr. M Gwedela",
    "Electrocardiograph": "Dr. M Gwedela",
    "HEMODYNAMICS": "Dr. M Gwedela",
    "AUTOREGULATION OF BLOOD FLOW": "Dr. M Gwedela",
    "Control of Peripheral Resistance": "Dr. M Gwedela",
    "CARDIAC OUTPUT": "Dr. M Gwedela",
    "VENOUS RETURN": "Dr. M Gwedela",
    "Main Steps of Respiration": "Dr. M Gwedela",
    "Control Of Ventilation": "Dr. M Gwedela",
    "Lung Volumes and Capacities": "Dr. M Gwedela",
    "Transport of Gases": "Dr. M Gwedela",
    
    # SEM 2 - Public Health
    "Environmental hazards": "Dr. Charles Mangani",
    "Principles of EH": "Dr. Charles Mangani",
    "Hygiene Promotion": "Dr. Charles Mangani",
    "Water supplies and Treatment": "Dr. Charles Mangani",
    "Principles of Public Health Screening": "Dr. Charles Mangani",
    "Introduction-qualitative-research": "Dr. Charles Mangani",
    "INTRODUCTION TO RESEARCH METHODOLOGY": "Dr. Charles Mangani",
    "HIV Epidemiology": "Prof V Mwapasa",
    "Questionnaire design": "Dr. Charles Mangani",
    
    # Psychology
    "Intro to Human Behaviour": "Prof C Bandawe",
}

# ============================================
# HELPER FUNCTIONS
# ============================================
def get_week_from_path(file_path):
    path = str(file_path).lower()
    
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
    elif "sem 2" in path:
        if "anatomy" in path: return 17
        elif "physiology" in path: return 18
        elif "pharmacology" in path: return 19
        elif "haematology" in path: return 18
        else: return 17
    else:
        return 1

def get_category_from_path(file_path):
    path = str(file_path)
    for folder, category in CATEGORY_MAP.items():
        if folder in path:
            return category
    return "Lecture"

def extract_lecturer(filename):
    name = filename.replace("_", " ").replace("-", " ").lower()
    clean_name = clean_title(filename).lower()
    
    # Manual mapping
    for key, value in LECTURER_MAP.items():
        if key.lower() in name or key.lower() in clean_name:
            return value
    
    # Keyword matching
    lecturer_keywords = {
        "tembo": "Mr. LH Tembo",
        "manda": "Dr. J Manda",
        "phiri": "W. Phiri",
        "mwakikunga": "Dr. A Mwakikunga",
        "manjatika": "Dr. Manjatika",
        "kaledzera": "T Kaledzera",
        "jana": "Dr. Jana",
        "nyondo": "T. Nyondo",
        "nayupe": "S. Nayupe",
        "chingwanda": "Dr. C Chingwanda",
        "mlozeni": "M. Mlozeni",
        "mkakosya": "Dr. R Mkakosya",
        "nyirenda": "Dr. Tonney Nyirenda",
        "msefula": "Prof C Msefula",
        "kulapani": "Dr. D Kulapani",
        "chaima": "Dr. David Chaima",
        "mulenga": "Dr. M Mulenga",
        "thuboy": "Blessings Thuboy",
        "gwedela": "Dr. M Gwedela",
        "mwambyale": "T. Mwambyale",
        "mangani": "Dr. Charles Mangani",
        "kawale": "Dr. Paul Kawale",
        "tizifa": "Dr. Tinashe Tizifa",
        "kayuni": "Dr. Seke Kayuni",
        "kumitawa": "A Kumitawa",
        "malonda": "Emma Malonda",
        "sithole": "Dr Jessie Khaki Sithole",
        "stanley": "Dr. Christopher Stanley",
        "umara": "Prof E Umar",
        "nkhangamwa": "Dr. Blessings Nkhangamwa",
        "zolowere": "Dr. Yankho Zolowere",
        "mwale": "Dr. Chikondi Mwale",
        "sungani": "Dr. Charles Sungani",
        "chabunya": "Dr. Sylvester Chabunya",
        "gadama": "Dr. Yohane Gadama",
        "mwapasa": "Prof V Mwapasa",
        "bandawe": "Prof C Bandawe",
        "dzamalala": "Dr. Charles Dzamalala",
        "mmela": "Dr. Tadala M'mela",
    }
    
    for keyword, lecturer in lecturer_keywords.items():
        if keyword in name:
            return lecturer
    
    return "Unknown"

def clean_title(filename):
    name = filename.replace("_", " ").replace("-", " ")
    name = re.sub(r'^\d+\.\s*', '', name)
    name = re.sub(r'^\d+\s*', '', name)
    
    suffixes = [".pptx", ".ppt", ".pdf", ".docx", ".doc", ".txt"]
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    
    prefixes = ["MBBS1", "BCHD", "BSC", "2023", "2022", "2021", "2020", "DAHS"]
    for prefix in prefixes:
        if name.startswith(prefix):
            name = name[len(prefix):].strip()
        if name.endswith(prefix):
            name = name[:-len(prefix)].strip()
    
    name = ' '.join(word.capitalize() for word in name.split())
    return name.strip() if name.strip() else filename

def check_file_size(file_path):
    size = os.path.getsize(file_path)
    max_size = 10 * 1024 * 1024  # 10MB
    return size <= max_size, size

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

def upload_to_cloudinary(file_path, week):
    try:
        # Force RAW resource type for PDFs
        result = cloudinary.uploader.upload(
            file_path,
            folder=f"bms-bank/week_{week}",
            resource_type="raw",  # Force raw for PDFs
            upload_preset="bms_bank",
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
                'uploaded_by': 'PDF Bulk Upload',
                'created_at': datetime.now().isoformat()
            }
        )
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"   ❌ Supabase save failed: {e}")
        return False

def scan_and_upload_pdfs():
    print("\n" + "="*70)
    print("📄 PDF-ONLY BULK UPLOAD")
    print("="*70)
    print(f"📁 Source: {BASE_PATH}")
    print("="*70 + "\n")
    
    if not os.path.exists(BASE_PATH):
        print(f"❌ ERROR: Path not found: {BASE_PATH}")
        return
    
    pdf_files = []
    
    for root, dirs, files in os.walk(BASE_PATH):
        for file in files:
            if file.startswith('~') or file.startswith('.'):
                continue
            if file.lower().endswith('.pdf'):
                full_path = os.path.join(root, file)
                pdf_files.append(full_path)
    
    print(f"📄 Found {len(pdf_files)} PDF files to upload")
    print("="*70 + "\n")
    
    if len(pdf_files) == 0:
        print("❌ No PDF files found!")
        return
    
    success_count = 0
    fail_count = 0
    skipped_count = 0
    
    for i, file_path in enumerate(pdf_files, 1):
        filename = os.path.basename(file_path)
        
        week = get_week_from_path(file_path)
        category = get_category_from_path(file_path)
        lecturer = extract_lecturer(filename)
        title = clean_title(filename)
        
        can_upload, size = check_file_size(file_path)
        size_mb = size / (1024 * 1024)
        
        print(f"\n[{i}/{len(pdf_files)}] 📄 {filename}")
        print(f"   📅 Week {week} | 📂 {category}")
        print(f"   👨‍🏫 {lecturer}")
        print(f"   📝 {title}")
        print(f"   📏 {size_mb:.1f} MB")
        
        if not can_upload:
            print(f"   ⚠️ File too large ({size_mb:.1f}MB > 10MB). Skipping.")
            skipped_count += 1
            continue
        
        upload_result = upload_to_cloudinary(file_path, week)
        
        if upload_result:
            data = {
                'week': week,
                'category': category,
                'lecturer': lecturer,
                'title': title,
                'day': '',
                'time': '',
                'description': f"PDF upload from: {filename}"
            }
            
            if save_to_supabase(data, upload_result['url']):
                print(f"   ✅ Uploaded and saved!")
                success_count += 1
            else:
                print(f"   ❌ Failed to save to database")
                fail_count += 1
        else:
            fail_count += 1
        
        if i % 10 == 0:
            print(f"\n⏳ Progress: {i}/{len(pdf_files)} files...")
            time.sleep(0.5)
    
    print("\n" + "="*70)
    print("📊 PDF UPLOAD COMPLETE")
    print("="*70)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {fail_count}")
    print(f"⏭️ Skipped (too large): {skipped_count}")
    print(f"📁 Total PDFs processed: {len(pdf_files)}")
    print("="*70 + "\n")

if __name__ == "__main__":
    print("\n⚠️  This will upload ONLY PDF files to Cloudinary.")
    print("   All existing PDF entries in Supabase will be deleted first.")
    print("")
    
    if not os.path.exists(BASE_PATH):
        print(f"❌ ERROR: BASE_PATH not found: {BASE_PATH}")
        input("Press ENTER to exit...")
        exit()
    
    input("Press ENTER to start...")
    scan_and_upload_pdfs()