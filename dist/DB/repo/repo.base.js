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
            .sort(options?.sort)
            .populate(options?.populate);
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
    async findOneAndUpdate({ filter, update, options, }) {
        return await this._model.findOneAndUpdate(filter, update, {
            ...options,
            new: true,
        });
    }
    async findByIdAndDelete({ id, options, }) {
        return await this._model.findByIdAndDelete(id, options);
    }
    async deleteOne({ filter, options, }) {
        return await this._model.deleteOne(filter);
    }
    async deleteMany({ filter, options, paranoid = false }) {
        return await this._model.deleteMany(filter);
    }
    async deleteById({ id, options, paranoid = false }) {
        return await this._model.findByIdAndDelete(id);
    }
}
export default repoBase;
