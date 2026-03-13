import { PREFIX } from "../../../config/config.service.js"
import { ACCESS_SECRET_KEY } from "../../../config/config.service.js"
import jwt from "jsonwebtoken"

export const authentication = (req, res, next) => {
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

    req.auth = decodedToken
    next()
}