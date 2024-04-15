/**
 * @file NodeModel.js
 * @description Defines the MongoDB model for nodes within the blockchain network. Nodes are essential for network communication and synchronization.
 */

const mongoose = require("mongoose");

// Define the node schema
const nodeSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Node URL is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?(localhost|[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5})(:[0-9]{1,5})?(\/.*)?$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Error handling for save operations
nodeSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Node URL must be unique."));
  } else if (error.name === "ValidationError") {
    next(
      new Error("Invalid node URL, please check the format and uniqueness.")
    );
  } else {
    next(error); // Pass on any other errors
  }
});

// Create the model from the schema
const Node = mongoose.model("Node", nodeSchema);

module.exports = Node;
