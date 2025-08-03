#include <vector>
#include <iostream>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    for (int i = 0; i < nums.size(); ++i) {
        for (int j = i + 1; j < nums.size(); ++j) {
            if (nums[i] + nums[j] == target) {
                return {i, j};
            }
        }
    }
    return {};
}

int main() {
    std::vector<int> nums1 = {2, 7, 11, 15};
    int target1 = 9;
    std::vector<int> result1 = twoSum(nums1, target1);
    if (!result1.empty()) {
        std::cout << "For nums = {2, 7, 11, 15}, target = 9: Indices [" << result1[0] << ", " << result1[1] << "]" << std::endl;
    } else {
        std::cout << "No solution found for nums1." << std::endl;
    }

    std::vector<int> nums2 = {3, 2, 4};
    int target2 = 6;
    std::vector<int> result2 = twoSum(nums2, target2);
    if (!result2.empty()) {
        std::cout << "For nums = {3, 2, 4}, target = 6: Indices [" << result2[0] << ", " << result2[1] << "]" << std::endl;
    } else {
        std::cout << "No solution found for nums2." << std::endl;
    }

    std::vector<int> nums3 = {3, 3};
    int target3 = 6;
    std::vector<int> result3 = twoSum(nums3, target3);
    if (!result3.empty()) {
        std::cout << "For nums = {3, 3}, target = 6: Indices [" << result3[0] << ", " << result3[1] << "]" << std::endl;
    } else {
        std::cout << "No solution found for nums3." << std::endl;
    }

    return 0;
}