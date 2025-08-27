'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera,
  RotateCcw,
  FlashOn,
  FlashOff,
  SwitchCamera,
  X,
  Check,
  Upload,
  Smartphone,
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/stores/app';

interface MobileCameraUploadProps {
  onCapture?: (imageBlob: Blob, imageUrl: string) => void;
  onUploadSuccess?: (result: any) => void;
  onClose?: () => void;
  className?: string;
  projectId?: string;
}

export function MobileCameraUpload({
  onCapture,
  onUploadSuccess,
  onClose,
  className = '',
  projectId
}: MobileCameraUploadProps) {
  const [isActive, setIsActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState<Array<{ blob: Blob; url: string; id: string }>>([]);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addNotification, apiKey } = useAppStore();

  // Check if device supports camera
  const [isMobile, setIsMobile] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword));
    };

    setIsMobile(checkMobile());

    // Check camera availability
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setHasCamera(videoDevices.length > 0);
        })
        .catch(() => setHasCamera(false));
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentCamera,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setIsActive(true);
    } catch (error) {
      console.error('Camera access error:', error);
      addNotification({
        type: 'error',
        title: 'Camera Access Error',
        message: 'Unable to access camera. Please check permissions.',
      });
    }
  }, [currentCamera, addNotification]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newImage = { blob, url: imageUrl, id: imageId };
        setCapturedImages(prev => [...prev, newImage]);
        onCapture?.(blob, imageUrl);
        
        addNotification({
          type: 'success',
          title: 'Image Captured',
          message: 'Lab note image captured successfully',
        });
        
        // Enter preview mode
        setPreviewMode(true);
        setSelectedImageIndex(capturedImages.length);
      }
    }, 'image/jpeg', 0.9);
  }, [capturedImages.length, onCapture, addNotification]);

  const deleteImage = useCallback((index: number) => {
    setCapturedImages(prev => {
      const newImages = [...prev];
      // Revoke URL to free memory
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
    
    if (selectedImageIndex >= capturedImages.length - 1) {
      setSelectedImageIndex(Math.max(0, capturedImages.length - 2));
    }
    
    if (capturedImages.length === 1) {
      setPreviewMode(false);
    }
  }, [capturedImages.length, selectedImageIndex]);

  const switchCamera = useCallback(() => {
    setCurrentCamera(prev => prev === 'user' ? 'environment' : 'user');
    if (isActive) {
      stopCamera();
      // Restart with new camera after a brief delay
      setTimeout(startCamera, 100);
    }
  }, [isActive, stopCamera, startCamera]);

  const processImages = useCallback(async () => {
    if (capturedImages.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Create FormData with captured images
      const formData = new FormData();
      capturedImages.forEach((image, index) => {
        formData.append('images', image.blob, `captured_image_${index}.jpg`);
      });
      
      if (projectId) {
        formData.append('project_id', projectId);
      }

      // In a real implementation, you would send to your API
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        success: true,
        processed_images: capturedImages.length,
        results: capturedImages.map((img, index) => ({
          filename: `captured_image_${index}.jpg`,
          confidence: 85 + Math.random() * 10,
          text: `Sample OCR text from captured image ${index + 1}`
        }))
      };

      onUploadSuccess?.(mockResult);
      
      addNotification({
        type: 'success',
        title: 'Processing Complete',
        message: `${capturedImages.length} image(s) processed successfully`,
      });

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImages, projectId, onUploadSuccess, addNotification]);

  const handleClose = useCallback(() => {
    stopCamera();
    // Clean up captured image URLs
    capturedImages.forEach(img => URL.revokeObjectURL(img.url));
    setCapturedImages([]);
    onClose?.();
  }, [stopCamera, capturedImages, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      capturedImages.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [stopCamera, capturedImages]);

  if (!hasCamera) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <Smartphone className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Not Available</h3>
        <p className="text-gray-600 mb-4">
          Camera access is not available on this device or browser.
        </p>
        <p className="text-sm text-gray-500">
          Try using the standard file upload instead.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`}>
      {/* Camera View */}
      <div className="relative aspect-[4/3] bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Camera Controls Overlay */}
        {isActive && !previewMode && (
          <div className="absolute inset-0 flex flex-col">
            {/* Top Controls */}
            <div className="flex justify-between items-center p-4">
              <button
                onClick={handleClose}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  className={`p-2 rounded-full transition-all ${
                    flashEnabled 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                  }`}
                >
                  {flashEnabled ? <FlashOn className="w-5 h-5" /> : <FlashOff className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={switchCamera}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Guidelines */}
            <div className="flex-1 flex items-center justify-center">
              <div className="border-2 border-white border-dashed rounded-lg w-3/4 h-3/4 opacity-30">
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white text-sm">Position your lab note here</p>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center p-6">
              <div className="w-16 h-16 flex items-center justify-center">
                <span className="text-white text-sm">
                  {capturedImages.length}/3
                </span>
              </div>
              
              <button
                onClick={captureImage}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                disabled={capturedImages.length >= 3}
              >
                <div className="w-12 h-12 border-4 border-gray-300 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-600" />
                </div>
              </button>
              
              <div className="w-16 h-16 flex items-center justify-center">
                {capturedImages.length > 0 && (
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white"
                  >
                    <img
                      src={capturedImages[capturedImages.length - 1].url}
                      alt="Last captured"
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Mode */}
      <AnimatePresence>
        {previewMode && capturedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          >
            <div className="h-full flex flex-col">
              {/* Preview Header */}
              <div className="flex justify-between items-center p-4 bg-black bg-opacity-80">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="text-white text-sm">
                  {selectedImageIndex + 1} of {capturedImages.length}
                </div>
                
                <button
                  onClick={() => deleteImage(selectedImageIndex)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Preview Image */}
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={capturedImages[selectedImageIndex]?.url}
                  alt={`Captured ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Preview Controls */}
              <div className="p-4 bg-black bg-opacity-80">
                {/* Image Thumbnails */}
                {capturedImages.length > 1 && (
                  <div className="flex justify-center space-x-2 mb-4">
                    {capturedImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? 'border-lab-primary' : 'border-gray-400'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="btn-outline text-white border-white hover:bg-white hover:text-black"
                  >
                    Take More
                  </button>
                  
                  <button
                    onClick={processImages}
                    disabled={isProcessing}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Process Images</span>
                      </>
                    )}
                  </button>
                </div>

                {!apiKey && (
                  <div className="mt-4 flex items-center justify-center space-x-2 text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Set API key in Settings for AI processing</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial State - Start Camera */}
      {!isActive && !previewMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
          <Camera className="w-16 h-16 mb-6 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Camera Ready</h3>
          <p className="text-gray-400 text-center mb-8 px-4">
            Take clear photos of your lab notes for AI processing
          </p>
          
          <button
            onClick={startCamera}
            className="btn-primary flex items-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Start Camera</span>
          </button>
          
          {isMobile && (
            <p className="text-xs text-gray-500 mt-4 text-center px-4">
              For best results, hold your phone steady and ensure good lighting
            </p>
          )}
        </div>
      )}
    </div>
  );
}