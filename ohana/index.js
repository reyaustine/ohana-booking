const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Retrieve the bot token securely from Firebase environment
const botToken = functions.config().telegram.bot_token;
const chatIds = ['-4573533486']; // Your Telegram group or user chat ID(s)

// Function to send message to Telegram
async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// Function to send photo to Telegram
async function sendPhoto(chatId, photoUrl, caption) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: chatId, 
      photo: photoUrl,
      caption: caption
    }),
  });
}

// Firestore trigger to notify on new booking creation
exports.sendNewBookingNotification = functions.firestore.document('bookings/{bookingId}').onCreate(async (snap, context) => {
  const booking = snap.data();

  // Extract relevant details
  const bookingID = booking.bookingID || 'N/A';
  const customerName = booking.renterDetails.name || 'N/A';
  const vehicle = booking.bookingDetails.vehicle || 'N/A';
  const totalFee = booking.bookingDetails.totalFee || 'N/A';
  const proofOfPaymentUrl = booking.paymentProof || '';
  const createdBy = booking.savedBy || 'Unknown';
  const rentDateTime = new Date(booking.bookingDetails.rentDate).toLocaleString();
  const returnDateTime = new Date(booking.bookingDetails.returnDate).toLocaleString();

  // Format the message to send
  let message = `🚗 New Booking Alert 🚗\n\n` +
                `Booking ID: ${bookingID}\n` +
                `Customer: ${customerName}\n` +
                `Vehicle: ${vehicle}\n` +
                `Total Fee: ${totalFee}\n` +
                `Rent Date & Time: ${rentDateTime}\n` +
                `Return Date & Time: ${returnDateTime}\n` +
                `Created by: ${createdBy}\n`;

  // Send the message to all configured chat IDs
  for (const chatId of chatIds) {
    try {
      await sendMessage(chatId, message);
      
      if (proofOfPaymentUrl) {
        try {
          await sendPhoto(chatId, proofOfPaymentUrl, `Proof of Payment for Booking ID: ${bookingID}`);
          console.log('Proof of payment image sent successfully.');
        } catch (error) {
          console.error('Error sending proof of payment image:', error);
          await sendMessage(chatId, `Proof of Payment: ${proofOfPaymentUrl}`);
        }
      } else {
        console.log('No proof of payment URL provided.');
      }
    } catch (error) {
      console.error('Error sending notification to chat:', chatId, error);
    }
  }

  console.log('New booking notification process completed.');
});

// Firestore trigger to notify on booking update or deletion
exports.sendUpdatedBookingNotification = functions.firestore.document('bookings/{bookingId}').onUpdate(async (change, context) => {
  const beforeData = change.before.data();
  const afterData = change.after.data();

  console.log('Before data:', JSON.stringify(beforeData));
  console.log('After data:', JSON.stringify(afterData));

  // Check if this is a deletion (active set to NO)
  if (afterData.active === 'NO' && beforeData.active !== 'NO') {
    console.log('Detected a deletion: active field changed to NO');
    
    const bookingID = afterData.bookingID || 'N/A';
    const customerName = afterData.renterDetails.name || 'N/A';
    const vehicle = afterData.bookingDetails.vehicle || 'N/A';
    const totalFee = afterData.bookingDetails.totalFee || 'N/A';
    const deletedBy = afterData.updatedBy || 'Unknown';
    const rentDateTime = new Date(afterData.bookingDetails.rentDate).toLocaleString();
    const returnDateTime = new Date(afterData.bookingDetails.returnDate).toLocaleString();

    const message = `❌ Booking Cancellation ❌\n\n` +
                    `Booking ID: ${bookingID}\n` +
                    `Customer: ${customerName}\n` +
                    `Vehicle: ${vehicle}\n` +
                    `Total Fee: ${totalFee}\n` +
                    `Originally Scheduled from: ${rentDateTime} to ${returnDateTime}\n` +
                    `Deleted by: ${deletedBy}\n`;

    const promises = chatIds.map(chatId => sendMessage(chatId, message));
    await Promise.all(promises);

    console.log('Booking deletion notification sent to Telegram.');
  } else if (JSON.stringify(beforeData) !== JSON.stringify(afterData)) {
    // This is a regular update
    console.log('Detected an update: data has changed');
    
    const bookingID = afterData.bookingID || 'N/A';
    const customerName = afterData.renterDetails.name || 'N/A';
    const vehicle = afterData.bookingDetails.vehicle || 'N/A';
    const totalFee = afterData.bookingDetails.totalFee || 'N/A';
    const updatedBy = afterData.updatedBy || 'Unknown';
    const updatedRentDate = new Date(afterData.bookingDetails.rentDate).toLocaleString();
    const updatedReturnDate = new Date(afterData.bookingDetails.returnDate).toLocaleString();

    const message = `✏️ Booking Update ✏️\n\n` +
                    `Booking ID: ${bookingID}\n` +
                    `Customer: ${customerName}\n` +
                    `Vehicle: ${vehicle}\n` +
                    `Total Fee: ${totalFee}\n` +
                    `Updated Rent Date & Time: ${updatedRentDate}\n` +
                    `Updated Return Date & Time: ${updatedReturnDate}\n` +
                    `Updated by: ${updatedBy}`;

    const promises = chatIds.map(chatId => sendMessage(chatId, message));
    await Promise.all(promises);

    console.log('Booking update notification sent to Telegram.');
  } else {
    console.log('No significant changes detected. No notification sent.');
  }
});