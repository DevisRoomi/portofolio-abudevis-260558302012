import os
import re
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "public" / "assets" / "certificates" / "raw_pdf"
PROCESSED_DIR = BASE_DIR / "public" / "assets" / "certificates" / "processed"
OUTPUT_TS = BASE_DIR / "src" / "data" / "certificates.ts"

def clean_title(filename: str, page_num: int, total_pages: int) -> str:
    stem = Path(filename).stem
    clean = re.sub(r'[_\-]+', ' ', stem).strip().title()
    if total_pages > 1:
        return f"{clean} - Part {page_num + 1}"
    return clean

def process_certificates():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("[!] PyMuPDF belum terinstall. Menginstall via pip...")
        os.system("python -m pip install pymupdf")
        import fitz

    certificates = []
    cert_index = 1

    # Support PDF, PNG, JPG, JPEG, WEBP
    raw_files = sorted([
        f for f in RAW_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in [".pdf", ".png", ".jpg", ".jpeg", ".webp"]
    ])

    print(f"[*] Ditemukan {len(raw_files)} file sertifikat di {RAW_DIR}")

    for file_path in raw_files:
        ext = file_path.suffix.lower()
        if ext == ".pdf":
            print(f"[*] Memproses PDF: {file_path.name}")
            try:
                doc = fitz.open(file_path)
                total_pages = len(doc)
                print(f"    -> Berisi {total_pages} halaman sertifikat.")

                for page_idx in range(total_pages):
                    page = doc[page_idx]
                    
                    # Render page at 2x resolution (~144 DPI) for sharp display on Retina/4K
                    zoom = 2.0
                    mat = fitz.Matrix(zoom, zoom)
                    pix = page.get_pixmap(matrix=mat, alpha=False)

                    safe_stem = re.sub(r'[^a-zA-Z0-9]', '_', file_path.stem).lower()
                    img_filename = f"cert_{cert_index:02d}_{safe_stem}_p{page_idx + 1}.webp"
                    img_path = PROCESSED_DIR / img_filename
                    
                    # Also save individual single-page PDF if needed
                    single_pdf_filename = f"cert_{cert_index:02d}_{safe_stem}_p{page_idx + 1}.pdf"
                    single_pdf_path = PROCESSED_DIR / single_pdf_filename
                    
                    single_doc = fitz.open()
                    single_doc.insert_pdf(doc, from_page=page_idx, to_page=page_idx)
                    single_doc.save(single_pdf_path)
                    single_doc.close()

                    # Save image (fitz supports saving as png/webp/jpg)
                    pix.save(str(img_path))

                    title = clean_title(file_path.name, page_idx, total_pages)
                    certificates.append({
                        "id": f"cert-{cert_index:02d}",
                        "index": f"{cert_index:02d}",
                        "title": title,
                        "issuer": "Verified Credential",
                        "year": "2024 - 2026",
                        "category": "SOFTWARE ENGINEERING & TECH",
                        "imageUrl": f"/assets/certificates/processed/{img_filename}",
                        "pdfUrl": f"/assets/certificates/processed/{single_pdf_filename}",
                        "tags": ["Verified", "Engineering", "Credential"],
                        "skills": ["Problem Solving", "Architecture", "Engineering"],
                        "description": f"Sertifikat terverifikasi atas nama Abu Devis Jalaluddin untuk keahlian dan kompetensi teknis."
                    })
                    print(f"    [+] Disimpan: {img_filename}")
                    cert_index += 1

                doc.close()
            except Exception as e:
                print(f"[!] Gagal memproses {file_path.name}: {e}")

        elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
            # Image copy/conversion
            print(f"[*] Memproses Gambar: {file_path.name}")
            safe_stem = re.sub(r'[^a-zA-Z0-9]', '_', file_path.stem).lower()
            img_filename = f"cert_{cert_index:02d}_{safe_stem}{ext}"
            img_path = PROCESSED_DIR / img_filename
            
            with open(file_path, "rb") as rf:
                with open(img_path, "wb") as wf:
                    wf.write(rf.read())

            title = clean_title(file_path.name, 0, 1)
            certificates.append({
                "id": f"cert-{cert_index:02d}",
                "index": f"{cert_index:02d}",
                "title": title,
                "issuer": "Verified Credential",
                "year": "2024 - 2026",
                "category": "ACHIEVEMENT & ACCOMPLISHMENT",
                "imageUrl": f"/assets/certificates/processed/{img_filename}",
                "tags": ["Verified", "Achievement"],
                "skills": ["Leadership", "Discipline", "Competence"],
                "description": f"Dokumentasi sertifikat terverifikasi atas nama Abu Devis Jalaluddin."
            })
            print(f"    [+] Disimpan: {img_filename}")
            cert_index += 1

    # Generate TypeScript file
    ts_content = f"""// Auto-generated by scripts/process_certificates.py
export interface CertificateItem {{
  id: string;
  index: string;
  title: string;
  issuer: string;
  year: string;
  category: string;
  imageUrl: string;
  pdfUrl?: string;
  tags: string[];
  skills: string[];
  description: string;
}}

export const CERTIFICATES_DATA: CertificateItem[] = {json.dumps(certificates, indent=2)};
"""
    OUTPUT_TS.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_TS, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"\n[✓] Sukses memproses {len(certificates)} sertifikat!")
    print(f"[✓] File TypeScript tersimpan di: {OUTPUT_TS}")

if __name__ == "__main__":
    process_certificates()
