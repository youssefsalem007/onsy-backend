import { PREFIX } from "../../../config/config.service.js"
import { ACCESS_SECRET_KEY } from "../../../config/config.service.js"
import jwt from "jsonwebtoken"
import * as db_service from "../../DB/db.service.js"
import blacklistTokenModel from "../../DB/models/blacklistToken.model.js"

export const authentication = async (req, res, next) => {
    const {authorization} = req.headers
    if(!authorization || !authorization.startsWith(PREFIX)){
        throw new Error("Unauthorized")
    }
    const [prefix, token] = authorization.split(" ")
    if(prefix !== PREFIX){
        throw new Error("Invalid prefix")
    }
    const decodedToken = jwt.verify(token, ACCESS_SECRET_KEY)

    if(!decodedToken || !decodedToken?.id){
        throw new Error("Invalid token")
    }

    if(await db_service.findOne({
        model: blacklistTokenModel,
        filter: { token },
    })){
        throw new Error("Invalid token")
    }

    req.auth = decodedToken
    next()
}