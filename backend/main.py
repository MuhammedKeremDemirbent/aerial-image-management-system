import io
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="Plant Disease Detection API")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "best.pt")

try:
    model = YOLO(model_path)
    print(f"Model successfully loaded from {model_path}")
    print(f"Model classes: {model.names}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.get("/")
def read_root():
    return {
        "status": "running", 
        "model_loaded": model is not None,
        "model_classes": model.names if model else {}
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not loaded on server."}
        
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    
    print(f"\n--- Yeni Tahmin İsteği: {file.filename} ---")
    
    # Run inference
    results = model(image)
    print(f"Model Sonuçları (Results): {results}")
    
    detections = []
    summary = {}
    
    # Extract results
    for r in results:
        # Object detection boxes
        if hasattr(r, "boxes") and len(r.boxes) > 0:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                cls_name = model.names[cls_id]
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "confidence": conf,
                    "class_name": cls_name
                })
                
                # Build summary counts
                summary[cls_name] = summary.get(cls_name, 0) + 1
                
        # Classification probabilities (if it's a classification model)
        elif hasattr(r, "probs") and r.probs is not None:
            top_class_id = int(r.probs.top1)
            top_class_name = r.names[top_class_id]
            top_conf = float(r.probs.top1conf)
            
            detections.append({
                "confidence": top_conf,
                "class_name": top_class_name
            })
            summary[top_class_name] = 1

    # Determine dominant disease
    dominant_disease = "Healthy"
    max_conf = 0.0
    
    if detections:
        for det in detections:
            if det.get("confidence", 0.0) > max_conf:
                max_conf = det.get("confidence", 0.0)
                dominant_disease = det["class_name"]

    print(f"Çıkarılan Tespitler (Detections): {detections}")
    print(f"Baskın Durum (Dominant): {dominant_disease} (Güven: {max_conf})")

    return {
        "detections": detections,
        "summary": summary,
        "dominant_disease": dominant_disease,
        "max_confidence": max_conf,
        "image_width": image.width,
        "image_height": image.height
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
