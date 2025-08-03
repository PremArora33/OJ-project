#include <iostream>
#include <string>
#include <algorithm>

class Solution {
public:
    std::string reverseString(std::string s) {
        std::reverse(s.begin(), s.end());
        return s;
    }
};

int main() {
    std::string input_s;
    std::getline(std::cin, input_s);

    Solution sol;
    std::string reversed_s = sol.reverseString(input_s);

    std::cout << reversed_s << std::endl;

    return 0;
}