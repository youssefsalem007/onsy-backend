import joi from "joi";
import { generalRules } from "../../utils/security/generalRules.js";
import { genderEnum } from "../../common/enum/auth.enum.js";

export const signUpSchema = {
    body:joi.object({
        userName: joi.string().required(),
        email: generalRules.email.required(),
        password:generalRules.password.required(),
        confirmPassword: generalRules.confirmPassword.required(),
        gender: joi.string().valid(...Object.values(genderEnum)).required(),
        age:joi.number().required()
    }).required(),
    file: generalRules.file.required()
}