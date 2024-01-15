import referralModel from "../../../models/referral";

const referralServices = {

    createReferral: async (insertObj) => {
        return await referralModel.create(insertObj);
    },

    findReferral: async (query) => {
        return await referralModel.findOne(query);
    },

    updateReferral: async (query, updateObj) => {
        return await referralModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    referralList: async (query, page, limit) => {
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 15,
            sort: { createdAt: -1 },
            populate: "userId referredBy"
        };
        return await referralModel.paginate(query, options);
        // return await referralModel.find(query);
    },

    listReferral: async (query) => {
        return await referralModel.find(query);
    },

    aggregatelistIndirectReferral: async (query) => {
        return await referralModel.aggregate([
          {
            $match: query,
          },
          {
            $lookup: {
              from: "user",
              localField: "referredBy",
              foreignField: "_id",
              as: "userId",
            },
          },
          {
            $unwind: {
              path: "$userId",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$referredBy",
              totalEarning: { $sum: "$earning" },
              totalUser: { $sum: 1 },
            },
          },
        ]);
    },

    aggregatelistDirectReferral: async (query, timeframe) => {
      // Initialize the aggregation pipeline
      const aggregationPipeline = [
        {
          $match: query,
        },
        {
          $lookup: {
            from: "user",
            localField: "referredBy",
            foreignField: "_id",
            as: "referredBy",
          },
        },
        {
          $unwind: {
            path: "$referredBy",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$referredBy",
            totalEarning: { $sum: "$earning" },
            totalUser: { $sum: 1 },
          },
        },
      ];
    
      if (timeframe === "monthly") {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
        aggregationPipeline.unshift({
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        });
      } else if (timeframe === "yearly") {
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // January 1st of the current year
        const endOfYear = new Date(currentDate.getFullYear() + 1, 0, 0); // December 31st of the current year
    
        aggregationPipeline.unshift({
          $match: {
            createdAt: {
              $gte: startOfYear,
              $lte: endOfYear,
            },
          },
        });
      } else if (timeframe === "weekly") {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - dayOfWeek); // Go back to the start of the week
        startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to the end of the week
        endOfWeek.setHours(23, 59, 59, 999); // Set time to the last millisecond of the day
    
        aggregationPipeline.unshift({
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        });
      }
      return await referralModel.aggregate(aggregationPipeline);
    },
    

}

module.exports =  {referralServices} ;
