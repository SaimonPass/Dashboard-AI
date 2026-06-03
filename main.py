from ultralytics import YOLO
import cv2
import time
import os
import threading
from flask import Flask, Response, jsonify
from flask_cors import CORS

# ============================================================
# SAMP ROBO - YOLOv8 AI FEED STREAM SERVER
# ============================================================
#
# Run this file from your Pose_Estimation folder:
#
#   cd ~/Desktop/Pose_Estimation
#   source .venv/bin/activate
#   pip install flask flask-cors ultralytics opencv-python
#   python3 main.py
#
# Browser test:
#
#   http://localhost:8000/health
#   http://localhost:8000/stats
#   http://localhost:8000/video_feed
#
# React dashboard will use:
#
#   http://localhost:8000/video_feed
#
# ============================================================


# ============================================================
# MODEL PATHS
# These match your current file structure
# ============================================================

POSE_MODEL_PATH = "./yolov8n-pose_ncnn_model/"
OBJECT_MODEL_PATH = "./yolov8n_ncnn_model/"
ID_CARD_MODEL_PATH = "./best_ncnn_model/"


# ============================================================
# CAMERA SETTINGS
# ============================================================

CAMERA_INDEX = 0

FRAME_WIDTH = 640
FRAME_HEIGHT = 480
INFERENCE_SIZE = 320


# ============================================================
# CONFIDENCE SETTINGS
# ============================================================

POSE_CONF = 0.55
OBJECT_CONF = 0.50
ID_CARD_CONF = 0.40


# ============================================================
# PERFORMANCE SETTINGS
# Object and ID-card models will run every few frames.
# Pose model runs every frame.
# ============================================================

OBJECT_CHECK_INTERVAL = 8
ID_CARD_CHECK_INTERVAL = 8


# ============================================================
# KEYPOINT SETTINGS
# ============================================================

KEYPOINT_CONF_THRESHOLD = 0.45
FACE_VISIBLE_THRESHOLD = 0.45

FACE_KEYPOINTS = [0, 1, 2, 3, 4]

SELECTED_KEYPOINTS = [
    5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16
]

SKELETON_CONNECTIONS = [
    (5, 7, "Left Upper Arm"),
    (7, 9, "Left Forearm"),
    (6, 8, "Right Upper Arm"),
    (8, 10, "Right Forearm"),

    (11, 13, "Left Thigh"),
    (13, 15, "Left Leg"),
    (12, 14, "Right Thigh"),
    (14, 16, "Right Leg"),
]


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# LIVE STATS FOR REACT DASHBOARD
# ============================================================

latest_stats = {
    "fps": 0.0,
    "status": "starting",
    "person_count": 0,
    "object_count": 0,
    "id_card_count": 0,
    "camera_index": CAMERA_INDEX,
    "frame_width": FRAME_WIDTH,
    "frame_height": FRAME_HEIGHT,
    "last_update": time.time(),
}

stats_lock = threading.Lock()


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def check_model_path(path, name):
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"\n[ERROR] {name} not found at: {path}\n"
            f"Make sure this folder exists inside Pose_Estimation.\n"
            f"Example:\n"
            f"Pose_Estimation/{path}\n"
        )


def load_models():
    check_model_path(POSE_MODEL_PATH, "Pose model")
    check_model_path(OBJECT_MODEL_PATH, "Object model")
    check_model_path(ID_CARD_MODEL_PATH, "ID card model")

    print("[INFO] Loading YOLO models...")

    pose_model = YOLO(POSE_MODEL_PATH, task="pose")
    object_model = YOLO(OBJECT_MODEL_PATH, task="detect")
    id_card_model = YOLO(ID_CARD_MODEL_PATH, task="detect")

    print("[INFO] Models loaded successfully.")

    return pose_model, object_model, id_card_model


def draw_text_with_bg(frame, text, x, y, font_scale=0.45):
    font = cv2.FONT_HERSHEY_SIMPLEX
    thickness = 1

    h, w = frame.shape[:2]

    x = max(0, min(int(x), w - 1))
    y = max(18, min(int(y), h - 1))

    (text_w, text_h), _ = cv2.getTextSize(
        text,
        font,
        font_scale,
        thickness
    )

    cv2.rectangle(
        frame,
        (x, y - text_h - 7),
        (x + text_w + 8, y + 6),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        frame,
        text,
        (x + 4, y),
        font,
        font_scale,
        (0, 255, 255),
        thickness,
        cv2.LINE_AA
    )


def is_face_visible(person_confs):
    visible_face_points = 0

    for idx in FACE_KEYPOINTS:
        if person_confs[idx] > FACE_VISIBLE_THRESHOLD:
            visible_face_points += 1

    return visible_face_points >= 2


def create_error_frame(message):
    frame = cv2.UMat(480, 640, cv2.CV_8UC3).get()
    frame[:] = (18, 18, 18)

    cv2.putText(
        frame,
        "SAMP ROBO - AI FEED ERROR",
        (40, 185),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.85,
        (0, 0, 255),
        2,
        cv2.LINE_AA
    )

    cv2.putText(
        frame,
        str(message)[:75],
        (40, 230),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        1,
        cv2.LINE_AA
    )

    cv2.putText(
        frame,
        "Check terminal logs for details.",
        (40, 265),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (180, 180, 180),
        1,
        cv2.LINE_AA
    )

    return frame


def draw_dashboard_overlay(frame, fps, person_count, object_count, id_card_count):
    h, w = frame.shape[:2]

    cv2.rectangle(frame, (0, 0), (w, 42), (10, 15, 18), -1)

    cv2.putText(
        frame,
        "SAMP ROBO - YOLOv8 AI FEED",
        (12, 27),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )

    right_text = (
        f"FPS {fps:.1f} | "
        f"Person {person_count} | "
        f"Objects {object_count} | "
        f"ID {id_card_count}"
    )

    cv2.putText(
        frame,
        right_text,
        (max(10, w - 455), 27),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.48,
        (0, 255, 180),
        1,
        cv2.LINE_AA
    )


# ============================================================
# LOAD YOLO MODELS
# ============================================================

print("[INFO] Checking and loading models...")
pose_model, object_model, id_card_model = load_models()


# ============================================================
# FRAME GENERATOR FOR FLASK STREAM
# ============================================================

def generate_frames():
    cap = cv2.VideoCapture(CAMERA_INDEX)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print("[ERROR] Could not open camera.")

        with stats_lock:
            latest_stats["status"] = "camera_error"

        error_frame = create_error_frame("Could not open camera.")

        while True:
            ok, buffer = cv2.imencode(".jpg", error_frame)

            if ok:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + buffer.tobytes()
                    + b"\r\n"
                )

            time.sleep(1)

    print("[INFO] Camera started.")
    print("[INFO] YOLO video stream: http://localhost:8000/video_feed")
    print("[INFO] YOLO stats stream: http://localhost:8000/stats")

    frame_count = 0

    cached_object_results = None
    cached_id_card_results = None

    prev_time = time.time()
    fps = 0.0

    while True:
        success, frame = cap.read()

        if not success:
            print("[ERROR] Failed to read from webcam.")

            with stats_lock:
                latest_stats["status"] = "frame_read_error"

            error_frame = create_error_frame("Failed to read from webcam.")
            ok, buffer = cv2.imencode(".jpg", error_frame)

            if ok:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + buffer.tobytes()
                    + b"\r\n"
                )

            continue

        frame_count += 1

        frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
        annotated_frame = frame.copy()

        person_count = 0
        object_count = 0
        id_card_count = 0

        try:
            # --------------------------------------------------------
            # POSE MODEL
            # --------------------------------------------------------
            pose_results = pose_model(
                frame,
                conf=POSE_CONF,
                imgsz=INFERENCE_SIZE,
                verbose=False
            )

            pose_boxes = pose_results[0].boxes
            keypoints = pose_results[0].keypoints

            # --------------------------------------------------------
            # OBJECT MODEL
            # --------------------------------------------------------
            if frame_count % OBJECT_CHECK_INTERVAL == 0:
                cached_object_results = object_model(
                    frame,
                    conf=OBJECT_CONF,
                    imgsz=INFERENCE_SIZE,
                    verbose=False
                )

            # --------------------------------------------------------
            # ID CARD MODEL
            # --------------------------------------------------------
            if frame_count % ID_CARD_CHECK_INTERVAL == 0:
                cached_id_card_results = id_card_model(
                    frame,
                    conf=ID_CARD_CONF,
                    imgsz=INFERENCE_SIZE,
                    verbose=False
                )

            # --------------------------------------------------------
            # POSE KEYPOINTS
            # Only draw arms and legs when face is not visible
            # --------------------------------------------------------
            if keypoints is not None:
                all_keypoints_xy = keypoints.xy
                all_keypoints_conf = keypoints.conf

                if all_keypoints_conf is not None:
                    for person_kpts, person_confs in zip(
                        all_keypoints_xy,
                        all_keypoints_conf
                    ):
                        person_kpts = person_kpts.cpu().numpy()
                        person_confs = person_confs.cpu().numpy()

                        face_visible = is_face_visible(person_confs)

                        if face_visible:
                            continue

                        for start_idx, end_idx, label in SKELETON_CONNECTIONS:
                            x1_k, y1_k = person_kpts[start_idx]
                            x2_k, y2_k = person_kpts[end_idx]

                            conf1 = person_confs[start_idx]
                            conf2 = person_confs[end_idx]

                            if (
                                conf1 > KEYPOINT_CONF_THRESHOLD
                                and conf2 > KEYPOINT_CONF_THRESHOLD
                                and x1_k > 0 and y1_k > 0
                                and x2_k > 0 and y2_k > 0
                            ):
                                cv2.line(
                                    annotated_frame,
                                    (int(x1_k), int(y1_k)),
                                    (int(x2_k), int(y2_k)),
                                    (0, 255, 0),
                                    2
                                )

                                mid_x = int((x1_k + x2_k) / 2)
                                mid_y = int((y1_k + y2_k) / 2)

                                draw_text_with_bg(
                                    annotated_frame,
                                    label,
                                    mid_x,
                                    mid_y
                                )

                        for idx in SELECTED_KEYPOINTS:
                            x_k, y_k = person_kpts[idx]
                            conf = person_confs[idx]

                            if (
                                conf > KEYPOINT_CONF_THRESHOLD
                                and x_k > 0
                                and y_k > 0
                            ):
                                cv2.circle(
                                    annotated_frame,
                                    (int(x_k), int(y_k)),
                                    3,
                                    (0, 0, 255),
                                    -1
                                )

            # --------------------------------------------------------
            # PERSON BOXES
            # --------------------------------------------------------
            if pose_boxes is not None:
                person_count = len(pose_boxes)

                for box in pose_boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])

                    cv2.rectangle(
                        annotated_frame,
                        (x1, y1),
                        (x2, y2),
                        (255, 0, 0),
                        2
                    )

                    cv2.putText(
                        annotated_frame,
                        f"Person {conf:.2f}",
                        (x1, max(55, y1 - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.45,
                        (255, 0, 0),
                        1,
                        cv2.LINE_AA
                    )

            # --------------------------------------------------------
            # GENERAL OBJECT DETECTION
            # --------------------------------------------------------
            if cached_object_results is not None:
                object_boxes = cached_object_results[0].boxes

                if object_boxes is not None:
                    for box in object_boxes:
                        cls_id = int(box.cls[0])
                        conf = float(box.conf[0])
                        class_name = object_model.names[cls_id]

                        # Person is handled by pose model.
                        # Cell phone is ignored because ID cards can be misread.
                        if class_name in ["person", "cell phone"]:
                            continue

                        object_count += 1

                        x1, y1, x2, y2 = map(int, box.xyxy[0])

                        cv2.rectangle(
                            annotated_frame,
                            (x1, y1),
                            (x2, y2),
                            (0, 165, 255),
                            2
                        )

                        cv2.putText(
                            annotated_frame,
                            f"{class_name} {conf:.2f}",
                            (x1, max(55, y1 - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.45,
                            (0, 165, 255),
                            1,
                            cv2.LINE_AA
                        )

            # --------------------------------------------------------
            # ID CARD DETECTION
            # --------------------------------------------------------
            if cached_id_card_results is not None:
                id_card_boxes = cached_id_card_results[0].boxes

                if id_card_boxes is not None:
                    for box in id_card_boxes:
                        cls_id = int(box.cls[0])
                        conf = float(box.conf[0])
                        class_name = id_card_model.names[cls_id]

                        id_card_count += 1

                        x1, y1, x2, y2 = map(int, box.xyxy[0])

                        cv2.rectangle(
                            annotated_frame,
                            (x1, y1),
                            (x2, y2),
                            (0, 255, 255),
                            2
                        )

                        cv2.putText(
                            annotated_frame,
                            f"{class_name} {conf:.2f}",
                            (x1, max(55, y1 - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5,
                            (0, 255, 255),
                            2,
                            cv2.LINE_AA
                        )

            # --------------------------------------------------------
            # FPS CALCULATION
            # --------------------------------------------------------
            current_time = time.time()
            time_diff = current_time - prev_time

            if time_diff > 0:
                fps = 1.0 / time_diff

            prev_time = current_time

            draw_dashboard_overlay(
                annotated_frame,
                fps,
                person_count,
                object_count,
                id_card_count
            )

            with stats_lock:
                latest_stats["fps"] = round(float(fps), 2)
                latest_stats["status"] = "running"
                latest_stats["person_count"] = int(person_count)
                latest_stats["object_count"] = int(object_count)
                latest_stats["id_card_count"] = int(id_card_count)
                latest_stats["last_update"] = time.time()

        except Exception as error:
            print(f"[ERROR] Inference failed: {error}")

            annotated_frame = create_error_frame(str(error))

            with stats_lock:
                latest_stats["status"] = "inference_error"

        ok, buffer = cv2.imencode(
            ".jpg",
            annotated_frame,
            [int(cv2.IMWRITE_JPEG_QUALITY), 80]
        )

        if not ok:
            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + buffer.tobytes()
            + b"\r\n"
        )


# ============================================================
# FLASK ROUTES
# ============================================================

@app.route("/")
def index():
    return jsonify({
        "app": "SAMP ROBO YOLO Stream Server",
        "video_feed": "http://localhost:8000/video_feed",
        "stats": "http://localhost:8000/stats",
        "health": "http://localhost:8000/health"
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/stats")
def stats():
    with stats_lock:
        return jsonify(dict(latest_stats))


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":
    print("[INFO] Starting Flask YOLO stream server...")
    print("[INFO] Dashboard feed URL: http://localhost:8000/video_feed")
    print("[INFO] Dashboard stats URL: http://localhost:8000/stats")
    print("[INFO] Health check URL: http://localhost:8000/health")

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False,
        threaded=True
    )