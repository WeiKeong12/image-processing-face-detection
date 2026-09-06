// FileHandler.js - File Upload and Drag/Drop Module
class FileHandler {
    constructor() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    // Setup file upload event listeners
    setupEventListeners() {
        const imageUpload = document.getElementById('imageUpload');
        
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }
    }

    // Setup drag and drop functionality
    setupDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area
        ['dragenter', 'dragover'].forEach(eventName => {
            document.addEventListener(eventName, this.highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, this.unhighlight, false);
        });

        // Handle dropped files
        document.addEventListener('drop', (e) => {
            this.handleDrop(e);
        }, false);
    }

    // Prevent default drag behaviors
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area when dragging over
    highlight(e) {
        document.body.style.backgroundColor = '#e8f4f8';
        document.body.style.transition = 'background-color 0.2s ease';
    }

    // Remove highlight when not dragging
    unhighlight(e) {
        document.body.style.backgroundColor = '#f0f2f5';
    }

    // Handle dropped files
    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            
            if (this.validateImageFile(file)) {
                this.loadImageFromFile(file);
            } else {
                this.showError('Please drop a valid image file (JPEG, PNG, GIF, WebP)');
            }
        }
    }

    // Handle image upload from file input
    handleImageUpload(event) {
        const file = event.target.files[0];
        
        if (file && this.validateImageFile(file)) {
            this.loadImageFromFile(file);
        } else if (file) {
            this.showError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        }
    }

    // Validate if file is a supported image type
    validateImageFile(file) {
        const supportedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp'
        ];
        
        return supportedTypes.includes(file.type.toLowerCase());
    }

    // Load and process image from file
    loadImageFromFile(file) {
        // Show loading indicator
        this.showLoadingIndicator();
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    const imageData = this.processImageFile(img);
                    
                    console.log(`Image loaded from file: ${file.name} (${file.size} bytes)`);
                    console.log('Image scaled to 160x120 for processing');
                    
                    // Dispatch event with loaded image data
                    document.dispatchEvent(new CustomEvent('imageLoaded', { 
                        detail: { 
                            imageData,
                            filename: file.name,
                            filesize: file.size,
                            source: 'file'
                        } 
                    }));
                    
                    this.showSuccessMessage(`Image "${file.name}" loaded successfully`);
                    
                } catch (error) {
                    console.error('Error processing image:', error);
                    this.showError('Error processing the image file');
                } finally {
                    this.hideLoadingIndicator();
                }
            };
            
            img.onerror = () => {
                this.hideLoadingIndicator();
                this.showError('Error loading the image file');
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            this.hideLoadingIndicator();
            this.showError('Error reading the file');
        };
        
        reader.readAsDataURL(file);
    }

    // Process image file and convert to ImageData
    processImageFile(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to standard processing dimensions
        canvas.width = 160;
        canvas.height = 120;
        
        // Calculate scaling to maintain aspect ratio
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
            // Image is wider than canvas
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
        } else {
            // Image is taller than canvas
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
        }
        
        // Clear canvas with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw scaled image
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Return ImageData
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Show loading indicator
    showLoadingIndicator() {
        // Create or show loading indicator
        let loader = document.getElementById('fileLoadingIndicator');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'fileLoadingIndicator';
            loader.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    z-index: 1000;
                    text-align: center;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 10px;
                    "></div>
                    Processing image...
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loader);
        }
        
        loader.style.display = 'block';
    }

    // Hide loading indicator
    hideLoadingIndicator() {
        const loader = document.getElementById('fileLoadingIndicator');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Show success message
    showSuccessMessage(message) {
        this.showTemporaryMessage(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showTemporaryMessage(message, 'error');
        console.error('FileHandler Error:', message);
    }

    // Show temporary message
    showTemporaryMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1001;
            max-width: 300px;
            word-wrap: break-word;
            transition: opacity 0.3s ease;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 4000);
    }

    // Get supported file types for display
    getSupportedTypes() {
        return [
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'
        ];
    }

    // Get max file size (in bytes)
    getMaxFileSize() {
        return 10 * 1024 * 1024; // 10MB
    }

    // Validate file size
    validateFileSize(file) {
        return file.size <= this.getMaxFileSize();
    }

    // Clear any active file input
    clearFileInput() {
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.value = '';
        }
    }
}