import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import serviceAccount from './firebase/service-account-key.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize the firebase admin app
  // initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  //   databaseURL: 'https://fir-noti-android.firebaseio.com',
  // });

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });
  await app.listen(process.env.PORT || 3456);
}
bootstrap();

// Create a list containing up to 500 registration tokens.
// These registration tokens come from the client FCM SDKs.
// const registrationTokens = [
//   'YOUR_REGISTRATION_TOKEN_1',
//   // …
//   'YOUR_REGISTRATION_TOKEN_N',
// ];

// const message = {
//   data: {score: '850', time: '2:45'},
//   tokens: registrationTokens,
// };

// getMessaging().sendAll(message)
//   .then((response) => {
//     console.log(response.successCount + ' messages were sent successfully');
//   });
