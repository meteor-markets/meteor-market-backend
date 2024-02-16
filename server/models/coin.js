import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import logger from "../helper/logger";
import status from "../enums/status";
import coinType from "../enums/coinType";
import coinImage from "../enums/coinImage";
import coinIndex from "../enums/coinIndex";
import {
  ethereum,
  binance,
  polygon,
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
  let result = await Mongoose.model("coin", coinSchema).find({});
  if (result.length != 0) {
    logger.info("Default coin content already created.");
  } else {
    // const object1 = {
    //     coinName: coinType.DAI,
    //     coinImage: coinImage.DAI,
    //     coinIndex: coinIndex.DAI,
    //     chainId: ethereum.chainId,
    //     chianIdHEX: ethereum.chianIdHEX,
    //     supplyAPY: 4,
    //     sRewardAPR: 0.1,
    //     borrowAPY: 2,
    //     bRewardAPR: 0.2,

    // };
    // const object2 = {
    //     coinName: coinType.LUSD,
    //     coinImage: coinImage.LUSD,
    //     coinIndex: coinIndex.LUSD,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 4,
    //     sRewardAPR: 0.1,
    //     borrowAPY: 2,
    //     bRewardAPR: 0.2,

    // };
    // const object3 = {
    //     coinName: coinType.MAI,
    //     coinImage: coinImage.MAI,
    //     coinIndex: coinIndex.MAI,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 4,
    //     sRewardAPR: 0.1,
    //     borrowAPY: 2,
    //     bRewardAPR: 0.2,

    // };
    // const object4 = {
    //     coinName: coinType.OP,
    //     coinImage: coinImage.OP,
    //     coinIndex: coinIndex.OP,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 4.3,
    //     sRewardAPR: 0.1,
    //     borrowAPY: 2.2,
    //     bRewardAPR: 0.5,
    // };
    // const object5 = {
    //     coinName: coinType.SNX,
    //     coinImage: coinImage.SNX,
    //     coinIndex: coinIndex.SNX,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 5.2,
    //     sRewardAPR: 0.4,
    //     borrowAPY: 1.3,
    //     bRewardAPR: 0.9,
    // };
    const object6 = {
      coinName: coinType.USDC,
      coinImage: coinImage.USDC,
      coinIndex: coinIndex.USDC,
      chainId: binance.chainId,
      chianIdHEX: binance.chianIdHEX,
      supplyAPY: 4.0,
      sRewardAPR: 0.5,
      borrowAPY: 1.3,
      bRewardAPR: 0.3,
    };
    // const object7 = {
    //     coinName: coinType.USDT,
    //     coinImage: coinImage.USDT,
    //     coinIndex: coinIndex.USDT,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 1.1,
    //     sRewardAPR: 0.5,
    //     borrowAPY: 2.3,
    //     bRewardAPR: 0.2,
    // };
    // const object8 = {
    //     coinName: coinType.WBTC,
    //     coinImage: coinImage.WBTC,
    //     coinIndex: coinIndex.WBTC,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 4.0,
    //     sRewardAPR: 0.1,
    //     borrowAPY: 2.7,
    //     bRewardAPR: 0.2,
    // };
    const object9 = {
      coinName: coinType.WETH,
      coinImage: coinImage.WETH,
      coinIndex: coinIndex.WETH,
      chainId: binance.chainId,
      chianIdHEX: binance.chianIdHEX,
      supplyAPY: 7.3,
      sRewardAPR: 0.1,
      borrowAPY: 2.5,
      bRewardAPR: 0.2,
    };
    // const object10 = {
    //     coinName: coinType.sUSD,
    //     coinImage: coinImage.sUSD,
    //     coinIndex: coinIndex.sUSD,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 4.4,
    //     sRewardAPR: 0.1,
    //     borrowAPY: 2.4,
    //     bRewardAPR: 0.2,
    // };
    // const object11 = {
    //     coinName: coinType.wstETH,
    //     coinImage: coinImage.wstETH,
    //     coinIndex: coinIndex.wstETH,
    //     chainId: binance.chainId,
    //     chianIdHEX: binance.chianIdHEX,
    //     supplyAPY: 4.5,
    //     sRewardAPR: 0.1,
    //     borrowAPY: 2.6,
    //     bRewardAPR: 0.2,
    // };
    const object12 = {
      coinName: coinType.BLAST,
      coinImage: coinImage.BLAST,
      coinIndex: coinIndex.BLAST,
      chainId: "168587773",
      chianIdHEX: "0xA0C71FD",
      supplyAPY: 2.5,
      sRewardAPR: 0.9,
      borrowAPY: 1.6,
      bRewardAPR: 0.5,
    };

    // let coinResult = await Mongoose.model("coin", coinSchema).create(object1, object2, object3, object4, object5, object6, object7, object8, object9, object10, object11, object12);
    let coinResult = await Mongoose.model("coin", coinSchema).create(
      object12,
      object6,
      object9
    );
    if (coinResult) {
      console.log("DEFAULT coin created.", coinResult);
    }
  }
}).call();
