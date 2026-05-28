importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// You need to set this dynamically or hardcode the config
const firebaseConfig = {
  projectId: "woven-goal-413617",
  appId: "1:147314811287:web:317d8b4247874a9848e4d2",
  apiKey: "AIzaSyDZV1P2-YBxV5uWcqWFVPWlkMiYUVQF6QU",
  authDomain: "woven-goal-413617.firebaseapp.com",
  messagingSenderId: "147314811287",
  storageBucket: "woven-goal-413617.firebasestorage.app",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Nuevo mensaje';
  const notificationOptions = {
    body: payload.notification?.body || 'Abra la aplicación para ver más detalles.',
    icon: '/icon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
