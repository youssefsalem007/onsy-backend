import joi from "joi";
import { generalRules } from "../../common/utils/security/generalRules.js";
import { genderEnum } from "../../common/enum/auth.enum.js";

export const signUpSchema = {
    body:joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: generalRules.email.required(),
        password:generalRules.password.required(),
        confirmPassword: generalRules.confirmPassword.required(),
        gender: joi.string().valid(...Object.values(genderEnum)).required(),
        age:joi.number().required()
    }).required(),
    file: generalRules.file.required()
}

export const signInSchema = {
    body:joi.object({
        email: generalRules.email.required(),
        password:generalRules.password.required(),
    }).required(),
}
