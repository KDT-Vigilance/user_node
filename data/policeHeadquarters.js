import mongoose from "../database.js";

const PoliceHeadquartersSchema = new mongoose.Schema({
  station_key: { type: String, unique: true, required: true },
  general_key: { type: String, unique: true, required: true },
});

const PoliceHeadquarters = mongoose.model("PoliceHeadquarters", PoliceHeadquartersSchema);

// CRUD 기능
export const createPoliceHQ = async (data) =>
  await PoliceHeadquarters.create(data);
export const getPoliceHQs = async () => await PoliceHeadquarters.find();
export const getPoliceHQById = async (id) =>
  await PoliceHeadquarters.findById(id);
export const updatePoliceHQ = async (id, data) =>
  await PoliceHeadquarters.findByIdAndUpdate(id, data, { new: true });
export const deletePoliceHQ = async (id) =>
  await PoliceHeadquarters.findByIdAndDelete(id);

export default PoliceHeadquarters;
