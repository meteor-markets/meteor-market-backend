import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import logger from "../helper/logger";
import status from "../enums/status";
import coinType from "../enums/coinType";
import coinImage from "../enums/coinImage";
import coinIndex from "../enums/coinIndex";
import {
  blast,
} from "../helper/blockchain/constant/constant";
const options = {
  collection: "coin",
  timestamps: true,
};

const coinSchema = new Schema(
  {
    coinName: {
      type: String,
    },
    coinIndex: {
      type: Number,
    },
    coinImage: {
      type: String,
    },
    chainId: {
      type: String,
    },
    chianIdHEX: {
      type: String,
    },
    supplyAPY: {
      type: Number,
    },
    sRewardAPR: {
      type: Number,
    },
    borrowAPY: {
      type: Number,
    },
    bRewardAPR: {
      type: Number,
    },

    status: { type: String, default: status.ACTIVE },
  },
  options
);
coinSchema.plugin(mongoosePaginate);
coinSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("coin", coinSchema);

(async () => {
  // let result = await Mongoose.model("coin", coinSchema).deleteMany();
  let result = await Mongoose.model("coin", coinSchema).find({});
  if (result.length != 0) {
    logger.info("Default coin content already created.");
  } else {

    const object1 = {
      coinName: coinType.BLAST,
      coinImage: coinImage.BLAST,
      coinIndex: coinIndex.BLAST,
      chainId: blast.chainId,
      chianIdHEX: blast.chianIdHEX,
      supplyAPY: 2.5,
      sRewardAPR: 0.9,
      borrowAPY: 1.6,
      bRewardAPR: 0.5,
    };

    const object2 = {
      coinName: coinType.USDB,
      coinImage: coinImage.USDB,
      coinIndex: coinIndex.USDB,
      chainId: blast.chainId,
      chianIdHEX: blast.chianIdHEX,
      supplyAPY: 4.0,
      sRewardAPR: 0.5,
      borrowAPY: 1.3,
      bRewardAPR: 0.3,
    };

    const object3 = {
      coinName: coinType.WETH,
      coinImage: coinImage.WETH,
      coinIndex: coinIndex.WETH,
      chainId: blast.chainId,
      chianIdHEX: blast.chianIdHEX,
      supplyAPY: 7.3,
      sRewardAPR: 0.1,
      borrowAPY: 2.5,
      bRewardAPR: 0.2,
    };


    let coinResult = await Mongoose.model("coin", coinSchema).create(
      object1,
      object2,
      object3
    );
    if (coinResult) {
      console.log("DEFAULT coin created.", coinResult);
    }
  }
}).call();
