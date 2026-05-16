import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import newFeedSevices from "./newFeed.sevices.js";

const newsFeedRouter: Router = Router();

newsFeedRouter.get("/get-feed", authenticate, newFeedSevices.getFeed);

export default newsFeedRouter;
