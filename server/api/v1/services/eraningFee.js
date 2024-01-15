import earningFeeModel from "../../../models/eraningFee";


const feeServices = {

    createFee: async (obj1, obj2, obj3, obj4, obj5) => {
        return await earningFeeModel.create(obj1, obj2, obj3, obj4, obj5);
    },
    findFee: async (query) => {
        return await earningFeeModel.findOne(query);
    },

    updateFee: async (query, updateObj) => {
        return await earningFeeModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    feeList: async (query) => {
        return await earningFeeModel.find(query);
    },

}

module.exports = { feeServices };