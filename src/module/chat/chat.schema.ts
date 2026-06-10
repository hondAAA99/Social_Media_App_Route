import zod from 'zod'
import { genRules } from '../../common/utils/validationGeneralRules.js'
import { ErrorConflict } from '../../common/utils/globalresponse.js'

export const getChatSchema = {
  params: zod.object({
    userId: genRules.shape.id,
  }),
}

export const createGroupChat = {
  body: zod.object({
    participation: zod.array(genRules.shape.id).refine(value => {
      if (
        value &&
        (value as Array<any>).length !== new Set(value as Array<any>).size
      ) {
        return ErrorConflict('dublicated tags')
      }
    }),
    groupImage: genRules.shape.file.optional(),
    group: zod.string(),
  }),
}
