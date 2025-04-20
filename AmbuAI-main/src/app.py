from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- Make sure this line is present
import cv2
import numpy as np
import pytesseract

app = Flask(__name__)
CORS(app)  # <-- Make sure this line is present

# Configure paths
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
image_path = r"94908534.webp"

@app.route('/detect', methods=['POST'])  # Create a new endpoint
def detect_ambulance():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    image_path = "uploaded_image.webp"  # Save the uploaded image temporarily
    file.save(image_path)

    # Load image
    image = cv2.imread(image_path)
    if image is None:
        return jsonify({'error': 'Image not found or corrupted'}), 400

    # Convert color spaces
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Balanced color detection ranges
    red_lower1 = np.array([0, 120, 70])  # Slightly relaxed saturation
    red_upper1 = np.array([10, 255, 255])
    red_lower2 = np.array([170, 120, 70])
    red_upper2 = np.array([180, 255, 255])
    red_mask = cv2.inRange(hsv, red_lower1, red_upper1) + cv2.inRange(hsv, red_lower2, red_upper2)

    white_mask = cv2.inRange(hsv, np.array([0, 0, 200]), np.array([180, 50, 255]))  # Bright whites
    blue_mask = cv2.inRange(hsv, np.array([90, 100, 50]), np.array([140, 255, 200]))  # Emergency blue

    combined_mask = cv2.bitwise_or(red_mask, cv2.bitwise_or(white_mask, blue_mask))

    # Smart morphological operations
    kernel = np.ones((3,3), np.uint8)
    combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # Adaptive contour detection
    contours, _ = cv2.findContours(combined_mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    ambulance_candidates = []

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 4000 or area > 80000:  # Adjusted size range
            continue
        
        x, y, w, h = cv2.boundingRect(cnt)
        aspect_ratio = w / h
        
        # Vehicle-like proportions with tolerance
        if not (1.4 < aspect_ratio < 2.3):
            continue
        
        # Verify color distribution
        roi = image[y:y+h, x:x+w]
        hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        
        red_pixels = cv2.inRange(hsv_roi, red_lower1, red_upper1) + cv2.inRange(hsv_roi, red_lower2, red_upper2)
        white_pixels = cv2.inRange(hsv_roi, np.array([0, 0, 200]), np.array([180, 50, 255]))
        blue_pixels = cv2.inRange(hsv_roi, np.array([90, 100, 50]), np.array([140, 255, 200]))
        
        emergency_pixels = np.sum((red_pixels + white_pixels + blue_pixels)/255)
        total_pixels = w * h
        
        if emergency_pixels / total_pixels < 0.15:  # At least 15% emergency colors
            continue
        
        ambulance_candidates.append((x, y, w, h, emergency_pixels/total_pixels))

    # Sort candidates by emergency color percentage
    ambulance_candidates.sort(key=lambda x: x[4], reverse=True)

    # Enhanced text verification with fallback
    emergency_keywords = ["AMBULANCE", "EMS", "RESCUE", "911", "MEDIC"]
    text_detected = False
    best_text_conf = 0

    for (x, y, w, h, _) in ambulance_candidates[:2]:  # Check top 2 candidates
        roi = gray[y:y+h, x:x+w]
        
        # Multi-stage preprocessing
        roi = cv2.GaussianBlur(roi, (3, 3), 0)
        roi = cv2.medianBlur(roi, 3)
        _, roi = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Try multiple OCR configurations
        text = pytesseract.image_to_string(roi, config='--psm 7 --oem 1').strip().upper()
        data = pytesseract.image_to_data(roi, output_type=pytesseract.Output.DICT, config='--psm 6')
        
        for i, word in enumerate(data['text']):
            conf = int(data['conf'][i])
            word = word.strip().upper()
            if conf > best_text_conf and any(keyword in word for keyword in emergency_keywords):
                best_text_conf = conf
                text_detected = True
                cv2.putText(image, f"{word} ({conf}%)", (x, y-10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,255), 2)
                break

    # Smart template matching
    symbol_found = False
    symbol_templates = ["red_cross.png", "star_of_life.jpg"]

    for template_file in symbol_templates:
        try:
            template = cv2.imread(template_file, 0)
            if template is None:
                continue
            
            # Dynamic scaling
            for scale in [0.6, 0.8, 1.0]:
                resized = cv2.resize(template, None, fx=scale, fy=scale)
                if resized.shape[0] > gray.shape[0] or resized.shape[1] > gray.shape[1]:
                    continue
                
                res = cv2.matchTemplate(gray, resized, cv2.TM_CCOEFF_NORMED)
                _, max_val, _, max_loc = cv2.minMaxLoc(res)
                
                # Verify symbol is near a candidate region
                if max_val > 0.82:
                    for (x,y,w,h,_) in ambulance_candidates[:2]:  # Check against top candidates
                        if (x-w/2 < max_loc[0] < x+w*1.5 and 
                            y-h/2 < max_loc[1] < y+h*1.5):
                            symbol_found = True
                            cv2.rectangle(image, max_loc, 
                                         (max_loc[0]+resized.shape[1], max_loc[1]+resized.shape[0]),
                                         (255,0,0), 2)
                            break
        except Exception as e:
            print(f"Error processing {template_file}: {e}")

    # Final decision with adaptive thresholds
    ambulance_detected = False
    if ambulance_candidates:
        top_candidate = ambulance_candidates[0]
        
        # Score-based detection
        score = 0
        if text_detected and best_text_conf > 70:
            score += 1
        if symbol_found:
            score += 1
        if top_candidate[4] > 0.25:  # High color percentage
            score += 1
        if np.sum(blue_mask[top_candidate[1]:top_candidate[1]+top_candidate[3], 
                  top_candidate[0]:top_candidate[0]+top_candidate[2]]) > 3000:
            score += 1
        
        if score >= 2:  # Require at least 2 positive indicators
            ambulance_detected = True

    # Return the result as JSON
    # Encode the result image as base64 and include it in the response
    import base64
    _, buffer = cv2.imencode('.jpg', image)
    img_bytes = buffer.tobytes()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    return jsonify({
        'ambulance_detected': ambulance_detected,
        'result_image': img_base64
    })

if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app