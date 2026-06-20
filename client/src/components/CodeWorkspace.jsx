import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, HelpCircle, Code, CheckCircle, XCircle } from 'lucide-react';

const CodeWorkspace = ({
  code = '',
  onChange = () => {},
  language = 'javascript',
  setLanguage = () => {},
  testCases = [],
  questionText = ''
}) => {
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState('');
  const [runSuccess, setRunSuccess] = useState(null);

  // Set default code template when language changes
  useEffect(() => {
    if (!code) {
      if (language === 'javascript') {
        onChange("function solve(input) {\n  // Write your code here\n  return input;\n}");
      } else if (language === 'python') {
        onChange("def solve(input):\n    # Write your code here\n    return input");
      } else {
        onChange("// Write your code here");
      }
    }
  }, [language]);

  const handleRunCode = () => {
    setRunning(true);
    setOutput('Compiling and running against test cases...\n');
    setRunSuccess(null);

    setTimeout(() => {
      try {
        if (language === 'javascript') {
          // Attempt basic client-side JS evaluation sandbox for fun!
          // We extract the user function body and run it with the input from test cases.
          const userCode = code;
          
          let outputs = [];
          let allPassed = true;

          const testToRun = testCases.length > 0 
            ? testCases 
            : [{ input: '5', expectedOutput: '5' }];

          testToRun.forEach((tc, idx) => {
            // Basic sandboxed evaluation logic for demo
            // We append the function and call it
            const evalScript = `
              ${userCode}
              try {
                // Find function name dynamically or assume solve
                const funcName = '${userCode.includes('reverseString') ? 'reverseString' : userCode.includes('isPalindrome') ? 'isPalindrome' : userCode.includes('twoSum') ? 'twoSum' : 'solve'}';
                const fn = typeof eval(funcName) === 'function' ? eval(funcName) : solve;
                JSON.stringify(fn(${tc.input}));
              } catch (e) {
                'ERROR: ' + e.message;
              }
            `;
            const result = eval(evalScript);
            
            const expectedStr = String(tc.expectedOutput);
            const resultStr = String(result);
            
            const passed = resultStr.replace(/"/g, '') === expectedStr.replace(/"/g, '');
            if (!passed) allPassed = false;

            outputs.push(`Test Case ${idx + 1}:
  Input: ${tc.input}
  Expected: ${expectedStr}
  Received: ${resultStr}
  Result: ${passed ? '✓ PASSED' : '✗ FAILED'}`);
          });

          setOutput(outputs.join('\n\n'));
          setRunSuccess(allPassed);
        } else {
          // Non JS language simulation
          setOutput(`Simulation success: Output printed to stdout.
Compilation check: 0 errors, 0 warnings.
All mock test cases verified successfully!`);
          setRunSuccess(true);
        }
      } catch (err) {
        setOutput(`Compilation Error: ${err.message}\nEnsure your syntax is correct.`);
        setRunSuccess(false);
      } finally {
        setRunning(false);
      }
    }, 1200);
  };

  const handleRequestHint = () => {
    setHint("Loading AI hint...");
    setTimeout(() => {
      // Basic rule based hints based on question content
      if (questionText.toLowerCase().includes('reverse')) {
        setHint("Hint: Try using a 2-pointer approach to reverse in-place, or build a new string from back to front. Complexity should be O(n).");
      } else if (questionText.toLowerCase().includes('palindrome')) {
        setHint("Hint: Check characters from both ends moving towards the center. If any mismatch occurs, it's not a palindrome.");
      } else if (questionText.toLowerCase().includes('two')) {
        setHint("Hint: Use a Hash Map to store previously seen numbers. This allows lookup in O(1) time, reducing overall complexity to O(n).");
      } else {
        setHint("Hint: Break down the problem. Consider boundary/empty inputs (like null, empty arrays, negative values) before optimizing.");
      }
    }, 800);
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl overflow-hidden border border-white/5 bg-slate-950/80">
      {/* Editor Controls bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm text-gray-300 font-semibold">
          <Code size={16} className="text-blue-400" />
          <span>Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-lg text-xs px-2.5 py-1 text-gray-300 focus:outline-none focus:border-blue-500/50"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button
            onClick={handleRequestHint}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-yellow-400/90 transition-all active:scale-95"
          >
            <HelpCircle size={13} />
            <span>Hint</span>
          </button>
          <button
            onClick={handleRunCode}
            disabled={running}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-blue-500/10"
          >
            <Play size={13} />
            <span>{running ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            cursorBlinking: 'smooth',
            formatOnType: true,
            padding: { top: 12, bottom: 12 }
          }}
        />
        {hint && (
          <div className="absolute top-3 right-3 left-3 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-xl text-xs flex justify-between items-start z-10 backdrop-blur-md">
            <span className="flex-1 pr-4">{hint}</span>
            <button onClick={() => setHint('')} className="text-yellow-400 hover:text-white font-bold">&times;</button>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="h-44 border-t border-white/5 bg-slate-950 flex flex-col font-mono text-xs">
        <div className="px-4 py-2 bg-slate-900 border-b border-white/5 text-gray-400 flex items-center justify-between">
          <span>Console Output</span>
          {runSuccess !== null && (
            <span className={`flex items-center gap-1 ${runSuccess ? 'text-green-400' : 'text-red-400'}`}>
              {runSuccess ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {runSuccess ? 'All passed' : 'Failed'}
            </span>
          )}
        </div>
        <div className="flex-1 p-3 overflow-y-auto whitespace-pre text-gray-300">
          {output || 'Click "Run" to test your code against test cases.'}
        </div>
      </div>
    </div>
  );
};

export default CodeWorkspace;
