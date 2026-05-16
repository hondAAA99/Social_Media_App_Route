/* Auth Types */
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  coverPictures?: string[];
  bio?: string;
  phone?: string;
  role: "user" | "admin";
  isConfirmed: boolean;
  is2FAEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: IUser;
}

export interface ISignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  attachment?: File;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IConfirmSignupPayload {
  token: string;
}

export interface IGoogleAuthPayload {
  tokenId: string;
}

/* Message Types */
export interface IMessage {
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
  updatedAt: string;
}

export interface ISendMessagePayload {
  content: string;
  attachments?: File[];
}

export interface IMessageListResponse {
  messages: IMessage[];
  total: number;
  page: number;
  pageSize: number;
}

/* Profile Update Types */
export interface IUpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  email?: string;
}

export interface IUpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* Error Response Types */
export interface IApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

/* Upload Progress Type */
export interface IUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/* Authentication State */
export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/* User Share Profile */
export interface ISharedProfile {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  coverPictures?: string[];
  bio?: string;
  email?: string;
}
