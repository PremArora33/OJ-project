#include <iostream> // Required for input/output operations
#include <vector>   // Required for std::vector
#include <unordered_map> // Required for std::unordered_map
#include <limits> // Required for std::numeric_limits

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> numMap; // Maps number to its index

        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            // Check if the complement exists in the map
            if (numMap.count(complement)) {
                return {numMap[complement], i};
            }
            // If not found, add the current number and its index to the map
            numMap[nums[i]] = i;
        }
        return {}; // Should not reach here based on problem constraints
    }
};

int main() {
    Solution sol;
    std::vector<int> nums;
    int target;
    int num_elements;

    std::cout << "Enter the number of elements in the array: ";
    // Use a loop for robust input to handle non-integer input
    while (!(std::cin >> num_elements) || num_elements <= 1) {
        std::cout << "Invalid input. Please enter a positive integer greater than 1: ";
        std::cin.clear(); // Clear the error flag
        // Ignore the rest of the invalid input line
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }

    std::cout << "Enter the elements of the array, separated by spaces: ";
    for (int i = 0; i < num_elements; ++i) {
        int num;
        while (!(std::cin >> num)) {
            std::cout << "Invalid input. Please enter an integer: ";
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        }
        nums.push_back(num);
    }

    std::cout << "Enter the target sum: ";
    while (!(std::cin >> target)) {
        std::cout << "Invalid input. Please enter an integer for the target sum: ";
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }

    std::vector<int> result = sol.twoSum(nums, target);

    if (!result.empty()) {
        std::cout << "The indices of the two numbers that add up to the target are: "
                  << result[0] << " and " << result[1] << std::endl;
    } else {
        std::cout << "No two numbers found that add up to the target." << std::endl;
    }

    return 0;
}