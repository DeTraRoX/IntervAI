#include <iostream>
#include <string>
#include <vector>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        for (size_t i = 0; i < nums.size(); i++) {
            for (size_t j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return {(int)i, (int)j};
                }
            }
        }
        return {};
    }
};


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
        { "[2, 7, 11, 15], 9", "[0,1]" }
    };
    std::cout << "TEST_RESULTS:[";
    for (int i = 0; i < 1; i++) {
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
}