import apiClient from "./axios.config";
export const messageApi = {
    async getAllMessages(page = 1, pageSize = 20) {
        const response = await apiClient.get("/message/", {
            params: { page, pageSize },
        });
        return response.data;
    },
    async sendMessage(content, attachments) {
        const formData = new FormData();
        formData.append("content", content);
        if (attachments && attachments.length > 0) {
            attachments.slice(0, 3).forEach((file) => {
                formData.append("attachments", file);
            });
        }
        const response = await apiClient.post("/message/send-message", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    async getMessageById(messageId) {
        const response = await apiClient.get(`/message/get-message/${messageId}`);
        return response.data;
    },
    async deleteMessage(messageId) {
        const response = await apiClient.delete(`/message/delete-message/${messageId}`);
        return response.data;
    },
};
export default messageApi;
