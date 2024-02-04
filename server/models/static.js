import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import logger from "../helper/logger";

const options = {
    collection: "static",
    timestamps: true,
};

const staticSchema = new Schema(
    {
        type:{
            type: String
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        status: { type: String, default: status.ACTIVE },
    },
    options,{ timestamps : true }
);
staticSchema.plugin(mongoosePaginate);
staticSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("static", staticSchema);

(async () => {
    let result = await Mongoose.model("static", staticSchema).find({});
    if (result.length != 0) {
        logger.info("Default Static content already created. ");
    }
    else {
        var object1 = {
            type: "TermsConditions",
            title: "Term And Conditions ",
            description: "A term and conditions agreement is the agreement that includes the terms, the rules and the guidelines of acceptable behavior and other useful sections to which users must agree in order to use or access your website and mobioe app."
        };
        var object2 = {
            type: "AboutUs",
            title: "About Us",
            description: "An about us oage helps your company make a good first impression, and is critical for building customer trust and loyalty."
        };
        var object3 = {
            type: "Privacypolicy",
            title: "Privacy Policy",
            description: "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        };
        var object4 = {
            type: "Refund",
            title: "Refund",
            description: "Please take a moment to review our refund policy carefully. If you have any questions or concerns, don't hesitate to contact our customer support team."
        };
        let staticResult = await Mongoose.model("static", staticSchema).create(object1, object2, object3, object4);
        if (staticResult) {
            console.log("Default static created.", staticResult)
        }
    }
}).call();





