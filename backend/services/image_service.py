import os
import uuid
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
from pathlib import Path
from backend.core.config import GENERATED_DIR, UPLOADS_DIR, STATIC_DIR

def get_font(size: int = 24, bold: bool = True):
    # Try standard system fonts or default fallback
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    ]
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except Exception:
            continue
    return ImageFont.load_default()

def resolve_image_path(image_url: str) -> Path:
    # Handle local /static/ URLs or relative paths
    clean_url = image_url.replace("\\", "/")
    if "/static/" in clean_url:
        relative = clean_url.split("/static/")[-1]
        path = STATIC_DIR / relative
        if path.exists():
            return path
    # Try directly in generated or uploads
    filename = Path(clean_url).name
    for directory in [GENERATED_DIR, UPLOADS_DIR, STATIC_DIR]:
        candidate = directory / filename
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"Image not found on server: {image_url}")

def remove_background(image_path: Path, tolerance: int = 35, edge_blur: int = 2) -> Path:
    """
    Intelligent background removal using Pillow & NumPy.
    Detects edge background sample pixels, builds a distance-based alpha matte,
    and applies soft feathering to create a crisp transparent PNG.
    """
    img = Image.open(image_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    h, w, _ = arr.shape
    
    # Sample corner regions to detect ambient background color
    corners = np.concatenate([
        arr[0:15, 0:15, :3].reshape(-1, 3),
        arr[0:15, -15:, :3].reshape(-1, 3),
        arr[-15:, 0:15, :3].reshape(-1, 3),
        arr[-15:, -15:, :3].reshape(-1, 3),
        arr[0:10, :, :3].reshape(-1, 3),
        arr[-10:, :, :3].reshape(-1, 3)
    ], axis=0)
    bg_color = np.median(corners, axis=0)
    
    # Calculate Euclidean color distance from background
    rgb = arr[:, :, :3]
    dist = np.linalg.norm(rgb - bg_color, axis=-1)
    
    # Soft thresholding for smooth edges
    min_dist = float(tolerance)
    max_dist = min_dist * 2.2
    
    alpha = np.clip((dist - min_dist) / (max_dist - min_dist + 1e-5), 0.0, 1.0) * 255.0
    
    # Refine center region (keep center subject intact)
    y_idx, x_idx = np.ogrid[:h, :w]
    center_y, center_x = h / 2.0, w / 2.0
    rad_norm = np.sqrt(((x_idx - center_x) / (w / 2.0))**2 + ((y_idx - center_y) / (h / 2.0))**2)
    inner_mask = rad_norm < 0.55
    alpha[inner_mask] = np.maximum(alpha[inner_mask], 255.0 * (1.0 - (rad_norm[inner_mask] / 0.7)**2))
    
    alpha_img = Image.fromarray(alpha.astype(np.uint8), mode="L")
    if edge_blur > 0:
        alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(edge_blur))
    
    img.putalpha(alpha_img)
    
    out_name = f"nobg_{uuid.uuid4().hex[:10]}.png"
    out_path = GENERATED_DIR / out_name
    img.save(out_path, format="PNG")
    return out_path

def create_preset_background(preset_name: str, width: int, height: int) -> Image.Image:
    """Generate professional dynamic studio backgrounds"""
    bg = Image.new("RGBA", (width, height), (20, 20, 24, 255))
    draw = ImageDraw.Draw(bg)
    
    if preset_name == "studio_white":
        # Professional studio cyclorama gradient
        for y in range(height):
            ratio = y / height
            r = int(245 - ratio * 40)
            g = int(247 - ratio * 38)
            b = int(252 - ratio * 35)
            draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        # Studio softbox radial highlight
        hl = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        hldraw = ImageDraw.Draw(hl)
        cx, cy = width // 2, int(height * 0.45)
        hldraw.ellipse([cx - width // 3, cy - height // 4, cx + width // 3, cy + height // 4], fill=(255, 255, 255, 80))
        hl = hl.filter(ImageFilter.GaussianBlur(width // 8))
        bg = Image.alpha_composite(bg, hl)
        
    elif preset_name == "neon_cyberpunk":
        # Cyberpunk violet to cyan dark radiant glow
        for y in range(height):
            ratio = y / height
            r = int(12 + ratio * 20)
            g = int(8 + ratio * 15)
            b = int(28 + ratio * 45)
            draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        gdraw.ellipse([-width//4, height//3, width//2, height], fill=(168, 85, 247, 90)) # purple
        gdraw.ellipse([width//2, 0, width + width//4, height//2], fill=(6, 182, 212, 85)) # cyan
        glow = glow.filter(ImageFilter.GaussianBlur(width // 6))
        bg = Image.alpha_composite(bg, glow)
        
    elif preset_name == "dark_marble":
        # Luxury dark sleek studio with golden rim aura
        for y in range(height):
            ratio = y / height
            v = int(18 + ratio * 12)
            draw.line([(0, y), (width, y)], fill=(v, v, v + 2, 255))
        glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        gdraw.ellipse([width//4, height//4, 3*width//4, 3*height//4], fill=(217, 119, 6, 60))
        glow = glow.filter(ImageFilter.GaussianBlur(width // 5))
        bg = Image.alpha_composite(bg, glow)
        
    elif preset_name == "luxury_bokeh":
        # Warm sunset bokeh
        for y in range(height):
            ratio = y / height
            r = int(35 + (1 - ratio) * 45)
            g = int(20 + (1 - ratio) * 20)
            b = int(40 + ratio * 20)
            draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        gdraw.ellipse([int(width*0.2), int(height*0.2), int(width*0.5), int(height*0.5)], fill=(244, 63, 94, 70))
        gdraw.ellipse([int(width*0.5), int(height*0.4), int(width*0.9), int(height*0.8)], fill=(245, 158, 11, 70))
        glow = glow.filter(ImageFilter.GaussianBlur(width // 7))
        bg = Image.alpha_composite(bg, glow)
        
    else:  # pastel_gradient
        for y in range(height):
            r = int(224 - (y / height) * 30)
            g = int(231 - (y / height) * 20)
            b = int(255 - (y / height) * 10)
            draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
            
    return bg

def replace_background(foreground_path: Path, preset_name: str = "studio_white") -> Path:
    """Composite cut-out foreground onto new atmospheric background with contact shadow"""
    fg = Image.open(foreground_path).convert("RGBA")
    w, h = fg.size
    
    bg = create_preset_background(preset_name, w, h)
    
    # Cast a realistic soft drop shadow beneath the subject
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    cx, cy = w // 2, int(h * 0.78)
    sdraw.ellipse([cx - int(w * 0.35), cy - int(h * 0.08), cx + int(w * 0.35), cy + int(h * 0.08)], fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(w * 0.04)))
    
    composite = Image.alpha_composite(bg, shadow)
    composite = Image.alpha_composite(composite, fg)
    
    out_name = f"bgreplace_{uuid.uuid4().hex[:10]}.png"
    out_path = GENERATED_DIR / out_name
    composite.convert("RGB").save(out_path, format="JPEG", quality=95)
    return out_path

def apply_image_adjustments(
    image_path: Path,
    brightness: float = 1.0,
    contrast: float = 1.0,
    saturation: float = 1.0,
    sharpness: float = 1.0,
    vignette: float = 0.0,
    temperature: float = 0.0
) -> Path:
    """Adjust color temperature, brightness, contrast, saturation, sharpness, and vignette"""
    img = Image.open(image_path).convert("RGB")
    
    # Color temperature adjustment
    if abs(temperature) > 1.0:
        arr = np.array(img, dtype=np.float32)
        factor = temperature / 100.0  # -1.0 to 1.0
        if factor > 0:  # Warm: boost red, reduce blue
            arr[:, :, 0] = np.clip(arr[:, :, 0] * (1.0 + factor * 0.25), 0, 255)
            arr[:, :, 2] = np.clip(arr[:, :, 2] * (1.0 - factor * 0.20), 0, 255)
        else:  # Cool: boost blue, reduce red
            arr[:, :, 2] = np.clip(arr[:, :, 2] * (1.0 - factor * 0.25), 0, 255)
            arr[:, :, 0] = np.clip(arr[:, :, 0] * (1.0 + factor * 0.20), 0, 255)
        img = Image.fromarray(arr.astype(np.uint8))
        
    # Brightness
    if abs(brightness - 1.0) > 0.01:
        img = ImageEnhance.Brightness(img).enhance(brightness)
        
    # Contrast
    if abs(contrast - 1.0) > 0.01:
        img = ImageEnhance.Contrast(img).enhance(contrast)
        
    # Saturation (Color)
    if abs(saturation - 1.0) > 0.01:
        img = ImageEnhance.Color(img).enhance(saturation)
        
    # Sharpness
    if abs(sharpness - 1.0) > 0.01:
        img = ImageEnhance.Sharpness(img).enhance(sharpness)
        
    # Vignette
    if vignette > 0.05:
        w, h = img.size
        vig = Image.new("L", (w, h), 255)
        vdraw = ImageDraw.Draw(vig)
        for i in range(int(w * 0.35)):
            alpha = int(255 * (1.0 - (vignette * (1.0 - (i / (w * 0.35))))))
            vdraw.rectangle([i, i, w - i, h - i], outline=alpha)
        vig = vig.filter(ImageFilter.GaussianBlur(int(w * 0.12)))
        black = Image.new("RGB", (w, h), (0, 0, 0))
        img = Image.composite(img, black, vig)
        
    out_name = f"adj_{uuid.uuid4().hex[:10]}.jpg"
    out_path = GENERATED_DIR / out_name
    img.save(out_path, format="JPEG", quality=95)
    return out_path

def add_creative_text_overlay(
    image_path: Path,
    headline: str = "SUMMER COLLECTION",
    sub_text: str = "UP TO 50% OFF",
    badge: str = "LIMITED EDITION",
    position: str = "bottom",
    accent_hex: str = "#6366f1"
) -> Path:
    """Render graphic overlay with scrim, typography badges, and promotional design"""
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Parse accent color
    accent_hex = accent_hex.lstrip("#")
    try:
        r_acc, g_acc, b_acc = tuple(int(accent_hex[i:i+2], 16) for i in (0, 2, 4))
    except Exception:
        r_acc, g_acc, b_acc = (99, 102, 241)
        
    # Add dark gradient scrim on bottom or top for maximum text readability
    scrim_height = int(h * 0.38)
    if position == "bottom":
        for i in range(scrim_height):
            ratio = i / scrim_height
            alpha = int(185 * (ratio ** 1.3))
            y = h - scrim_height + i
            draw.line([(0, y), (w, y)], fill=(10, 12, 18, alpha))
            
        base_y = h - int(h * 0.28)
    else:  # top
        for i in range(scrim_height):
            ratio = (scrim_height - i) / scrim_height
            alpha = int(185 * (ratio ** 1.3))
            draw.line([(0, i), (w, i)], fill=(10, 12, 18, alpha))
        base_y = int(h * 0.08)
        
    font_badge = get_font(max(14, int(w * 0.022)), bold=True)
    font_head = get_font(max(26, int(w * 0.052)), bold=True)
    font_sub = get_font(max(16, int(w * 0.028)), bold=False)
    
    margin_x = int(w * 0.08)
    curr_y = base_y
    
    # Render pill badge if present
    if badge:
        bbox = draw.textbbox((0, 0), badge.upper(), font=font_badge)
        bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pad_x, pad_y = int(w * 0.02), int(h * 0.008)
        pill_rect = [margin_x, curr_y, margin_x + bw + pad_x * 2, curr_y + bh + pad_y * 2]
        draw.rounded_rectangle(pill_rect, radius=int(bh * 0.6), fill=(r_acc, g_acc, b_acc, 235))
        draw.text((margin_x + pad_x, curr_y + pad_y - 2), badge.upper(), fill=(255, 255, 255, 255), font=font_badge)
        curr_y += bh + pad_y * 2 + int(h * 0.018)
        
    # Render Headline
    if headline:
        # Subtle drop shadow behind headline
        draw.text((margin_x + 2, curr_y + 2), headline.upper(), fill=(0, 0, 0, 180), font=font_head)
        draw.text((margin_x, curr_y), headline.upper(), fill=(255, 255, 255, 255), font=font_head)
        bbox_head = draw.textbbox((0, 0), headline.upper(), font=font_head)
        curr_y += (bbox_head[3] - bbox_head[1]) + int(h * 0.012)
        
    # Render Sub-text
    if sub_text:
        draw.text((margin_x, curr_y), sub_text, fill=(210, 215, 225, 235), font=font_sub)
        
    # Accent decorative bottom line
    line_y = h - int(h * 0.03) if position == "bottom" else int(h * 0.38)
    draw.line([(margin_x, line_y), (margin_x + int(w * 0.25), line_y)], fill=(r_acc, g_acc, b_acc, 255), width=4)
    
    final_img = Image.alpha_composite(img, overlay)
    out_name = f"overlay_{uuid.uuid4().hex[:10]}.jpg"
    out_path = GENERATED_DIR / out_name
    final_img.convert("RGB").save(out_path, format="JPEG", quality=95)
    return out_path
