# SmartVision Access System

An AI-powered real-time identity verification system that automatically detects and decodes QR codes and barcodes 
from uploaded images. Built with a Python FastAPI backend for computer vision processing and a Node.js + Express frontend server, 
the system provides a clean web interface for scanning and logging access events.

---

## Features

- **QR Code and Barcode Detection** — automatically decodes QR codes, barcodes, and multiple code types in a single image using OpenCV and Pyzbar
- **Real-Time Image Processing** — uploads and processes images instantly via a REST API
- **FastAPI Backend** — async request handling with structured JSON responses, input validation, and error management
- **Node.js Frontend Server** — Express-based middleware that bridges the HTML frontend to the Python backend
- **Multi-Code Support** — detects multiple codes in a single scan and returns all results
- **CORS Enabled** — ready for cross-origin requests from any frontend
- **File Validation** — handles empty files and invalid images gracefully with descriptive error responses

---

## System Architecture

```
Browser (HTML/CSS/JS)
        ↓  HTTP Request (image upload)
Node.js + Express Server (server.js)
        ↓  Forwards image via axios + form-data
FastAPI Python Backend (backend.py)
        ↓  OpenCV + Pyzbar decode
        ↑  JSON response with scan results
```

---

## Project Structure

```
SmartVision-Access-System/
├── frontend/
│   └── public/              # HTML, CSS, JS frontend files
├── node_modules/            # Node.js dependencies
├── backend.py               # FastAPI backend — image processing and barcode decoding
├── server.js                # Node.js/Express server — frontend serving and API proxy
├── package.json             # Node.js dependencies and scripts
├── package-lock.json        # Locked dependency versions
└── README.md
```

---

## Requirements

### Python Backend
- Python 3.7 or higher
- pip

### Node.js Frontend Server
- Node.js 14 or higher
- npm

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/eyyVince/SmartVision-Access-System.git
cd SmartVision-Access-System
```

---

### 2. Set Up the Python Backend

**Install Python dependencies:**

```bash
pip install fastapi uvicorn opencv-python pyzbar numpy python-multipart
```

> On some systems, Pyzbar requires the `zbar` shared library. Install it with:
> - **Ubuntu/Debian:** `sudo apt-get install libzbar0`
> - **macOS:** `brew install zbar`
> - **Windows:** Pyzbar typically works out of the box; if not, install [ZBar binaries](http://zbar.sourceforge.net/download.html)

**Start the FastAPI server:**

```bash
uvicorn backend:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

---

### 3. Set Up the Node.js Frontend Server

**Install Node.js dependencies:**

```bash
npm install
```

**Start the Node.js server:**

```bash
node server.js
```

The frontend will be available at `http://localhost:3000` (or the port defined in `server.js`)

---

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Upload an image containing a QR code or barcode using the scan interface
3. The frontend sends the image to the Node.js server, which forwards it to the FastAPI backend
4. The backend processes the image with OpenCV and Pyzbar and returns the decoded results
5. Results are displayed on the page showing the code type and decoded data

---

## API Reference

### POST `/scan`

Accepts an image file and returns all decoded QR codes and barcodes found in the image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` — image file (JPEG, PNG, etc.)

**Success Response:**
```json
{
  "status": "success",
  "count": 2,
  "results": [
    {
      "type": "QRCODE",
      "data": "https://example.com",
      "confidence": 1.0
    },
    {
      "type": "EAN13",
      "data": "1234567890123",
      "confidence": 1.0
    }
  ]
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Invalid image"
}
```

**Error Cases:**
- Empty file uploaded → `"Empty file"`
- Invalid or corrupted image → `"Invalid image"`
- Unexpected server error → returns exception message

---

## Tech Stack

| Layer | Technology |
|---|---|
| Computer Vision | OpenCV (`cv2`) |
| Barcode / QR Decoding | Pyzbar |
| Python Backend | FastAPI, Uvicorn |
| Image Processing | NumPy |
| Frontend Server | Node.js, Express |
| HTTP Client (proxy) | Axios, form-data |
| File Upload Handling | Multer |
| Frontend | HTML5, CSS3, JavaScript |

---

## Dependencies

### Python (`backend.py`)
| Package | Purpose |
|---|---|
| `fastapi` | REST API framework |
| `uvicorn` | ASGI server for FastAPI |
| `opencv-python` | Image loading and preprocessing |
| `pyzbar` | QR code and barcode decoding |
| `numpy` | Image array processing |
| `python-multipart` | File upload support for FastAPI |

### Node.js (`package.json`)
| Package | Purpose |
|---|---|
| `express` | Frontend web server and routing |
| `axios` | HTTP client to proxy requests to FastAPI |
| `multer` | Middleware for handling file uploads |
| `form-data` | Constructs multipart form data for API forwarding |

---

## Troubleshooting

**`ImportError: Unable to find zbar shared library`**
- Linux: `sudo apt-get install libzbar0`
- macOS: `brew install zbar`
- Windows: Download and install ZBar from the official site

**`ModuleNotFoundError: No module named 'cv2'`**
```bash
pip install opencv-python
```

**`Cannot find module 'express'`**
```bash
npm install
```

**Backend returns `"Invalid image"`**
- Make sure the uploaded file is a valid image format (JPEG, PNG, BMP, WebP)
- Ensure the file is not corrupted or zero bytes

**No results returned but image is valid**
- The image may not contain a detectable QR code or barcode
- Try a higher resolution image with better contrast and lighting
- Ensure the barcode is not obscured or partially cut off

**CORS errors in browser**
- The FastAPI backend has CORS enabled for all origins by default
- If issues persist, check that the backend is running on port `8000`

---

## How It Works

1. The user uploads an image via the HTML frontend
2. The Node.js Express server receives the file using Multer and forwards it to the FastAPI backend using Axios and form-data
3. FastAPI reads the uploaded file bytes and converts them into a NumPy array using `np.frombuffer`
4. OpenCV decodes the array into an image and converts it to grayscale for better detection accuracy
5. Pyzbar scans the grayscale image and decodes all QR codes and barcodes found
6. The results are returned as a structured JSON response with the code type and decoded data
7. The frontend displays the results to the user in real time

---

## Author

**Vincent Bernaldo**
- GitHub: [@eyyVince](https://github.com/eyyVince)
- Portfolio: [webportfolio-amber-theta.vercel.app](https://webportfolio-amber-theta.vercel.app)
- Source: [github.com/eyyVince/SmartVision-Access-System](https://github.com/eyyVince/SmartVision-Access-System)
