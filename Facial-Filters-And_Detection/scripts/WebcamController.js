// Clean WebcamController without Background Effects
class WebcamController {
    constructor() {
        this.video = null;
        this.livePreview = null;
        this.previewOverlay = null;
        this.isWebcamActive = false;
        this.isPreviewActive = false;
        this.webcamStream = null;
        
        // Fixed preview dimensions
        this.PREVIEW_WIDTH = 280;
        this.PREVIEW_HEIGHT = 180;
        
        this.setupPreview();
        this.setupEventListeners();
    }

    setupPreview() {
        this.livePreview = document.getElementById('livePreview');
        this.video = document.getElementById('video');
        this.previewOverlay = document.getElementById('previewOverlay');
        
        // Set fixed dimensions for the video element
        if (this.livePreview) {
            this.livePreview.style.width = this.PREVIEW_WIDTH + 'px';
            this.livePreview.style.height = this.PREVIEW_HEIGHT + 'px';
            this.livePreview.style.objectFit = 'cover';
            this.livePreview.style.display = 'block';
        }
        
        // Ensure preview container has relative positioning and fixed size
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            previewContainer.style.position = 'relative';
            previewContainer.style.width = this.PREVIEW_WIDTH + 'px';
            previewContainer.style.height = this.PREVIEW_HEIGHT + 'px';
            previewContainer.style.overflow = 'hidden';
            previewContainer.style.borderRadius = '8px';
        }
    }

    setupEventListeners() {
        const startBtn = document.getElementById('startPreviewBtn');
        const stopBtn = document.getElementById('stopPreviewBtn');
        const captureBtn = document.getElementById('captureBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startPreview());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopPreview());
        }

        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.captureImage());
        }

        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.captureImage();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    if (this.isPreviewActive) {
                        this.stopPreview();
                    } else {
                        this.startPreview();
                    }
                    break;
            }
        });
    }

    async initializeWebcam() {
        try {
            this.webcamStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            
            if (this.video) {
                this.video.srcObject = this.webcamStream;
            }
            
            if (this.livePreview) {
                this.livePreview.srcObject = this.webcamStream;
            }
            
            this.isWebcamActive = true;
            console.log('Webcam initialized successfully');
            
        } catch (error) {
            console.error('Error accessing webcam:', error);
            this.showPreviewError('Unable to access webcam. Please ensure camera permissions are granted.');
            throw error;
        }
    }

    async startPreview() {
        try {
            if (!this.webcamStream) {
                await this.initializeWebcam();
            }
            
            if (this.webcamStream) {
                this.isPreviewActive = true;

                if (this.video) {
                    this.video.play();
                }
                
                if (this.livePreview) {
                    this.livePreview.play();
                }
                
                if (this.previewOverlay) {
                    this.previewOverlay.classList.add('hidden');
                }
                
                this.updateButtonStates();
                console.log('Preview started');
                
                document.dispatchEvent(new CustomEvent('previewStarted'));
            }
        } catch (error) {
            console.error('Error starting preview:', error);
            this.showPreviewError('Failed to start camera preview');
        }
    }

    stopPreview() {
        this.isPreviewActive = false;
        
        if (this.previewOverlay) {
            this.previewOverlay.classList.remove('hidden');
        }
        
        this.updateButtonStates();
        console.log('Preview stopped');
        
        document.dispatchEvent(new CustomEvent('previewStopped'));
    }

    updateButtonStates() {
        const startBtn = document.getElementById('startPreviewBtn');
        const stopBtn = document.getElementById('stopPreviewBtn');
        
        if (startBtn && stopBtn) {
            if (this.isPreviewActive) {
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
            } else {
                startBtn.style.display = 'inline-block';
                stopBtn.style.display = 'none';
            }
        }
    }

    showPreviewError(message) {
        const previewMessage = document.querySelector('.preview-message p');
        if (previewMessage) {
            previewMessage.textContent = message;
            previewMessage.style.color = '#e74c3c';
        }
        
        if (this.previewOverlay) {
            this.previewOverlay.classList.remove('hidden');
        }
    }

    captureImage() {
        if (!this.isWebcamActive || !this.video) {
            console.error('Webcam not ready');
            alert('Webcam not ready. Please start the preview first.');
            return null;
        }
    
        if (this.video.paused || this.video.ended || this.video.readyState < 2) {
            console.error('Video stream is not ready for capture.');
            alert('Video stream is still loading. Please wait a moment and try again.');
            return null;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 160;
        canvas.height = 120;
        
        // Capture from original video
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        console.log('Image captured and scaled to 160x120');
        this.showCaptureSuccess();
        
        document.dispatchEvent(new CustomEvent('imageCaptured', { 
            detail: { imageData } 
        }));
        
        return imageData;
    }

    showCaptureSuccess() {
        const captureBtn = document.getElementById('captureBtn');
        if (!captureBtn) return;
        
        const originalText = captureBtn.textContent;
        
        captureBtn.textContent = 'Captured! ✓';
        captureBtn.style.background = 'linear-gradient(45deg, #27ae60, #229954)';
        
        setTimeout(() => {
            captureBtn.textContent = originalText;
            captureBtn.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
        }, 1500);
    }

    stopWebcam() {
        if (this.webcamStream) {
            this.webcamStream.getTracks().forEach(track => track.stop());
            this.webcamStream = null;
        }
        
        this.isWebcamActive = false;
        this.isPreviewActive = false;
        
        if (this.livePreview) {
            this.livePreview.srcObject = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        this.updateButtonStates();
        console.log('Webcam stopped');
    }

    getStatus() {
        return {
            isWebcamActive: this.isWebcamActive,
            isPreviewActive: this.isPreviewActive,
            hasStream: !!this.webcamStream,
            previewDimensions: `${this.PREVIEW_WIDTH}x${this.PREVIEW_HEIGHT}`
        };
    }

    cleanup() {
        this.stopWebcam();
        
        const startBtn = document.getElementById('startPreviewBtn');
        const stopBtn = document.getElementById('stopPreviewBtn');
        const captureBtn = document.getElementById('captureBtn');
        
        if (startBtn) {
            startBtn.replaceWith(startBtn.cloneNode(true));
        }
        if (stopBtn) {
            stopBtn.replaceWith(stopBtn.cloneNode(true));
        }
        if (captureBtn) {
            captureBtn.replaceWith(captureBtn.cloneNode(true));
        }
    }
}