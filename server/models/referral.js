import mongoose from "mongoose";
const schema = mongoose.Schema;
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";
import referralCategory from "../enums/referralCategory";

const options = {
  collection: "referral",
  timestamps: true,
};

const schemaDefination = new schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: "user",
    },
    referredBy: {
      type: schema.Types.ObjectId,
      ref: "user",
    },
    earning: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: [referralCategory.DIRECT, referralCategory.INDIRECT],
    },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("referral", schemaDefination);
