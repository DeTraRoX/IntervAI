const express = require('express');
const { protect } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewReport
} = require('../services/ai');
const { runCodeLocally } = require('../services/codeExecutor');

const router = express.Router();

// @route   POST /api/interview/create
// @desc    Initialize a new mock interview session and pre-generate questions
// @access  Private
router.post('/create', protect, async (req, res) => {
  const { role, type, difficulty } = req.body;

  try {
    if (!role || !type || !difficulty) {
      return res.status(400).json({ message: 'Role, Type, and Difficulty are required' });
    }

    // 1. Fetch user's resume if available to personalize questions
    const resume = await Resume.findOne({ userId: req.user._id });

    // 2. Generate questions from AI
    const questions = await generateInterviewQuestions(role, type, difficulty, resume);

    // 3. Create active session in DB
    const interview = await Interview.create({
      userId: req.user._id,
      role,
      type,
      difficulty,
      questions,
      answers: [],
      scores: {
        technical: 0,
        communication: 0,
        confidence: 0,
        problemSolving: 0,
        relevance: 0,
        overall: 0
      },
      feedback: {
        strengths: [],
        weaknesses: [],
        recommendations: []
      },
      isCompleted: false
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Create Interview Error:', error.message);
    res.status(500).json({ message: 'Failed to create interview session' });
  }
});

// @route   POST /api/interview/submit-answer
// @desc    Submit an answer to a specific question, evaluate it on-the-fly
// @access  Private
router.post('/submit-answer', protect, async (req, res) => {
  const { interviewId, questionId, textAnswer, codeAnswer } = req.body;

  try {
    if (!interviewId || !questionId) {
      return res.status(400).json({ message: 'Interview ID and Question ID are required' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit answers for this interview' });
    }

    const question = interview.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found in this interview' });
    }

    // 1. Run AI Evaluation on answer
    const answerVal = interview.type === 'Coding' ? (codeAnswer || '') : (textAnswer || '');
    const evaluation = await evaluateAnswer(question.text, answerVal, interview.role, interview.type, interview.difficulty);

    // 2. Log answer in session
    // Check if question has already been answered
    const existingIndex = interview.answers.findIndex(ans => ans.questionId === questionId);

    const answerObject = {
      questionId,
      questionText: question.text,
      textAnswer: interview.type !== 'Coding' ? answerVal : '',
      codeAnswer: interview.type === 'Coding' ? answerVal : '',
      audioUrl: '',
      feedback: {
        score: evaluation.score,
        comments: evaluation.comments
      }
    };

    if (existingIndex > -1) {
      interview.answers[existingIndex] = answerObject;
    } else {
      interview.answers.push(answerObject);
    }

    await interview.save();
    res.json({ success: true, evaluation, interview });
  } catch (error) {
    console.error('Submit Answer Error:', error.message);
    res.status(500).json({ message: 'Failed to record answer evaluation' });
  }
});

// @route   POST /api/interview/complete
// @desc    Finalize interview session, generate comprehensive report
// @access  Private
router.post('/complete', protect, async (req, res) => {
  const { interviewId } = req.body;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 1. Generate comprehensive performance dashboard summary
    const report = await generateInterviewReport(interview);

    // 2. Save final report outcomes
    interview.scores = report.scores;
    interview.feedback = report.feedback;
    interview.isCompleted = true;
    await interview.save();

    res.json(interview);
  } catch (error) {
    console.error('Finalize Interview Error:', error.message);
    res.status(500).json({ message: 'Failed to finalize interview report' });
  }
});

// @route   GET /api/interview/history
// @desc    Retrieve all completed interviews for the authenticated user
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Interview.find({ userId: req.user._id, isCompleted: true })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Fetch History Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/interview/:id
// @desc    Retrieve detailed analytics for a single interview
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this interview session' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Fetch Session Detail Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/interview/run-code
// @desc    Execute code in local sandbox and evaluate test cases
// @access  Private
router.post('/run-code', protect, async (req, res) => {
  const { code, language, testCases, functionName } = req.body;

  try {
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and Language are required' });
    }

    const result = await runCodeLocally(
      code,
      language,
      functionName || 'solve',
      testCases || []
    );

    res.json(result);
  } catch (error) {
    console.error('Run Code Route Error:', error.message);
    res.status(500).json({ message: 'Failed to execute code' });
  }
});

module.exports = router;
