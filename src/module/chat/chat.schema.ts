import zod from 'zod'
import { genRules } from '../../common/utils/validationGeneralRules.js'


export const getChatSchema = {
  params: zod.object({
    userId: genRules.id,
  }),
}