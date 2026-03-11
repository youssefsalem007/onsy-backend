import multer from "multer"

export const multer_host = () => {
    const storage = multer.diskStorage({})
    function fileFilter (req,file,cb){
        if(!file.mimetype.startsWith("image/")){
            return cb(new Error("only images are allowed"),false)
        }
        cb(null,true)
    }
    return multer({storage, fileFilter})
}