import * as db_service from "../../DB/db.service.js"
import authModel from "../../DB/models/auth.model.js"
import cloudinary from "../../common/utils/cloudinary.js"
import successResponse from "../../common/utils/response.success.js"


export const signUp = async (req,res,next) => {
    const {firstName, lastName, email, password, gender, age} = req.body
    
    if(await db_service.findOne({
        model:authModel,
        filter:{email}
    })
){
    throw new Error("Email already exists")
}

    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path)
    
    const auth = await db_service.create({
        model: authModel,
        data:{
            firstName,
            lastName,
            email,
            password,
            gender,
            age,
            profilePicture:{secure_url, public_id}
        }
    })
    successResponse({res, status:201, message:"Successful signUp", data:auth})
}