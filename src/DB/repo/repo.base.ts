import {
  _QueryFilter,
  ModifyResult,
  QueryOptions,
  WithLevel1NestedPaths,
} from 'mongoose'
import { PopulateOptions } from 'mongoose'
import { UpdateQuery } from 'mongoose'
import { ProjectionType } from 'mongoose'
import { HydratedDocument, Model, QueryFilter, Schema } from 'mongoose'

abstract class repoBase<Tdocument> {
  constructor(protected readonly _model: Model<Tdocument>) {}

  async create(data: Partial<Tdocument>): Promise<HydratedDocument<Tdocument>> {
    return await this._model.create(data)
  }

  async findAll({
    filter,
    options,
    projection,
  }: {
    filter: QueryFilter<Tdocument>
    projection?: ProjectionType<Tdocument> | null
    options?: QueryOptions<Tdocument>
  }): Promise<HydratedDocument<Tdocument>[] | null> {
    return await this._model
      .find(filter, projection)
      .skip(options?.skip!)
      .limit(options?.limit!)
      .sort(options?.sort)
      .populate(options?.populate as PopulateOptions)
  }

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<Tdocument>
    projection?: ProjectionType<Tdocument> | null
    options?: QueryOptions<Tdocument>
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this._model
      .findOne(filter, projection)
      .skip(options?.skip!)
      .limit(options?.limit!)
      .sort(options?.sort)
      .populate(options?.populate as PopulateOptions)
  }

  async findById({
    id,
    projection,
    options,
  }: {
    id: Schema.Types.ObjectId | any
    projection?: ProjectionType<Tdocument> | null | undefined
    options?: QueryOptions<Tdocument>
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this._model
      .findById(id, projection)
      .skip(options?.skip!)
      .limit(options?.limit!)
      .sort(options?.sort)
      .populate(options?.populate as PopulateOptions)
  }

  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Schema.Types.ObjectId
    update: UpdateQuery<Tdocument>
    options?: QueryOptions<Tdocument> | null
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this._model.findByIdAndUpdate(id, update, {
      new: true,
      ...options,
    })
  }

  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<WithLevel1NestedPaths<Tdocument>>
    update?: UpdateQuery<Tdocument>
    options?: QueryOptions<Tdocument>
  }): Promise<ModifyResult<Tdocument> | null> {
    return await this._model.findOneAndUpdate(filter, update, {
      ...options,
      new: true,
    })
  }

  async findByIdAndDelete({
    id,
    options,
  }: {
    id: Schema.Types.ObjectId
    options?: QueryOptions<Tdocument>
  }) {
    return await this._model.findByIdAndDelete(id, options)
  }

  async deleteOne({
    filter,
    options,
  }: {
    filter: QueryFilter<Tdocument>
    options?: QueryOptions<Tdocument>
  }) {
    return await this._model.deleteOne(filter)
  }

  async findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<Tdocument>
    options?: QueryOptions<Tdocument>
  }) {
    return await this._model.findOneAndDelete(filter)
  }

  async deleteMany({
    filter,
    options,
    paranoid = false,
  }: {
    filter: QueryFilter<Tdocument>
    options?: QueryOptions<Tdocument>
    paranoid?: Boolean
  }) {
    return await this._model.deleteMany(filter)
  }

  async paginate<T>({
    limit,
    page,
    search = {},
    options,
  }: {
    limit: number
    page: number
    search?: QueryFilter<T>
    options?: QueryOptions<Tdocument>
  }) {
    limit = !limit || limit < 0 ? 1 : Number(limit)
    page = !page || page < 0 ? 2 : Number(page)

    let skip = (limit - 1) * page

    const [data, totalDoc]: [any, number] = await Promise.all([
      this.findAll({
        filter: { ...(search ?? {}) },
        options: {
          skip,
          limit,
          options,
        },
      }),
      this._model.countDocuments({ ...(search ?? {}) }),
    ])

    let totalPages = totalDoc / limit

    return {
      meta: {
        totalDoc,
        currentPage: page,
        totalPages,
        limit,
      },
      data,
    }
  }
}

export default repoBase
