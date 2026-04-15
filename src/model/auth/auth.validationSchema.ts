import zod from "zod";
export const signUpSchema = {
  body: zod
    .object({
      userName: zod.string(),
      email: zod.string(),
      password: zod.string(),
      cpassword: zod.string(),
      phone: zod.string().optional(),
      role: zod.string().optional(),
      gender: zod.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.password != data.cpassword) {
        ctx.addIssue({
          code: zod.z.ZodIssueCode.custom,
          message: "passwords do not match",
          path: ["cpassword"],
        });
      }
    }),
};
export const signInSchema = {
  body: zod.object({
    email: zod.string(),
    password: zod.string(),
  }),
};
