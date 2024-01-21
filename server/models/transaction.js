
import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import logger from "../helper/logger";
import status from '../enums/status';
import transactionStatus from "../enums/transactionStatus";
import transactionType from "../enums/transactionType";



const options = {
    collection: "transaction",
    timestamps: true,
};

const schemaDefination = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user" },
        // userId: { type: Schema.Types.ObjectId, ref: "user" },
        walletAddress: { type: String },
        coinName: { type: String },
        coinImage: { type: String },
        amount: { type: Number },
        transactionHash: { type: String },
        transactionFee: { type: String },
        title: { type: String },
        description: { type: String },
        transactionType: {
            type: String,
            enum: [transactionType.DEPOSIT, transactionType.WITHDRAW],
        },
        transactionStatus: {
            type: String,
            enum: [transactionStatus.PENDING, transactionStatus.SUCCESS, transactionStatus.FAILED,],
        },
        status: { type: String, default: status.ACTIVE },
    },
    options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("transaction", schemaDefination);


