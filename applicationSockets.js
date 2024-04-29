// applicationSockets.js

require('dotenv').config(); // Make sure to require 'dotenv' at the top of the file
const jwt = require('jsonwebtoken');
const Application = require('./models/Application');

function setupApplicationSocketEvents(applicationSocket) {
  // Authentication middleware specific to this namespace
  applicationSocket.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error('Authentication error:', err);
          return next(new Error('Authentication error'));
        }
        socket.decoded_token = decoded;
        return next();
      });
    } else {
      return next(new Error('Authentication error: No token provided'));
    }
  });

  // Handle connections specifically in this namespace
  applicationSocket.on('connection', (socket) => {
    const userId = socket.decoded_token?.id;
    if (!userId) {
      console.error('No user ID found in decoded token');
      return socket.disconnect(true);
    }

    socket.join(`user-${userId}`, () => {
      console.log(`User ${userId} joined their room successfully`);
    });


    
    socket.on('fetchAllApplications', async () => {
      try {
        const applications = await Application.find({ userId: userId });
        socket.emit('allApplications', applications);
      } catch (error) {
        console.error('Error fetching all applications:', error);
        socket.emit('error', 'Failed to fetch applications');
      }
    });

    socket.on('archiveApplication', async (applicationId) => {
      const application = await Application.findById(applicationId);
      if (application && application.userId.toString() === userId) {
        await archiveApplication(io, applicationId);
      } else {
        socket.emit('error', 'You do not have permission to archive this application');
      }
    });

    socket.on('requestCurrentState', async (userId) => {
      try {
        const application = await Application.findOne({ userId: userId }).sort({ createdAt: -1 }).exec();
        if (application) {
          socket.emit(`currentState-${userId}`, {
            id: application._id,
            status: application.status,
            inspectionSchedule: application.inspectionSchedule,
            pdfFileName: application.pdfFile?.name,
          });
        } else {
          // Instead of emitting 'error', emit a specific event like 'noApplicationFound'
          socket.emit(`noApplicationFound-${userId}`);
        }
      } catch (error) {
        console.error('Error fetching recent application:', error);
        // Keep the error event for actual errors
        socket.emit('error', 'Failed to fetch recent application');
      }
    });
    
  });
}



async function archiveApplication(io, applicationId) {
  try {
    const application = await Application.findByIdAndUpdate(applicationId, { archived: true }, { new: true });
    io.emit('applicationArchived', application);
  } catch (error) {
    console.error('Error archiving application:', error);
  }
}


module.exports = setupApplicationSocketEvents;

