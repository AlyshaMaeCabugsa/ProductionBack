// controllers/establishmentController.js
const { emitEstablishmentCount } = require('../websocketServer'); 
const AnnualRecord = require('../models/AnnualRecords'); 
const Establishment = require('../models/Establishment');

// Create an establishment
exports.createEstablishment = async (req, res) => {
  try {
    const newEstablishment = new Establishment(req.body);
    const validationError = newEstablishment.validateSync(); // synchronous validation
    if (validationError) {
      return res.status(400).json({ message: "Validation error", errors: validationError.errors });
    }
    await newEstablishment.save();

    await emitEstablishmentCount(); // Emit the count after creation
    res.status(201).json(newEstablishment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating establishment: " + error.message });
  }
};

// Fetch all establishments
exports.getAllEstablishments = async (req, res) => {
  try {
    const establishments = await Establishment.find();
    res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching establishments: " + error.message });
  }
};

// Fetch establishment by ID
exports.getEstablishmentById = async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);
    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }
    res.json(establishment);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Error fetching establishment: " + error.message });
  }
};

// Update an establishment
exports.updateEstablishment = async (req, res) => {
  try {
    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    await emitEstablishmentCount(); // Emit the count after update

    if (!updatedEstablishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }
    res.json(updatedEstablishment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(400).json({ message: "Error updating establishment: " + error.message });
  }
};

// Delete an establishment
exports.deleteEstablishment = async (req, res) => {
  try {
    const deletedEstablishment = await Establishment.findByIdAndDelete(req.params.id);

    await emitEstablishmentCount(); // Emit the count after deletion

    if (!deletedEstablishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting establishment: " + error.message });
  }
};

// Search establishments
exports.searchEstablishments = async (req, res) => {
    try {
        let query = {};
    
        if (req.query.term) {
          const regex = new RegExp(req.query.term, 'i'); // 'i' flag for case-insensitive
          query = {
            $or: [
              { tradeName: { $regex: regex } },
              { uniqueNumber: { $regex: regex } }
            ]
          };
        }
    
        const establishments = await Establishment.find(query);
        res.json(establishments);
      } catch (error) {
        res.status(500).json({ message: 'Error searching for establishments', error });
      }
    };

    exports.getSearchSuggestions = async (req, res) => {
      try {
        const searchTerm = req.query.term;
        const establishments = await Establishment.find({
          tradeName: new RegExp(searchTerm, 'i')
        }).limit(10);
        res.json(establishments.map(est => est.tradeName));
      } catch (error) {
        res.status(500).json({ message: "Server error occurred" });
      }
    };
    
    // Function to fetch establishment history by search term (unique number or trade name)
    exports.fetchEstablishmentHistoryBySearch = async (req, res) => {
      try {
        const searchTerm = req.params.searchTerm;
        const establishment = await Establishment.findOne({
          $or: [
            { uniqueNumber: searchTerm },
            { tradeName: new RegExp(searchTerm, 'i') }
          ]
        });
        
        if (!establishment) {
          return res.status(404).json({ message: 'Establishment not found' });
        }
        
        const records = await AnnualRecord.find({ establishment: establishment._id });
        res.json(records); // Send only the records array
      } catch (error) {
        res.status(500).json({ message: "Server error occurred" });
      }
    };