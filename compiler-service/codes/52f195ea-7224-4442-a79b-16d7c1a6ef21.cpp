#include <iostream> // This line includes the input/output stream library,
                    // which allows us to use std::cout (for output)
                    // and std::cin (for input).

int main() {
    // Declare two integer variables to store the numbers
    int num1;
    int num2;

    // Declare a variable to store the sum
    int sum;

    // Prompt the user to enter the first number
    std::cout << "Enter the first number: ";

    // Read the first number from the user and store it in num1
    std::cin >> num1;

    // Prompt the user to enter the second number
    std::cout << "Enter the second number: ";

    // Read the second number from the user and store it in num2
    std::cin >> num2;

    // Calculate the sum
    sum = num1 + num2;

    // Display the result
    std::cout << "The sum of " << num1 << " and " << num2 << " is: " << sum << std::endl;

    // Return 0 to indicate successful program execution
    return 0;
}