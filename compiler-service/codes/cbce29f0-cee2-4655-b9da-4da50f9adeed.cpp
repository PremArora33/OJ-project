#include <vector>
#include <iostream>
#include <algorithm>

void sortColors(std::vector<int>& nums) {
    int low = 0;
    int mid = 0;
    int high = nums.size() - 1;

    while (mid <= high) {
        if (nums[mid] == 0) {
            std::swap(nums[low], nums[mid]);
            low++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            std::swap(nums[mid], nums[high]);
            high--;
        }
    }
}

int main() {
    std::vector<int> nums1 = {2, 0, 2, 1, 1, 0};
    sortColors(nums1);
    for (int num : nums1) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    std::vector<int> nums2 = {2, 0, 1};
    sortColors(nums2);
    for (int num : nums2) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    std::vector<int> nums3 = {0, 0, 0};
    sortColors(nums3);
    for (int num : nums3) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    std::vector<int> nums4 = {1, 1, 1};
    sortColors(nums4);
    for (int num : nums4) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    std::vector<int> nums5 = {2, 2, 2};
    sortColors(nums5);
    for (int num : nums5) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    std::vector<int> nums6 = {};
    sortColors(nums6);
    for (int num : nums6) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    return 0;
}