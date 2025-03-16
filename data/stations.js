import mongoose from "../database.js";

const StationSchema = new mongoose.Schema({
  station_name: { type: String, required: true },
  account: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tel: { type: Number, unique: true, required: true },
  station_key: { type: String, unique: true, required: true },
  general_key: { type: String, unique: true, required: true },
  token: { type: String, required: false },
});

const Station = mongoose.model("Station", StationSchema);

// CRUD 기능
export const createStation = async (data) => await Station.create(data);
export const getStations = async () => await Station.find();
export const getStationById = async (id) => await Station.findById(id);
export const updateStation = async (id, data) =>
  await Station.findByIdAndUpdate(id, data, { new: true });
export const deleteStation = async (id) => await Station.findByIdAndDelete(id);

export default Station;
