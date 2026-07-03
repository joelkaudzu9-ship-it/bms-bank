import os
import re

BASE_PATH = r"C:\Users\joelk\Desktop\MBBS 1"

def find_large_files(path, max_size_mb=10):
    """Find all files larger than max_size_mb in a directory"""
    max_size_bytes = max_size_mb * 1024 * 1024
    large_files = []
    
    supported_extensions = {'.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'}
    
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.startswith('~') or file.startswith('.'):
                continue
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_extensions:
                full_path = os.path.join(root, file)
                size = os.path.getsize(full_path)
                if size > max_size_bytes:
                    large_files.append({
                        'filename': file,
                        'path': full_path,
                        'size_mb': size / (1024 * 1024),
                        'size_bytes': size,
                        'folder': os.path.basename(root),
                        'category': os.path.basename(os.path.dirname(root))
                    })
    
    return large_files

def print_report(large_files):
    """Print a nice report of large files"""
    print("\n" + "="*80)
    print("FILES LARGER THAN 10MB")
    print("="*80)
    print(f"Total files found: {len(large_files)}")
    print("="*80 + "\n")
    
    # Sort by size descending
    large_files.sort(key=lambda x: x['size_mb'], reverse=True)
    
    # Print table
    print(f"{'#':<4} {'File':<50} {'Size':<10} {'Category':<15} {'Folder':<15}")
    print("-"*80)
    
    total_size = 0
    for i, f in enumerate(large_files, 1):
        size_str = f"{f['size_mb']:.1f} MB"
        filename = f['filename'][:47]
        print(f"{i:<4} {filename:<50} {size_str:<10} {f['category'][:14]:<15} {f['folder'][:14]:<15}")
        total_size += f['size_mb']
    
    print("-"*80)
    print(f"Total size of all large files: {total_size:.1f} MB ({total_size/1024:.1f} GB)")
    
    # Group by category
    print("\n" + "="*80)
    print("BREAKDOWN BY CATEGORY")
    print("="*80)
    categories = {}
    for f in large_files:
        cat = f['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(f)
    
    for cat, files in sorted(categories.items()):
        total = sum(f['size_mb'] for f in files)
        print(f"\n{cat} ({len(files)} files, {total:.1f} MB):")
        for f in files[:5]:
            print(f"  - {f['filename'][:50]} ({f['size_mb']:.1f} MB)")
        if len(files) > 5:
            print(f"  ... and {len(files)-5} more")
    
    # Save to file (without emojis)
    with open("large_files_report.txt", "w", encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("FILES LARGER THAN 10MB\n")
        f.write("="*80 + "\n")
        f.write(f"Total files found: {len(large_files)}\n")
        f.write("="*80 + "\n\n")
        
        f.write(f"{'#':<4} {'File':<50} {'Size':<10} {'Category':<15} {'Folder':<15}\n")
        f.write("-"*80 + "\n")
        
        for i, file in enumerate(large_files, 1):
            f.write(f"{i:<4} {file['filename'][:47]:<50} {file['size_mb']:.1f} MB  {file['category'][:14]:<15} {file['folder'][:14]:<15}\n")
        
        f.write("\n" + "="*80 + "\n")
        f.write("BREAKDOWN BY CATEGORY\n")
        f.write("="*80 + "\n")
        for cat, files in sorted(categories.items()):
            total = sum(f['size_mb'] for f in files)
            f.write(f"\n{cat} ({len(files)} files, {total:.1f} MB):\n")
            for file in files:
                f.write(f"  - {file['filename']} ({file['size_mb']:.1f} MB)\n")
    
    print(f"\nFull report saved to: large_files_report.txt")

if __name__ == "__main__":
    if not os.path.exists(BASE_PATH):
        print(f"ERROR: Path not found: {BASE_PATH}")
        print("Please update BASE_PATH in the script.")
        exit()
    
    print("Scanning for files larger than 10MB...")
    print(f"Path: {BASE_PATH}\n")
    
    large_files = find_large_files(BASE_PATH)
    print_report(large_files)