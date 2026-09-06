// ImageProcessing.js - Core Image Processing Module (Only Threshold Methods Updated)
class ImageProcessing {
    constructor() {
        this.canvases = {};
        this.contexts = {};
        this.initializeCanvases();
    }

    // Initialize all canvas contexts including the new overlay canvas
    initializeCanvases() {
        this.canvases = {
            webcam: document.getElementById('webcamCanvas'),
            grayscale: document.getElementById('grayscaleCanvas'),
            redChannel: document.getElementById('redChannelCanvas'),
            greenChannel: document.getElementById('greenChannelCanvas'),
            blueChannel: document.getElementById('blueChannelCanvas'),
            redThreshold: document.getElementById('redThresholdCanvas'),
            greenThreshold: document.getElementById('greenThresholdCanvas'),
            blueThreshold: document.getElementById('blueThresholdCanvas'),
            webcam2: document.getElementById('webcamCanvas2'),
            colorSpace1: document.getElementById('colorSpace1Canvas'),
            colorSpace2: document.getElementById('colorSpace2Canvas'),
            cs1Threshold: document.getElementById('cs1ThresholdCanvas'),
            cs2Threshold: document.getElementById('cs2ThresholdCanvas'),
            faceDetection: document.getElementById('faceDetectionCanvas'),
            faceOverlay: document.getElementById('faceOverlayCanvas')
        };
        
        this.contexts = {};
        Object.keys(this.canvases).forEach(key => {
            if (this.canvases[key]) {
                this.contexts[key] = this.canvases[key].getContext('2d');
                this.contexts[key].imageSmoothingEnabled = false;
            }
        });

        console.log('Image processing canvases initialized with improved threshold processing only');
    }

    // Process the current captured image through all filters
    processImage(imageData) {
        if (!imageData) return;
        
        // Display original images
        this.displayImage(imageData, 'webcam');
        this.displayImage(imageData, 'webcam2');
        
        // Process grayscale
        const grayscaleData = this.convertToGrayscaleWithBrightness(imageData);
        this.displayImage(grayscaleData, 'grayscale');
        
        // Process color channels (UNCHANGED - keep original colored channels)
        const channels = this.splitColorChannels(imageData);
        this.displayImage(channels.red, 'redChannel');
        this.displayImage(channels.green, 'greenChannel');
        this.displayImage(channels.blue, 'blueChannel');
        this.processChannelThresholding(channels, imageData);
        
        // Process color spaces (UNCHANGED - keep original color space representations)
        const colorSpaces = this.convertColorSpaces(imageData);
        this.displayImage(colorSpaces.hsv, 'colorSpace1');
        this.displayImage(colorSpaces.ycbcr, 'colorSpace2');
        this.processColorSpaceThresholding(colorSpaces, imageData);
    }

    // Convert image to grayscale and increase brightness by 20% (UNCHANGED)
    convertToGrayscaleWithBrightness(imageData) {
        const newImageData = new ImageData(imageData.width, imageData.height);
        const data = imageData.data;
        const newData = newImageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            const brightGray = Math.min(255, Math.round(gray * 1.2));
            newData[i] = brightGray;
            newData[i + 1] = brightGray;
            newData[i + 2] = brightGray;
            newData[i + 3] = data[i + 3];
        }
        return newImageData;
    }

    // Split image into color channels (UNCHANGED - keep original colored channels)
    splitColorChannels(imageData) {
        const data = imageData.data;
        const channels = {
            red: new ImageData(imageData.width, imageData.height),
            green: new ImageData(imageData.width, imageData.height),
            blue: new ImageData(imageData.width, imageData.height)
        };
        for (let i = 0; i < data.length; i += 4) {
            channels.red.data[i] = data[i];
            channels.red.data[i + 1] = 0;
            channels.red.data[i + 2] = 0;
            channels.red.data[i + 3] = 255;
            channels.green.data[i] = 0;
            channels.green.data[i + 1] = data[i + 1];
            channels.green.data[i + 2] = 0;
            channels.green.data[i + 3] = 255;
            channels.blue.data[i] = 0;
            channels.blue.data[i + 1] = 0;
            channels.blue.data[i + 2] = data[i + 2];
            channels.blue.data[i + 3] = 255;
        }
        return channels;
    }

    // Process thresholding for each color channel (UPDATED - now uses new threshold method)
    processChannelThresholding(channels, originalImageData) {
        const thresholds = {
            red: parseInt(document.getElementById('redThreshold').value),
            green: parseInt(document.getElementById('greenThreshold').value),
            blue: parseInt(document.getElementById('blueThreshold').value)
        };
        
        Object.keys(channels).forEach(channel => {
            // NEW: Use improved threshold method that creates black/white depth visualization
            const thresholdData = this.applyDepthThreshold(originalImageData, thresholds[channel], channel);
            this.displayImage(thresholdData, `${channel}Threshold`);
        });
    }

    // NEW: Apply threshold that creates proper black/white depth visualization
    applyDepthThreshold(imageData, threshold, channel = 'all') {
        const newImageData = new ImageData(imageData.width, imageData.height);
        const newData = newImageData.data;
        const originalData = imageData.data;
        
        for (let i = 0; i < originalData.length; i += 4) {
            let channelValue;
            
            // Extract the specific channel value from original image
            switch (channel) {
                case 'red':
                    channelValue = originalData[i];
                    break;
                case 'green':
                    channelValue = originalData[i + 1];
                    break;
                case 'blue':
                    channelValue = originalData[i + 2];
                    break;
                default:
                    // For grayscale or luminance
                    channelValue = Math.round(
                        0.299 * originalData[i] + 
                        0.587 * originalData[i + 1] + 
                        0.114 * originalData[i + 2]
                    );
            }
            
            // Create threshold visualization: 
            // Above threshold = show intensity as grayscale (white = high intensity)
            // Below threshold = black
            if (channelValue >= threshold) {
                // Show the depth/intensity of the channel value as grayscale
                newData[i] = channelValue;
                newData[i + 1] = channelValue;
                newData[i + 2] = channelValue;
            } else {
                // Below threshold = black
                newData[i] = 0;
                newData[i + 1] = 0;
                newData[i + 2] = 0;
            }
            newData[i + 3] = 255; // Alpha
        }
        
        return newImageData;
    }

    // OLD: Keep original threshold method for backward compatibility (not used anymore)
    applyThreshold(imageData, threshold, channel = 'all', originalImageData) {
        const newImageData = new ImageData(originalImageData.width, originalImageData.height);
        const newData = newImageData.data;
        const originalData = originalImageData.data;
        for (let i = 0; i < imageData.data.length; i += 4) {
            let value;
            if (channel === 'red') value = imageData.data[i];
            else if (channel === 'green') value = imageData.data[i + 1];
            else if (channel === 'blue') value = imageData.data[i + 2];
            else value = imageData.data[i];
            if (value > threshold) {
                newData[i] = originalData[i];
                newData[i + 1] = originalData[i + 1];
                newData[i + 2] = originalData[i + 2];
                newData[i + 3] = originalData[i + 3];
            } else {
                newData[i] = 0;
                newData[i + 1] = 0;
                newData[i + 2] = 0;
                newData[i + 3] = 255;
            }
        }
        return newImageData;
    }

    // Convert RGB to different color spaces (UNCHANGED)
    convertColorSpaces(imageData) {
        const data = imageData.data;
        const hsvData = new ImageData(imageData.width, imageData.height);
        const ycbcrData = new ImageData(imageData.width, imageData.height);
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            const hsv = this.rgbToHsv(r, g, b);
            hsvData.data[i] = Math.round(hsv.h * 255 / 360);
            hsvData.data[i + 1] = Math.round(hsv.s * 255);
            hsvData.data[i + 2] = Math.round(hsv.v * 255);
            hsvData.data[i + 3] = 255;
            const ycbcr = this.rgbToYcbcr(data[i], data[i + 1], data[i + 2]);
            ycbcrData.data[i] = ycbcr.y;
            ycbcrData.data[i + 1] = ycbcr.cb;
            ycbcrData.data[i + 2] = ycbcr.cr;
            ycbcrData.data[i + 3] = 255;
        }
        return { hsv: hsvData, ycbcr: ycbcrData };
    }

    // RGB to HSV conversion algorithm (UNCHANGED)
    rgbToHsv(r, g, b) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        let h = 0;
        const s = max === 0 ? 0 : diff / max;
        const v = max;
        if (diff !== 0) {
            if (max === r) h = ((g - b) / diff) % 6;
            else if (max === g) h = (b - r) / diff + 2;
            else h = (r - g) / diff + 4;
            h *= 60;
            if (h < 0) h += 360;
        }
        return { h, s, v };
    }

    // RGB to YCbCr conversion algorithm (UNCHANGED)
    rgbToYcbcr(r, g, b) {
        const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const cb = Math.round(128 - 0.168736 * r - 0.331264 * g + 0.5 * b);
        const cr = Math.round(128 + 0.5 * r - 0.418688 * g - 0.081312 * b);
        return {
            y: Math.max(0, Math.min(255, y)),
            cb: Math.max(0, Math.min(255, cb)),
            cr: Math.max(0, Math.min(255, cr))
        };
    }

    // Process color space thresholding (UPDATED - now uses new threshold methods)
    processColorSpaceThresholding(colorSpaces, originalImageData) {
        const cs1Threshold = parseInt(document.getElementById('colorSpace1Threshold').value);
        const cs2Threshold = parseInt(document.getElementById('colorSpace2Threshold').value);
        
        // NEW: Use improved color space threshold methods
        const cs1ThresholdData = this.applyColorSpaceThreshold(originalImageData, cs1Threshold, 'hsv');
        const cs2ThresholdData = this.applyColorSpaceThreshold(originalImageData, cs2Threshold, 'ycbcr');
        
        this.displayImage(cs1ThresholdData, 'cs1Threshold');
        this.displayImage(cs2ThresholdData, 'cs2Threshold');
    }

    // NEW: Apply color space threshold for proper depth visualization
    applyColorSpaceThreshold(imageData, threshold, colorSpace) {
        const newImageData = new ImageData(imageData.width, imageData.height);
        const newData = newImageData.data;
        const originalData = imageData.data;
        
        for (let i = 0; i < originalData.length; i += 4) {
            let intensityValue;
            
            if (colorSpace === 'hsv') {
                // Use HSV Value (brightness) component for depth
                const r = originalData[i] / 255;
                const g = originalData[i + 1] / 255;
                const b = originalData[i + 2] / 255;
                const hsv = this.rgbToHsv(r, g, b);
                intensityValue = Math.round(hsv.v * 255); // Value component (0-255)
            } else if (colorSpace === 'ycbcr') {
                // Use YCbCr Y (luminance) component for depth
                const ycbcr = this.rgbToYcbcr(originalData[i], originalData[i + 1], originalData[i + 2]);
                intensityValue = ycbcr.y; // Y component (luminance)
            } else {
                // Fallback to grayscale luminance
                intensityValue = Math.round(
                    0.299 * originalData[i] + 
                    0.587 * originalData[i + 1] + 
                    0.114 * originalData[i + 2]
                );
            }
            
            // Apply threshold: above = show intensity as grayscale, below = black
            if (intensityValue >= threshold) {
                newData[i] = intensityValue;
                newData[i + 1] = intensityValue;
                newData[i + 2] = intensityValue;
            } else {
                newData[i] = 0;
                newData[i + 1] = 0;
                newData[i + 2] = 0;
            }
            newData[i + 3] = 255;
        }
        
        return newImageData;
    }

    // Display image data on canvas (UNCHANGED)
    displayImage(imageData, canvasKey) {
        const canvas = this.canvases[canvasKey];
        const ctx = this.contexts[canvasKey];
        
        if (!canvas || !ctx) {
            console.warn(`Canvas '${canvasKey}' not found or context not available`);
            return;
        }

        if (!imageData || !imageData.data) {
            console.warn(`Invalid image data provided for canvas '${canvasKey}'`);
            return;
        }
        
        if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
            canvas.width = imageData.width;
            canvas.height = imageData.height;
        }
        
        try {
            ctx.putImageData(imageData, 0, 0);
            canvas.classList.add('success');
            setTimeout(() => canvas.classList.remove('success'), 500);
        } catch (error) {
            console.error(`Error displaying image on canvas '${canvasKey}':`, error);
        }
    }

    // Clear specific canvas (UNCHANGED)
    clearCanvas(canvasKey) {
        const canvas = this.canvases[canvasKey];
        const ctx = this.contexts[canvasKey];
        
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Clear all canvases (UNCHANGED)
    clearAllCanvases() {
        Object.keys(this.canvases).forEach(key => {
            this.clearCanvas(key);
        });
        console.log('All canvases cleared');
    }

    // Get canvas element by key (UNCHANGED)
    getCanvas(canvasKey) {
        return this.canvases[canvasKey];
    }

    // Get context by key (UNCHANGED)
    getContext(canvasKey) {
        return this.contexts[canvasKey];
    }

    // Check if canvas exists and is ready (UNCHANGED)
    isCanvasReady(canvasKey) {
        return !!(this.canvases[canvasKey] && this.contexts[canvasKey]);
    }

    // Get list of available canvas keys (UNCHANGED)
    getAvailableCanvases() {
        return Object.keys(this.canvases).filter(key => this.isCanvasReady(key));
    }

    // Method to copy image from one canvas to another (UNCHANGED)
    copyImageBetweenCanvases(sourceKey, targetKey) {
        const sourceCanvas = this.canvases[sourceKey];
        const targetCtx = this.contexts[targetKey];
        
        if (sourceCanvas && targetCtx) {
            targetCtx.drawImage(sourceCanvas, 0, 0);
            console.log(`Copied image from ${sourceKey} to ${targetKey}`);
        } else {
            console.warn(`Cannot copy image: source '${sourceKey}' or target '${targetKey}' not available`);
        }
    }

    // Get image data from a specific canvas (UNCHANGED)
    getImageDataFromCanvas(canvasKey) {
        const canvas = this.canvases[canvasKey];
        const ctx = this.contexts[canvasKey];
        
        if (canvas && ctx) {
            return ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        
        console.warn(`Cannot get image data from canvas '${canvasKey}'`);
        return null;
    }

    // NEW: Debug method to analyze threshold values
    analyzeThresholdDistribution(imageData, channel = 'luminance') {
        const data = imageData.data;
        const histogram = new Array(256).fill(0);
        
        for (let i = 0; i < data.length; i += 4) {
            let value;
            
            switch (channel) {
                case 'red':
                    value = data[i];
                    break;
                case 'green':
                    value = data[i + 1];
                    break;
                case 'blue':
                    value = data[i + 2];
                    break;
                case 'hsv':
                    const r = data[i] / 255;
                    const g = data[i + 1] / 255;
                    const b = data[i + 2] / 255;
                    const hsv = this.rgbToHsv(r, g, b);
                    value = Math.round(hsv.v * 255);
                    break;
                case 'ycbcr':
                    const ycbcr = this.rgbToYcbcr(data[i], data[i + 1], data[i + 2]);
                    value = ycbcr.y;
                    break;
                default:
                    value = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            }
            
            histogram[value]++;
        }
        
        const totalPixels = (data.length / 4);
        const statistics = {
            channel: channel,
            totalPixels: totalPixels,
            mean: histogram.reduce((sum, count, value) => sum + (value * count), 0) / totalPixels,
            histogram: histogram
        };
        
        console.log(`Threshold analysis for ${channel}:`, statistics);
        return statistics;
    }
}