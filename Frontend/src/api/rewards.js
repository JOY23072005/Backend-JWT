import axiosInstance from "./axios";

/**
 * GET
 * Fetch rewards
 */
export const getRewards = async (params = {}) => {
  const { data } = await axiosInstance.get("/reward/manage", {
    params,
  });

  return data;
};

/**
 * POST
 * Create reward
 */
export const createReward = async (reward) => {
  const { data } = await axiosInstance.post(
    "/reward",
    reward
  );

  return data;
};

/**
 * PATCH
 * Update reward
 */
export const updateReward = async (
  rewardId,
  reward
) => {
  const { data } = await axiosInstance.patch(
    `/reward/${rewardId}`,
    reward
  );

  return data;
};

/**
 * PATCH
 * Update reward image
 */
export const updateRewardImage = async (
  rewardId,
  image
) => {
  const formData = new FormData();

  formData.append("image", image);

  const { data } = await axiosInstance.patch(
    `/reward/${rewardId}/image`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * PATCH
 * Toggle reward status
 */
export const toggleRewardStatus = async (
  rewardId,
  isActive
) => {
  const { data } = await axiosInstance.patch(
    `/reward/${rewardId}/toggle`,
    {
      isActive,
    }
  );

  return data;
};

/**
 * DELETE
 * Delete reward
 */
export const deleteReward = async (
  rewardId
) => {
  const { data } =
    await axiosInstance.delete(
      `/reward/${rewardId}`
    );

  return data;
};

/**
 * POST
 * Upload rewards CSV
 */
export const uploadRewardsCSV = async (
  file
) => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await axiosInstance.post(
    "/reward/upload-csv",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
};