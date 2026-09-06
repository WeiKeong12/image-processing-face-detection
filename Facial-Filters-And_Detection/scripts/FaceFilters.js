// FaceFilters.js - Face Filter Effects Module with PNG Overlay Support
class FaceFilters {
    constructor() {
        this.overlayAssets = {}; // NEW: Store overlay assets
        this.setupKeyboardShortcuts();
        this.loadBuiltinOverlays(); // NEW: Load built-in overlays
    }

    // Setup keyboard shortcuts for filters AND overlays
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if we're not in an input field
            if (e.target.tagName.toLowerCase() === 'input') return;

            switch(e.key) {
                // Face Filters (1-4)
                case '1': 
                    e.preventDefault();
                    this.triggerFilter('grayscale'); 
                    break;
                case '2': 
                    e.preventDefault();
                    this.triggerFilter('blur'); 
                    break;
                case '3': 
                    e.preventDefault();
                    this.triggerFilter('colorConvert'); 
                    break;
                case '4': 
                    e.preventDefault();
                    this.triggerFilter('pixelate'); 
                    break;
                // NEW: Overlay Filters (5-8)
                case '5': 
                    e.preventDefault();
                    this.triggerOverlay('dogEars'); 
                    break;
                case '6': 
                    e.preventDefault();
                    this.triggerOverlay('catEars'); 
                    break;
                case '7': 
                    e.preventDefault();
                    this.triggerOverlay('sunglasses'); 
                    break;
                case '8': 
                    e.preventDefault();
                    this.triggerOverlay('crown'); 
                    break;
            }
        });
    }

    // NEW: Load built-in overlays
    async loadBuiltinOverlays() {
        console.log('[FaceFilters] Loading built-in overlays...');
        
        const overlayConfigs = {
            dogEars: { name: 'Dog Ears', position: 'above_head', scale: 1.2 },
            catEars: { name: 'Cat Ears', position: 'above_head', scale: 1.0 },
            sunglasses: { name: 'Sunglasses', position: 'eyes', scale: 0.8 },
            crown: { name: 'Crown', position: 'above_head', scale: 1.0 }
        };

        for (const [key, config] of Object.entries(overlayConfigs)) {
            try {
                const canvas = this.createOverlayCanvas(key);
                const dataUrl = canvas.toDataURL('image/png');
                await this.loadOverlayFromDataUrl(key, dataUrl, config);
            } catch (error) {
                console.error(`Failed to load ${key}:`, error);
            }
        }

        console.log('[FaceFilters] Built-in overlays loaded');
    }

    // NEW: Create overlay canvas based on type
    createOverlayCanvas(type) {
        switch (type) {
            case 'dogEars': return this.createDogEarsCanvas();
            case 'catEars': return this.createCatEarsCanvas();
            case 'sunglasses': return this.createSunglassesCanvas();
            case 'crown': return this.createCrownCanvas();
            default: 
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 100;
                return canvas;
        }
    }

    // NEW: Create dog ears canvas
    createDogEarsCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dog ears with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 120);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = gradient;
        
        // Left ear
        ctx.beginPath();
        ctx.ellipse(40, 50, 25, 40, -Math.PI/6, 0, 2*Math.PI);
        ctx.fill();
        
        // Right ear
        ctx.beginPath();
        ctx.ellipse(160, 50, 25, 40, Math.PI/6, 0, 2*Math.PI);
        ctx.fill();
        
        // Inner ear details
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(40, 50, 12, 25, -Math.PI/6, 0, 2*Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(160, 50, 12, 25, Math.PI/6, 0, 2*Math.PI);
        ctx.fill();
        
        return canvas;
    }

    // NEW: Create cat ears canvas
    createCatEarsCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#696969';
        
        // Left ear (triangular)
        ctx.beginPath();
        ctx.moveTo(25, 90);
        ctx.lineTo(10, 20);
        ctx.lineTo(50, 40);
        ctx.closePath();
        ctx.fill();
        
        // Right ear
        ctx.beginPath();
        ctx.moveTo(135, 90);
        ctx.lineTo(150, 20);
        ctx.lineTo(110, 40);
        ctx.closePath();
        ctx.fill();
        
        // Inner ear (pink)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(28, 70);
        ctx.lineTo(18, 35);
        ctx.lineTo(42, 45);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(132, 70);
        ctx.lineTo(142, 35);
        ctx.lineTo(118, 45);
        ctx.closePath();
        ctx.fill();
        
        return canvas;
    }

    // NEW: Create sunglasses canvas
    createSunglassesCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 140;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Sunglasses frame
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 4;
        ctx.fillStyle = '#000000';
        
        // Left lens
        ctx.beginPath();
        ctx.arc(30, 25, 18, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Right lens
        ctx.beginPath();
        ctx.arc(110, 25, 18, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Bridge
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(48, 25);
        ctx.lineTo(92, 25);
        ctx.stroke();
        
        // Lens reflections
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(25, 20, 6, 8, -Math.PI/4, 0, 2*Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(105, 20, 6, 8, -Math.PI/4, 0, 2*Math.PI);
        ctx.fill();
        
        return canvas;
    }

    // NEW: Create crown canvas
    createCrownCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Crown gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 80);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        
        // Crown base
        ctx.beginPath();
        ctx.moveTo(20, 70);
        ctx.lineTo(25, 30);
        ctx.lineTo(40, 45);
        ctx.lineTo(55, 20);
        ctx.lineTo(70, 35);
        ctx.lineTo(90, 15);
        ctx.lineTo(110, 35);
        ctx.lineTo(125, 20);
        ctx.lineTo(140, 45);
        ctx.lineTo(155, 30);
        ctx.lineTo(160, 70);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add jewels
        const jewels = [
            {x: 55, y: 35, color: '#FF0000', size: 6},
            {x: 90, y: 25, color: '#0000FF', size: 8},
            {x: 125, y: 35, color: '#00FF00', size: 6}
        ];
        
        jewels.forEach(jewel => {
            ctx.fillStyle = jewel.color;
            ctx.beginPath();
            ctx.arc(jewel.x, jewel.y, jewel.size, 0, 2*Math.PI);
            ctx.fill();
        });
        
        return canvas;
    }

    // NEW: Load overlay from data URL
    async loadOverlayFromDataUrl(name, dataUrl, config) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.overlayAssets[name] = {
                    image: img,
                    width: img.width,
                    height: img.height,
                    name: config.name,
                    position: config.position,
                    scale: config.scale,
                    loaded: true
                };
                resolve();
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    // NEW: Load custom overlay from file
    async loadOverlayFromFile(file, name, position = 'above_head', scale = 1.0) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    await this.loadOverlayFromDataUrl(name, e.target.result, {
                        name, position, scale
                    });
                    console.log(`Custom overlay '${name}' loaded`);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // NEW: Trigger overlay with visual feedback
    triggerOverlay(overlayType) {
        const button = document.getElementById(`overlayKey${this.getOverlayNumber(overlayType)}`);
        if (button) {
            button.classList.add('active');
            setTimeout(() => button.classList.remove('active'), 200);
        }

        // Dispatch custom event for overlay
        document.dispatchEvent(new CustomEvent('applyOverlayFilter', { 
            detail: { filterType: overlayType } 
        }));
    }

    // NEW: Get overlay number for button identification
    getOverlayNumber(overlayType) {
        const overlayMap = {
            'dogEars': 5,
            'catEars': 6,
            'sunglasses': 7,
            'crown': 8
        };
        return overlayMap[overlayType] || 5;
    }

    // Trigger filter with visual feedback (unchanged)
    triggerFilter(filterType) {
        const button = document.getElementById(`faceKey${this.getFilterNumber(filterType)}`);
        if (button) {
            button.classList.add('active');
            setTimeout(() => button.classList.remove('active'), 200);
        }

        // Dispatch custom event for the main processor to handle
        document.dispatchEvent(new CustomEvent('applyFaceFilter', { 
            detail: { filterType } 
        }));
    }

    // Get filter number for button identification (unchanged)
    getFilterNumber(filterType) {
        const filterMap = {
            'grayscale': 1,
            'blur': 2,
            'colorConvert': 3,
            'pixelate': 4
        };
        return filterMap[filterType] || 1;
    }

    // NEW: Apply overlay to image
    applyOverlay(overlayType, imageData, faceRegions) {
        if (!imageData || !faceRegions || faceRegions.length === 0) {
            console.log('No face detected for overlay');
            return imageData;
        }

        const overlay = this.overlayAssets[overlayType];
        if (!overlay || !overlay.loaded) {
            console.warn(`Overlay '${overlayType}' not loaded`);
            return imageData;
        }

        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Apply overlay to first detected face
        const region = faceRegions[0];
        this.drawOverlayOnFace(newImageData, region, overlay);

        console.log(`Applied ${overlayType} overlay to detected face`);
        return newImageData;
    }

    // NEW: Draw overlay on face
    drawOverlayOnFace(imageData, faceRegion, overlay) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw original image
        tempCtx.putImageData(imageData, 0, 0);
        
        // Calculate overlay position
        const overlayPos = this.calculateOverlayPosition(faceRegion, overlay);
        
        // Draw overlay
        tempCtx.globalAlpha = 0.95;
        tempCtx.drawImage(
            overlay.image,
            overlayPos.x,
            overlayPos.y,
            overlayPos.width,
            overlayPos.height
        );
        tempCtx.globalAlpha = 1.0;
        
        // Copy back to original imageData
        const modifiedImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        for (let i = 0; i < imageData.data.length; i++) {
            imageData.data[i] = modifiedImageData.data[i];
        }
    }

    // NEW: Calculate overlay position
    calculateOverlayPosition(faceRegion, overlay) {
        const { x, y, width, height } = faceRegion;
        const scaleFactor = overlay.scale || 1.0;
        
        switch (overlay.position) {
            case 'above_head':
                return {
                    x: x - (width * scaleFactor - width) / 2,
                    y: y - height * 0.5 * scaleFactor,
                    width: width * scaleFactor,
                    height: (overlay.height / overlay.width) * width * scaleFactor
                };
            case 'eyes':
                return {
                    x: x + width * 0.1,
                    y: y + height * 0.25,
                    width: width * 0.8 * scaleFactor,
                    height: (overlay.height / overlay.width) * width * 0.8 * scaleFactor
                };
            case 'mouth':
                return {
                    x: x + width * 0.2,
                    y: y + height * 0.6,
                    width: width * 0.6 * scaleFactor,
                    height: (overlay.height / overlay.width) * width * 0.6 * scaleFactor
                };
            default:
                return {
                    x: x,
                    y: y,
                    width: width * scaleFactor,
                    height: (overlay.height / overlay.width) * width * scaleFactor
                };
        }
    }

    // NEW: Get available overlays
    getAvailableOverlays() {
        return Object.keys(this.overlayAssets);
    }

    // NEW: List all overlays with info
    listOverlays() {
        const overlayList = {};
        Object.keys(this.overlayAssets).forEach(key => {
            const overlay = this.overlayAssets[key];
            overlayList[key] = {
                name: overlay.name,
                position: overlay.position,
                scale: overlay.scale,
                loaded: overlay.loaded,
                dimensions: `${overlay.width}x${overlay.height}`
            };
        });
        return overlayList;
    }

    // NEW: Remove overlay
    removeOverlay(name) {
        if (this.overlayAssets[name]) {
            delete this.overlayAssets[name];
            console.log(`Removed overlay '${name}'`);
            return true;
        }
        return false;
    }

    // NEW: Check if overlay is ready
    isOverlayReady(overlayType) {
        return !!(this.overlayAssets[overlayType] && this.overlayAssets[overlayType].loaded);
    }

    // Apply grayscale filter to face region (unchanged)
    applyGrayscaleFaceFilter(imageData, region) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        const data = newImageData.data;

        for (let y = region.y; y < region.y + region.height; y++) {
            for (let x = region.x; x < region.x + region.width; x++) {
                const idx = (y * imageData.width + x) * 4;

                if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
                    const gray = Math.round(
                        0.299 * data[idx] +
                        0.587 * data[idx + 1] +
                        0.114 * data[idx + 2]
                    );

                    data[idx] = gray;
                    data[idx + 1] = gray;
                    data[idx + 2] = gray;
                }
            }
        }

        return newImageData;
    }

    // Apply blur filter to face region (unchanged)
    applyBlurFaceFilter(imageData, region) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        const data = newImageData.data;
        const originalData = imageData.data;

        const blurRadius = 3;

        for (let y = region.y; y < region.y + region.height; y++) {
            for (let x = region.x; x < region.x + region.width; x++) {
                const idx = (y * imageData.width + x) * 4;
                if (idx >= 0 && idx < data.length) {
                    let r = 0, g = 0, b = 0, count = 0;

                    for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                        for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                            const ny = y + dy;
                            const nx = x + dx;

                            if (ny >= 0 && ny < imageData.height && nx >= 0 && nx < imageData.width) {
                                const sampleIdx = (ny * imageData.width + nx) * 4;
                                r += originalData[sampleIdx];
                                g += originalData[sampleIdx + 1];
                                b += originalData[sampleIdx + 2];
                                count++;
                            }
                        }
                    }

                    data[idx] = Math.round(r / count);
                    data[idx + 1] = Math.round(g / count);
                    data[idx + 2] = Math.round(b / count);
                }
            }
        }

        return newImageData;
    }

    // Apply color conversion filter to face region (unchanged)
    applyColorConvertFaceFilter(imageData, region) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        const data = newImageData.data;

        for (let y = region.y; y < region.y + region.height; y++) {
            for (let x = region.x; x < region.x + region.width; x++) {
                const idx = (y * imageData.width + x) * 4;
                if (idx >= 0 && idx < data.length) {
                    const r = data[idx] / 255;
                    const g = data[idx + 1] / 255;
                    const b = data[idx + 2] / 255;

                    const hsv = this.rgbToHsv(r, g, b);
                    hsv.h = (hsv.h + 180) % 360;

                    const rgb = this.hsvToRgb(hsv.h, hsv.s, hsv.v);
                    data[idx] = Math.round(rgb.r * 255);
                    data[idx + 1] = Math.round(rgb.g * 255);
                    data[idx + 2] = Math.round(rgb.b * 255);
                }
            }
        }

        return newImageData;
    }

    // Apply pixelate filter to face region (unchanged)
    applyPixelateFaceFilter(imageData, region) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        const data = newImageData.data;
        const originalData = imageData.data;

        const blockSize = 5;

        for (let blockY = region.y; blockY < region.y + region.height; blockY += blockSize) {
            for (let blockX = region.x; blockX < region.x + region.width; blockX += blockSize) {
                let totalR = 0;
                let totalG = 0;
                let totalB = 0;
                let pixelCount = 0;

                for (let y = blockY; y < Math.min(blockY + blockSize, region.y + region.height); y++) {
                    for (let x = blockX; x < Math.min(blockX + blockSize, region.x + region.width); x++) {
                        const idx = (y * imageData.width + x) * 4;
                        if (idx >= 0 && idx < data.length) {
                            totalR += originalData[idx];
                            totalG += originalData[idx + 1];
                            totalB += originalData[idx + 2];
                            pixelCount++;
                        }
                    }
                }

                if (pixelCount > 0) {
                    const avgR = Math.round(totalR / pixelCount);
                    const avgG = Math.round(totalG / pixelCount);
                    const avgB = Math.round(totalB / pixelCount);

                    for (let y = blockY; y < Math.min(blockY + blockSize, region.y + region.height); y++) {
                        for (let x = blockX; x < Math.min(blockX + blockSize, region.x + region.width); x++) {
                            const idx = (y * imageData.width + x) * 4;
                            if (idx >= 0 && idx < data.length) {
                                data[idx] = avgR;
                                data[idx + 1] = avgG;
                                data[idx + 2] = avgB;
                            }
                        }
                    }
                }
            }
        }

        return newImageData;
    }

    // RGB to HSV conversion algorithm (unchanged)
    rgbToHsv(r, g, b) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = 0;
        const s = max === 0 ? 0 : diff / max;
        const v = max;

        if (diff !== 0) {
            if (max === r) {
                h = ((g - b) / diff) % 6;
            } else if (max === g) {
                h = (b - r) / diff + 2;
            } else {
                h = (r - g) / diff + 4;
            }
            h *= 60;
            if (h < 0) h += 360;
        }

        return { h, s, v };
    }

    // HSV to RGB conversion (unchanged)
    hsvToRgb(h, s, v) {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;

        let r, g, b;

        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }

        return {
            r: r + m,
            g: g + m,
            b: b + m
        };
    }

    // Main filter application method (unchanged)
    applyFilter(filterType, imageData, faceRegions) {
        if (!imageData || !faceRegions || faceRegions.length === 0) {
            console.log('No face detected or image captured');
            return imageData;
        }

        const region = faceRegions[0];
        let filteredImage;

        switch (filterType) {
            case 'grayscale':
                filteredImage = this.applyGrayscaleFaceFilter(imageData, region);
                break;
            case 'blur':
                filteredImage = this.applyBlurFaceFilter(imageData, region);
                break;
            case 'colorConvert':
                filteredImage = this.applyColorConvertFaceFilter(imageData, region);
                break;
            case 'pixelate':
                filteredImage = this.applyPixelateFaceFilter(imageData, region);
                break;
            default:
                return imageData;
        }

        console.log(`Applied ${filterType} filter to detected face`);
        return filteredImage;
    }
}