export const findOne = async ({model, filter = {}, select ="", options={}} ={}) => {
    return await model.findOne(filter, select, options)
}

export const create = async ({model, data} ={}) => {
    return await model.create(data)
}