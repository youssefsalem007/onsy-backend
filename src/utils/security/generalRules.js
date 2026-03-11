import joi from "joi"
export const generalRules = {
    email: joi.string().email({maxDomainSegments:2}),
    password: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,12}$/),
    confirmPassword: joi.string().valid(joi.ref("password")),
    
    file: joi.object({
    fieldname: joi.string().required(),
    originalname:joi.string().required(),
    encoding:joi.string().required(),
    mimetype:joi.string().required(),
     destination:joi.string().required(),
    filename:joi.string().required(),
    path:joi.string().required(),
    size:joi.number().required()
}).message({
    'any.required':"file is required"
})
}