
import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import logger from "../helper/logger";
import status from '../enums/status';
import transactionStatus from "../enums/transactionStatus";
import transactionType from "../enums/transactionType";


const options = {
    collection: "configSetting",
    timestamps: true,
};

const schemaDefination = new Schema(
    {
        totalSupply: { type: Number },
        supplyAPY: { type: Number },
        minSupply: { type: Number },
        maxSupply: { type: Number },
        rewardAPR: { type: Number },
        totalBorrow: { type: Number },
        borrowAPY: { type: Number },
        minBorrow: { type: Number },
        maxBorrow: { type: Number },
        title: { type: String },
        description: { type: String },
        status: { type: String, default: status.ACTIVE },
    },
    options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("configSetting", schemaDefination);

