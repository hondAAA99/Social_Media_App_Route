import zod from 'zod'
import { genRules } from '../../common/utils/validationGeneralRules.js'

export const createStory = {
  body: zod.object({
    text: zod.string().max(500).optional(),
    backGroundColor: zod.string().optional(),
    excludeUsers: zod.array(zod.string()).optional(),
    availiabilty: zod.enum(['public', 'private', 'friends']).optional(),
    attachments: genRules.file.optional(),
  }),
}
export const viewStory = {
  params: zod.object({
    storyId: genRules.id,
  }),
}
export const getViewers = {
  params: zod.object({
    storyId: genRules.id,
  }),
}
export const deleteStory = {
  params: zod.object({
    storyId: genRules.id,
  }),
}
