
import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import logger from "../helper/logger";
import status from '../enums/status';
import coinType from '../enums/coinType';
import coinImage from "../enums/coinImage";
import coinIndex from "../enums/coinIndex";
const options = {
    collection: "coin",
    timestamps: true,
};

const coinSchema = new Schema(
    {
        coinName: {
            type: String
        },
        coinIndex: {
            type: Number
        },
        coinImage: {
            type: String
        },
        status: { type: String, default: status.ACTIVE },
    },
    options
);
coinSchema.plugin(mongoosePaginate);
coinSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("coin", coinSchema);


(async () => {
    let result = await Mongoose.model("coin", coinSchema).find({});
    if (result.length != 0) {
        logger.info("Default coin content already created.");
    }
    else {
        const object1 = {
            coinName: coinType.BTC,
            coinImage: coinImage.BTC,
            coinIndex: coinIndex.BTC
        };
        const object2 = {
            coinName: coinType.ETH,
            coinImage: coinImage.ETH,
            coinIndex: coinIndex.ETH

        };
        const object3 = {
            coinName: coinType.USDT,
            coinImage: coinImage.USDT,
            coinIndex: coinIndex.USDT

        };
        let coinResult = await Mongoose.model("coin", coinSchema).create(object1, object2, object3);
        if (coinResult) {
            console.log("DEFAULT coin created.", coinResult)
        }
    }
}).call();