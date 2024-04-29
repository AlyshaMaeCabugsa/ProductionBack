// smsService.js
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID from your Twilio dashboard
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio Auth Token from your Twilio dashboard
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number in E.164 format (+1xxxxxxxxxx)

const client = new twilio(accountSid, authToken);

exports.sendSMSToMultipleRecipients = async (phoneNumbers, body) => {
  const sendPromises = phoneNumbers.map(number => {
    // Twilio's `create` method returns a promise, so we return it to the array `sendPromises`
    return client.messages.create({
      body: body,
      to: `+63${number}`, // Ensure the number is in the E.164 format and add the Philippines country code +63
      from: twilioPhoneNumber // Your Twilio phone number
    })
    .then(message => {
      console.log(`SMS sent to ${number}, SID: ${message.sid}`);
      return message.sid; // If needed elsewhere, you can collect these SIDs for confirmation or logs
    })
    .catch(error => {
      console.error(`Error sending SMS to ${number}:`, error);
      // Depending on how critical this is, you might want to throw the error to stop the process
      // or just log it and continue trying to send to the other numbers.
    });
  });

  try {
    // `Promise.all` resolves when all of the promises in `sendPromises` have resolved or when one rejects.
    // `Promise.allSettled` would wait for all to complete regardless of resolution or rejection
    const results = await Promise.all(sendPromises);
    console.log('All SMS messages have been queued for delivery!');
    return results; // This could be useful if you want to do something with the message SIDs
  } catch (error) {
    // Log the error or handle it as needed
    console.error('Error sending one or more SMS messages:', error);
    throw error; // Rethrow if you want the calling function to handle it
  }
};


