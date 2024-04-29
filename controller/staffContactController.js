const StaffContact = require('../models/StaffContact');

exports.getContacts = async (req, res) => {
    try {
      const contacts = await StaffContact.find().select('-__v'); // Omit the version key from results
      res.json(contacts);
    } catch (error) {
      res.status(500).send({ message: "Error retrieving contacts", error: error.message });
    }
  };
  
  exports.createContact = async (req, res) => {
    try {
      const { name, phoneNumber } = req.body;
      // Ensure both name and phone number are provided
      if (!name || !phoneNumber) {
        return res.status(400).send({ message: "Name and phone number are required" });
      }
      const newContact = new StaffContact({ name, phoneNumber });
      const savedContact = await newContact.save();
      res.status(201).json(savedContact);
    } catch (error) {
      res.status(500).send({ message: "Error creating contact", error: error.message });
    }
  };

exports.updateContact = async (req, res) => {
  try {
    const updatedContact = await StaffContact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedContact);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await StaffContact.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error);
  }
};
