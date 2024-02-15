import overviewModal from "../../../models/overview";

const overviewService = {
  //   createCoin: async (insertObj) => {
  //     return await overviewModal.create(insertObj);
  //   },

  //   findCoin: async (query) => {
  //     return await overviewModal.findOne(query);
  //   },

  updateAssets: async (query, updateObj) => {
    return await overviewModal.findOneAndUpdate(query, updateObj, {
      new: true,
    });
  },

  getAssets: async (query) => {
    return await overviewModal.find(query).sort({ index: 1 });
  },
};

module.exports = { overviewService };
