class Solution:
    def threeSum(self, nums: list[int]) ->list[list[int]]:
        nums.sort()
        n=len(nums)-1
        result = []
        print(nums)
        for i in range(n-1):
            print(i)
            if nums[i]>0:
                break
            if i>0 and nums[i]==nums[i-1]:
                continue
            j,k=i+1,n
            print(i,j,k)
            target = 0-nums[i]
            while j<k:
                print(i,j,j)
                print(nums[i],nums[j],nums[k])
                total = nums[j]+nums[k]
                if total > target:
                    k-=1
                elif total < target:
                    j+=1
                else:
                    result.append([nums[i], nums[j], nums[k]])
                    j+=1
                    k-=1
        return result


print(Solution().threeSum([0,0,0]))                
