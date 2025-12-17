import express from 'express';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const message = process.env.MESSAGE || 'Hello from TestApp!';

app.get('/', (req, res) => {
  res.send({ message, time: new Date().toISOString() });
});

app.get('/healthz', (req, res) => {
  res.send('ok');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
