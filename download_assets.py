import os
import json
import time
import requests

# Configuration
JSON_FILE = 'books.json'
FRONTEND_DIR = 'frontend'
DOWNLOADS_DIR = os.path.join(FRONTEND_DIR, 'assets', 'downloads')

# Standard browser User-Agent to prevent 403 Forbidden errors (e.g., from Gutenberg)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def create_directories():
    os.makedirs(DOWNLOADS_DIR, exist_ok=True)
    os.makedirs(os.path.join(FRONTEND_DIR, 'assets', 'images'), exist_ok=True)

def download_file(url, filepath):
    if not url:
        return False
    
    if os.path.exists(filepath):
        print(f"Skipping (already exists): {filepath}")
        return True

    try:
        response = requests.get(url, headers=HEADERS, stream=True, timeout=15)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded: {filepath}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found in the current directory.")
        return

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        books = json.load(f)

    create_directories()

    for book in books:
        print(f"\nProcessing: {book['title']}...")

        # 1. Download Cover Image
        image_path = os.path.join(FRONTEND_DIR, book['localImage'])
        download_file(book['remoteImage'], image_path)
        time.sleep(1) # Delay to prevent IP blocking

        # 2. Download EPUB
        if book.get('downloadUrl'):
            epub_path = os.path.join(DOWNLOADS_DIR, f"{book['id']}.epub")
            download_file(book['downloadUrl'], epub_path)
            time.sleep(1)

        # 3. Download PDF (or TXT fallback)
        if book.get('pdfUrl'):
            # Determine extension (some Gutenberg fallbacks are .txt)
            ext = '.txt' if '.txt' in book['pdfUrl'] else '.pdf'
            pdf_path = os.path.join(DOWNLOADS_DIR, f"{book['id']}{ext}")
            download_file(book['pdfUrl'], pdf_path)
            time.sleep(1)

    print("\nAsset download complete.")

if __name__ == "__main__":
    main()