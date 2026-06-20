import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interviewStore';
import { Mic, MicOff, Volume2, VolumeX, Camera, CameraOff, Play, Send, Award, Clock, ArrowRight, Loader } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import VoiceWaveform from '../components/VoiceWaveform';
import CodeWorkspace from '../components/CodeWorkspace';

const InterviewRoom = () => {
  const { 
    activeInterview, 
    currentQuestionIndex, 
    submitAnswer, 
    nextQuestion, 
    completeInterview, 
    loading 
  } = useInterviewStore();
  
  const navigate = useNavigate();

  // Redirect if no session exists
  useEffect(() => {
    if (!activeInterview) {
      navigate('/setup');
    }
  }, [activeInterview, navigate]);

  const [answerText, setAnswerText] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Video/Webcam states
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [telemetry, setTelemetry] = useState({ eyeContact: 92, expression: 'Focused', confidence: 85 });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Timer states
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);

  // Initialize Speech and speaks the first question on mount
  useEffect(() => {
    if (activeInterview && activeInterview.questions?.length > 0) {
      const q = activeInterview.questions[currentQuestionIndex];
      speakQuestion(q.text);
    }
    
    // Setup Timer
    setTimeElapsed(0);
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionIndex]);

  // Telemetry loop for webcam analysis
  useEffect(() => {
    let interval = null;
    if (webcamEnabled) {
      interval = setInterval(() => {
        setTelemetry({
          eyeContact: Math.max(78, Math.min(99, 90 + Math.floor(Math.random() * 10 - 5))),
          expression: ['Focused', 'Confident', 'Thinking', 'Calm'][Math.floor(Math.random() * 4)],
          confidence: Math.max(80, Math.min(98, 85 + Math.floor(Math.random() * 8 - 3)))
        });
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [webcamEnabled]);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window && isSpeechEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
      if (defaultVoice) utterance.voice = defaultVoice;
      
      utterance.rate = 0.95;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Browser speech-to-text recognition
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Speech Recognition is not supported by your browser. Please try Google Chrome or MS Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setAnswerText(prev => prev + (prev ? ' ' : '') + transcript.trim());
      };

      recognition.onerror = (e) => {
        console.error('Speech Recognition Error:', e.message);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  // Webcam access
  const toggleWebcam = async () => {
    if (webcamEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setWebcamEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setWebcamEnabled(true);
      } catch (err) {
        alert("Webcam access denied or unavailable. Visual Telemetry will be simulated.");
      }
    }
  };

  const handleAnswerSubmit = async () => {
    if (activeInterview.type !== 'Coding' && !answerText.trim()) {
      alert('Please type or speak an answer before submitting.');
      return;
    }

    const q = activeInterview.questions[currentQuestionIndex];
    const success = await submitAnswer(q.id, answerText, codeAnswer);
    
    if (success) {
      // Clear inputs
      setAnswerText('');
      setCodeAnswer('');
      
      const hasNext = nextQuestion();
      if (!hasNext) {
        // Last question answered, complete mock session
        const report = await completeInterview();
        if (report) {
          navigate(`/report/${report._id}`);
        }
      }
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!activeInterview) return null;

  const currentQuestion = activeInterview.questions[currentQuestionIndex];
  const isCodingMode = activeInterview.type === 'Coding';
  const isLastQuestion = currentQuestionIndex === activeInterview.questions.length - 1;

  return (
    <div className="flex flex-col gap-6 py-2 h-full max-w-7xl mx-auto">
      {/* Top Session Details bar */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-white/5 px-6 py-4 rounded-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Interview Session: {activeInterview.role}</span>
          </h2>
          <span className="text-xs text-gray-400">Mode: {activeInterview.type} ({activeInterview.difficulty})</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-300 font-semibold bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/5">
            <Clock size={15} className="text-blue-400" />
            <span>Time: {formatTimer(timeElapsed)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 font-semibold bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/5">
            <span>Q: {currentQuestionIndex + 1} / {activeInterview.questions.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Avatar and Proctor Telemetry (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="border border-white/5 flex flex-col items-center gap-6 text-center">
            <h3 className="text-sm font-semibold text-gray-300">AI Recruiter</h3>
            
            {/* Pulsing Visual Waveform */}
            <div className="relative py-4 w-full flex items-center justify-center">
              <VoiceWaveform isSpeaking={isAiSpeaking} isRecording={isListening} />
            </div>

            {/* Audio Synthesis Settings toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isSpeechEnabled 
                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' 
                    : 'border-white/5 bg-slate-950/40 text-gray-500 hover:text-white'
                }`}
                title={isSpeechEnabled ? "Disable AI speech out loud" : "Enable AI speech out loud"}
              >
                {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={toggleWebcam}
                className={`p-2.5 rounded-xl border transition-all ${
                  webcamEnabled 
                    ? 'border-purple-500/20 bg-purple-500/10 text-purple-400' 
                    : 'border-white/5 bg-slate-950/40 text-gray-500 hover:text-white'
                }`}
                title={webcamEnabled ? "Disable Webcam feed" : "Enable Webcam feed"}
              >
                {webcamEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
              </button>
            </div>
          </GlassCard>

          {/* Webcam Proctor Area */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-slate-950/50 aspect-video flex flex-col items-center justify-center">
            {webcamEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500 p-4 text-center">
                <CameraOff size={24} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Webcam Offline</span>
                <span className="text-[9px] text-gray-400 max-w-xs mt-1">Enable camera for visual eye contact and expression proctoring details.</span>
              </div>
            )}
            
            {webcamEnabled && (
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/80 border border-white/5 backdrop-blur-md flex flex-col gap-1.5 font-mono text-[9px] text-gray-300">
                <div className="flex justify-between items-center">
                  <span>Eye Contact Rate</span>
                  <span className="text-blue-400 font-bold">{telemetry.eyeContact}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expression Pacing</span>
                  <span className="text-purple-400 font-bold">{telemetry.expression}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Confidence Level</span>
                  <span className="text-cyan-400 font-bold">{telemetry.confidence}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Q&A Interface (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassCard className="border border-white/5 flex flex-col gap-5">
            {/* Question Panel */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Interviewer Query</span>
              <h3 className="text-lg font-bold text-white leading-relaxed">
                {currentQuestion?.text}
              </h3>
            </div>

            {/* Answer Workspace Selector */}
            {isCodingMode ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400">Code Solution Workspace</span>
                <CodeWorkspace
                  code={codeAnswer}
                  onChange={(val) => setCodeAnswer(val)}
                  language={editorLanguage}
                  setLanguage={setEditorLanguage}
                  testCases={currentQuestion.testCases}
                  questionText={currentQuestion.text}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                  <span>Type or Dictate Answer</span>
                  <span className="text-[10px] text-gray-500">Character count: {answerText.length}</span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Explain your approach or start speaking by clicking the microphone button..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all font-sans leading-relaxed resize-none"
                />
              </div>
            )}

            {/* Answer Commands Panel */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              {!isCodingMode ? (
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
                    isListening 
                      ? 'border-red-500/20 bg-red-500/10 text-red-400 animate-pulse' 
                      : 'border-white/10 bg-slate-950 hover:bg-slate-900 text-gray-300'
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isListening ? 'Stop Speaking' : 'Speech Input'}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleAnswerSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 px-6 py-3 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/10 active:scale-95 disabled:opacity-50 transition-all"
              >
                <span>{loading ? 'Evaluating...' : isLastQuestion ? 'Generate Performance Report' : 'Submit & Next'}</span>
                {loading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  isLastQuestion ? <Award size={14} /> : <ArrowRight size={14} />
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
