import userModel from "../../../models/user";
import status from "../../../enums/status";
import userType from "../../../enums/userType";

const userServices = {
  userCheck: async (userId) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { $or: [{ email: userId }, { mobileNumber: userId }] },
      ],
    };
    return await userModel.findOne(query);
  },
  allactiveUser: async (query) => {
    return await userModel.count(query);
  },

  checkUserExists: async (mobileNumber, email) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
      ],
    };
    return await userModel.findOne(query);
  },

  emailMobileExist: async (mobileNumber, email, id) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { _id: { $ne: id } },
        { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
      ],
    };
    return await userModel.findOne(query);
  },

  checkSocialLogin: async (socialId, socialType) => {
    return await userModel.findOne({
      socialId: socialId,
      socialType: socialType,
    });
  },

  userCount: async () => {
    return await userModel.countDocuments();
  },

  findCount: async (query) => {
    return await userModel.countDocuments(query);
  },

  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },

  findUser: async (query) => {
    return await userModel.findOne(query);
  },
  findUserForOtp: async (query) => {
    return await userModel.findOne(query);
  },

  findUserData: async (query) => {
    return await userModel.findOne(query);
  },

  deleteUser: async (query) => {
    return await userModel.deleteOne(query);
  },

  userFindList: async (query) => {
    return await userModel.find(query);
  },

  updateUser: async (query, updateObj) => {
    return await userModel
      .findOneAndUpdate(query, updateObj, { new: true })
      .select("-otp");
  },
  updateUserForOtp: async (query, updateObj) => {
    return await userModel
      .findOneAndUpdate(query, updateObj, { new: true })
  },

  updateUserById: async (query, updateObj) => {
    return await userModel
      .findByIdAndUpdate(query, updateObj, { new: true })
      .select("-otp");
  },

  findfollowers: async (query) => {
    return await userModel
      .findOne(query)
      .populate({ path: "followers" })
      .select("name email profilePic followersCount followingCount");
  },

  findfollowing: async (query) => {
    return await userModel
      .findOne(query)
      .populate({ path: "following" })
      .select("name email profilePic followersCount followingCount");
  },

  insertManyUser: async (obj) => {
    return await userModel.insertMany(obj);
  },

  paginateSearch: async (validatedBody) => {
    let query = {
      userType: { $ne: userType.ADMIN },
    };
    const {
      search,
      fromDate,
      toDate,
      page,
      limit,
      status,
    } = validatedBody;

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (fromDate && !toDate) {
      query.createdAt = {
        $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
      };
    }
    if (!fromDate && toDate) {
      query.createdAt = {
        $lte: new Date(
          new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
        ),
      };
    }
    if (fromDate && toDate) {
      query.$and = [
        {
          createdAt: {
            $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)),
          },
        },
        {
          createdAt: {
            $lte: new Date(
              new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
            ),
          },
        },
      ];
    }
    let aggregate = userModel.aggregate([
      {
        $match: query
      },
    ]);
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: { createdAt: -1 }
    }

    return await userModel.aggregatePaginate(aggregate, options);
  },

  userCount: async () => {
    return await userModel.countDocuments();
  },

  userList: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userType: userType.USER };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { walletAddress: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ];
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ];
    }


    let aggregate = userModel.aggregate([
      {
        $match: query
      },
    ]);
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: { createdAt: -1 }
    }

    return await userModel.aggregatePaginate(aggregate, options);
  },

  insertManyUser: async (obj) => {
    return await userModel.insertMany(obj);
  },

  findUserLastSeen: async (query) => {
    return await userModel.findOne(query);
  },

  findAllReferralList: async (query) => {
    return await userModel
      .find(query)
      .select(
        "firstName lastName userName email countryCode mobileNumber profilePic coverPic coverImage gender "
      );
  }

};

module.exports = { userServices };
