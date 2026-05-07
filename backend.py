from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
from pyzbar.pyzbar import decode
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scan")
async def scan(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        if not contents:
            return {"status": "error", "message": "Empty file"}

        npimg = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        if img is None:
            return {"status": "error", "message": "Invalid image"}

        results = []

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        decoded_objects = decode(gray)

        for obj in decoded_objects:
            results.append({
                "type": obj.type,
                "data": obj.data.decode("utf-8"),
                "confidence": 1.0  # placeholder (pyzbar doesn't provide confidence)
            })

        return {
            "status": "success",
            "count": len(results),
            "results": results
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }