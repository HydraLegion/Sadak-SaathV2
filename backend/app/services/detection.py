"""
Sadak Saathi — Detection Service
YOLOv8-based pothole detection pipeline
"""
import io
import cv2
import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO
from typing import BinaryIO
import logging

logger = logging.getLogger(__name__)


class DetectionService:
    """YOLOv8-based pothole detection service."""

    def __init__(self, model_path: str, confidence_threshold: float = 0.7):
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

    def load_model(self) -> None:
        """Load YOLO model."""
        if self.model is None:
            logger.info(f"Loading YOLO model from {self.model_path} on {self.device}")
            self.model = YOLO(self.model_path)
            if self.device == 'cuda':
                self.model.to(self.device)
            logger.info("YOLO model loaded successfully")

    def detect_from_bytes(self, image_bytes: bytes) -> dict:
        """
        Detect potholes from image bytes.

        Returns:
            dict with detection results including bounding boxes,
            confidence scores, and severity classification.
        """
        if self.model is None:
            self.load_model()

        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Run inference
        results = self.model.predict(
            image_rgb,
            conf=self.confidence_threshold,
            verbose=False,
            device=self.device
        )

        # Parse results
        detections = []
        severity_scores = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}

        for result in results:
            boxes = result.boxes
            for box in boxes:
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].cpu().numpy()
                x, y, w, h = xyxy[2] - xyxy[0], xyxy[3] - xyxy[1], xyxy[2] - xyxy[0], xyxy[3] - xyxy[1]

                # Calculate severity based on size and confidence
                area = (xyxy[2] - xyxy[0]) * (xyxy[3] - xyxy[1])
                severity = self._calculate_severity(area, conf)

                detections.append({
                    'x': float(xyxy[0]),
                    'y': float(xyxy[1]),
                    'width': float(w),
                    'height': float(h),
                    'confidence': conf,
                    'class': 'pothole',
                    'severity': severity
                })

                severity_scores[severity] += conf

        return {
            'detections': detections,
            'count': len(detections),
            'severity_scores': severity_scores,
            'avg_confidence': np.mean([d['confidence'] for d in detections]) if detections else 0,
            'device': self.device
        }

    def _calculate_severity(self, area: float, confidence: float) -> str:
        """
        Calculate severity based on pothole area and detection confidence.

        Area thresholds (normalized to 720p):
        - Critical: > 50000 pixels (~10cm diameter on road)
        - High: > 20000 pixels
        - Medium: > 5000 pixels
        - Low: < 5000 pixels
        """
        normalized_area = area / (720 * 1280)  # Normalize to standard resolution

        score = (normalized_area * 0.6) + (confidence * 0.4)

        if normalized_area > 0.1 or score > 0.85:
            return 'critical'
        elif normalized_area > 0.04 or score > 0.7:
            return 'high'
        elif normalized_area > 0.01 or score > 0.5:
            return 'medium'
        else:
            return 'low'

    def extract_frames(self, video_stream: BinaryIO, sample_rate: int = 2) -> list:
        """
        Extract frames from video at specified sample rate.

        Args:
            video_stream: Video file stream
            sample_rate: Extract every N frames

        Returns:
            List of frames as numpy arrays
        """
        cap = cv2.VideoCapture(video_stream)
        frames = []
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_rate == 0:
                frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            frame_idx += 1

        cap.release()
        return frames

    def detect_video(self, video_stream: BinaryIO, sample_rate: int = 2) -> dict:
        """
        Detect potholes throughout a video.

        Returns aggregated detection results across all sampled frames.
        """
        frames = self.extract_frames(video_stream, sample_rate)
        all_detections = []
        aggregated_severity = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}

        for frame in frames:
            result = self.detect_from_bytes(cv2.imencode('.jpg', frame)[1].tobytes())
            all_detections.extend(result['detections'])

            for severity, score in result['severity_scores'].items():
                aggregated_severity[severity] += score

        return {
            'detections': all_detections,
            'frame_count': len(frames),
            'total_detections': len(all_detections),
            'severity_scores': aggregated_severity,
            'avg_confidence': np.mean([d['confidence'] for d in all_detections]) if all_detections else 0
        }


# Global instance (lazy loaded)
_detection_service: DetectionService | None = None


def get_detection_service() -> DetectionService:
    """Get or create the detection service singleton."""
    global _detection_service
    if _detection_service is None:
        from flask import current_app
        model_path = current_app.config.get('YOLO_MODEL_PATH', 'models/yolov8n-pothole.pt')
        threshold = current_app.config.get('YOLO_CONFIDENCE_THRESHOLD', 0.7)
        _detection_service = DetectionService(model_path, threshold)
    return _detection_service
