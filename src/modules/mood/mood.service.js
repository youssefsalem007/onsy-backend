import { model } from "mongoose"
import * as db_service from "../../DB/db.service.js"
import moodModel from "../../DB/models/mood.model.js"
import successResponse from "../../common/utils/response.success.js"


export const moodLog = async (req,res,next) => {
const timeCount = 12 * 60 * 60 * 1000
const logHours = new Date (Date.now() - timeCount )

const lastLog = await db_service.findOne({
    model: moodModel,
    filter: {user: req.auth._id, createdAt: {$gte: logHours}}
})

if(lastLog){
    const remainingTimeMS = (lastLog.createdAt.getTime() + timeCount) - Date.now()
    const hours = Math.floor(remainingTimeMS / (1000 * 60 * 60))
    const minutes = Math.ceil((remainingTimeMS % (1000 * 60 * 60)) / (1000 * 60))
    throw new Error(`please wait ${hours}h:${minutes}m to enter your mood again`, {cause: 429})
}

const logging = await db_service.create({
    model: moodModel,
    data: {user: req.auth._id, mood:req.body.mood}
})

successResponse({res, status:201, message:"mood logged", data: logging})
}

export const allMoods = async (req,res,next) => {
    const moods = await db_service.find({
        model: moodModel,
        filter: {user: req.auth._id}
    })

    if (moods.length == 0){
        throw new Error("No moods found", {cause: 404})
    }
    successResponse({res, data: moods})
}

export const getMoodById = async (req,res,next) => {
    const mood = await db_service.findOne({
        model: moodModel,
        filter: {
            _id: req.params.mood_id,
            user: req.auth._id
        }
    })
    if(!mood) throw new Error("mood not found", {cause: 404})
    successResponse({res, data: mood})
}

export const updateMood = async (req,res,next) =>{
    const {mood} = req.body
    const updatedMood = await db_service.update({
        model: moodModel,
        filter: {_id: req.params.mood._id, user: req.auth._id, isUpdated: false},
        update: {mood, isUpdated: true}
    })
    if(!updated){
        throw new Error("You already updated your mood today")
    }
    successResponse({res, message:"Mood updated", data: updated})
}