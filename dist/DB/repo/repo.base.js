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
    async findOne({ filter, projection, options, }) {
        return await this._model
            .findOne(filter, projection)
            .skip(options?.skip)
            .limit(options?.limit)
            .sort(options?.sort)
            .populate(options?.populate);
    }
    async findById({ id, projection, populate, }) {
        return await this._model
            .findById(id, projection)
            .populate(populate);
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
    async findOneAndDelete({ filter, options, }) {
        return await this._model.findOneAndDelete(filter);
    }
    async deleteMany({ filter, options, paranoid = false, }) {
        return await this._model.deleteMany(filter);
    }
    async paginate({ limit, page, populate, search = {}, sort, }) {
        limit = !limit || limit < 0 ? 1 : Number(limit);
        page = !page || page < 0 ? 2 : Number(page);
        let skip = (limit - 1) * page;
        const [data, totalDoc] = await Promise.all([
            this.findAll({
                filter: { ...(search ?? {}) },
                options: {
                    skip,
                    limit,
                    sort,
                    populate,
                },
            }),
            this._model.countDocuments({ ...(search ?? {}) }),
        ]);
        let totalPages = totalDoc / limit;
        return {
            meta: {
                totalDoc,
                currentPage: page,
                totalPages,
                limit,
            },
            data,
        };
    }
}
export default repoBase;
