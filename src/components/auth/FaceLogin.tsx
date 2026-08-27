import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Employee } from '../../types';

interface FaceLoginProps {
  employees: Employee[];
  onSuccess: (empId: string) => void;
  onCancel: () => void;
}

export const FaceLogin: React.FC<FaceLoginProps> = ({ employees, onSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>('Đang tải mô hình AI...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Convert face descriptors to labeled descriptors
  const labeledDescriptors = React.useMemo(() => {
    return employees
      .filter(e => e.faceDescriptor)
      .map(e => {
        try {
          const arr = JSON.parse(e.faceDescriptor!);
          const float32Arr = new Float32Array(arr);
          return new faceapi.LabeledFaceDescriptors(e.id, [float32Arr]);
        } catch (err) {
          console.error("Invalid descriptor for", e.name);
          return null;
        }
      })
      .filter(Boolean) as faceapi.LabeledFaceDescriptors[];
  }, [employees]);

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
        setStatus('Đang bật camera...');
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

  const handleVideoPlay = () => {
    setStatus('Đang quét khuôn mặt...');
    
    if (labeledDescriptors.length === 0) {
      setStatus('Chưa có nhân viên nào đăng ký khuôn mặt.');
      setTimeout(onCancel, 3000);
      return;
    }

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);

    const scanInterval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        if (bestMatch.label !== 'unknown') {
          clearInterval(scanInterval);
          stopVideo();
          setStatus('Thành công! Đang đăng nhập...');
          setTimeout(() => {
            onSuccess(bestMatch.label);
          }, 1000);
        } else {
          setStatus('Không nhận ra khuôn mặt. Hãy đưa mặt vào giữa khung hình.');
        }
      } else {
        setStatus('Đang tìm khuôn mặt...');
      }
    }, 1000); // scan every 1 second

    return () => clearInterval(scanInterval);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 rounded-full overflow-hidden bg-gray-200 border-4 border-[#003d9b] shadow-inner flex items-center justify-center">
        {!modelsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d9b]"></div>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          onPlay={handleVideoPlay}
          className="object-cover w-full h-full"
        />
      </div>
      
      <p className="mt-6 text-[15px] font-semibold text-[#041b3c] text-center min-h-[40px]">
        {status}
      </p>
      
      <button
        type="button"
        onClick={() => { stopVideo(); onCancel(); }}
        className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#434654] font-bold rounded-lg transition-colors"
      >
        Hủy & Đăng nhập bằng Mật khẩu
      </button>
    </div>
  );
};
