# 生成 COOPER OS PWA 图标
from PIL import Image, ImageDraw, ImageFont
import os

def make_icon(size, path):
    # 深蓝圆角方块背景
    img = Image.new('RGBA', (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    radius = int(size * 0.22)
    d.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=(16, 32, 64, 255))
    # 蓝色渐变效果（叠加高光）
    for y in range(size):
        alpha = int(40 * (1 - y/size))
        d.line([(0, y), (size, y)], fill=(79, 141, 255, alpha))
    # 内部发光圆
    cx = cy = size // 2
    r = int(size * 0.26)
    glow = int(size * 0.30)
    for i in range(glow, 0, -1):
        a = int(60 * (1 - i/glow))
        d.ellipse([cx-i, cy-i, cx+i, cy+i], outline=(111, 182, 255, a), width=2)
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(79, 141, 255, 255))
    d.ellipse([int(cx-r*0.55), int(cy-r*0.55), int(cx+r*0.55), int(cy+r*0.55)], fill=(140, 190, 255, 255))
    # 字母 C
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(size*0.30))
    except:
        font = ImageFont.load_default()
    text = "C"
    bbox = d.textbbox((0,0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text((cx - tw/2 - bbox[0], cy - th/2 - bbox[1]), text, font=font, fill=(255,255,255,255))
    img.save(path)
    print(f"生成 {path} ({size}x{size})")

base = r"C:\Users\wyb\Desktop\草哥工作台"
make_icon(512, os.path.join(base, "icon-512.png"))
make_icon(192, os.path.join(base, "icon-192.png"))
print("完成")
