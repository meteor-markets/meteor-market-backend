import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";
import transactionStatus from "../enums/transactionStatus";
import transactionType from "../enums/transactionType";

const options = {
  collection: "stake",
  timestamps: true,
};
const schema = Mongoose.Schema;
var stakeSchema = new schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: "user",
    },
    coinType: { type: String },
    coinImage: { type: String },
    price: { type: Number },
    stakeFee: { type: Number, default: 0 },
    fromDate: { type: Date },
    toDate: { type: Date },
    durationDays: { type: String },
    interest: { type: String },
    payoutAmount: { type: Number },
    earning: { type: Number, default: 0 },
    reason: { type: String },
    isWithdraw: { type: Boolean, default: false },
    isRequested: { type: Boolean, default: false },
    isEmergency: { type: Boolean, default: false },
    documentUrl: { type: String },
    transactionStatus: { type: String },
    transactionType: { type: String },
  },
  options
);

stakeSchema.plugin(mongoosePaginate);
stakeSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("stake", stakeSchema);
