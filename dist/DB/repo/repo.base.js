class repoBase {
    _model;
    constructor(_model) {
        this._model = _model;
    }
    async create(data) {
        return await this._model.create(data);
    }
    async findAll({ filter, options, projection, }) {
        return await this._model
            .find(filter, projection)
            .skip(options?.skip)
            .limit(options?.limit)
            .sort(options?.sort).populate(options?.populate);
    }
    async findOne({ filter, projection, }) {
        return await this._model.findOne(filter, projection);
    }
    async findById({ id, projection, }) {
        return await this._model.findById(id, projection);
    }
    async findByIdAndUpdate({ id, update, options, }) {
        return await this._model.findByIdAndUpdate(id, update, {
            new: true,
            ...options,
        });
    }
    async findByIdAndDelete({ id, options, }) {
        return await this._model.findByIdAndDelete(id, options);
    }
    async userEmailExists(email) {
        return await this.findOne({
            filter: {
                email,
            },
        });
    }
}
export default repoBase;
