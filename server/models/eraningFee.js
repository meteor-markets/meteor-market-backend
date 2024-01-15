import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";
import coinType from "../enums/coinType";
import feeType from "../enums/feeType";
import logger from "../helper/logger";

const options = {
  collection: "earnigFee",
  timestamps: true,
};

const earningfeeSchema = new Schema(
  {
    earning: {
      type: Number,
      set: value => parseFloat(value).toFixed(3),
      default: 0
    },
    coinType: {
      type: String,
    },
    feeType: {
      type: String,
    },
    status: { type: String, default: status.ACTIVE },
  },
  options
);
earningfeeSchema.plugin(mongoosePaginate);
earningfeeSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("earningfee", earningfeeSchema);

(async () => {
  let result = await Mongoose.model("earnigFee", earningfeeSchema).find({});
  if (result.length != 0) {
    logger.info("Default fee content already created.");
  } else {
    var object1 = {
      earning: 0,
      coinType: coinType.USDT,
      feeType: feeType.WITHDRAWAL_FEE,
    };
    var object2 = {
      earning: 0,
      coinType: coinType.BTC,
      feeType: feeType.WITHDRAWAL_FEE,
    };
    var object3 = {
      earning: 0,
      coinType: coinType.ETH,
      feeType: feeType.WITHDRAWAL_FEE,
    };
    var object4 = {
      earning: 0,
      coinType: coinType.USDT,
      feeType: feeType.DEPOSIT_FEE,
    };
    var object5 = {
      earning: 0,
      coinType: coinType.BTC,
      feeType: feeType.DEPOSIT_FEE,
    };
    var object6 = {
      earning: 0,
      coinType: coinType.ETH,
      feeType: feeType.DEPOSIT_FEE,
    };
    var object7 = {
      earning: 0,
      coinType: coinType.USDT,
      feeType: feeType.STAKE_FEE,
    };


    let feeResult = await Mongoose.model("earnigFee", earningfeeSchema).create(
      object1,
      object2,
      object3,
      object4,
      object5,
      object6,
      object7
    );
    if (feeResult) {
      console.log("DEFAULT fee created.", feeResult);
    }
  }
}).call();
