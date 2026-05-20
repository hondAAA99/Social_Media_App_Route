import zod from "zod";
export const signUpSchema = {
    body: zod
        .object({
        userName: zod.string(),
        email: zod.email(),
        password: zod.string(),
        cpassword: zod.string(),
        phone: zod.string().optional(),
        role: zod.string().optional(),
        gender: zod.string().optional(),
        DateOfBirth: zod.date(),
    })
        .superRefine((data, ctx) => {
        if (data.password != data.cpassword) {
            ctx.addIssue({
                code: zod.z.ZodIssueCode.custom,
                message: "passwords do not match",
                path: ["cpassword"],
            });
        }
        if (Number(new Date(data.DateOfBirth).getTime) > Date.now() ||
            Number(new Date(data.DateOfBirth).getTime) - Date.now() < 378691200000) {
            ctx.addIssue({
                code: zod.z.ZodIssueCode.custom,
                message: "invalid Date",
                path: ["DateOfBirth"],
            });
        }
    }),
};
export const signInSchema = {
    body: zod.object({
        email: zod.email(),
        password: zod.string(),
        fcm: zod.string(),
    }),
};
export const confirmSignUpSchema = {
    body: zod.object({
        email: zod.email(),
        otp: zod.string().length(5),
    }),
};
export const forgetPassword = {
    body: zod.object({
        email: zod.email(),
    }),
};
export const resetPassowrd = {
    body: zod.object({
        email: zod.email(),
        newPassword: zod.string(),
        otp: zod.string().length(5),
    }),
};
export const resendOtp = {
    body: zod.object({
        email: zod.email(),
    }),
};
export const confirmLoginSchema = {
    body: zod.object({
        email: zod.email(),
        otp: zod.string().length(5),
    }),
};
