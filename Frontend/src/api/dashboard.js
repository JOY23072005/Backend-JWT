import axiosInstance from "./axios.js";

export const getDashboard = async () => {
  const { data } = await axiosInstance.get("/api/dashboard");
  console.log(data);
  return data;
};