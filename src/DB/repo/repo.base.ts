import {
  _QueryFilter,
  ModifyResult,
  QueryOptions,
  WithLevel1NestedPaths,
} from "mongoose";
import { PopulateOptions } from "mongoose";
import { UpdateQuery } from "mongoose";
import { ProjectionType } from "mongoose";
import { HydratedDocument, Model, QueryFilter, Schema } from "mongoose";

abstract class repoBase<Tdocument> {
  constructor(protected readonly _model: Model<Tdocument>) {}

  async create(data: Partial<Tdocument>): Promise<HydratedDocument<Tdocument>> {
    return await this._model.create(data);
  }

  async findAll({
    filter,
    options,
    projection,
  }: {
    filter: QueryFilter<Tdocument>;
    projection?: ProjectionType<Tdocument> | null;
    options?: QueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument>[] | null> {
    return await this._model
      .find(filter, projection)
      .skip(options?.skip!)
      .limit(options?.limit!)
      .sort(options?.sort)
      .populate(options?.populate as PopulateOptions);
  }

  async findOne({
    filter,
    projection,
  }: {
    filter: QueryFilter<Tdocument>;
    projection?: ProjectionType<Tdocument> | null;
    options?: QueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this._model.findOne(filter, projection);
  }

  async findById({
    id,
    projection,
  }: {
    id: Schema.Types.ObjectId;
    projection?: ProjectionType<Tdocument> | null | undefined;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this._model.findById(id, projection);
  }

  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Schema.Types.ObjectId;
    update: UpdateQuery<Tdocument>;
    options?: QueryOptions<Tdocument> | null;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this._model.findByIdAndUpdate(id, update, {
      new: true,
      ...options,
    });
  }

  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<WithLevel1NestedPaths<Tdocument>>;
    update?: UpdateQuery<Tdocument>;
    options?: QueryOptions<Tdocument>;
  }): Promise<ModifyResult<Tdocument> | null> {
    return await this._model.findOneAndUpdate(filter, update, {
      ...options,
      new: true,
    });
  }

  async findByIdAndDelete({
    id,
    options,
  }: {
    id: Schema.Types.ObjectId;
    options: QueryOptions<Tdocument>;
  }) {
    return await this._model.findByIdAndDelete(id, options);
  }
}

export default repoBase;
