// ImageProcessor.js - Updated Main Application Module with Better Face Detection
class ImageProcessor {
    constructor() {
        this.currentImage = null;
        this.currentFaceRegions = [];

        // Initialize all modules
        this.webcamController = new WebcamController();
        this.fileHandler = new FileHandler();
        this.imageProcessing = new ImageProcessing();
        this.faceDetector = new FaceDetector();
        this.faceFilters = new FaceFilters();

        this.setupEventListeners();
        this.setupSliderControls();
        this.setupCustomOverlayUI();
        this.initializeApplication();

        console.log('Image Processing Application initialized with improved face detection');
    }

    // Initialize the application with proper ML5/p5 setup
    async initializeApplication() {
        try {
            // Check for required libraries
            if (typeof ml5 === 'undefined') {
                console.error('ML5.js is not loaded!');
                this.showErrorMessage('ML5.js library is required for face detection');
                return;
            }
            
            if (typeof p5 === 'undefined') {
                console.warn('p5.js not detected, some features may be limited');
            }
            
            console.log('ML5.js version:', ml5.version);
            console.log('Initializing face detection models...');
            
            // Initialize face detection with retries
            let retries = 3;
            let initialized = false;
            
            while (retries > 0 && !initialized) {
                try {
                    await this.faceDetector.initModels();
                    
                    // Test if models are loaded
                    const status = this.faceDetector.getStatus();
                    if (status.ready) {
                        initialized = true;
                        console.log('✅ Face detection models loaded successfully');
                        console.log('Detector type:', status.detectorType);
                        this.showSuccessMessage('Face detection ready!');
                    } else {
                        throw new Error('Models not ready after initialization');
                    }
                } catch (error) {
                    console.warn(`Initialization attempt failed (${4 - retries}/3):`, error);
                    retries--;
                    
                    if (retries > 0) {
                        console.log('Retrying initialization...');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            if (!initialized) {
                console.error('Failed to initialize face detection after 3 attempts');
                this.showErrorMessage('Face detection initialization failed. Using fallback detection.');
            }
            
            this.setInitialSliderValues();
            console.log('Application initialization complete');
            
        } catch (error) {
            console.error('Error during application initialization:', error);
            this.showErrorMessage('Failed to initialize application properly');
        }
    }

    // Enhanced face detection with better error handling
    async detectAndDisplayFaces(imageData) {
        if (!imageData) {
            console.warn('No image data provided for face detection');
            return;
        }
        
        try {
            console.log('Starting face detection...');
            
            // Clear previous face regions
            this.currentFaceRegions = [];
            
            // Attempt face detection
            const faceRegions = await this.faceDetector.detectAndDisplayFaces(imageData);
            
            if (faceRegions && faceRegions.length > 0) {
                console.log(`✅ Successfully detected ${faceRegions.length} face(s)`);
                
                // Validate face regions
                const validRegions = faceRegions.filter(region => {
                    return region && 
                           region.width > 10 && 
                           region.height > 10 &&
                           region.x >= 0 && 
                           region.y >= 0 &&
                           region.x + region.width <= imageData.width &&
                           region.y + region.height <= imageData.height;
                });
                
                if (validRegions.length > 0) {
                    // Draw face detection boxes
                    const faceImage = this.faceDetector.highlightFaceRegions(imageData, validRegions);
                    this.imageProcessing.displayImage(faceImage, 'faceDetection');
                    this.currentFaceRegions = validRegions;
                    
                    // Log face positions for debugging
                    validRegions.forEach((region, i) => {
                        console.log(`Face ${i + 1}: Position(${Math.round(region.x)}, ${Math.round(region.y)}) Size(${Math.round(region.width)}x${Math.round(region.height)}) Method: ${region.method}`);
                    });
                    
                    this.showSuccessMessage(`Detected ${validRegions.length} face(s)`);
                } else {
                    console.warn('Face regions detected but none were valid');
                    this.handleNoFaceDetected(imageData);
                }
            } else {
                console.log('No faces detected in image');
                this.handleNoFaceDetected(imageData);
            }
            
        } catch (error) {
            console.error('Face detection error:', error);
            this.handleNoFaceDetected(imageData);
        }
    }

    // Handle case when no face is detected
    handleNoFaceDetected(imageData) {
        // Display original image without boxes
        this.imageProcessing.displayImage(imageData, 'faceDetection');
        this.currentFaceRegions = [];
        
        // Don't show error for every frame, just log it
        console.log('No face detected in current frame');
    }

    // Process a newly captured or loaded image
    async processNewImage(originalImage) {
        if (!originalImage) {
            console.warn('No image to process');
            return;
        }

        try {
            console.log('Processing new image...');
            console.log(`Image dimensions: ${originalImage.width}x${originalImage.height}`);
            
            // Step 1: Display original image
            this.imageProcessing.processImage(originalImage);
            
            // Step 2: Perform face detection with enhanced error handling
            await this.detectAndDisplayFaces(originalImage);
            
            // Step 3: Initialize overlay canvas
            this.imageProcessing.displayImage(originalImage, 'faceOverlay');
            
            console.log('Image processing complete');
            
            // Debug info
            if (this.currentFaceRegions.length > 0) {
                console.log(`Face detection successful: ${this.currentFaceRegions.length} face(s) found`);
            } else {
                console.log('No faces detected - check lighting and face visibility');
            }

        } catch (error) {
            console.error('Error processing image:', error);
            this.showErrorMessage('Error processing image. Please try again.');
        }
    }

    // Setup main application event listeners
    setupEventListeners() {
        // Listen for captured images from webcam
        document.addEventListener('imageCaptured', async (e) => {
            console.log('Image captured from webcam');
            this.currentImage = e.detail.imageData;
            await this.processNewImage(this.currentImage);
        });

        // Listen for loaded images from files
        document.addEventListener('imageLoaded', async (e) => {
            console.log('Image loaded from file');
            this.currentImage = e.detail.imageData;
            await this.processNewImage(this.currentImage);
        });

        // Listen for face filter applications
        document.addEventListener('applyFaceFilter', (e) => {
            this.applyFaceFilter(e.detail.filterType);
        });

        // Listen for overlay filter applications
        document.addEventListener('applyOverlayFilter', (e) => {
            this.applyOverlayFilter(e.detail.filterType);
        });

        // Face filter button controls (1-4)
        document.getElementById('faceKey1')?.addEventListener('click', () => this.applyFaceFilter('grayscale'));
        document.getElementById('faceKey2')?.addEventListener('click', () => this.applyFaceFilter('blur'));
        document.getElementById('faceKey3')?.addEventListener('click', () => this.applyFaceFilter('colorConvert'));
        document.getElementById('faceKey4')?.addEventListener('click', () => this.applyFaceFilter('pixelate'));

        // Overlay filter button controls (5-8)
        document.getElementById('overlayKey5')?.addEventListener('click', () => this.applyOverlayFilter('dogEars'));
        document.getElementById('overlayKey6')?.addEventListener('click', () => this.applyOverlayFilter('catEars'));
        document.getElementById('overlayKey7')?.addEventListener('click', () => this.applyOverlayFilter('sunglasses'));
        document.getElementById('overlayKey8')?.addEventListener('click', () => this.applyOverlayFilter('crown'));

        // Add debug key for testing face detection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' && e.ctrlKey) {
                e.preventDefault();
                this.debugFaceDetection();
            }
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.showErrorMessage('An unexpected error occurred. Please try again.');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showErrorMessage('An error occurred during processing. Please try again.');
        });
    }

    // Debug face detection
    async debugFaceDetection() {
        console.group('🔍 Face Detection Debug Info');
        
        const status = this.faceDetector.getStatus();
        console.log('Detector Status:', status);
        
        if (this.currentImage) {
            console.log('Current Image:', {
                width: this.currentImage.width,
                height: this.currentImage.height,
                dataLength: this.currentImage.data.length
            });
            
            console.log('Running test detection...');
            const testRegions = await this.faceDetector.detectAndDisplayFaces(this.currentImage);
            console.log('Test Detection Results:', testRegions);
        } else {
            console.log('No current image loaded');
        }
        
        console.log('Current Face Regions:', this.currentFaceRegions);
        console.groupEnd();
    }

    // Apply face filters with better validation
    applyFaceFilter(filterType) {
        if (!this.currentImage) {
            console.log('No image captured');
            this.showErrorMessage('Please capture or load an image first.');
            return;
        }
        
        if (!this.currentFaceRegions || this.currentFaceRegions.length === 0) {
            console.log('No face detected for filter application');
            this.showErrorMessage('No face detected. Please ensure your face is visible and try again.');
            return;
        }
        
        try {
            const filteredImage = this.faceFilters.applyFilter(filterType, this.currentImage, this.currentFaceRegions);
            this.imageProcessing.displayImage(filteredImage, 'faceDetection');
            console.log(`Applied ${filterType} filter to detected face`);
            this.showSuccessMessage(`Applied ${filterType} filter successfully`);
        } catch (error) {
            console.error('Error applying face filter:', error);
            this.showErrorMessage(`Error applying ${filterType} filter`);
        }
    }

    // Apply overlay filters with better validation
    applyOverlayFilter(filterType) {
        if (!this.currentImage) {
            console.log('No image captured for overlay');
            this.showErrorMessage('Please capture or load an image first.');
            return;
        }
        
        if (!this.currentFaceRegions || this.currentFaceRegions.length === 0) {
            console.log('No face detected for overlay');
            this.showErrorMessage('No face detected. Please ensure your face is visible and try again.');
            return;
        }
        
        try {
            const overlayImage = this.faceFilters.applyOverlay(filterType, this.currentImage, this.currentFaceRegions);
            this.imageProcessing.displayImage(overlayImage, 'faceOverlay');
            console.log(`Applied ${filterType} overlay to detected face`);
            this.showSuccessMessage(`Applied ${filterType} overlay successfully`);
        } catch (error) {
            console.error('Error applying overlay filter:', error);
            this.showErrorMessage(`Error applying ${filterType} overlay`);
        }
    }

    // Setup custom overlay UI
    setupCustomOverlayUI() {
        const customOverlayUpload = document.getElementById('customOverlayUpload');
        const overlayPosition = document.getElementById('overlayPosition');
        const overlayScale = document.getElementById('overlayScale');
        const scaleValue = document.getElementById('scaleValue');

        // Update scale display
        if (overlayScale && scaleValue) {
            overlayScale.addEventListener('input', (e) => {
                scaleValue.textContent = e.target.value + 'x';
            });
        }

        // Handle custom overlay upload
        if (customOverlayUpload) {
            customOverlayUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const name = `custom_${Date.now()}`;
                    const position = overlayPosition ? overlayPosition.value : 'above_head';
                    const scale = overlayScale ? parseFloat(overlayScale.value) : 1.0;

                    this.showSuccessMessage('Uploading custom overlay...');

                    const success = await this.faceFilters.loadOverlayFromFile(file, name, position, scale);

                    if (success) {
                        this.showSuccessMessage(`Custom overlay "${file.name}" loaded successfully!`);
                        this.updateCustomOverlayList();
                    } else {
                        this.showErrorMessage('Failed to load custom overlay');
                    }

                    customOverlayUpload.value = '';

                } catch (error) {
                    console.error('Error loading custom overlay:', error);
                    this.showErrorMessage('Error loading custom overlay');
                }
            });
        }

        setInterval(() => this.updateCustomOverlayList(), 3000);
    }

    // Update custom overlay list
    updateCustomOverlayList() {
        const customOverlayList = document.getElementById('customOverlayList');
        if (!customOverlayList) return;

        const overlays = this.faceFilters.listOverlays();
        const customOverlays = Object.keys(overlays).filter(key => key.startsWith('custom_'));

        if (customOverlays.length === 0) {
            customOverlayList.innerHTML = '<p style="color: #6c757d; text-align: center; font-size: 0.8em;">No custom overlays loaded</p>';
            return;
        }

        customOverlayList.innerHTML = '';
        customOverlays.forEach(key => {
            const overlay = overlays[key];
            const item = document.createElement('div');
            item.className = 'custom-overlay-item';
            
            item.innerHTML = `
                <div class="overlay-name">${overlay.name}</div>
                <div class="overlay-info">
                    ${overlay.dimensions} • ${overlay.position} • ${overlay.scale}x
                </div>
                <div class="custom-overlay-controls">
                    <button class="btn small" onclick="imageProcessor.applyCustomOverlay('${key}')">Apply</button>
                    <button class="btn small danger" onclick="imageProcessor.removeCustomOverlay('${key}')">Remove</button>
                </div>
            `;
            
            customOverlayList.appendChild(item);
        });
    }

    // Apply custom overlay
    applyCustomOverlay(key) {
        document.dispatchEvent(new CustomEvent('applyOverlayFilter', { 
            detail: { filterType: key } 
        }));
    }

    // Remove custom overlay
    removeCustomOverlay(key) {
        const success = this.faceFilters.removeOverlay(key);
        if (success) {
            this.showSuccessMessage('Custom overlay removed');
            this.updateCustomOverlayList();
        }
    }

    // Setup threshold slider controls
    setupSliderControls() {
        const createSliderHandler = (type, processFn) => {
            const slider = document.getElementById(`${type}Threshold`);
            const valueSpanId = type === 'colorSpace1' ? 'cs1Value' : type === 'colorSpace2' ? 'cs2Value' : `${type}Value`;
            const valueSpan = document.getElementById(valueSpanId);

            if (slider && valueSpan) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    valueSpan.textContent = value;
                    
                    if (this.currentImage) {
                        processFn(value);
                    }
                });
                
                slider.addEventListener('mousedown', (e) => e.stopPropagation());
                slider.addEventListener('touchstart', (e) => e.stopPropagation());
            }
        };

        // RGB channel threshold handlers
        const channelTypes = ['red', 'green', 'blue'];
        channelTypes.forEach(type => {
            createSliderHandler(type, (threshold) => {
                const thresholdedData = this.imageProcessing.applyDepthThreshold(
                    this.currentImage, 
                    threshold, 
                    type
                );
                this.imageProcessing.displayImage(thresholdedData, `${type}Threshold`);
            });
        });

        // Color space threshold handlers
        const colorSpaceTypes = ['colorSpace1', 'colorSpace2'];
        colorSpaceTypes.forEach(type => {
            createSliderHandler(type, (threshold) => {
                const colorSpace = type === 'colorSpace1' ? 'hsv' : 'ycbcr';
                const thresholdedData = this.imageProcessing.applyColorSpaceThreshold(
                    this.currentImage, 
                    threshold, 
                    colorSpace
                );
                this.imageProcessing.displayImage(thresholdedData, `${type === 'colorSpace1' ? 'cs1' : 'cs2'}Threshold`);
            });
        });
    }

    // Set initial values for all sliders
    setInitialSliderValues() {
        const defaultValues = {
            redThreshold: 128,
            greenThreshold: 128,
            blueThreshold: 128,
            colorSpace1Threshold: 128,
            colorSpace2Threshold: 128
        };
        
        Object.entries(defaultValues).forEach(([id, value]) => {
            const slider = document.getElementById(id);
            const valueSpanId = id.replace('Threshold', '').replace('colorSpace1', 'cs1').replace('colorSpace2', 'cs2') + 'Value';
            const valueSpan = document.getElementById(valueSpanId);
            if (slider) slider.value = value;
            if (valueSpan) valueSpan.textContent = value;
        });
    }

    // Show success message
    showSuccessMessage(message) {
        this.showTemporaryMessage(message, 'success');
    }

    // Show error message
    showErrorMessage(message) {
        this.showTemporaryMessage(message, 'error');
    }

    // Show temporary message
    showTemporaryMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1002;
            max-width: 400px;
            text-align: center;
            transition: all 0.3s ease;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Get current application state
    getApplicationState() {
        return {
            hasCurrentImage: !!this.currentImage,
            faceRegionsDetected: this.currentFaceRegions.length,
            webcamStatus: this.webcamController.getStatus(),
            faceDetectorStatus: this.faceDetector.getStatus(),
            availableOverlays: this.faceFilters.getAvailableOverlays(),
            thresholdValues: {
                red: document.getElementById('redThreshold')?.value || 128,
                green: document.getElementById('greenThreshold')?.value || 128,
                blue: document.getElementById('blueThreshold')?.value || 128,
                hsv: document.getElementById('colorSpace1Threshold')?.value || 128,
                ycbcr: document.getElementById('colorSpace2Threshold')?.value || 128
            },
            timestamp: new Date().toISOString()
        };
    }

    // Reset application to initial state
    resetApplication() {
        try {
            this.currentImage = null;
            this.currentFaceRegions = [];

            // Clear all canvases
            const canvasKeys = ['webcam', 'grayscale', 'redChannel', 'greenChannel', 'blueChannel', 
                              'redThreshold', 'greenThreshold', 'blueThreshold', 'webcam2', 
                              'colorSpace1', 'colorSpace2', 'cs1Threshold', 'cs2Threshold', 
                              'faceDetection', 'faceOverlay'];
            
            canvasKeys.forEach(key => {
                const canvas = document.getElementById(key + 'Canvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            });

            this.fileHandler.clearFileInput();
            this.setInitialSliderValues();
            console.log('Application reset to initial state');
            this.showSuccessMessage('Application reset successfully');
        } catch (error) {
            console.error('Error resetting application:', error);
            this.showErrorMessage('Error resetting application');
        }
    }

    // Cleanup method for proper disposal
    cleanup() {
        try {
            this.webcamController.cleanup();
            this.currentImage = null;
            this.currentFaceRegions = [];
            console.log('Application cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Debug method to log current state
    debugInfo() {
        const state = this.getApplicationState();
        console.group('Application Debug Info');
        console.log('Current State:', state);
        console.log('Image Dimensions:', this.currentImage ? `${this.currentImage.width}x${this.currentImage.height}` : 'No image');
        console.log('Face Regions:', this.currentFaceRegions);
        console.log('Face Detector Status:', state.faceDetectorStatus);
        console.log('Threshold Values:', state.thresholdValues);
        console.log('Modules Loaded:', {
            webcamController: !!this.webcamController,
            fileHandler: !!this.fileHandler,
            imageProcessing: !!this.imageProcessing,
            faceDetector: !!this.faceDetector,
            faceFilters: !!this.faceFilters
        });
        console.log('Available Overlays:', this.faceFilters.getAvailableOverlays());
        console.groupEnd();
        return state;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Image Processing Application with Improved Face Detection...');
    try {
        window.imageProcessor = new ImageProcessor();
        window.debugImageProcessor = () => window.imageProcessor.debugInfo();
        
        console.log('Application initialized successfully');
        console.log('');
        console.log('🎯 FACE DETECTION IMPROVEMENTS:');
        console.log('• Fixed bounding box calculation to detect actual face regions');
        console.log('• Added multiple detection methods (FaceMesh, FaceApi, Fallback)');
        console.log('• Improved coordinate extraction from ML5.js results');
        console.log('• Added corner markers for better visibility');
        console.log('• Enhanced error handling and fallback detection');
        console.log('');
        console.log('⌨️ CONTROLS:');
        console.log('• Space/Enter: Capture image');
        console.log('• P: Toggle preview');
        console.log('• Ctrl+D: Debug face detection');
        console.log('• Face filters (1-4): Grayscale, Blur, Color Shift, Pixelate');
        console.log('• Overlay filters (5-8): Dog Ears, Cat Ears, Sunglasses, Crown');
        console.log('');
        console.log('📸 TIPS FOR BETTER FACE DETECTION:');
        console.log('• Ensure good lighting on your face');
        console.log('• Face the camera directly');
        console.log('• Keep face within frame boundaries');
        console.log('• Avoid extreme angles or partial face views');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 9999;
        `;
        errorDiv.innerHTML = `
            <h3>Application Failed to Load</h3>
            <p>Please refresh the page and try again.</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #e74c3c;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }
});