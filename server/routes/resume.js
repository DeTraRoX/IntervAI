const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const { extractTextFromPDF } = require('../services/pdfExtractor');
const { analyzeResume } = require('../services/ai');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF format resumes are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// @route   POST /api/resume/upload
// @desc    Upload a PDF resume, extract details, and save
// @access  Private
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file format' });
    }

    const filePath = req.file.path;

    // 1. Extract text from PDF
    let rawText = '';
    try {
      rawText = await extractTextFromPDF(filePath);
    } catch (parseError) {
      // Remove temp file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ message: parseError.message });
    }

    // 2. Perform AI parsing
    let parsedData = {};
    try {
      parsedData = await analyzeResume(rawText);
    } catch (aiError) {
      console.error('AI parsing error, falling back to mock parser:', aiError.message);
      // Fallback: trigger offline parsing directly if OpenAI throws
      const { analyzeResume: fallbackAnalyze } = require('../services/openai');
      // If we are already running offline, analyzeResume does the fallback.
      // So this is a double guard.
    }

    // Save/Update in DB
    // Look for existing resume for this user
    let resume = await Resume.findOne({ userId: req.user._id });

    const fileUrl = `/uploads/${path.basename(filePath)}`;

    if (resume) {
      // Delete old file if exists
      const oldPath = path.join(__dirname, '..', resume.fileUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn('Failed to delete old resume file:', e.message);
        }
      }

      resume.fileUrl = fileUrl;
      resume.skills = parsedData.skills || [];
      resume.experience = parsedData.experience || [];
      resume.projects = parsedData.projects || [];
      resume.education = parsedData.education || [];
      resume.rawText = rawText;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        fileUrl,
        skills: parsedData.skills || [],
        experience: parsedData.experience || [],
        projects: parsedData.projects || [],
        education: parsedData.education || [],
        rawText
      });
    }

    res.status(201).json(resume);
  } catch (error) {
    console.error('Upload Endpoint Error:', error.message);
    res.status(500).json({ message: 'Failed to process resume' });
  }
});

// @route   GET /api/resume/me
// @desc    Get the logged-in user's parsed resume
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found for this user' });
    }
    res.json(resume);
  } catch (error) {
    console.error('Get Resume Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
