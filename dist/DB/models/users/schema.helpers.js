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
        if (paranoid && paranoid === true) {
            this.setQuery({ deletedAt: { $exists: false }, ...rest });
        }
        else {
            this.setQuery({ ...rest });
        }
    });
    userSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
        const query = this.getQuery();
        if (query.force == true) {
            this.setQuery(query);
        }
        else {
            this.setQuery({ ...query, deleteAt: { $exists: false } });
        }
    });
};
export default UserSchemaHelpersCalling;
