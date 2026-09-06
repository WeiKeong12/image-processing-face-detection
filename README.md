# Advanced Image Processing

A browser-based computer vision application for real-time face detection, image filters, and color-space threshold analysis. Capture images from a webcam or upload your own, then explore RGB channels, HSV and YCbCr color spaces, threshold analysis, and face-tracked overlays.

## Features

- Live webcam preview and image capture
- Drag-and-drop or file-picker image upload (JPEG, PNG, GIF, WebP, BMP)
- Grayscale, blur, color shift, and pixelate face filters
- Built-in overlays (dog ears, cat ears, sunglasses, crown) tracked to detected face position
- Custom PNG overlay upload with adjustable position and scale
- RGB channel separation with individual threshold sliders
- HSV and YCbCr color space conversion with threshold sliders
- Real-time face detection

## How to Use

1. Click "Start Preview" to enable your webcam, or upload an image using the file picker or drag-and-drop.
2. Click "Capture Image" (or press Space/Enter) to process the current frame.
3. Use the sidebar controls to apply face filters (keys 1-4), built-in overlays (keys 5-8), or upload a custom PNG overlay.
4. Adjust the threshold sliders under each channel/color-space canvas to see live threshold analysis.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space / Enter | Capture image |
| P | Toggle camera preview |
| 1 | Grayscale filter |
| 2 | Blur filter |
| 3 | Color shift filter |
| 4 | Pixelate filter |
| 5 | Dog ears overlay |
| 6 | Cat ears overlay |
| 7 | Sunglasses overlay |
| 8 | Crown overlay |

## Built With

- p5.js — canvas rendering and image processing
- ml5.js — face detection model
- Vanilla JavaScript (ES6 classes) — application logic
- HTML5 Canvas API — pixel-level image manipulation

## Running Locally

Since this app uses the webcam and loads local scripts, serve it with a local server rather than opening `index.html` directly:

```
npx http-server .
```

Then open the served address in your browser and grant camera permissions when prompted.

## Project Structure

```
├── index.html                  # Entry point and UI layout
├── styles.css                  # Application styling
└── scripts/
    ├── helper-api/
    │   └── p5.min.js            # p5.js library
    ├── FaceDetector.js          # Face detection logic (ml5.js integration)
    ├── FaceFilters.js           # Grayscale, blur, color shift, pixelate filters
    ├── FileHandler.js           # File upload and drag-and-drop handling
    ├── ImageProcessing.js       # Core pixel-level image processing utilities
    ├── ImageProcessor.js        # Orchestrates channel separation and color-space conversion
    └── WebcamController.js      # Webcam preview and image capture
```

## Notes

This project was built as an exercise in computer vision and graphics programming fundamentals, covering pixel manipulation, color space conversion, and face detection in the browser.

## License

This project is licensed under the MIT License.
