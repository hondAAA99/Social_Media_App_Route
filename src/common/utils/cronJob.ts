import cronJob from "node-cron";
import userRepo from "../../DB/repo/user.repo.js";
import type { NextFunction, Request, Response } from "express";

export const deleteUnconfirmedUsersCronJob = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  cronJob.schedule("0 0 * * *", async () => {
    const deletedUnconfirmedUsers = await new userRepo().deleteMany({
      filter: {
        confirmed: { $exists: false },
      },
    });

    console.log(
      `deleted ${deletedUnconfirmedUsers.deletedCount} unconfirmed users`,
    );
  });

  next();
};
