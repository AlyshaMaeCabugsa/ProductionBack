const { emitAnnualRecordCounts } = require('../websocketServer');
const AnnualRecord = require('../models/AnnualRecords'); // Ensure this path is correct
const Establishment = require('../models/Establishment'); // Add this line to import the Establishment model


exports.createAnnualRecord = async (req, res) => {
  try {
    const establishmentExists = await Establishment.findById(req.body.establishment);
    if (!establishmentExists) {
      return res.status(404).json({ message: "Establishment not found" });
    }
    
    const record = new AnnualRecord(req.body);
    await record.save();
    
    await emitAnnualRecordCounts();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: "Error creating annual record: " + error.message });
  }
};

exports.getAllAnnualRecords = async (req, res) => {
  try {
    let query = {};
    if (req.query.year) {
      query.year = parseInt(req.query.year);
    }
    if (req.query.listType) {
      query.listType = req.query.listType;
    }

    const records = await AnnualRecord.find(query).populate('establishment');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching annual records: " + error.message });
  }
};

exports.getAnnualRecordsByYear = async (req, res) => {
  const { year } = req.params; // Or req.query if you're using query parameters
  try {
    const records = await AnnualRecord.find({ year: year }).populate('establishment');
    res.json(records);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAnnualRecordsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const records = await AnnualRecord.find({ year: parseInt(year) });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching annual records for year: " + error.message });
  }
};

exports.updateAnnualRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await AnnualRecord.findByIdAndUpdate(id, req.body, { new: true });
    if (!record) {
      return res.status(404).json({ message: "Annual record not found" });
    }

    await emitAnnualRecordCounts();

    res.status(200).json(record);
  } catch (error) {
    res.status(400).json({ message: "Error updating annual record: " + error.message });
  }
};

exports.deleteAnnualRecord = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete record with id: ${id}`); // Log the ID being deleted

    const result = await AnnualRecord.findByIdAndDelete(id);
    console.log('Delete operation result:', result); // Log the result of the delete operation

    if (result) {
      await emitAnnualRecordCounts();
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Annual record not found" });
    }
  } catch (error) {
    console.error('Error during deletion:', error); // Log any errors that occur
    res.status(500).json({ message: "Error deleting annual record: " + error.message });
  }
};

// Add a function to fetch establishment details by ID
exports.getEstablishmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const establishment = await Establishment.findById(id);
    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }
    res.status(200).json(establishment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching establishment: " + error.message });
  }
};
