#!/usr/bin/env python3
"""
Officialum1 LLC - Universal Credit Scanner & Auto-Injector
Scans project files (PHP, Blade, React/Vue JSX/TSX, HTML) and injects developer credits if missing.
"""

import os
import sys
import re
import argparse
from pathlib import Path

# Fix Windows console encoding for paths containing emojis
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
    except Exception:
        pass

CREDIT_URL = "https://officialum1.com/"
CREDIT_NAME = "Officialum1 LLC"

# Snippets
ADMIN_BLADE_CREDIT = '| Developed by <a href="https://officialum1.com/" target="_blank" rel="noopener noreferrer" class="text-primary font-bold">Officialum1 LLC</a>'
ADMIN_PHP_CREDIT = '| Developed by <a href="https://officialum1.com/" target="_blank" rel="noopener noreferrer" style="font-weight:bold; color:#0d6efd;">Officialum1 LLC</a>'
REACT_JSX_CREDIT = ' | Developed by <a href="https://officialum1.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Officialum1 LLC</a>'
HTML_PHP_CREDIT = ' | Developed by <a href="https://officialum1.com/" target="_blank" rel="noopener noreferrer">Officialum1 LLC</a>'

IGNORE_DIRS = {
    'vendor', 'node_modules', '.git', '.gemini', '.next', '.nuxt', 
    'dist', 'build', 'storage', 'cache', '__pycache__', '__MACOSX'
}

def is_ignored(path_str):
    parts = Path(path_str).parts
    return any(ignored in parts for ignored in IGNORE_DIRS)

def has_credit(content):
    return "officialum1.com" in content.lower() or "officialum1 llc" in content.lower()

def inject_into_content(content, filepath, is_admin=False):
    ext = os.path.splitext(filepath)[1].lower()
    filename = os.path.basename(filepath).lower()

    if has_credit(content):
        return content, False

    # Choose appropriate snippet
    if "blade.php" in filepath.lower():
        snippet = ADMIN_BLADE_CREDIT if is_admin else HTML_PHP_CREDIT
    elif ext in [".jsx", ".tsx", ".vue", ".js"]:
        snippet = REACT_JSX_CREDIT
    elif is_admin:
        snippet = ADMIN_PHP_CREDIT
    else:
        snippet = HTML_PHP_CREDIT

    # Injection Strategies:
    # 1. Look for existing copyright text or &copy; or ©
    copyright_pattern = re.compile(r'((?:&copy;|©|Copyright).*?(?:<\/p>|<\/div>|<\/span>))', re.IGNORECASE | re.DOTALL)
    match = copyright_pattern.search(content)
    if match:
        full_match = match.group(1)
        # Place snippet right before the closing tag of copyright block
        tag_end = re.search(r'(<\/(?:p|div|span)>)$', full_match, re.IGNORECASE)
        if tag_end:
            idx = tag_end.start()
            modified = full_match[:idx] + snippet + full_match[idx:]
            return content[:match.start()] + modified + content[match.end():], True

    # 2. Look for closing </footer>
    if "</footer>" in content:
        replacement = f"    <div style=\"text-align:center; padding:5px 0; font-size:13px;\">{snippet}</div>\n</footer>"
        return content.replace("</footer>", replacement, 1), True

    # 3. Look for closing </body>
    if "</body>" in content:
        replacement = f"  <div style=\"text-align:center; padding:8px 0; font-size:12px;\">{snippet}</div>\n</body>"
        return content.replace("</body>", replacement, 1), True

    return content, False

def scan_and_process_project(project_path, inject=False):
    print(f"\n==================================================")
    print(f"Scanning: {project_path}")
    print(f"==================================================")
    
    target_files = []
    
    VALID_EXTENSIONS = {'.php', '.html', '.htm', '.jsx', '.tsx', '.vue', '.blade.php'}
    
    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            file_lower = file.lower()
            rel_path = os.path.join(root, file)
            ext = os.path.splitext(file_lower)[1]
            
            # Only code/markup extensions
            if not any(file_lower.endswith(vext) for vext in ['.php', '.html', '.htm', '.jsx', '.tsx', '.vue']):
                continue

            # Identify footer and layout files
            if any(k in file_lower for k in ['footer', 'foot_']):
                target_files.append(rel_path)
            elif file_lower in ['index.html', 'index.php', 'layout.jsx', 'layout.tsx', 'layout.blade.php']:
                target_files.append(rel_path)

    if not target_files:
        print("  [!] No footer or layout files found in project.")
        return

    for fpath in target_files:
        try:
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            continue

        is_admin = 'admin' in fpath.lower()
        has_c = has_credit(content)
        rel_display = os.path.relpath(fpath, project_path)

        if has_c:
            print(f"  [OK - PRESENT] {rel_display}")
        else:
            print(f"  [X - MISSING] {rel_display} {'(ADMIN)' if is_admin else '(PUBLIC)'}")
            if inject:
                new_content, modified = inject_into_content(content, fpath, is_admin)
                if modified:
                    # Backup original
                    bak_path = fpath + ".bak"
                    if not os.path.exists(bak_path):
                        with open(bak_path, 'w', encoding='utf-8', errors='ignore') as bf:
                            bf.write(content)
                    # Write updated content
                    with open(fpath, 'w', encoding='utf-8', errors='ignore') as wf:
                        wf.write(new_content)
                    print(f"    --> [INJECTED & SAVED] Credit added to {rel_display}")
                else:
                    print(f"    --> [WARNING] Could not determine auto-insertion spot. Please check manually.")

def main():
    parser = argparse.ArgumentParser(description="Officialum1 LLC Credit Scanner & Injector")
    parser.add_argument("path", nargs="?", default=".", help="Path to project directory")
    parser.add_argument("--inject", action="store_true", help="Automatically inject credit if missing")
    parser.add_argument("--all-desktop", action="store_true", help="Scan all desktop project folders")
    args = parser.parse_args()

    desktop_dir = r"C:\Users\Abc\Desktop"

    if args.all_desktop:
        for item in os.listdir(desktop_dir):
            full = os.path.join(desktop_dir, item)
            if os.path.isdir(full) and item not in IGNORE_DIRS:
                scan_and_process_project(full, inject=args.inject)
    else:
        target = os.path.abspath(args.path)
        scan_and_process_project(target, inject=args.inject)

if __name__ == "__main__":
    main()
