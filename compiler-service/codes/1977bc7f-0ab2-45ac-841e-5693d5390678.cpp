#include <string>
#include <algorithm>

class Solution {
public:
    std::string reverseString(std::string s) {
        // Write your code here to reverse the string s
        std::reverse(s.begin(), s.end());
        return s;
    }
};