import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendMessageSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, Send, Image, Trash2 } from "lucide-react";

interface SendMessageFormData {
  content: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  attachments?: string[];
  createdAt: string;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
  });

  // Simulated fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call: const result = await messageApi.getAllMessages()
        setMessages([]);
      } catch (err: any) {
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setAttachments(files);
  };

  const onSubmit = async (data: SendMessageFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      // const result = await messageApi.sendMessage(data.content, attachments)
      // setMessages([result, ...messages])
      reset();
      setAttachments([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      // Replace with actual API call: await messageApi.deleteMessage(messageId)
      setMessages(messages.filter((m) => m._id !== messageId));
    } catch (err: any) {
      setError("Failed to delete message");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Send Message Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Send a Message</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Message Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message
            </label>
            <textarea
              {...register("content")}
              placeholder="Write your message here..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 cursor-pointer"
              />
              <Image className="text-gray-400" size={24} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Max 3 files, 5MB each</p>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, idx) => (
                  <p key={idx} className="text-sm text-primary-600">
                    ✓ {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" message="" />
              </>
            ) : (
              <>
                <Send size={20} />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Your Messages</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {messages.length} messages
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">No messages yet</p>
            <p className="text-sm text-gray-500">
              Send your first message to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {message.sender.firstName} {message.sender.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(message._id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="text-gray-700 mb-3">{message.content}</p>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {message.attachments.map((attachment, idx) => (
                      <img
                        key={idx}
                        src={attachment}
                        alt={`Attachment ${idx + 1}`}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
