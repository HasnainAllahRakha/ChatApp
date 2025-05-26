// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },
//     subCategory: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "SubCategory",
//     },
//     productCode: {
//       type: String,
//       unique: true,
//       required: true,
//       trim: true,
//     },
//     colors: {
//       type: [String],
//     },
//     size: {
//       type: String,
//     },
//     images: {
//       type: [String],
//       trim: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);
