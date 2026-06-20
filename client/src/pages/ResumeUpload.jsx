import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, FileText, AlertCircle, Sparkles, Loader } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [parsedResume, setParsedResume] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    // Check if user already has an analyzed resume loaded
    const loadExistingResume = async () => {
      try {
        const res = await axios.get(`${API_URL}/resume/me`);
        setParsedResume(res.data);
      } catch (err) {
        // User has no resume uploaded yet
        console.log('No existing resume found for user.');
      } finally {
        setLoadingInitial(false);
      }
    };
    loadExistingResume();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF format resumes are supported.');
      return;
    }
    // Limit to 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be smaller than 5MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(15);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post(`${API_URL}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Scale progress so the AI parsing step is captured in the remaining percentage
          setProgress(Math.min(90, Math.max(15, percentCompleted)));
        }
      });
      setProgress(100);
      setTimeout(() => {
        setParsedResume(res.data);
        setUploading(false);
        setFile(null);
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <span>AI Resume Analyzer</span>
        </h1>
        <p className="text-sm text-gray-400">Upload your professional resume to customize and tailor your interview rooms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Upload Resume</h2>
            
            {error && (
              <div className="flex items-center gap-2 p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resume-file').click()}
              className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-4 ${
                dragging 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/60'
              }`}
            >
              <input
                type="file"
                id="resume-file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-4 bg-white/5 text-gray-400 rounded-full">
                <UploadCloud size={32} className={uploading ? 'animate-bounce' : ''} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {file ? file.name : 'Select or drag PDF here'}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">PDF format up to 5MB</span>
              </div>
            </div>

            {file && !uploading && (
              <button
                onClick={handleUpload}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95 text-sm"
              >
                Scan & Parse Resume
              </button>
            )}

            {uploading && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Loader size={12} className="animate-spin text-blue-400" />
                    {progress < 90 ? 'Uploading files...' : 'AI scanning content...'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Parsed Outcomes Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Scan Results</span>
            {parsedResume && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle size={10} />
                <span>Synchronized</span>
              </span>
            )}
          </h2>

          {loadingInitial ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 glass-panel border border-white/5 rounded-2xl">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Checking resume profile...</span>
            </div>
          ) : !parsedResume ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 glass-panel border border-white/5 rounded-2xl px-6 text-center bg-slate-950/20">
              <div className="p-4 bg-white/5 text-gray-400 rounded-full">
                <FileText size={32} />
              </div>
              <h3 className="text-base font-bold text-white">No resume scanned yet</h3>
              <p className="text-xs text-gray-400 max-w-sm">Scan your resume to feed details automatically to the recruiter model before initiating sessions.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Skills */}
              <GlassCard className="border border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                  <Sparkles size={16} />
                  <span>Extracted Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedResume.skills?.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="text-xs text-gray-300 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!parsedResume.skills || parsedResume.skills.length === 0) && (
                    <span className="text-xs text-gray-500">No skills identified.</span>
                  )}
                </div>
              </GlassCard>

              {/* Projects */}
              <GlassCard className="border border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                  <Sparkles size={16} />
                  <span>Projects</span>
                </div>
                <div className="flex flex-col gap-4">
                  {parsedResume.projects?.map((proj, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0 flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">{proj.title || proj.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.technologies?.map((tech, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-normal">{proj.description}</p>
                    </div>
                  ))}
                  {(!parsedResume.projects || parsedResume.projects.length === 0) && (
                    <span className="text-xs text-gray-500">No projects parsed.</span>
                  )}
                </div>
              </GlassCard>

              {/* Experience & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <GlassCard className="border border-white/5 flex flex-col gap-4">
                  <span className="text-sm font-semibold text-cyan-400">Work Experience</span>
                  <div className="flex flex-col gap-3">
                    {Array.isArray(parsedResume.experience) ? (
                      parsedResume.experience.map((exp, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white">{exp.role}</span>
                          <span className="text-[10px] text-cyan-400">{exp.company} ({exp.duration})</span>
                          <p className="text-[11px] text-gray-400 mt-1 leading-normal">{exp.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">{parsedResume.experience || 'No work history found.'}</p>
                    )}
                  </div>
                </GlassCard>

                {/* Education */}
                <GlassCard className="border border-white/5 flex flex-col gap-4">
                  <span className="text-sm font-semibold text-yellow-400">Education Details</span>
                  <div className="flex flex-col gap-3">
                    {Array.isArray(parsedResume.education) ? (
                      parsedResume.education.map((edu, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white">{edu.degree}</span>
                          <span className="text-[10px] text-yellow-400">{edu.school} {edu.year ? `(${edu.year})` : ''}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No education entries found.</p>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
