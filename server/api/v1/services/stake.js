import stakeModel from "../../../models/stake";
import status from "../../../enums/status";

const stakeServices = {

  createStake: async (insertObj) => {
    return await stakeModel.create(insertObj);
  },

  findStake: async (query) => {
    return await stakeModel.findOne(query).populate(['userId', 'coinId']);
  },

  updateStake: async (query, updateObj) => {
    return await stakeModel.findOneAndUpdate(query, updateObj, { new: true });
  },
  allStakeCount: async (query) => {
    return await stakeModel.count(query);
  },

  stakeList: async (query) => {
    return await stakeModel.find(query).populate(['userId', 'coinId']);
  },
  paginateSearchStake: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { fromDate, toDate, page, limit, userId, coinType } = validatedBody;
    if (userId) {
      query.userId = userId
    }
    if (coinType) {
      query.coinType = coinType
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: { createdAt: -1 },
      populate: ['userId']
    };
    return await stakeModel.paginate(query, options);
  },

}

module.exports = { stakeServices };