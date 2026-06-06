import mongoose from 'mongoose';
import { userSchema } from './users.schema.js';
const UserSchemaHelpersCalling = () => {
    userSchema
        .virtual('userName')
        .set(function (value) {
        const [fn, ln] = value.split(' ');
        this.firstName = fn;
        this.lastName = ln;
    })
        .get(function () {
        return this.firstName + ' ' + this.lastName;
    });
    userSchema.pre(['findOne', 'find'], function () {
        const query = this.getQuery();
        const { paranoid, ...rest } = query;
        if (paranoid === true) {
            this.setQuery({ deletedAt: { $exists: false }, ...rest });
        }
        else {
            this.setQuery({ ...rest });
        }
    });
    userSchema.pre(['deleteMany', 'deleteOne', 'findOneAndDelete'], async function () {
        const condition = this.getQuery();
        const userId = condition._id;
        await Promise.all([
            mongoose.models.users.findByIdAndUpdate(userId, {
                deletedAt: Date.now(),
            }),
            mongoose.models.posts.findOneAndUpdate({
                createdBy: userId,
            }, { deletedAt: Date.now() }),
            mongoose.models.comments.findOneAndUpdate({
                createdBy: userId,
            }, { deletedAt: Date.now() }),
        ]);
    });
    userSchema.index({ 'story.createdAt': 1 }, { expireAfterSeconds: 0 });
};
export default UserSchemaHelpersCalling;
