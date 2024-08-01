require('dotenv').config();
const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  process.env.VAPID_CONTACT_EMAIL,
  publicVapidKey,
  privateVapidKey
);

module.exports = webpush;