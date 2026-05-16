import apiClient from "./axios.config";
export const userApi = {
    async getProfile() {
        const response = await apiClient.get("/users/getProfile");
        return response.data.user;
    },
    async getSharedProfile(userId) {
        const response = await apiClient.get(`/users/share-profile/${userId}`);
        return response.data.user;
    },
    async updateProfile(payload) {
        const response = await apiClient.patch("/users/update-user", payload);
        return response.data.user;
    },
    async uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append("attachment", file);
        const response = await apiClient.patch("/users/updateProfilePicture", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.user;
    },
    async deleteProfilePhoto() {
        const response = await apiClient.delete("/users/deleteProfilePhoto");
        return response.data.user;
    },
    async uploadCoverPictures(files) {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("attachments", file);
        });
        const response = await apiClient.patch("/users/updateCoverPictures", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.user;
    },
    async deleteCoverPhoto() {
        const response = await apiClient.delete("/users/deleteCoverPhotos");
        return response.data.user;
    },
    async updatePassword(payload) {
        const response = await apiClient.patch("/users/update-password", payload);
        return response.data;
    },
    async getSearchCount(userId) {
        const response = await apiClient.get(`/users/count-search/${userId}`);
        return response.data;
    },
};
export default userApi;
