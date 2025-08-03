#include <iostream>

int main() {
    int num1, num2;

    // Remove the input prompts, as input is provided via the input box
    std::cin >> num1; // Reads the first number from input
    std::cin >> num2; // Reads the second number from input

    int sum = num1 + num2;

    // Only print the final result
    std::cout << "The sum of " << num1 << " and " << num2 << " is: " << sum << std::endl;

    return 0;
}
