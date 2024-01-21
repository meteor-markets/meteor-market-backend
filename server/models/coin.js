
import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import logger from "../helper/logger";
import status from '../enums/status';
import coinType from '../enums/coinType';
import coinImage from "../enums/coinImage";
import coinIndex from "../enums/coinIndex";
import { ethereum, binance, polygon } from "../helper/blockchain/constant/constant"
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
        chainId: {
            type: String
        },
        chianIdHEX: {
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
            coinName: coinType.USDT,
            coinImage: coinImage.USDT,
            coinIndex: coinIndex.USDT,
            chainId: ethereum.chainId,
            chianIdHEX: ethereum.chianIdHEX
        };
        const object2 = {
            coinName: coinType.BUSD,
            coinImage: coinImage.BUSD,
            coinIndex: coinIndex.BUSD,
            chainId: binance.chainId,
            chianIdHEX: binance.chianIdHEX

        };
        const object3 = {
            coinName: coinType.MATIC,
            coinImage: coinImage.MATIC,
            coinIndex: coinIndex.MATIC,
            chainId: polygon.chainId,
            chianIdHEX: polygon.chianIdHEX

        };
        const object4 = {
            coinName: coinType.BNB,
            coinImage: coinImage.BNB,
            coinIndex: coinIndex.BNB,
            chainId: binance.chainId,
            chianIdHEX: binance.chianIdHEX

        };
        const object5 = {
            coinName: coinType.ETH,
            coinImage: coinImage.ETH,
            coinIndex: coinIndex.ETH,
            chainId: ethereum.chainId,
            chianIdHEX: ethereum.chianIdHEX
        };

        let coinResult = await Mongoose.model("coin", coinSchema).create(object1, object2, object3, object4, object5);
        if (coinResult) {
            console.log("DEFAULT coin created.", coinResult)
        }
    }
}).call();