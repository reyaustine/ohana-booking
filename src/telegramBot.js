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

// Firestore trigger to notify on new booking
exports.sendNewBookingNotification = functions.firestore.document('bookings/{bookingId}').onCreate(async (snap, context) => {
  const booking = snap.data();

  const message = `🚗 New Booking Alert 🚗\n\n` +
                  `Booking ID: ${booking.bookingID}\n` +
                  `Customer: ${booking.renterDetails.name}\n` +
                  `Vehicle: ${booking.bookingDetails.vehicle}\n` +
                  `Rent Date & Time: ${new Date(booking.bookingDetails.rentDate).toLocaleString()}\n` +
                  `Return Date & Time: ${new Date(booking.bookingDetails.returnDate).toLocaleString()}\n`;

  // Send the message to all configured chat IDs
  const promises = chatIds.map(chatId => sendMessage(chatId, message));
  await Promise.all(promises);

  console.log('New booking notification sent to Telegram.');
});

// Firestore trigger to notify on booking update
exports.sendUpdatedBookingNotification = functions.firestore.document('bookings/{bookingId}').onUpdate(async (change, context) => {
  const beforeData = change.before.data();
  const afterData = change.after.data();

  const message = `✏️ Booking Update ✏️\n\n` +
                  `Booking ID: ${afterData.bookingID}\n` +
                  `Customer: ${afterData.renterDetails.name}\n` +
                  `Vehicle: ${afterData.bookingDetails.vehicle}\n` +
                  `Updated Rent Date & Time: ${new Date(afterData.bookingDetails.rentDate).toLocaleString()}\n` +
                  `Updated Return Date & Time: ${new Date(afterData.bookingDetails.returnDate).toLocaleString()}\n`;

  const promises = chatIds.map(chatId => sendMessage(chatId, message));
  await Promise.all(promises);

  console.log('Booking update notification sent to Telegram.');
});

// Firestore trigger to notify on booking deletion
exports.sendDeletedBookingNotification = functions.firestore.document('bookings/{bookingId}').onDelete(async (snap, context) => {
  const booking = snap.data();

  const message = `❌ Booking Cancellation ❌\n\n` +
                  `Booking ID: ${booking.bookingID}\n` +
                  `Customer: ${booking.renterDetails.name}\n` +
                  `Vehicle: ${booking.bookingDetails.vehicle}\n` +
                  `Originally Scheduled from: ${new Date(booking.bookingDetails.rentDate).toLocaleString()} to ${new Date(booking.bookingDetails.returnDate).toLocaleString()}\n`;

  const promises = chatIds.map(chatId => sendMessage(chatId, message));
  await Promise.all(promises);

  console.log('Booking deletion notification sent to Telegram.');
});