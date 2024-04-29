
const socketIo = require('socket.io');
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const AnnualRecord = require('./models/AnnualRecords');
const InspectionSchedule = require('./models/InspectionSchedule');
const Establishment = require('./models/Establishment'); // Adjust path if necessary


const { scheduleNotifications } = require('./services/notificationSocket');


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  const server = http.createServer();

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", // Be sure to restrict the origin in production
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] 
  }
});

// This function emits the total count of establishments
const emitEstablishmentCount = async () => {
  try {
    const count = await Establishment.countDocuments();
    io.emit('establishmentCount', count);
  } catch (error) {
    console.error('Error emitting establishment count:', error);
  }
};

// Emit counts for the current year
const emitAnnualRecordCounts = async () => {
  const currentYear = new Date().getFullYear();

  try {
    const counts = await AnnualRecord.aggregate([
      {
        $match: { year: currentYear } // Match records for the current year
      },
      {
        $group: {
          _id: "$listType", // Group by listType
          count: { $sum: 1 } // Count the number of documents in each group
        }
      }
    ]);

    // Map the counts to the appropriate variables
    const positiveCount = counts.find(c => c._id === 'Positive')?.count || 0;
    const negativeCount = counts.find(c => c._id === 'Negative')?.count || 0;

    console.log(`Emitting Counts - Positive: ${positiveCount}, Negative: ${negativeCount}`);

    // Emit the counts to all connected clients
    io.emit('annualRecordCounts', { positiveCount, negativeCount });
  } catch (error) {
    console.error('Error emitting annual record counts:', error);
  }
};

// Import the setup function for the '/applications' namespace
const setupApplicationSocketEvents = require('./applicationSockets');

// Set up the '/applications' namespace using the imported setup function
const applicationSocket = io.of('/applications');
setupApplicationSocketEvents(applicationSocket);


io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO.');

  emitEstablishmentCount();
  emitAnnualRecordCounts();

  socket.on('requestEstablishmentCount', emitEstablishmentCount);
  socket.on('requestAnnualRecordCounts', emitAnnualRecordCounts);
  socket.on('requestSummaryGraphData', async () => {
    const updatedStats = await calculateStatsForGraphs();
    socket.emit('summaryGraphUpdate', updatedStats);
  });

  
  // Setup change streams for real-time updates
  setupAnnualRecordChangeStream(socket);
  setupInspectionScheduleChangeStream(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected from Socket.IO.');
  });
});

async function calculateStatsForGraphs() {
  const currentYear = new Date().getFullYear();
  
  try {
    const positiveCount = await AnnualRecord.countDocuments({
      year: currentYear,
      listType: 'Positive'
    });
    const negativeCount = await AnnualRecord.countDocuments({
      year: currentYear,
      listType: 'Negative'
    });
    // Further calculations or aggregations can go here
    // For instance, you might calculate totals, averages, or other statistics that your dashboard requires

    return { positiveCount, negativeCount }; // This is the stats object you'll emit
  } catch (error) {
    console.error('Error calculating stats for graphs:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

// Function to setup annual record change stream
function setupAnnualRecordChangeStream(socket) {
  const changeStream = AnnualRecord.watch();

  changeStream.on('change', async (change) => {
    console.log('Change detected on MongoDB for AnnualRecord:', change);

    try {
      // Here we handle all types of changes and recalculate the stats for our graphs
      if (['insert', 'update', 'replace', 'delete'].includes(change.operationType)) {
        const updatedStats = await calculateStatsForGraphs(); // Get the latest stats
        socket.emit('summaryGraphUpdate', updatedStats); // Emit the stats to the client
      }
    } catch (error) {
      console.error('Error in change stream:', error);
    }
  });

  socket.on('disconnect', () => {
    changeStream.close();
  });
}

function setupInspectionScheduleChangeStream(socket) {
  const changeStream = InspectionSchedule.watch();

  changeStream.on('change', async (change) => {
    console.log('Change detected on MongoDB for InspectionSchedule:', change);

    // Check the type of operation
    if (change.operationType === 'update' || change.operationType === 'replace') {
      // If a specific field, like 'status', was updated to 'Completed'
      // Assuming the updated fields are in the 'updateDescription.updatedFields' object
      if (change.updateDescription && change.updateDescription.updatedFields.status === 'Completed') {
        // Fetch the updated inspection document to emit detailed info
        const updatedInspection = await InspectionSchedule.findById(change.documentKey._id);
        socket.emit('recentInspectionUpdate', {
          message: `Inspection for ${updatedInspection.establishment} has been completed.`,
          inspection: updatedInspection
        });
      }
    } else if (change.operationType === 'insert') {
      socket.emit('inspectionScheduleChange', {
        message: `New inspection scheduled for ${change.fullDocument.establishment}.`,
        inspection: change.fullDocument
      });
    } else if (change.operationType === 'delete') {
      socket.emit('inspectionScheduleDeleted', {
        message: `An inspection schedule has been deleted.`,
        inspectionId: change.documentKey._id
      });
    }

    // Handle other change types ('delete', 'insert', etc.) as necessary
  });

  socket.on('disconnect', () => {
    changeStream.close();
  });
}

scheduleNotifications(io);


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Socket.IO server is running on port ${PORT}`);
});



// Export both io and emitEstablishmentCount at the end of the file
module.exports = { io, emitEstablishmentCount, emitAnnualRecordCounts };


