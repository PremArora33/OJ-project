#include <string>
#include <algorithm>

class Solution {
public:
    std::string reverseString(std::string s) {
        std::reverse(s.begin(), s.end());
        return s;
    }
};
// There should NOT be a 'main' function in this code snippet