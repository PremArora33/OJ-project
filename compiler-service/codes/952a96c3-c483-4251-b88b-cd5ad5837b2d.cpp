#include <iostream>
#include <string>
#include <algorithm> // Required for std::reverse

class Solution {
public:
    std::string reverseString(std::string s) {
        // Reverse the string in-place
        std::reverse(s.begin(), s.end());
        return s;
    }
};

// Main function for local testing or if your platform expects it
int main() {
    // This part assumes your compiler service or platform will call your Solution class.
    // If it only expects a main function that reads from stdin and prints to stdout,
    // use the alternative simple main below.

    std::string input_s;
    std::getline(std::cin, input_s); // Read the entire line from standard input

    Solution sol;
    std::string reversed_s = sol.reverseString(input_s);

    std::cout << reversed_s << std::endl; // Print the reversed string to standard output

    return 0;
}