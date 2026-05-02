import zod from 'zod';
export const updatePasswordSchema = {
    body: zod.object({
        email: zod.email(),
        oldPassword: zod.string(),
        newPassword: zod.string(),
        newCPassword: zod.string(),
    }).superRefine((value, ctx) => {
        if (value.newPassword != value.newCPassword) {
            ctx.addIssue({
                code: zod.z.ZodIssueCode.custom,
                message: "passwords do not match",
                path: ["cpassword"],
            });
        }
    })
};
export const createSignedUrlSchem = {
    body: zod.object({
        ContetnType: zod.string(),
        fileName: zod.string(),
    })
};
