import joi from "joi";
import { generalRules } from "../../common/utils/security/generalRules.js";

export const logMoodSchema = {
    body: joi.object({
        mood: joi.number().valid(1, 2, 3, 4, 5).required()
    }).required()
}


export const getMoodSchema = {
    params: joi.object({
        moodId: generalRules.id.required()
    }).required()
}

export const updateMoodSchema = {
    body: joi.object({
        mood:joi.number().valid(1, 2, 3, 4, 5).required()
    }).required(),
    params: joi.object({
        moodId: generalRules.id.required()
    }).required()
}