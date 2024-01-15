import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import coinType from "../enums/coinType";
import coinImage from "../enums/coinImage";
import logger from "../helper/logger";

import status from '../enums/status';
const options = {
    collection: "feeSetting",
    timestamps: true
};
const schema = Mongoose.Schema;
var feeSettingSchema = new schema(
    {
        minWithdraw: { type: Number },
        maxWithdraw: { type: Number },
        withdrawFee: { type: Number },
        minDeposite: { type: Number },
        maxDeposite: { type: Number },
        depositeFee: { type: Number },
        minStake: { type: Number },
        maxStake: { type: Number },
        stakeFee: { type: Number },
        stakeDuration1: { type: Number },
        stakeDuration2: { type: Number },
        stakeDuration3: { type: Number },
        stakeInterestFor1: { type: Number },
        stakeInterestFor2: { type: Number },
        stakeInterestFor3: { type: Number },
        termsConditions: { type: String },
        coinType: { type: String },
        coinImage: { type: String },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

feeSettingSchema.plugin(mongoosePaginate);
feeSettingSchema.plugin(mongooseAggregatePaginate);

module.exports = Mongoose.model("feeSetting", feeSettingSchema);
(async () => {
    let result = await Mongoose.model("feeSetting", feeSettingSchema).find();
    if (result.length != 0) {
        logger.info("Default feeSetting already created.");
    }
    else {
        var object1 = {
            minWithdraw: 0.1,
            maxWithdraw: 100,
            withdrawFee: 0.001,
            minDeposite: 0.1,
            maxDeposite: 100,
            depositeFee: 0.001,
            minStake: 0.1,
            maxStake: 100,
            stakeFee: 0.001,
            stakeDuration1: 1,
            stakeDuration2: 30,
            stakeDuration3: 365,
            stakeInterestFor1: 10,
            stakeInterestFor2: 10,
            stakeInterestFor3: 10,
            coinType: coinType.USDT,
            coinImage: coinImage.USDT,
        };
        let feeResult = await Mongoose.model("feeSetting", feeSettingSchema).create(object1);
        if (feeResult) {
            console.log("Default feeSetting created.", feeResult)
        }
    }
}).call();
