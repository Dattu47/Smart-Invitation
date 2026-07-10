"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Upload, Palette, ShieldAlert, Sparkles, RefreshCw, Download } from "lucide-react";

interface AiQrGeneratorProps {
  text: string;
  onQrGenerated: (base64Url: string) => void;
  initialQrUrl?: string;
  eventName?: string;
}

type QrStyle = "squares" | "dots" | "rounded" | "fluid";
type FinderStyle = "square" | "circle" | "rounded";

export default function AiQrGenerator({ text, onQrGenerated, initialQrUrl, eventName }: AiQrGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Customization States
  const [style, setStyle] = useState<QrStyle>("rounded");
  const [finderStyle, setFinderStyle] = useState<FinderStyle>("rounded");
  const [primaryColor, setPrimaryColor] = useState("#4c2d82"); // Default deep indigo
  const [secondaryColor, setSecondaryColor] = useState("#ec4899"); // Default vibrant pink
  const [useGradient, setUseGradient] = useState(true);
  
  // Custom uploaded files
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [artworkImage, setArtworkImage] = useState<HTMLImageElement | null>(null);
  
  // Scannability check warning
  const [isContrastLow, setIsContrastLow] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load logo from initial URL if exists and logoSrc is empty
  useEffect(() => {
    if (initialQrUrl && initialQrUrl.startsWith("data:image")) {
      // It's a base64 QR, we can't extract initial logo easily, but we can generate a new one
    }
  }, [initialQrUrl]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setLogoImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Artwork Upload & Color Extraction
  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setArtworkImage(img);
        // Extract dominant colors
        const extracted = extractDominantColors(img);
        if (extracted && extracted.length >= 2) {
          setPrimaryColor(extracted[0]);
          setSecondaryColor(extracted[1]);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Helper to extract dominant colors from image
  const extractDominantColors = (img: HTMLImageElement): string[] | null => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, 10, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;
      
      const colors: string[] = [];
      // Pick high contrast vibrant pixel colors
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        if (a > 200) {
          // Convert to Hex
          const hex = "#" + [r, g, b].map(x => {
            const val = x.toString(16);
            return val.length === 1 ? "0" + val : val;
          }).join("");
          
          // Filter out too dark or too light backgrounds to ensure scannability
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness > 40 && brightness < 200 && !colors.includes(hex)) {
            colors.push(hex);
          }
        }
        if (colors.length >= 3) break;
      }
      return colors.length >= 2 ? colors : ["#4c2d82", "#ec4899"];
    } catch {
      return null;
    }
  };

  // Check Contrast validation to guarantee scan reliability
  const checkContrast = (color1: string, color2: string) => {
    // Basic relative luminance checker
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    // If both colors are very light, warning is activated
    const b1 = (c1.r * 299 + c1.g * 587 + c1.b * 114) / 1000;
    const b2 = (c2.r * 299 + c2.g * 587 + c2.b * 114) / 1000;

    if (b1 > 180 && b2 > 180) {
      setIsContrastLow(true);
    } else {
      setIsContrastLow(false);
    }
  };

  // Core Canvas QR drawing engine
  const generateCustomQr = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsGenerating(true);
    checkContrast(primaryColor, secondaryColor);

    try {
      const qrWidth = 400;
      canvas.width = qrWidth;
      canvas.height = qrWidth;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw pure white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, qrWidth, qrWidth);

      // Create QR matrix using high error correction for custom logo embedding safety
      const qrObj = QRCode.create(text || "https://google.com", { errorCorrectionLevel: "H" });
      const modules = qrObj.modules;
      const size = modules.size;
      const cellSize = qrWidth / size;

      // Setup primary styling fill (Gradient or Solid)
      let fillStyle: string | CanvasGradient = primaryColor;
      if (useGradient) {
        const grad = ctx.createLinearGradient(0, 0, qrWidth, qrWidth);
        grad.addColorStop(0, primaryColor);
        grad.addColorStop(1, secondaryColor);
        fillStyle = grad;
      }
      ctx.fillStyle = fillStyle;

      // Helper function to draw rounded rectangles
      const drawRoundedRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
        c.fill();
      };

      // Define Finder patterns boundaries
      const isFinderPattern = (col: number, row: number) => {
        // Top-left
        if (col < 7 && row < 7) return true;
        // Top-right
        if (col >= size - 7 && row < 7) return true;
        // Bottom-left
        if (col < 7 && row >= size - 7) return true;
        return false;
      };

      // Define Center blank space boundary for Embedded Logo
      const logoScale = 0.22; // 22% size window in center
      const centerStart = Math.floor(size * (1 - logoScale) / 2);
      const centerEnd = Math.ceil(size * (1 + logoScale) / 2);
      const isCenterLogoArea = (col: number, row: number) => {
        return logoImage && col >= centerStart && col < centerEnd && row >= centerStart && row < centerEnd;
      };

      // 1. Draw modules matrix
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (isCenterLogoArea(col, row)) continue; // Keep center blank for logo
          if (isFinderPattern(col, row)) continue; // Skip raw drawing of finders to draw custom designs

          const isDark = modules.get(col, row);
          if (isDark) {
            ctx.fillStyle = fillStyle;
            const x = col * cellSize;
            const y = row * cellSize;

            if (style === "dots") {
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.4, 0, Math.PI * 2);
              ctx.fill();
            } else if (style === "rounded") {
              drawRoundedRect(ctx, x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, cellSize * 0.3);
            } else if (style === "fluid") {
              // Fluid matches adjacent cells to merge blocks
              const hasTop = row > 0 && modules.get(col, row - 1) && !isFinderPattern(col, row - 1);
              const hasBottom = row < size - 1 && modules.get(col, row + 1) && !isFinderPattern(col, row + 1);
              const hasLeft = col > 0 && modules.get(col - 1, row) && !isFinderPattern(col - 1, row);
              const hasRight = col < size - 1 && modules.get(col + 1, row) && !isFinderPattern(col + 1, row);

              ctx.beginPath();
              ctx.rect(x, y, cellSize, cellSize);
              ctx.fill();
              
              // Draw micro corners if single
              if (!hasTop && !hasBottom && !hasLeft && !hasRight) {
                ctx.fillStyle = "#ffffff";
                // Clip corners
                ctx.fillRect(x, y, 1.5, 1.5);
                ctx.fillRect(x + cellSize - 1.5, y, 1.5, 1.5);
                ctx.fillRect(x, y + cellSize - 1.5, 1.5, 1.5);
                ctx.fillRect(x + cellSize - 1.5, y + cellSize - 1.5, 1.5, 1.5);
              }
            } else {
              // Classic squares
              ctx.fillRect(x, y, cellSize, cellSize);
            }
          }
        }
      }

      // 2. Draw custom Finder pattern corners
      const drawFinder = (centerX: number, centerY: number) => {
        ctx.fillStyle = fillStyle;
        const outerSize = 7 * cellSize;
        const innerSize = 3 * cellSize;
        const xOffset = centerX - outerSize / 2;
        const yOffset = centerY - outerSize / 2;

        // Outer Ring
        if (finderStyle === "circle") {
          ctx.beginPath();
          ctx.arc(centerX, centerY, outerSize / 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(centerX, centerY, (outerSize - 2 * cellSize) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (finderStyle === "rounded") {
          drawRoundedRect(ctx, xOffset, yOffset, outerSize, outerSize, cellSize * 1.8);
          
          ctx.fillStyle = "#ffffff";
          drawRoundedRect(ctx, xOffset + cellSize, yOffset + cellSize, outerSize - 2 * cellSize, outerSize - 2 * cellSize, cellSize * 1.0);
        } else {
          // Classic Square Ring
          ctx.fillRect(xOffset, yOffset, outerSize, outerSize);
          
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(xOffset + cellSize, yOffset + cellSize, outerSize - 2 * cellSize, outerSize - 2 * cellSize);
        }

        // Inner Eye Dot
        ctx.fillStyle = fillStyle;
        const innerX = centerX - innerSize / 2;
        const innerY = centerY - innerSize / 2;
        
        if (finderStyle === "circle" || finderStyle === "rounded") {
          ctx.beginPath();
          ctx.arc(centerX, centerY, innerSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(innerX, innerY, innerSize, innerSize);
        }
      };

      // Top-Left Finder
      drawFinder(3.5 * cellSize, 3.5 * cellSize);
      // Top-Right Finder
      drawFinder((size - 3.5) * cellSize, 3.5 * cellSize);
      // Bottom-Left Finder
      drawFinder(3.5 * cellSize, (size - 3.5) * cellSize);

      // 3. Draw center Logo if uploaded
      if (logoImage) {
        const logoWidth = qrWidth * logoScale;
        const logoX = (qrWidth - logoWidth) / 2;
        const logoY = (qrWidth - logoWidth) / 2;
        const padding = 6;

        // White background border card for logo
        ctx.fillStyle = "#ffffff";
        drawRoundedRect(ctx, logoX - padding, logoY - padding, logoWidth + 2 * padding, logoWidth + 2 * padding, 12);

        // Draw image logo
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoWidth);
      }

      // 4. Output base64 URL to parent state callback
      const dataUrl = canvas.toDataURL("image/png");
      onQrGenerated(dataUrl);
    } catch (err) {
      console.error("AI custom QR code draw error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [text, style, finderStyle, primaryColor, secondaryColor, useGradient, logoImage, onQrGenerated]);

  // Redraw QR code on canvas whenever drawing parameters change
  useEffect(() => {
    generateCustomQr();
  }, [generateCustomQr]);

  // Helper to trigger download directly from custom canvas
  const downloadCustomQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `smart_qr_${eventName || "invite"}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-6 p-5 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-2 select-none">
        <Sparkles className="w-5 h-5 text-wedding-gold animate-pulse" />
        <h3 className="font-serif text-base font-semibold text-wedding-gold-light">
          AI-Branded QR Customizer
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Render Canvas Container */}
        <div className="relative shrink-0 flex flex-col items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-lg border border-white/10 relative overflow-hidden">
            <canvas ref={canvasRef} className="w-48 h-48 md:w-56 md:h-56 object-contain" />
            {isGenerating && (
              <div className="absolute inset-0 bg-wedding-purple-dark/80 flex items-center justify-center backdrop-blur-[1px]">
                <RefreshCw className="w-6 h-6 animate-spin text-wedding-gold" />
              </div>
            )}
          </div>
          
          <button
            onClick={downloadCustomQr}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-wedding-gold/40 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer select-none"
          >
            <Download className="w-3.5 h-3.5 text-wedding-gold" />
            <span>Download Custom QR</span>
          </button>
        </div>

        {/* Customization controls Panel */}
        <div className="flex-1 w-full space-y-4">
          {/* Style select */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">QR Block Style</label>
            <div className="grid grid-cols-4 gap-2">
              {(["squares", "rounded", "fluid", "dots"] as QrStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer capitalize ${
                    style === s 
                      ? "border-wedding-gold text-wedding-gold bg-wedding-gold/10" 
                      : "border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Finder corners Style select */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Finder Corners Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(["square", "rounded", "circle"] as FinderStyle[]).map((fs) => (
                <button
                  key={fs}
                  onClick={() => setFinderStyle(fs)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer capitalize ${
                    finderStyle === fs 
                      ? "border-wedding-gold text-wedding-gold bg-wedding-gold/10" 
                      : "border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  {fs}
                </button>
              ))}
            </div>
          </div>

          {/* Color gradients Panel */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Color Palette</label>
              <div className="flex items-center gap-1.5">
                <input 
                  type="checkbox" 
                  id="grad-check" 
                  checked={useGradient} 
                  onChange={(e) => setUseGradient(e.target.checked)} 
                  className="rounded border-white/10 bg-white/5 focus:ring-0 w-3 h-3 text-wedding-gold"
                />
                <label htmlFor="grad-check" className="text-[10px] text-gray-400 cursor-pointer select-none">Use Gradient</label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <span className="text-[10px] font-mono text-gray-400 uppercase">{primaryColor}</span>
              </div>

              {useGradient && (
                <div className="flex items-center gap-1.5">
                  <input 
                    type="color" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-gray-400 uppercase">{secondaryColor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload references Panel */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
            {/* Center Logo Upload */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Center Logo</label>
              <div className="relative w-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="logo-upload"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="logo-upload"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-white/10 hover:border-wedding-gold/40 text-xs font-semibold text-gray-400 hover:text-white bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer select-none"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="truncate">{logoImage ? "Change Logo" : "Upload Logo"}</span>
                </label>
              </div>
            </div>

            {/* Artwork reference color extraction */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Artwork Palette</label>
              <div className="relative w-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="art-upload"
                  onChange={handleArtworkUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="art-upload"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-white/10 hover:border-wedding-gold/40 text-xs font-semibold text-gray-400 hover:text-white bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer select-none"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="truncate">{artworkImage ? "Artwork Loaded" : "Extract Palette"}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scannability Guard Alerts */}
      {isContrastLow && (
        <div className="flex gap-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 leading-relaxed select-none">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Scan Contrast Warning:</strong> The chosen colors are very light. We recommend selecting at least one dark color to ensure all phone cameras scan the QR correctly!
          </span>
        </div>
      )}
    </div>
  );
}
