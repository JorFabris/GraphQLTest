import mongoose from "mongoose";
const password = "JUNYNwLNX6gfrRG9";
const MONGODB_URI = `mongodb+srv://root:${password}@cluster0.mllteqt.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MONGODB");
  })
  .catch((err) => {
    console.log(err);
  });
