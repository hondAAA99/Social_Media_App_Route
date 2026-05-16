import apiClient from "./axios.config";
import { IMessage, IMessageListResponse } from "@types/index";

export const messageApi = {
  /**
   * Get all messages for the current user
   */
  async getAllMessages(page = 1, pageSize = 20) {
    const response = await apiClient.get<IMessageListResponse>("/message/", {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Send a message with optional attachments
   */
  async sendMessage(content: string, attachments?: File[]) {
    const formData = new FormData();
    formData.append("content", content);

    if (attachments && attachments.length > 0) {
      attachments.slice(0, 3).forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await apiClient.post<IMessage>(
      "/message/send-message",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Get a specific message by ID
   */
  async getMessageById(messageId: string) {
    const response = await apiClient.get<IMessage>(
      `/message/get-message/${messageId}`,
    );
    return response.data;
  },

  /**
   * Delete a message by ID
   */
  async deleteMessage(messageId: string) {
    const response = await apiClient.delete(
      `/message/delete-message/${messageId}`,
    );
    return response.data;
  },
};

export default messageApi;
