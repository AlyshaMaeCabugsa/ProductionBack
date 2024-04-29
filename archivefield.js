const mongoose = require('mongoose');
const Application = require('./models/Application'); 

// MongoDB connection string
const uri = 'mongodb+srv://firestationopol:admin1234@cluster0.2kjhuql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

async function addTimestampsToExistingApplications() {
  try {
    const applications = await Application.find({ createdAt: { $exists: false } });

    for (const application of applications) {
      // If you want a more accurate creation time you might have other fields to infer it from
      application.createdAt = new Date(); // This sets the current date and time
      application.updatedAt = new Date(); // This sets the current date and time
      await application.save();
    }

    console.log('All existing applications have been updated with timestamps.');
  } catch (error) {
    console.error('Error updating applications:', error);
  } finally {
    mongoose.disconnect();
  }
}

addTimestampsToExistingApplications();