import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

interface FaceRegistrationProps {
  onSuccess: (descriptor: string) => void;
  onCancel: () => void;
}

export const FaceRegistration: React.FC<FaceRegistrationProps> = ({ onSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>('Đang tải mô hình AI...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        setStatus('Vui lòng nhìn thẳng vào camera...');
        startVideo();
      } catch (err) {
        setStatus('Lỗi tải mô hình AI. Vui lòng thử lại.');
      }
    };
    loadModels();

    return () => {
      stopVideo();
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(currentStream => {
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      })
      .catch(err => {
        setStatus('Không thể mở camera. Vui lòng cấp quyền.');
      });
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureFace = async () => {
    if (!videoRef.current) return;
    setStatus('Đang phân tích khuôn mặt...');
    
    const detection = await faceapi.detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setDescriptor(detection.descriptor);
      setStatus('✅ Quét khuôn mặt thành công!');
    } else {
      setStatus('❌ Không tìm thấy khuôn mặt! Hãy thử lại.');
    }
  };

  const handleSave = () => {
    if (descriptor) {
      const arr = Array.from(descriptor);
      onSuccess(JSON.stringify(arr));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 rounded-xl overflow-hidden bg-gray-200 border-4 border-[#003d9b] shadow-inner flex items-center justify-center">
        {!modelsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d9b]"></div>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          className="object-cover w-full h-full"
        />
      </div>
      
      <p className="mt-4 text-[14px] font-semibold text-[#041b3c] text-center min-h-[40px] px-4">
        {status}
      </p>
      
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={() => { stopVideo(); onCancel(); }}
          className="px-5 py-2.5 border border-[#c3c6d6] text-[#434654] font-bold rounded-lg hover:bg-gray-50"
        >
          Hủy
        </button>

        {!descriptor ? (
          <button
            type="button"
            onClick={captureFace}
            disabled={!modelsLoaded}
            className="px-5 py-2.5 bg-[#003d9b] text-white font-bold rounded-lg hover:bg-[#0052cc] disabled:opacity-50"
          >
            Chụp khuôn mặt
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
          >
            Lưu dữ liệu sinh trắc
          </button>
        )}
      </div>
    </div>
  );
};
