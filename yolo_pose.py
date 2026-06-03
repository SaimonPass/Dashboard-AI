from ultralytics import YOLO
import cv2

# Load YOLO pose model
model = YOLO("yolov8n-pose.pt")

# Use webcam: 0
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run pose detection
    results = model(frame, conf=0.5)

    # Draw skeleton and keypoints
    annotated_frame = results[0].plot()

    cv2.imshow("YOLO Pose Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
