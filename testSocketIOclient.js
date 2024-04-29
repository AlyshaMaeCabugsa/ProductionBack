const io = require('socket.io-client');

const userIdToTest = '661c4dc691c80854b4a467d2'; // Replace with the userId you want to test
const SOCKET_SERVER_URL = 'http://localhost:8080/applications'; // Replace with your actual server URL
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MWM0ZGM2OTFjODA4NTRiNGE0NjdkMiIsImVtYWlsIjoibGFpZEBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6IlVzZXIiLCJpYXQiOjE3MTQyMTU2NDYsImV4cCI6MTcxNDIxOTI0Nn0.4Cgc4e6f8fgAWPfeK147QY02HPuL6XMqyUsoGVU_BnI'; // Replace with a valid JWT token for the user

const socket = io(SOCKET_SERVER_URL, {
  auth: {
    token: authToken,
  },
  transports: ['websocket'], // Using WebSockets only for this test
});

socket.on('connect', () => {
  console.log(`Connected to the server. Emitting requestCurrentState for userId: ${userIdToTest}`);
  socket.emit('requestCurrentState', userIdToTest);
});

socket.on(`currentState-${userIdToTest}`, (data) => {
  console.log(`currentState event received for userId: ${userIdToTest}:`, data);
  // You should see the application data here if everything is working correctly.
  socket.disconnect();
});

socket.on('error', (error) => {
  console.error('Error received:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
});



