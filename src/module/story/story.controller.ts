import { Router } from 'express'
import storyServices from './story.services.js'
import { authenticate } from '../../common/middleware/authenticate.js'

const storyRouter: Router = Router()

storyRouter.post('/createStory', authenticate, storyServices.createStory)
storyRouter.get('/feed', authenticate, storyServices.getFeed)
storyRouter.get('/view-story/:storyId', authenticate, storyServices.viewStory)
storyRouter.get('/getViewers/:storyId', authenticate, storyServices.getViewers)
storyRouter.delete(
  '/deleteStory/:storyId',
  authenticate,
  storyServices.deleteStory,
)

export default storyRouter
