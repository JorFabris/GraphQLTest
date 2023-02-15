import mongoose from "mongoose";

const schema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    minLength: 5,
  },
  phone: {
    type: String,
    minLength: 10,
  },
  street: {
    type: String,
    required: [true, "Street is required"],
    minLength: 5,
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
});

export default mongoose.model("Person", schema);
