const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '') {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('GEMINI_API_KEY is not defined. IntervAI will operate in Mock/Offline mode.');
}

// Mock database of high-quality interview questions
const MOCK_QUESTIONS = {
  'Frontend Developer': {
    'Technical': {
      'Beginner': [
        "What is the virtual DOM in React, and how does it improve performance?",
        "Explain the difference between state and props in React.",
        "What is the difference between 'let', 'const', and 'var' in JavaScript?",
        "How does CSS Flexbox differ from CSS Grid, and when would you use each?",
        "What is the difference between synchronous and asynchronous code in JavaScript?"
      ],
      'Intermediate': [
        "Explain React's hook dependencies array. What happens if you omit it or pass empty?",
        "What are closures in JavaScript, and what is a practical use case for them?",
        "Explain event bubbling and capturing in the DOM.",
        "How do you optimize a React application that is suffering from excessive re-renders?",
        "What is CSS modules, and how does it prevent global style pollution?"
      ],
      'Advanced': [
        "Explain the reactivity system in modern frameworks vs React fiber reconciliation architecture.",
        "How would you design a frontend state management framework from scratch?",
        "What are micro-frontends, and what are their architectural pros and cons?",
        "Explain how the event loop works, specifically microtasks vs macrotasks queues.",
        "Explain the critical rendering path in browsers and how to optimize it for a sub-second FCP."
      ]
    },
    'Coding': {
      'Beginner': [
        {
          id: 'q1',
          text: "Write a function `reverseString(str)` that takes a string and returns it reversed.",
          category: "Coding",
          codeSnippet: "function reverseString(str) {\n  // Write your code here\n  \n}",
          testCases: [{ input: "\"hello\"", expectedOutput: "\"olleh\"" }]
        },
        {
          id: 'q2',
          text: "Write a function `isPalindrome(str)` that checks if a string reads the same backwards.",
          category: "Coding",
          codeSnippet: "function isPalindrome(str) {\n  // Write your code here\n  \n}",
          testCases: [{ input: "\"racecar\"", expectedOutput: "true" }]
        }
      ],
      'Intermediate': [
        {
          id: 'q1',
          text: "Implement a function `twoSum(nums, target)` that returns indices of two numbers adding to target.",
          category: "Coding",
          codeSnippet: "function twoSum(nums, target) {\n  // Write your code here\n  \n}",
          testCases: [{ input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]" }]
        }
      ]
    }
  },
  'Backend Developer': {
    'Technical': {
      'Intermediate': [
        "What is the difference between SQL and NoSQL databases? When do you choose which?",
        "Explain how connection pooling works in a database context and why it is important.",
        "What are REST API design best practices, and how do they differ from GraphQL?",
        "How do you secure user passwords before storing them in a database?",
        "What is the difference between authentication and authorization?"
      ]
    }
  },
  'Software Engineer': {
    'Technical': {
      'Intermediate': [
        "What is MVC architecture, and how does it separate concerns in an application?",
        "Explain the SOLID principles of Object-Oriented Design.",
        "What is a memory leak, and how can you detect and prevent it in Node.js?",
        "What is the purpose of Git rebase vs Git merge? When would you use each?",
        "Explain how a hash map works under the hood, and what its time complexities are."
      ]
    },
    'Behavioral': {
      'Intermediate': [
        "Tell me about a time you had a conflict with a team member. How did you resolve it?",
        "Describe a difficult technical problem you solved. What was your approach?",
        "How do you handle deadlines and prioritize tasks when you have multiple projects?",
        "Tell me about a time you failed. What did you learn from the experience?",
        "How do you stay up-to-date with new technologies and industry trends?"
      ]
    },
    'HR': {
      'Intermediate': [
        "Why do you want to work for our company?",
        "Where do you see yourself in five years?",
        "What are your greatest professional strengths and weaknesses?",
        "Why should we hire you over other candidates?",
        "What are your salary expectations for this position?"
      ]
    }
  }
};

const DEFAULT_QUESTIONS = [
  "Explain a challenging project you worked on recently and the technical decisions you made.",
  "How do you handle testing, debugging, and maintaining code quality in your projects?",
  "What is your approach to learning a new programming language or framework quickly?",
  "Describe a scenario where you had to debug a critical production bug under tight deadlines.",
  "How do you collaborate with non-technical stakeholders (e.g. Product Managers, UI designers)?"
];

const DEFAULT_CODING_QUESTIONS = [
  {
    id: 'code1',
    text: "Write a function `fizzBuzz(n)` that returns an array of strings from 1 to n with Fizz, Buzz or FizzBuzz.",
    category: "Coding",
    codeSnippet: "function fizzBuzz(n) {\n  // Write code here\n  \n}",
    testCases: [{ input: "5", expectedOutput: "['1', '2', 'Fizz', '4', 'Buzz']" }]
  }
];

// Helper to sanitize and parse JSON response from Gemini
const parseGeminiJSON = (text) => {
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parsing error on Gemini response:", text);
    throw new Error("AI returned invalid JSON formatting.");
  }
};

/**
 * Extracted Local Offline Generators (Fallback)
 */

const getOfflineResumeAnalysis = (resumeText) => {
  const skillsVocab = ['javascript', 'react', 'node', 'express', 'mongodb', 'python', 'java', 'sql', 'html', 'css', 'git', 'aws', 'docker', 'typescript', 'redux', 'vue', 'angular', 'c++', 'rust', 'graphql', 'rest api', 'next.js', 'sass'];
  const lowerText = resumeText.toLowerCase();
  const skills = skillsVocab.filter(skill => lowerText.includes(skill.toLowerCase()))
                             .map(s => s.charAt(0).toUpperCase() + s.slice(1));
  
  return {
    skills: skills.length > 0 ? skills : ['JavaScript', 'HTML5', 'CSS3', 'Git'],
    experience: [
      {
        role: "Software Developer",
        company: "Tech Solutions Inc.",
        duration: "2023 - Present",
        description: "Developed and maintained full-stack web applications. Optimized data queries."
      }
    ],
    projects: [
      {
        title: "Personal Portfolio System",
        technologies: ["React", "CSS", "Vite"],
        description: "Built a responsive portfolio website with custom page animations."
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        school: "State University",
        year: "2022"
      }
    ]
  };
};

const getOfflineQuestions = (role, type, difficulty) => {
  const roleKey = MOCK_QUESTIONS[role] ? role : 'Software Engineer';
  const typeKey = MOCK_QUESTIONS[roleKey][type] ? type : 'Technical';
  const diffKey = MOCK_QUESTIONS[roleKey][typeKey] && MOCK_QUESTIONS[roleKey][typeKey][difficulty] ? difficulty : 'Intermediate';

  const source = MOCK_QUESTIONS[roleKey][typeKey] && MOCK_QUESTIONS[roleKey][typeKey][diffKey] 
    ? MOCK_QUESTIONS[roleKey][typeKey][diffKey] 
    : (type === 'Coding' ? DEFAULT_CODING_QUESTIONS : DEFAULT_QUESTIONS);

  return source.map((q, idx) => {
    if (typeof q === 'string') {
      return {
        id: `q-${idx}`,
        text: q,
        category: type,
        codeSnippet: '',
        testCases: []
      };
    }
    return q;
  });
};

const getOfflineAnswerEvaluation = (questionText, answerText) => {
  const cleanAnswer = answerText ? answerText.trim() : '';
  const scoreBase = cleanAnswer.length > 50 ? 8 : (cleanAnswer.length > 20 ? 6 : 4);
  const scoreModifier = cleanAnswer.toLowerCase().includes('because') || cleanAnswer.toLowerCase().includes('example') ? 1 : 0;
  const finalScore = Math.min(10, scoreBase + scoreModifier);

  return {
    score: finalScore,
    comments: cleanAnswer.length > 0 
      ? `The answer shows basic understanding. (Fallback local evaluator used.)`
      : `No response was provided. A comprehensive explanation is recommended.`
  };
};

const getOfflineReport = (interviewData) => {
  const totalAnswers = interviewData.answers || [];
  const averageScore = totalAnswers.length > 0 
    ? Math.round((totalAnswers.reduce((sum, item) => sum + (item.feedback.score || 0), 0) / (totalAnswers.length * 10)) * 100)
    : 75;

  const technical = Math.round(averageScore / 10);
  const communication = Math.round(averageScore > 80 ? 9 : 8);
  const confidence = Math.round(averageScore > 70 ? 8 : 7);
  const problemSolving = Math.round(averageScore > 85 ? 9 : 7);
  const relevance = Math.round(averageScore > 75 ? 8 : 7);

  return {
    scores: {
      technical,
      communication,
      confidence,
      problemSolving,
      relevance,
      overall: averageScore
    },
    feedback: {
      strengths: [
        `Solid understanding of core role definitions.`,
        `Coherent and structured answer delivery.`,
        `Effective communication under pressure.`
      ],
      weaknesses: [
        `Missing details on optimization and complexity metrics.`,
        `Could provide more concrete architectural instances.`
      ],
      recommendations: [
        `Study systems scaling patterns and caching architectures.`,
        `Practice mock coding execution loops to identify edge cases.`
      ]
    }
  };
};

/**
 * Service methods using Gemini API with Automatic Fallback Try/Catch blocks
 */

const analyzeResume = async (resumeText) => {
  if (!genAI) {
    return getOfflineResumeAnalysis(resumeText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are an expert resume parser and technical recruiter. Parse the provided resume text and extract the details in the exact JSON format below. Do not add any text other than the JSON:
    {
      "skills": ["Skill1", "Skill2"],
      "experience": [{"role": "title", "company": "company name", "duration": "period", "description": "details"}],
      "projects": [{"title": "project name", "technologies": ["tech1", "tech2"], "description": "details"}],
      "education": [{"degree": "degree/course", "school": "institute name", "year": "graduation year"}]
    }

    Resume Content:
    ${resumeText}`;

    const result = await model.generateContent(prompt);
    return parseGeminiJSON(result.response.text());
  } catch (error) {
    console.warn('Gemini Resume Analysis failed (possibly overloaded). Falling back to Offline Mode:', error.message);
    return getOfflineResumeAnalysis(resumeText);
  }
};

const generateInterviewQuestions = async (role, type, difficulty, resumeData) => {
  if (!genAI) {
    return getOfflineQuestions(role, type, difficulty);
  }

  try {
    const isCoding = type === 'Coding';
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a professional AI interviewer conducting a ${difficulty}-level ${type} interview for a ${role} position.
    Generate exactly 5 distinct and challenging questions.
    
    ${resumeData ? `The candidate's resume shows: Skills: ${JSON.stringify(resumeData.skills)}. Tailor at least some questions to their technical profile.` : ''}

    ${isCoding ? `Since this is a Coding interview, each question MUST contain a starter 'codeSnippet' and 'testCases' matching javascript parameters.` : `Do not include code snippets or test cases.`}

    Return the result in the exact JSON format below:
    {
      "questions": [
        {
          "id": "unique-q-id-1",
          "text": "Question prompt text",
          "category": "core topic",
          "codeSnippet": "function name() {\\n\\n}",
          "testCases": [{"input": "args", "expectedOutput": "output string"}]
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const parsed = parseGeminiJSON(result.response.text());
    return parsed.questions || parsed;
  } catch (error) {
    console.warn('Gemini Question Generation failed (possibly overloaded). Falling back to Offline Mode:', error.message);
    return getOfflineQuestions(role, type, difficulty);
  }
};

const evaluateAnswer = async (questionText, answerText, role, type, difficulty) => {
  if (!genAI) {
    return getOfflineAnswerEvaluation(questionText, answerText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `Evaluate the candidate's answer for the following interview question:
    Role: ${role}
    Type: ${type}
    Difficulty: ${difficulty}
    
    Question: ${questionText}
    Candidate's Answer: ${answerText}
    
    Evaluate technical accuracy, completeness, and clarity. Return score (0 to 10) and brief comments in JSON format:
    {
      "score": 8,
      "comments": "feedback explanation"
    }`;

    const result = await model.generateContent(prompt);
    return parseGeminiJSON(result.response.text());
  } catch (error) {
    console.warn('Gemini Answer Evaluation failed (possibly overloaded). Falling back to Offline Mode:', error.message);
    return getOfflineAnswerEvaluation(questionText, answerText);
  }
};

const generateInterviewReport = async (interviewData) => {
  if (!genAI) {
    return getOfflineReport(interviewData);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `Compile a detailed interview performance report based on the following candidate session:
    Role: ${interviewData.role}
    Type: ${interviewData.type}
    Difficulty: ${interviewData.difficulty}
    
    Q&A Session:
    ${JSON.stringify(interviewData.answers.map(ans => ({ question: ans.questionText, answer: ans.textAnswer || ans.codeAnswer, evaluation: ans.feedback })))}
    
    Evaluate the overall performance and assign scores from 1 to 10 for technical, communication, confidence, problemSolving, and relevance, and an overall percentage score (0-100).
    Provide structural strengths, weaknesses, and concrete recommendations.
    
    Return in the exact JSON format below:
    {
      "scores": {
        "technical": 8,
        "communication": 7,
        "confidence": 8,
        "problemSolving": 7,
        "relevance": 9,
        "overall": 78
      },
      "feedback": {
        "strengths": ["Strength detail 1", "Strength detail 2"],
        "weaknesses": ["Improvement detail 1", "Improvement detail 2"],
        "recommendations": ["Actionable advice 1", "Actionable advice 2"]
      }
    }`;

    const result = await model.generateContent(prompt);
    return parseGeminiJSON(result.response.text());
  } catch (error) {
    console.warn('Gemini Report Compilation failed (possibly overloaded). Falling back to Offline Mode:', error.message);
    return getOfflineReport(interviewData);
  }
};

module.exports = {
  analyzeResume,
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewReport
};
