#include <iostream>
#include <string>
#include <algorithm> // For std::reverse

int main() {
    std::string s;
    std::getline(std::cin, s); // Read the whole line as input

    std::reverse(s.begin(), s.end()); // Reverse the string
    
    std::cout << s << std::endl; // Print the result

    return 0;
}