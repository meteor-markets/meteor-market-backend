import feeSettingModel from "../../../models/feeSetting";

const feeSettingServices = {
  createFeeSetting: async (insertObj) => {
    return await feeSettingModel.create(insertObj);
  },
  findFeeSetting: async (query) => {
    return await feeSettingModel.findOne(query).populate("userId");
  },
  updateFeeSetting: async (query, updateObj) => {
    return await feeSettingModel.findOneAndUpdate(query, updateObj, {
      new: true,
    });
  },
  feeSettingList: async (query) => {
    return await feeSettingModel.find(query);
  },
};

module.exports = { feeSettingServices };
