import apiClient from "./axios.config";
import {
  IUser,
  IUpdateProfilePayload,
  IUpdatePasswordPayload,
  ISharedProfile,
} from "@types/index";

export const userApi = {
  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await apiClient.get<{ user: IUser }>("/users/getProfile");
    return response.data.user;
  },

  /**
   * Get shared profile by user ID
   */
  async getSharedProfile(userId: string) {
    const response = await apiClient.get<{ user: ISharedProfile }>(
      `/users/share-profile/${userId}`,
    );
    return response.data.user;
  },

  /**
   * Update user profile
   */
  async updateProfile(payload: IUpdateProfilePayload) {
    const response = await apiClient.patch<{ user: IUser }>(
      "/users/update-user",
      payload,
    );
    return response.data.user;
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("attachment", file);

    const response = await apiClient.patch<{ user: IUser }>(
      "/users/updateProfilePicture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.user;
  },

  /**
   * Delete profile photo
   */
  async deleteProfilePhoto() {
    const response = await apiClient.delete<{ user: IUser }>(
      "/users/deleteProfilePhoto",
    );
    return response.data.user;
  },

  /**
   * Upload cover pictures (max 2)
   */
  async uploadCoverPictures(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await apiClient.patch<{ user: IUser }>(
      "/users/updateCoverPictures",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.user;
  },

  /**
   * Delete cover photo
   */
  async deleteCoverPhoto() {
    const response = await apiClient.delete<{ user: IUser }>(
      "/users/deleteCoverPhotos",
    );
    return response.data.user;
  },

  /**
   * Update password
   */
  async updatePassword(payload: IUpdatePasswordPayload) {
    const response = await apiClient.patch("/users/update-password", payload);
    return response.data;
  },

  /**
   * Get search count for user (admin only)
   */
  async getSearchCount(userId: string) {
    const response = await apiClient.get(`/users/count-search/${userId}`);
    return response.data;
  },
};

export default userApi;
