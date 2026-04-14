import joi from "joi"
export const generalRules = {
    email: joi.string().email({maxDomainSegments:2}),
    password: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,20}$/),
    confirmPassword: joi.string().valid(joi.ref("password")),
    }