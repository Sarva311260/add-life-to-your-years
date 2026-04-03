"""
Generate a styled PDF last page with:
- QR code linking to addlifetoyouryears.org
- Share section with social icons text
- Copyright notice
- Website URL as clickable link
"""
import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

# ── Generate QR code ──────────────────────────────────────────────────────────
url = "https://addlifetoyouryears.org"
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=2,
)
qr.add_data(url)
qr.make(fit=True)

qr_img = qr.make_image(fill_color="#1a3a2a", back_color="white")
qr_path = "/home/ubuntu/wellness-coach-app/book/qr_code.png"
qr_img.save(qr_path)
print(f"QR code saved to {qr_path}")
print(f"QR code size: {qr_img.size}")
