import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Heart,
  Smile,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
} from 'lucide-react';
import { petService } from '../services/petService';
import { moodService } from '../services/moodService';
import { Pet, MoodAnalysis } from '../types';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const MoodScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPetId = searchParams.get('petId') || '';

  const { success, error, warning } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId);
  const [loadingPets, setLoadingPets] = useState(true);

  // Mode: 'camera' | 'upload'
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MoodAnalysis | null>(null);

  // History State
  const [history, setHistory] = useState<MoodAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      loadMoodHistory(selectedPetId);
    }
  }, [selectedPetId]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  const loadPets = async () => {
    try {
      setLoadingPets(true);
      const res = await petService.getPets();
      if (res.success && res.pets.length > 0) {
        setPets(res.pets);
        if (!selectedPetId) {
          setSelectedPetId(res.pets[0].id);
        }
      }
    } catch (err) {
      error('Failed to load registered pets.');
    } finally {
      setLoadingPets(false);
    }
  };

  const loadMoodHistory = async (petId: string) => {
    try {
      setLoadingHistory(true);
      const res = await moodService.getMoodHistory(petId);
      if (res.success) {
        setHistory(res.history);
      }
    } catch (err) {
      console.warn('Failed to fetch mood history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startCamera = async () => {
    try {
      setCapturedImageBase64(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      warning(
        'Could not access camera. Please allow camera permissions or use the "Upload Image" option.'
      );
      setInputMode('upload');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImageBase64(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadedFilePreview(URL.createObjectURL(file));
      setCapturedImageBase64(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPetId) {
      error('Please select a pet first.');
      return;
    }

    if (!capturedImageBase64 && !uploadedFile) {
      error('Please capture a photo or upload an image first.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await moodService.analyzeMood({
        petId: selectedPetId,
        imageFile: uploadedFile || undefined,
        imageBase64: capturedImageBase64 || undefined,
      });

      if (res.success && res.data) {
        setAnalysisResult(res.data);
        success(`Mood predicted: ${res.data.predictedMood}!`);
        loadMoodHistory(selectedPetId);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to analyze mood.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setCapturedImageBase64(null);
    setUploadedFile(null);
    setUploadedFilePreview(null);
    stopCamera();
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Happy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Playful':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Relaxed':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Curious':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Fearful':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Stressed':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loadingPets) {
    return <Loader message="Setting up AI Mood Scanner..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 p-6 md:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/40 text-teal-100 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>AI-Powered Feature • Team Dorado Engineering</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Pet Mood Scanner</h2>
          <p className="text-teal-100 text-xs md:text-sm max-w-2xl leading-relaxed">
            Snap or upload a photo of your pet to detect indicative facial expressions, posture cues, and receive veterinary-guided care tips tailored to their current state.
          </p>
        </div>
      </div>

      {/* Pet Selector */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
            Choose Pet to Scan
          </label>
          <p className="text-xs text-pawMuted">Analyses will be archived in this pet's medical profile</p>
        </div>

        {pets.length === 0 ? (
          <p className="text-xs text-red-500 font-bold">Please add a pet in My Pets first.</p>
        ) : (
          <div className="flex items-center space-x-3">
            <select
              value={selectedPetId}
              onChange={(e) => {
                setSelectedPetId(e.target.value);
                handleReset();
              }}
              className="px-4 py-2 rounded-xl border border-teal-200 text-xs font-bold text-teal-900 bg-teal-50/50 focus:border-teal-500 outline-none"
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.animalType} — {pet.breed})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Scanner Workspace */}
      {!analysisResult ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-teal-100 space-y-6">
          {/* Method Tabs */}
          <div className="flex items-center justify-center space-x-4 border-b border-gray-100 pb-4">
            <button
              onClick={() => {
                setInputMode('camera');
                setUploadedFile(null);
                setUploadedFilePreview(null);
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
                inputMode === 'camera'
                  ? 'bg-teal-500 text-white shadow-soft'
                  : 'bg-gray-100 text-pawMuted hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Use Live Camera</span>
            </button>

            <button
              onClick={() => {
                setInputMode('upload');
                stopCamera();
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
                inputMode === 'upload'
                  ? 'bg-teal-500 text-white shadow-soft'
                  : 'bg-gray-100 text-pawMuted hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photograph</span>
            </button>
          </div>

          {/* Camera View */}
          {inputMode === 'camera' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              {!isCameraActive && !capturedImageBase64 && (
                <div className="w-full max-w-lg aspect-video rounded-3xl bg-slate-900/5 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-12 h-12 text-teal-400 mb-3" />
                  <h4 className="font-bold text-pawText text-sm">Camera is inactive</h4>
                  <p className="text-xs text-pawMuted max-w-xs mt-1 mb-4">
                    Click the button below to allow camera preview and take a clear picture of {selectedPet?.name || 'your pet'}.
                  </p>
                  <Button onClick={startCamera} icon={<Camera className="w-4 h-4" />}>
                    Open Camera Preview
                  </Button>
                </div>
              )}

              {isCameraActive && (
                <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden bg-black shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Camera overlay crosshairs */}
                  <div className="absolute inset-4 border border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                      Center pet's face & posture inside frame
                    </span>
                  </div>

                  {/* Shutter Button */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-3">
                    <button
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full bg-white border-4 border-teal-500 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition"
                      title="Take Photo"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-500" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-semibold backdrop-blur-xs hover:bg-black/80"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Captured Photo Review */}
              {capturedImageBase64 && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-lg border-2 border-teal-400">
                    <img
                      src={capturedImageBase64}
                      alt="Captured pet"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Snapshot Ready
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={startCamera}
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Retake Photo
                    </Button>
                    <Button
                      onClick={handleAnalyze}
                      isLoading={analyzing}
                      icon={<Sparkles className="w-4 h-4" />}
                    >
                      Confirm & Analyze Mood
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload View */}
          {inputMode === 'upload' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              {!uploadedFilePreview ? (
                <label className="w-full max-w-lg aspect-video rounded-3xl bg-teal-50/30 border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50/60 transition flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                  <Upload className="w-12 h-12 text-teal-500 mb-3" />
                  <h4 className="font-bold text-pawText text-sm">Choose or drag pet photo here</h4>
                  <p className="text-xs text-pawMuted mt-1 mb-2">
                    Supports JPEG, PNG, WEBP files up to 10MB
                  </p>
                  <span className="text-xs font-bold text-teal-600 underline">Browse Files</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-lg border-2 border-teal-400">
                    <img
                      src={uploadedFilePreview}
                      alt="Uploaded pet preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Image Selected
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadedFilePreview(null);
                      }}
                    >
                      Choose Different Photo
                    </Button>
                    <Button
                      onClick={handleAnalyze}
                      isLoading={analyzing}
                      icon={<Sparkles className="w-4 h-4" />}
                    >
                      Analyze Photo Mood
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Indicative Notice Banner */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-start space-x-3 text-xs text-pawMuted">
            <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Scientific & Veterinary Disclaimer:</strong> Facial snapshots alone provide indicative behavioral estimates and do not determine an animal's complete emotional state or physical health. Always consider posture, appetite, and tail movements.
            </p>
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-teal-100 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Analysis Complete
              </span>
              <h3 className="text-xl font-black text-pawText">
                {selectedPet?.name}'s Mood Report
              </h3>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
              Try Another Image
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Scanned Image Card */}
            <div className="md:col-span-5 space-y-3">
              <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-teal-100 bg-gray-50">
                <img
                  src={analysisResult.imageUrl}
                  alt="Scanned Pet"
                  className="w-full aspect-square object-cover"
                />
              </div>

              {analysisResult.isDemoMode && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Indicative Demo Heuristic Engine</strong>
                    <span>Running in biological indicative mode. External AI Vision API key can be configured via environment variables.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Results & Care Tips */}
            <div className="md:col-span-7 space-y-5">
              {/* Predicted Mood Badge */}
              <div className="p-5 rounded-3xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-pawMuted font-bold uppercase tracking-wider">
                    Predicted Emotional Expression
                  </span>
                  <div className="flex items-center space-x-3 mt-1">
                    <span
                      className={`text-2xl font-black px-4 py-1.5 rounded-2xl border ${getMoodColor(
                        analysisResult.predictedMood
                      )}`}
                    >
                      {analysisResult.predictedMood}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-pawMuted font-bold uppercase tracking-wider block">
                    Confidence Score
                  </span>
                  <span className="text-2xl font-black text-teal-700">
                    {Math.round(analysisResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Short Explanation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-pawText mb-1.5">
                  Expression Diagnosis
                </h4>
                <p className="text-sm text-pawText leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {analysisResult.explanation}
                </p>
              </div>

              {/* Observed Visual Indicators */}
              {analysisResult.observations && analysisResult.observations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-pawText mb-1.5">
                    Visible Postural Indicators
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysisResult.observations.map((obs, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-2.5 rounded-xl bg-teal-50/30 text-xs font-medium text-teal-900 border border-teal-100"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span>{obs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Care Tips */}
              {analysisResult.careTips && analysisResult.careTips.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1.5">
                    Veterinary Suggested Care & Interaction
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.careTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-2.5 p-3 rounded-2xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-100 font-medium"
                      >
                        <Heart className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 fill-emerald-100" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Veterinary Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p>
                  {analysisResult.disclaimer ||
                    'Results are indicative observations, not clinical veterinary diagnoses. Consult a certified veterinarian if abnormal behavioral signs persist.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Scan History for Selected Pet */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="text-base font-extrabold text-pawText">
              Analysis History for {selectedPet?.name || 'Selected Pet'}
            </h3>
          </div>
          <span className="text-xs text-pawMuted font-semibold">
            {history.length} Saved Scans
          </span>
        </div>

        {loadingHistory ? (
          <Loader size="sm" message="Loading scan archives..." />
        ) : history.length === 0 ? (
          <p className="text-xs text-pawMuted py-4 text-center">
            No previous scans logged yet for this pet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-teal-200 bg-gray-50/40 transition space-y-2.5"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.imageUrl}
                    alt="Scan thumbnail"
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-teal-500/20"
                  />
                  <div>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getMoodColor(
                        item.predictedMood
                      )}`}
                    >
                      {item.predictedMood}
                    </span>
                    <span className="text-[10px] text-pawMuted block mt-1">
                      {new Date(item.createdAt).toLocaleDateString()} • {Math.round(item.confidence * 100)}% Match
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-pawMuted line-clamp-2">{item.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
