/**
 * @file ExplorerModel.js
 * @description Defines the MongoDB model for tracking and caching blockchain queries in the blockchain explorer. This model can be used to enhance the performance of the explorer by caching frequent queries and managing query logs.
 */

const mongoose = require("mongoose");

// Define the schema for a blockchain explorer entry
const explorerSchema = new mongoose.Schema(
  {
    queryType: {
      type: String,
      required: [true, "Query type is required"],
      enum: {
        values: ["block", "transaction", "address", "balance"],
        message: "{VALUE} is not a supported query type",
      },
    },
    queryData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Query data is required"],
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Query results are required"],
    },
    cached: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to handle errors during save operations
explorerSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Duplicate entry detected for this query."));
  } else if (error.name === "ValidationError") {
    let messages = Object.values(error.errors).map((val) => val.message);
    next(new Error(messages.join(", ")));
  } else {
    next(); // Proceed to the next middleware if no errors
  }
});

// Create the model from the schema
const Explorer = mongoose.model("Explorer", explorerSchema);

module.exports = Explorer;
