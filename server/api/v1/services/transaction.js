import transactionModel from "../../../models/transaction";
import status from '../../../enums/status';
import transactionStatus from "../../../enums/transactionStatus";
import transactionType from "../../../enums/transactionType";

const transactionServices = {

    createTransaction: async (insertObj) => {
        return await transactionModel.create(insertObj);
    },

    findTransaction: async (query) => {
        return await transactionModel.findOne(query).sort({ createdAt: -1 });
    },

    alltransactionCount: async (query) => {
        return await transactionModel.count(query);
    },

    updateTransaction: async (query, updateObj) => {
        return await transactionModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    transactionList: async (query) => {
        return await transactionModel.find(query);
    },

    transactionHistory: async (validatedBody) => {
        const { search, userId, transactionType, transactionStatus, fromDate, toDate, page, limit, } = validatedBody;
        let query = { userId: userId, status: { $ne: status.DELETE } }

        if (search) {
            query.$or = [
                { coinName: { $regex: search, $options: 'i' } },
            ]
        }
        if (transactionType) query.transactionType = { $regex: transactionType, $options: 'i' };
        if (transactionStatus) query.transactionStatus = { $regex: transactionStatus, $options: 'i' };
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) };

        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') };

        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) } },
                { createdAt: { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') } },
            ]
        }


        let aggregate = transactionModel.aggregate([
            {
                $match: query
            },
        ]);
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 }
        }

        return await transactionModel.aggregatePaginate(aggregate, options);

    },


}

module.exports = { transactionServices };