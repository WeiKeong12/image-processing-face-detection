// FaceDetector.js - CORRECTED ML5.js Face Detection with p5.js Integration
class FaceDetector {
    constructor() {
        this.faceDetectionReady = false;
        this.detections = [];
        this.currentFaceRegions = [];
        this.isDetecting = false;
        this.detector = null;
        
        // p5.js video element
        this.p5Video = null;
        
        console.log('[FaceDetector] Initializing with proper p5.js/ML5.js integration...');
        this.initializeP5();
    }

    // Initialize p5.js properly for ML5 face detection
    initializeP5() {
        // Create a p5 instance for face detection
        const sketch = (p) => {
            p.setup = () => {
                // Create a small canvas for processing (not displayed)
                p.noCanvas();
                
                // Initialize ML5 face detection
                this.initModels();
            };
        };
        
        // Create p5 instance
        new p5(sketch);
    }

    async initModels() {
        if (typeof ml5 === 'undefined') {
            console.error('[FaceDetector] ❌ ML5.js not loaded!');
            return;
        }

        console.log('[FaceDetector] ✅ ML5.js available, version:', ml5.version);
        
        try {
            // Use ml5.faceApi with proper configuration
            const detectionOptions = {
                withLandmarks: true,
                withDescriptors: false,
                minConfidence: 0.5,
                MODEL_URLS: {
                    // Use the correct model URLs for face-api
                    modelUrl: 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_manifest.json',
                    landmarksUrl: 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights/face_landmark_68_model-weights_manifest.json'
                }
            };
            
            console.log('[FaceDetector] Loading face detection model...');
            
            // Create a temporary video element for ML5
            const tempVideo = document.createElement('video');
            tempVideo.width = 320;
            tempVideo.height = 240;
            
            // Try multiple ML5 detection methods
            await this.tryLoadDetector();
            
        } catch (error) {
            console.error('[FaceDetector] Failed to initialize models:', error);
        }
    }

    async tryLoadDetector() {
        // Try different ML5 detection methods in order of preference
        
        // Method 1: Try ml5.facemesh (most reliable for face detection)
        if (ml5.facemesh) {
            try {
                console.log('[FaceDetector] Attempting to load facemesh...');
                
                // Create temporary video for initialization
                const video = document.createElement('video');
                video.width = 320;
                video.height = 240;
                
                this.detector = ml5.facemesh(video, {
                    maxFaces: 2,
                    refineLandmarks: false,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                }, () => {
                    console.log('[FaceDetector] ✅ Facemesh model loaded!');
                    this.faceDetectionReady = true;
                    this.detectorType = 'facemesh';
                });
                
                return;
            } catch (error) {
                console.warn('[FaceDetector] Facemesh failed:', error);
            }
        }
        
        // Method 2: Try ml5.faceApi
        if (ml5.faceApi) {
            try {
                console.log('[FaceDetector] Attempting to load faceApi...');
                
                const video = document.createElement('video');
                video.width = 320;
                video.height = 240;
                
                this.detector = ml5.faceApi(video, {
                    withLandmarks: true,
                    withDescriptors: false,
                    minConfidence: 0.5
                }, () => {
                    console.log('[FaceDetector] ✅ FaceApi model loaded!');
                    this.faceDetectionReady = true;
                    this.detectorType = 'faceApi';
                });
                
                return;
            } catch (error) {
                console.warn('[FaceDetector] FaceApi failed:', error);
            }
        }
        
        console.error('[FaceDetector] No working face detection model found');
    }

    async detectAndDisplayFaces(imageData) {
        if (!this.faceDetectionReady || this.isDetecting) {
            console.log('[FaceDetector] Detection not ready or already detecting');
            return [];
        }

        if (!imageData || !imageData.data) {
            console.error('[FaceDetector] No valid image data provided');
            return [];
        }

        console.log(`[FaceDetector] 🔍 Starting detection on ${imageData.width}x${imageData.height} image`);

        this.isDetecting = true;
        let faceRegions = [];

        try {
            // Convert ImageData to canvas for ML5
            const canvas = this.createCanvasFromImageData(imageData);
            
            // Create p5 graphics object from canvas
            const p5Graphics = this.createP5Graphics(canvas);
            
            // Detect faces using the appropriate method
            if (this.detectorType === 'facemesh') {
                faceRegions = await this.detectWithFacemesh(canvas);
            } else if (this.detectorType === 'faceApi') {
                faceRegions = await this.detectWithFaceApi(canvas);
            } else {
                // Fallback to simple face detection
                faceRegions = await this.detectWithSimpleFaceDetection(imageData);
            }

            if (faceRegions.length > 0) {
                console.log('[FaceDetector] ✅ FACES DETECTED:');
                faceRegions.forEach((face, i) => {
                    console.log(`  Face ${i+1}: ${Math.round(face.width)}x${Math.round(face.height)} at (${Math.round(face.x)}, ${Math.round(face.y)})`);
                });
            } else {
                console.log('[FaceDetector] No faces detected');
            }

            this.currentFaceRegions = faceRegions;

        } catch (error) {
            console.error('[FaceDetector] Detection error:', error);
            faceRegions = [];
        } finally {
            this.isDetecting = false;
        }

        return faceRegions;
    }

    createP5Graphics(canvas) {
        // Create a p5 graphics object for ML5 processing
        if (typeof createGraphics !== 'undefined') {
            const pg = createGraphics(canvas.width, canvas.height);
            pg.drawingContext.drawImage(canvas, 0, 0);
            return pg;
        }
        return canvas;
    }

    async detectWithFacemesh(canvas) {
        return new Promise((resolve) => {
            console.log('[FaceDetector] Running Facemesh detection...');
            
            // Create a temporary image element from canvas
            const img = new Image();
            img.onload = async () => {
                try {
                    // Update detector's video source
                    this.detector.video = img;
                    
                    // Predict faces
                    const predictions = await this.detector.predict();
                    
                    if (!predictions || predictions.length === 0) {
                        console.log('[FaceDetector] Facemesh: No faces detected');
                        resolve([]);
                        return;
                    }

                    console.log(`[FaceDetector] Facemesh found ${predictions.length} face(s)`);

                    const faces = predictions.map((prediction, i) => {
                        // Get the mesh points
                        const mesh = prediction.scaledMesh || prediction.annotations || prediction.mesh;
                        
                        if (!mesh || mesh.length === 0) {
                            return null;
                        }

                        // Calculate proper bounding box from mesh points
                        const bbox = this.calculateProperBoundingBox(mesh, canvas.width, canvas.height);
                        
                        if (!bbox) return null;

                        return {
                            x: bbox.x,
                            y: bbox.y,
                            width: bbox.width,
                            height: bbox.height,
                            confidence: prediction.faceInViewConfidence || 0.8,
                            method: 'Facemesh'
                        };
                    }).filter(Boolean);

                    resolve(faces);
                } catch (error) {
                    console.error('[FaceDetector] Facemesh error:', error);
                    resolve([]);
                }
            };
            
            img.src = canvas.toDataURL();
        });
    }

    async detectWithFaceApi(canvas) {
        return new Promise((resolve) => {
            console.log('[FaceDetector] Running FaceApi detection...');
            
            // Create image from canvas
            const img = new Image();
            img.onload = () => {
                // Update detector's video/image source
                this.detector.video = img;
                
                // Detect faces
                this.detector.detect((err, results) => {
                    if (err) {
                        console.error('[FaceDetector] FaceApi error:', err);
                        resolve([]);
                        return;
                    }

                    if (!results || results.length === 0) {
                        console.log('[FaceDetector] FaceApi: No faces detected');
                        resolve([]);
                        return;
                    }

                    console.log(`[FaceDetector] FaceApi found ${results.length} face(s)`);

                    const faces = results.map((detection) => {
                        // Extract proper bounding box
                        let box = detection.detection?.box || detection.alignedRect?._box || detection.box;
                        
                        if (!box) {
                            console.warn('[FaceDetector] No bounding box found');
                            return null;
                        }

                        // Normalize coordinates
                        const x = box._x || box.x || 0;
                        const y = box._y || box.y || 0;
                        const width = box._width || box.width || 0;
                        const height = box._height || box.height || 0;

                        // Ensure coordinates are within canvas bounds
                        return {
                            x: Math.max(0, Math.min(x, canvas.width - width)),
                            y: Math.max(0, Math.min(y, canvas.height - height)),
                            width: Math.min(width, canvas.width),
                            height: Math.min(height, canvas.height),
                            confidence: detection.detection?._score || 0.8,
                            method: 'FaceApi'
                        };
                    }).filter(Boolean);

                    resolve(faces);
                });
            };
            
            img.src = canvas.toDataURL();
        });
    }

    // Improved bounding box calculation from mesh/landmarks
    calculateProperBoundingBox(points, canvasWidth, canvasHeight) {
        if (!points || points.length === 0) return null;

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        let validPoints = 0;

        // Process all points to find bounds
        points.forEach(point => {
            let x, y;
            
            // Handle different point formats
            if (Array.isArray(point)) {
                if (point.length >= 2) {
                    x = point[0];
                    y = point[1];
                }
            } else if (point && typeof point === 'object') {
                x = point.x || point._x;
                y = point.y || point._y;
            }

            // Validate and update bounds
            if (typeof x === 'number' && typeof y === 'number' && 
                !isNaN(x) && !isNaN(y) && 
                x >= 0 && x <= canvasWidth && 
                y >= 0 && y <= canvasHeight) {
                
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                validPoints++;
            }
        });

        // Need sufficient points for valid detection
        if (validPoints < 10) {
            console.warn(`[FaceDetector] Only ${validPoints} valid points found`);
            return null;
        }

        // Calculate dimensions with padding
        const padding = 0.1; // 10% padding
        const width = maxX - minX;
        const height = maxY - minY;
        const padX = width * padding;
        const padY = height * padding;

        return {
            x: Math.max(0, minX - padX),
            y: Math.max(0, minY - padY),
            width: Math.min(width + (padX * 2), canvasWidth),
            height: Math.min(height + (padY * 2), canvasHeight)
        };
    }

    // Fallback: Simple face detection using basic heuristics
    async detectWithSimpleFaceDetection(imageData) {
        console.log('[FaceDetector] Using fallback simple face detection...');
        
        // This is a basic skin color detection fallback
        const skinRegions = this.detectSkinRegions(imageData);
        
        if (skinRegions.length > 0) {
            // Find the largest connected region (likely the face)
            const faceRegion = this.findLargestRegion(skinRegions, imageData.width, imageData.height);
            
            if (faceRegion) {
                return [{
                    x: faceRegion.x,
                    y: faceRegion.y,
                    width: faceRegion.width,
                    height: faceRegion.height,
                    confidence: 0.5,
                    method: 'SimpleFallback'
                }];
            }
        }
        
        return [];
    }

    // Detect skin-colored regions as a fallback
    detectSkinRegions(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const skinMask = new Uint8Array(width * height);
        
        // Simple skin detection in RGB
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Simple skin color detection rules
            const isSkin = (r > 95 && g > 40 && b > 20) &&
                          (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
                          (Math.abs(r - g) > 15) &&
                          (r > g && r > b);
            
            if (isSkin) {
                skinMask[i / 4] = 1;
            }
        }
        
        return skinMask;
    }

    // Find the largest connected region (likely the face)
    findLargestRegion(skinMask, width, height) {
        let maxRegion = null;
        let maxArea = 0;
        
        // Simple region finding - find bounding box of skin pixels
        let minX = width, minY = height, maxX = 0, maxY = 0;
        let hasPixels = false;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (skinMask[idx] === 1) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    hasPixels = true;
                }
            }
        }
        
        if (hasPixels) {
            const regionWidth = maxX - minX;
            const regionHeight = maxY - minY;
            const area = regionWidth * regionHeight;
            
            // Check if region is face-like (aspect ratio)
            const aspectRatio = regionWidth / regionHeight;
            if (aspectRatio > 0.5 && aspectRatio < 2.0 && area > 100) {
                return {
                    x: minX,
                    y: minY,
                    width: regionWidth,
                    height: regionHeight
                };
            }
        }
        
        return null;
    }

    createCanvasFromImageData(imageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        
        console.log(`[FaceDetector] Created canvas: ${canvas.width}x${canvas.height}`);
        return canvas;
    }

    highlightFaceRegions(imageData, regions) {
        if (!regions || regions.length === 0) {
            console.log('[FaceDetector] No faces to highlight');
            return imageData;
        }

        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        console.log(`[FaceDetector] 🎨 Drawing ${regions.length} face box(es)`);
        
        regions.forEach((region, index) => {
            if (region && region.width > 0 && region.height > 0) {
                // Different colors for different detection methods
                const colors = {
                    'FaceApi': [255, 0, 0],      // Red
                    'Facemesh': [0, 255, 0],     // Green
                    'SimpleFallback': [255, 255, 0], // Yellow
                    'default': [0, 0, 255]       // Blue
                };
                
                const color = colors[region.method] || colors.default;
                
                // Draw thicker, more visible rectangle
                this.drawEnhancedRectangle(newImageData, region.x, region.y, region.width, region.height, color);
                
                // Add corner markers for better visibility
                this.drawCornerMarkers(newImageData, region.x, region.y, region.width, region.height, color);
                
                console.log(`[FaceDetector] ✏️ Drew ${region.method} face box: ${Math.round(region.width)}x${Math.round(region.height)} at (${Math.round(region.x)}, ${Math.round(region.y)})`);
            }
        });
        
        return newImageData;
    }

    drawEnhancedRectangle(imageData, x, y, width, height, color = [255, 0, 0]) {
        const data = imageData.data;
        const imageWidth = imageData.width;
        const imageHeight = imageData.height;
        const thickness = 3; // Thicker lines for better visibility
        
        // Ensure coordinates are integers and within bounds
        x = Math.round(Math.max(0, Math.min(x, imageWidth - 1)));
        y = Math.round(Math.max(0, Math.min(y, imageHeight - 1)));
        width = Math.round(Math.min(width, imageWidth - x));
        height = Math.round(Math.min(height, imageHeight - y));
        
        // Draw the rectangle with proper thickness
        for (let t = 0; t < thickness; t++) {
            // Top and bottom horizontal lines
            for (let i = 0; i < width; i++) {
                // Top line
                for (let dt = 0; dt < thickness; dt++) {
                    const topY = y + dt;
                    if (topY < imageHeight) {
                        const idx = (topY * imageWidth + (x + i)) * 4;
                        if (idx >= 0 && idx < data.length - 3) {
                            data[idx] = color[0];     // R
                            data[idx + 1] = color[1]; // G
                            data[idx + 2] = color[2]; // B
                            data[idx + 3] = 255;      // A
                        }
                    }
                }
                
                // Bottom line
                for (let dt = 0; dt < thickness; dt++) {
                    const bottomY = y + height - 1 - dt;
                    if (bottomY >= 0 && bottomY < imageHeight) {
                        const idx = (bottomY * imageWidth + (x + i)) * 4;
                        if (idx >= 0 && idx < data.length - 3) {
                            data[idx] = color[0];
                            data[idx + 1] = color[1];
                            data[idx + 2] = color[2];
                            data[idx + 3] = 255;
                        }
                    }
                }
            }
            
            // Left and right vertical lines
            for (let i = 0; i < height; i++) {
                // Left line
                for (let dt = 0; dt < thickness; dt++) {
                    const leftX = x + dt;
                    if (leftX < imageWidth) {
                        const idx = ((y + i) * imageWidth + leftX) * 4;
                        if (idx >= 0 && idx < data.length - 3) {
                            data[idx] = color[0];
                            data[idx + 1] = color[1];
                            data[idx + 2] = color[2];
                            data[idx + 3] = 255;
                        }
                    }
                }
                
                // Right line
                for (let dt = 0; dt < thickness; dt++) {
                    const rightX = x + width - 1 - dt;
                    if (rightX >= 0 && rightX < imageWidth) {
                        const idx = ((y + i) * imageWidth + rightX) * 4;
                        if (idx >= 0 && idx < data.length - 3) {
                            data[idx] = color[0];
                            data[idx + 1] = color[1];
                            data[idx + 2] = color[2];
                            data[idx + 3] = 255;
                        }
                    }
                }
            }
        }
    }

    // Add corner markers for better visibility
    drawCornerMarkers(imageData, x, y, width, height, color) {
        const markerSize = 10;
        const thickness = 3;
        const data = imageData.data;
        const imageWidth = imageData.width;
        
        // Ensure coordinates are within bounds
        x = Math.round(x);
        y = Math.round(y);
        width = Math.round(width);
        height = Math.round(height);
        
        // Draw corner markers
        const corners = [
            {x: x, y: y},                           // Top-left
            {x: x + width - 1, y: y},              // Top-right
            {x: x, y: y + height - 1},             // Bottom-left
            {x: x + width - 1, y: y + height - 1}  // Bottom-right
        ];
        
        corners.forEach(corner => {
            // Draw L-shaped corner markers
            for (let t = 0; t < thickness; t++) {
                // Horizontal part
                for (let i = 0; i < markerSize; i++) {
                    const px = corner.x + (corner.x === x ? i : -i);
                    const py = corner.y + t;
                    
                    if (px >= 0 && px < imageWidth && py >= 0 && py < imageData.height) {
                        const idx = (py * imageWidth + px) * 4;
                        if (idx >= 0 && idx < data.length - 3) {
                            data[idx] = color[0];
                            data[idx + 1] = color[1];
                            data[idx + 2] = color[2];
                            data[idx + 3] = 255;
                        }
                    }
                }
                
                // Vertical part
                for (let i = 0; i < markerSize; i++) {
                    const px = corner.x + t;
                    const py = corner.y + (corner.y === y ? i : -i);
                    
                    if (px >= 0 && px < imageWidth && py >= 0 && py < imageData.height) {
                        const idx = (py * imageWidth + px) * 4;
                        if (idx >= 0 && idx < data.length - 3) {
                            data[idx] = color[0];
                            data[idx + 1] = color[1];
                            data[idx + 2] = color[2];
                            data[idx + 3] = 255;
                        }
                    }
                }
            }
        });
    }

    // Get detector status
    getStatus() {
        return {
            ready: this.faceDetectionReady,
            detecting: this.isDetecting,
            detectorType: this.detectorType || 'none',
            lastDetectionCount: this.currentFaceRegions.length,
            ml5Available: typeof ml5 !== 'undefined',
            p5Available: typeof p5 !== 'undefined'
        };
    }

    reset() {
        this.currentFaceRegions = [];
        this.isDetecting = false;
        console.log('[FaceDetector] Reset detection state');
    }

    async testDetection() {
        console.log('[FaceDetector] 🧪 Running detection test...');
        const status = this.getStatus();
        console.log('[FaceDetector] Current status:', status);
        
        if (!status.ml5Available) {
            console.error('[FaceDetector] ❌ ML5.js not available');
            return;
        }
        
        if (!status.p5Available) {
            console.error('[FaceDetector] ❌ p5.js not available');
            return;
        }
        
        if (!status.ready) {
            console.log('[FaceDetector] Models not ready, initializing...');
            await this.initModels();
        }
        
        console.log('[FaceDetector] ✅ Detection test complete');
        console.log('[FaceDetector] Detector type:', this.detectorType);
    }
}