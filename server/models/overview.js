import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const options = {
  collection: "overview",
  timestamps: true,
};

const schemaDefination = new Schema(
  {
    totalAssets: { type: Number, default: 0 },
    totalSupply: { type: Number, default: 0 },
    totalBorrow: { type: Number, default: 0 },
  },
  options
);

schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("overview", schemaDefination);

(async () => {
  let result = await Mongoose.model("overview", schemaDefination).find({});
  if (result.length != 0) {
    // console.log("Default staticLink content already created.");
  } else {
    const obj = {
      totalAssets: 0,
      totalSupply: 0,
      totalBorrow: 0,
    };

    let staticResult = await Mongoose.model(
      "overview",
      schemaDefination
    ).create(obj);
    if (staticResult) {
      console.log("DEFAULT staticLink Created.", staticResult);
    }
  }
}).call();
