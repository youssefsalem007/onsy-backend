import successResponse from "../../common/utils/response.success.js"
import * as db_service from "../../DB/db.service.js"
import authModel from "../../DB/models/auth.model.js"
import {Compare, Hash} from "../../common/utils/security/hash.security.js"
import { SALT_ROUNDS } from "../../../config/config.service.js"




export const getProfile = async (req, res, next) => {
    const {id} = req.auth
    const user = await db_service.findOne({
        model: authModel,
        filter: { _id: id },
        select: "-password -createdAt -updatedAt -__v -isVerified -otp"
    })
    if(!user){
        return next(new Error("User not found", {cause: 404}))
    }
    successResponse({res,message: "User Profile", data: user});
}

export const updateProfile = async (req, res, next) => {
    const { id } = req.auth
    const { firstName, lastName, gender, age } = req.body

    const updatedUser = await db_service.update({
        model: authModel,
        filter: { _id: id },
        update: { firstName, lastName, gender, age },
        options: {
            projection: { password: 0, otp: 0, isVerified: 0, isOtpVerified: 0, __v: 0 }
        }
    })

    if (!updatedUser) {
        return next(new Error("User not found", { cause: 404 }))
    }

    successResponse({ res, message: "Profile updated successfully", data: updatedUser })
}

export const changePassword = async (req, res, next) => {
    const { id } = req.auth
    const { oldPassword, newPassword } = req.body

    if(oldPassword === newPassword){
        return next(new Error("New password cannot be same as old password"))
    }

    const user = await db_service.findOne({
        model: authModel,
        filter: { _id: id },
    })
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }

    if(!Compare({plain_text: oldPassword, cipher_text: user.password})){
        return next(new Error("Invalid old password", { cause: 400 }))
    }

    const updatedUser = await db_service.update({
        model: authModel,
        filter: { _id: id },
        update: { password: Hash({plain_text: newPassword, salt_rounds: SALT_ROUNDS}) }, 
        options: {
            projection: { password: 0, otp: 0, isVerified: 0, isOtpVerified: 0, __v: 0 }
        }
    })

    if (!updatedUser) {
        return next(new Error("User not found", { cause: 404 }))
    }

    successResponse({ res, message: "Password changed successfully", data: updatedUser })
}

export const deleteAccount = async (req, res, next) => {
    const { id } = req.auth
    const user = await db_service.findOne({
        model: authModel,
        filter: { _id: id },
    })
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }
    await db_service.deleteOne({
        model: authModel,
        filter: { _id: id },
    })
    successResponse({ res, message: "Account deleted successfully" })
}