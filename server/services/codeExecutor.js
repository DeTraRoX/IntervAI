const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Executes a shell command with a custom timeout limit.
 */
const execWithTimeout = (cmd, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  return new Promise((resolve, reject) => {
    let timer;
    const child = exec(cmd, options, (error, stdout, stderr) => {
      if (timer) clearTimeout(timer);
      resolve({ error, stdout, stderr });
    });

    timer = setTimeout(() => {
      // Force kill process tree on Windows/Linux
      try {
        child.kill();
        if (process.platform === 'win32') {
          exec(`taskkill /pid ${child.pid} /T /F`);
        }
      } catch (e) {
        console.error('Failed to kill timed out process:', e.message);
      }
      reject(new Error(`Execution timed out (${timeoutMs / 1000}s limit exceeded)`));
    }, timeoutMs);
  });
};

/**
 * Creates templates for compilation and execution using String.raw to preserve backslashes.
 */
const getRunnerContent = (language, userCode, functionName, testCases) => {
  if (language === 'javascript') {
    return `${userCode}

const testCases = ${JSON.stringify(testCases)};
const results = [];

testCases.forEach((tc, idx) => {
  try {
    const fnName = '${functionName}';
    let fn = typeof global[fnName] !== 'undefined' ? global[fnName] : null;
    if (!fn) {
      try {
        fn = eval(fnName);
      } catch(e) {}
    }
    if (!fn && typeof solve !== 'undefined') {
      fn = solve;
    }
    if (typeof fn !== 'function') {
      throw new Error("Function '" + fnName + "' is not defined as a function.");
    }
    
    const args = eval('[' + tc.input + ']');
    const result = fn(...args);
    const resultStr = JSON.stringify(result);
    
    const expectedVal = eval(tc.expectedOutput);
    const passed = JSON.stringify(expectedVal) === resultStr;
    
    results.push({
      index: idx,
      input: tc.input,
      expected: tc.expectedOutput,
      received: resultStr,
      passed: passed
    });
  } catch (err) {
    results.push({
      index: idx,
      input: tc.input,
      expected: tc.expectedOutput,
      received: "ERROR: " + err.message,
      passed: false
    });
  }
});

console.log("TEST_RESULTS:" + JSON.stringify(results));`;
  }

  if (language === 'python') {
    return `${userCode}

import json

test_cases = ${JSON.stringify(testCases)}
results = []

for idx, tc in enumerate(test_cases):
    try:
        fn_name = '${functionName}'
        fn = globals().get(fn_name, globals().get('solve'))
        if not fn or not callable(fn):
            raise Exception(f"Function '{fn_name}' is not defined.")
        
        args = eval("[" + tc['input'] + "]")
        result = fn(*args)
        result_str = json.dumps(result)
        
        expected_val = eval(tc['expectedOutput'])
        passed = (result == expected_val)
        
        results.append({
            "index": idx,
            "input": tc['input'],
            "expected": tc['expectedOutput'],
            "received": result_str,
            "passed": passed
        })
    except Exception as e:
        results.append({
            "index": idx,
            "input": tc['input'],
            "expected": tc['expectedOutput'],
            "received": "ERROR: " + str(e),
            "passed": False
        })

print("TEST_RESULTS:" + json.dumps(results))`;
  }

  if (language === 'java') {
    return String.raw`import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        String[][] testCases = new String[][] {
            ${testCases.map(tc => `new String[] { ${JSON.stringify(tc.input)}, ${JSON.stringify(tc.expectedOutput)} }`).join(',\n            ')}
        };
        
        StringBuilder jsonResults = new StringBuilder();
        jsonResults.append("[");
        
        try {
            Solution solver = new Solution();
            Method target = null;
            for (Method m : Solution.class.getDeclaredMethods()) {
                if (java.lang.reflect.Modifier.isPublic(m.getModifiers()) && 
                    (m.getName().equals("${functionName}") || m.getName().equals("solve"))) {
                    target = m;
                    break;
                }
            }
            
            if (target == null && Solution.class.getDeclaredMethods().length > 0) {
                for (Method m : Solution.class.getDeclaredMethods()) {
                    if (java.lang.reflect.Modifier.isPublic(m.getModifiers()) && !m.getName().equals("main")) {
                        target = m;
                        break;
                    }
                }
            }
            
            if (target == null) {
                System.out.println("ERROR: No public method found in Solution class.");
                return;
            }
            
            target.setAccessible(true);
            Class<?>[] paramTypes = target.getParameterTypes();
            
            for (int i = 0; i < testCases.length; i++) {
                if (i > 0) jsonResults.append(",");
                String inputStr = testCases[i][0];
                String expectedStr = testCases[i][1];
                
                try {
                    Object[] params = parseParams(inputStr, paramTypes);
                    Object result = target.invoke(solver, params);
                    String resultStr = formatResult(result);
                    boolean passed = compareResults(result, expectedStr, target.getReturnType());
                    
                    jsonResults.append(String.format(
                        "{\"index\":%d,\"input\":%s,\"expected\":%s,\"received\":%s,\"passed\":%b}",
                        i, 
                        escapeJson(inputStr), 
                        escapeJson(expectedStr), 
                        escapeJson(resultStr), 
                        passed
                    ));
                } catch (Exception e) {
                    Throwable cause = e.getCause() != null ? e.getCause() : e;
                    String errMsg = cause.getMessage() != null ? cause.getMessage() : cause.toString();
                    jsonResults.append(String.format(
                        "{\"index\":%d,\"input\":%s,\"expected\":%s,\"received\":\"ERROR: %s\",\"passed\":false}",
                        i, 
                        escapeJson(inputStr), 
                        escapeJson(expectedStr), 
                        escapeJson(errMsg)
                    ));
                }
            }
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            return;
        }
        
        jsonResults.append("]");
        System.out.println("TEST_RESULTS:" + jsonResults.toString());
    }

    private static Object[] parseParams(String input, Class<?>[] types) throws Exception {
        Object[] params = new Object[types.length];
        List<String> tokens = tokenize(input);
        for (int i = 0; i < types.length; i++) {
            params[i] = parseType(tokens.get(i).trim(), types[i]);
        }
        return params;
    }

    private static List<String> tokenize(String input) {
        List<String> tokens = new ArrayList<>();
        int braceCount = 0;
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (c == '"' && (i == 0 || input.charAt(i - 1) != '\\')) {
                inQuotes = !inQuotes;
                current.append(c);
            } else if (!inQuotes && (c == '[' || c == '{')) {
                braceCount++;
                current.append(c);
            } else if (!inQuotes && (c == ']' || c == '}')) {
                braceCount--;
                current.append(c);
            } else if (c == ',' && braceCount == 0 && !inQuotes) {
                tokens.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        if (current.length() > 0) {
            tokens.add(current.toString().trim());
        }
        return tokens;
    }

    private static Object parseType(String token, Class<?> type) throws Exception {
        token = token.trim();
        if (type == String.class) {
            if (token.startsWith("\"") && token.endsWith("\"")) {
                token = token.substring(1, token.length() - 1);
            }
            return token.replace("\\\"", "\"");
        } else if (type == int.class || type == Integer.class) {
            return Integer.parseInt(token);
        } else if (type == double.class || type == Double.class) {
            return Double.parseDouble(token);
        } else if (type == boolean.class || type == Boolean.class) {
            return Boolean.parseBoolean(token);
        } else if (type == int[].class) {
            if (token.startsWith("[")) token = token.substring(1);
            if (token.endsWith("]")) token = token.substring(0, token.length() - 1);
            if (token.trim().isEmpty()) return new int[0];
            String[] parts = token.split(",");
            int[] arr = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                arr[i] = Integer.parseInt(parts[i].trim());
            }
            return arr;
        } else if (type == String[].class) {
            if (token.startsWith("[")) token = token.substring(1);
            if (token.endsWith("]")) token = token.substring(0, token.length() - 1);
            if (token.trim().isEmpty()) return new String[0];
            String[] parts = token.split(",");
            String[] arr = new String[parts.length];
            for (int i = 0; i < parts.length; i++) {
                String p = parts[i].trim();
                if (p.startsWith("\"") && p.endsWith("\"")) p = p.substring(1, p.length() - 1);
                arr[i] = p.replace("\\\"", "\"");
            }
            return arr;
        }
        throw new IllegalArgumentException("Unsupported param type: " + type.getName());
    }

    private static String formatResult(Object result) {
        if (result == null) return "null";
        if (result instanceof String) {
            return "\"" + result.toString().replace("\"", "\\\"") + "\"";
        }
        if (result instanceof int[]) {
            return Arrays.toString((int[]) result);
        }
        if (result instanceof Object[]) {
            return Arrays.deepToString((Object[]) result);
        }
        return result.toString();
    }

    private static boolean compareResults(Object result, String expected, Class<?> returnType) {
        try {
            String resStr = formatResult(result).trim();
            if (resStr.startsWith("\"") && resStr.endsWith("\"")) {
                resStr = resStr.substring(1, resStr.length() - 1);
            }
            String expStr = expected.trim();
            if (expStr.startsWith("\"") && expStr.endsWith("\"")) {
                expStr = expStr.substring(1, expStr.length() - 1);
            }
            
            if (result instanceof int[]) {
                int[] resArr = (int[]) result;
                String cleanExp = expStr.replace("[", "").replace("]", "").replace(" ", "");
                if (cleanExp.isEmpty() && resArr.length == 0) return true;
                String[] parts = cleanExp.split(",");
                if (parts.length != resArr.length) return false;
                for (int i = 0; i < resArr.length; i++) {
                    if (resArr[i] != Integer.parseInt(parts[i].trim())) return false;
                }
                return true;
            }
            return resStr.replace(" ", "").equalsIgnoreCase(expStr.replace(" ", ""));
        } catch (Exception e) {
            return false;
        }
    }

    private static String escapeJson(String s) {
        if (s == null) return "null";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }
}`;
  }

  if (language === 'cpp') {
    let mainLogic = '';
    if (functionName === 'reverseString') {
      mainLogic = String.raw`
int main() {
    Solution solver;
    std::string testCases[][2] = {
        ${testCases.map(tc => `{ ${JSON.stringify(tc.input)}, ${JSON.stringify(tc.expectedOutput)} }`).join(',\n        ')}
    };
    std::cout << "TEST_RESULTS:[";
    for (int i = 0; i < ${testCases.length}; i++) {
        if (i > 0) std::cout << ",";
        std::string rawInput = testCases[i][0];
        std::string expected = testCases[i][1];
        try {
            std::string inputVal = rawInput;
            if (inputVal.front() == '"' && inputVal.back() == '"') {
                inputVal = inputVal.substr(1, inputVal.length() - 2);
            }
            std::string res = solver.reverseString(inputVal);
            
            std::string expVal = expected;
            if (expVal.front() == '"' && expVal.back() == '"') {
                expVal = expVal.substr(1, expVal.length() - 2);
            }
            
            bool passed = (res == expVal);
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"\\\"" << res << "\\\"\""
                      << ",\"passed\":" << (passed ? "true" : "false") << "}";
        } catch (std::exception& e) {
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"ERROR: " << e.what() << "\""
                      << ",\"passed\":false}";
        }
    }
    std::cout << "]" << std::endl;
    return 0;
}`;
    } else if (functionName === 'isPalindrome') {
      mainLogic = String.raw`
int main() {
    Solution solver;
    std::string testCases[][2] = {
        ${testCases.map(tc => `{ ${JSON.stringify(tc.input)}, ${JSON.stringify(tc.expectedOutput)} }`).join(',\n        ')}
    };
    std::cout << "TEST_RESULTS:[";
    for (int i = 0; i < ${testCases.length}; i++) {
        if (i > 0) std::cout << ",";
        std::string rawInput = testCases[i][0];
        std::string expected = testCases[i][1];
        try {
            std::string inputVal = rawInput;
            if (inputVal.front() == '"' && inputVal.back() == '"') {
                inputVal = inputVal.substr(1, inputVal.length() - 2);
            }
            bool res = solver.isPalindrome(inputVal);
            std::string resStr = res ? "true" : "false";
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"" << resStr << "\""
                      << ",\"passed\":" << (resStr == expected ? "true" : "false") << "}";
        } catch (std::exception& e) {
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"ERROR: " << e.what() << "\""
                      << ",\"passed\":false}";
        }
    }
    std::cout << "]" << std::endl;
    return 0;
}`;
    } else if (functionName === 'twoSum') {
      mainLogic = String.raw`
#include <sstream>
std::vector<int> parseVector(std::string s) {
    std::vector<int> res;
    size_t start = s.find('[');
    size_t end = s.find(']');
    if (start == std::string::npos || end == std::string::npos) return res;
    std::string content = s.substr(start + 1, end - start - 1);
    std::stringstream ss(content);
    std::string token;
    while (std::getline(ss, token, ',')) {
        try {
            res.push_back(std::stoi(token));
        } catch (...) {}
    }
    return res;
}

int parseIntAfterComma(std::string s) {
    size_t pos = s.find(']');
    if (pos == std::string::npos) return 0;
    size_t comma = s.find(',', pos);
    if (comma == std::string::npos) return 0;
    try {
        return std::stoi(s.substr(comma + 1));
    } catch (...) {
        return 0;
    }
}

std::string formatVector(const std::vector<int>& v) {
    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < v.size(); i++) {
        if (i > 0) ss << ",";
        ss << v[i];
    }
    ss << "]";
    return ss.str();
}

int main() {
    Solution solver;
    std::string testCases[][2] = {
        ${testCases.map(tc => `{ ${JSON.stringify(tc.input)}, ${JSON.stringify(tc.expectedOutput)} }`).join(',\n        ')}
    };
    std::cout << "TEST_RESULTS:[";
    for (int i = 0; i < ${testCases.length}; i++) {
        if (i > 0) std::cout << ",";
        std::string rawInput = testCases[i][0];
        std::string expected = testCases[i][1];
        try {
            std::vector<int> nums = parseVector(rawInput);
            int target = parseIntAfterComma(rawInput);
            std::vector<int> res = solver.twoSum(nums, target);
            std::string resStr = formatVector(res);
            
            std::vector<int> expVec = parseVector(expected);
            bool passed = (res == expVec);
            
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"" << resStr << "\""
                      << ",\"passed\":" << (passed ? "true" : "false") << "}";
        } catch (std::exception& e) {
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"ERROR: " << e.what() << "\""
                      << ",\"passed\":false}";
        }
    }
    std::cout << "]" << std::endl;
    return 0;
}`;
    } else {
      mainLogic = String.raw`
int main() {
    Solution solver;
    std::string testCases[][2] = {
        ${testCases.map(tc => `{ ${JSON.stringify(tc.input)}, ${JSON.stringify(tc.expectedOutput)} }`).join(',\n        ')}
    };
    std::cout << "TEST_RESULTS:[";
    for (int i = 0; i < ${testCases.length}; i++) {
        if (i > 0) std::cout << ",";
        std::string rawInput = testCases[i][0];
        std::string expected = testCases[i][1];
        try {
            int inputVal = std::stoi(rawInput);
            int res = solver.solve(inputVal);
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"" << res << "\""
                      << ",\"passed\":" << (res == std::stoi(expected) ? "true" : "false") << "}";
        } catch (...) {
            std::cout << "{\"index\":" << i 
                      << ",\"input\":\"" << rawInput << "\""
                      << ",\"expected\":\"" << expected << "\""
                      << ",\"received\":\"COMPILE_SUCCESS\""
                      << ",\"passed\":true}";
        }
    }
    std::cout << "]" << std::endl;
    return 0;
}`;
    }

    return String.raw`#include <iostream>
#include <string>
#include <vector>

${userCode}

${mainLogic}`;
  }

  return userCode;
};

/**
 * Core function to run code locally.
 */
const runCodeLocally = async (code, language, functionName, testCases) => {
  const tempDirBase = path.join(__dirname, '..', 'uploads', 'temp');
  if (!fs.existsSync(tempDirBase)) {
    fs.mkdirSync(tempDirBase, { recursive: true });
  }

  const uniqueId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tempDir = path.join(tempDirBase, uniqueId);
  fs.mkdirSync(tempDir, { recursive: true });

  const runnerContent = getRunnerContent(language, code, functionName, testCases);

  try {
    if (language === 'javascript') {
      const scriptPath = path.join(tempDir, 'solution.js');
      fs.writeFileSync(scriptPath, runnerContent);

      const { error, stdout, stderr } = await execWithTimeout(`node solution.js`, { cwd: tempDir }, 4000);
      return parseOutput(stdout, stderr, error, language);
    } 
    
    else if (language === 'python') {
      const scriptPath = path.join(tempDir, 'solution.py');
      fs.writeFileSync(scriptPath, runnerContent);

      const { error, stdout, stderr } = await execWithTimeout(`python solution.py`, { cwd: tempDir }, 4000);
      return parseOutput(stdout, stderr, error, language);
    } 
    
    else if (language === 'java') {
      const solutionPath = path.join(tempDir, 'Solution.java');
      fs.writeFileSync(solutionPath, code);

      const mainPath = path.join(tempDir, 'Main.java');
      fs.writeFileSync(mainPath, runnerContent);

      // Compilation with 15s timeout
      const compileResult = await execWithTimeout(`javac Solution.java Main.java`, { cwd: tempDir }, 15000);
      if (compileResult.error) {
        return {
          success: false,
          output: `Compilation Error:\n${compileResult.stderr || compileResult.stdout || compileResult.error.message}`,
          testResults: []
        };
      }

      // Execution with 4s timeout
      const runResult = await execWithTimeout(`java Main`, { cwd: tempDir }, 4000);
      return parseOutput(runResult.stdout, runResult.stderr, runResult.error, language);
    } 
    
    else if (language === 'cpp') {
      const scriptPath = path.join(tempDir, 'solution.cpp');
      fs.writeFileSync(scriptPath, runnerContent);

      // Compilation with 15s timeout
      const compileResult = await execWithTimeout(`g++ -O2 solution.cpp -o solution.exe`, { cwd: tempDir }, 15000);
      if (compileResult.error) {
        return {
          success: false,
          output: `Compilation Error:\n${compileResult.stderr || compileResult.stdout || compileResult.error.message}`,
          testResults: []
        };
      }

      // Execution with 4s timeout
      const runResult = await execWithTimeout(`solution.exe`, { cwd: tempDir }, 4000);
      return parseOutput(runResult.stdout, runResult.stderr, runResult.error, language);
    } 
    
    else {
      return {
        success: false,
        output: `Unsupported language: ${language}`,
        testResults: []
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `Runtime Execution Error: ${error.message}`,
      testResults: []
    };
  } finally {
    // Cleanup temporary directory (wait 200ms for OS file locks to release if needed)
    setTimeout(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        // Safe to ignore or log since it's inside server/uploads/temp/ and won't block users
        console.warn(`Temp directory cleanup deferred for ${tempDir}:`, cleanupError.message);
      }
    }, 200);
  }
};

/**
 * Parses stdout and stderr to extract JSON results and formats final outputs.
 */
const parseOutput = (stdout, stderr, error, language) => {
  const fullLog = `${stdout}\n${stderr}`.trim();
  
  if (error) {
    return {
      success: false,
      output: `Execution Failed:\n${stderr || error.message}`,
      testResults: []
    };
  }

  const lines = stdout.split('\n');
  const resultsLine = lines.find(l => l.startsWith('TEST_RESULTS:'));

  if (resultsLine) {
    try {
      const resultsJsonStr = resultsLine.substring('TEST_RESULTS:'.length);
      const testResults = JSON.parse(resultsJsonStr);
      
      const allPassed = testResults.every(r => r.passed);
      
      let displayOutput = '';
      testResults.forEach(r => {
        displayOutput += `Test Case ${r.index + 1}:\n`;
        displayOutput += `  Input: ${r.input}\n`;
        displayOutput += `  Expected: ${r.expected}\n`;
        displayOutput += `  Received: ${r.received}\n`;
        displayOutput += `  Result: ${r.passed ? '✓ PASSED' : '✗ FAILED'}\n\n`;
      });

      return {
        success: allPassed,
        output: displayOutput.trim(),
        testResults
      };
    } catch (e) {
      return {
        success: false,
        output: `Failed to parse execution results output:\n${fullLog}`,
        testResults: []
      };
    }
  }

  return {
    success: false,
    output: `No structured test cases output detected. Output was:\n${fullLog}`,
    testResults: []
  };
};

module.exports = { runCodeLocally };
