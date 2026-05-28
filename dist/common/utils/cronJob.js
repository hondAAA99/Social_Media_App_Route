import cronJob from "node-cron";
import userRepo from "../../DB/repo/user.repo.js";
export const deleteUnconfirmedUsersCronJob = (req, res, next) => {
    cronJob.schedule("0 0 * * *", async () => {
        const deletedUnconfirmedUsers = await new userRepo().deleteMany({
            filter: {
                confirmed: { $exists: false },
            },
        });
        console.log(`deleted ${deletedUnconfirmedUsers.deletedCount} unconfirmed users`);
    });
    next();
};
