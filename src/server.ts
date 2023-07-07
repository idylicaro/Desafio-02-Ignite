import { app } from './app.js';
import { env } from './env.js';

app
  .listen({
    port: env.PORT
  })
  .then(() => {
    console.log('HTTP Server Running!');
  });
