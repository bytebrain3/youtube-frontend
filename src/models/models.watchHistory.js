import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  watchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const History = mongoose.models.History || mongoose.model("History", HistorySchema);

export default History;
