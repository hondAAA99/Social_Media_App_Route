export const roleEnum = {
  user: "user",
  admin: "admin",
} as const;

export const providerEnum = {
  system: "system",
  google: "google",
};

export const genderEnum = {
  male: "male",
  female: "female",
  preferNotToSay : 'prefer not to say'
} ;

export const friendsFlagEnum = {
  friend: "friend",
  requested: "requested",
  declined : 'declined'
};
export const friendsRequestEnum = {
  accept: "accept-request",
  reject: "reject-request",
};

export const blockUserEnum = {
  block: "block",
  unBlock: "un-block",
};

export const confirmEmailFlagEnum = {
  confirmMail: "confirm-sign-up",
  enable2FA: "enable-2fa",
};


