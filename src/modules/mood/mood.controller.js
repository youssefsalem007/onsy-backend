import { Router } from "express";
import * as MS from "./mood.service.js"
import * as MV from "./mood.validation.js"
import { authentication } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";
const moodRouter = Router()


moodRouter.post("/", authentication, validation(MV.logMoodSchema), MS.moodLog)
moodRouter.get("/all", authentication, MS.allMoods)
moodRouter.get("/:moodId", authentication, validation(MV.getMoodSchema), MS.allMoods)
moodRouter.patch("/:moodId", authentication, validation(MV.updateMoodSchema), MS.updateMood)




export default moodRouter