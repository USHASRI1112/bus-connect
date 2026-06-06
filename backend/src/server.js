require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { createPostgresTripStore } = require('./stores/postgresTripStore');

async function main() {
  const store = await createPostgresTripStore();
  const app = express();
  const port = Number(process.env.PORT || 3001);
  const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';

  function getClientSessionId(req) {
    const headerValue = req.header('x-client-session-id');
    return typeof headerValue === 'string' && headerValue.trim().length > 0 ? headerValue.trim() : '';
  }

  app.use(cors({ origin: allowedOrigin === '*' ? '*' : allowedOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/trips', async (req, res, next) => {
    console.log('Received request to list trips with query:', req.query);
    try {
      const trips = await store.listTrips({
        date: typeof req.query.date === 'string' ? req.query.date : '',
        serviceNumber: typeof req.query.serviceNumber === 'string' ? req.query.serviceNumber : '',
        busName: typeof req.query.busName === 'string' ? req.query.busName : '',
      });
      console.log(`Found ${trips.length} trips matching filters`);
      res.json(trips);
    } catch (error) {
      console.error('Error listing trips:', error);
      next(error);
    }
  });

  app.post('/api/trips', async (req, res, next) => {
    try {
      const { busName = '', serviceNumber, tripDate } = req.body || {};
      const clientSessionId = getClientSessionId(req);

      if (typeof serviceNumber !== 'string' || serviceNumber.trim().length === 0) {
        res.status(400).json({ message: 'serviceNumber is required' });
        return;
      }

      if (typeof tripDate !== 'string' || tripDate.trim().length === 0) {
        res.status(400).json({ message: 'tripDate is required' });
        return;
      }

      if (clientSessionId.length === 0) {
        res.status(400).json({ message: 'client session is required' });
        return;
      }

      const trip = await store.createOrOpenTrip({
        busName: typeof busName === 'string' ? busName : '',
        serviceNumber: serviceNumber.trim(),
        tripDate: tripDate.trim(),
      }, clientSessionId);

      res.status(201).json(trip);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/trips/:tripId/discussion', async (req, res, next) => {
    try {
      const clientSessionId = getClientSessionId(req);

      if (clientSessionId.length === 0) {
        res.status(400).json({ message: 'client session is required' });
        return;
      }

      const discussion = await store.getDiscussionSession(req.params.tripId, clientSessionId);

      if (!discussion) {
        res.status(404).json({ message: 'Trip not found' });
        return;
      }

      res.json(discussion);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/trips/:tripId/updates', async (req, res, next) => {
    try {
      const { template, detail } = req.body || {};
      const clientSessionId = getClientSessionId(req);

      if (
        typeof template !== 'string' ||
        typeof detail !== 'string' ||
        detail.trim().length === 0
      ) {
        res.status(400).json({ message: 'template and detail are required' });
        return;
      }

      if (clientSessionId.length === 0) {
        res.status(400).json({ message: 'client session is required' });
        return;
      }

      const createdUpdate = await store.addTripUpdate(
        req.params.tripId,
        clientSessionId,
        template,
        detail.trim()
      );

      if (!createdUpdate) {
        res.status(404).json({ message: 'Trip not found' });
        return;
      }

      res.status(201).json(createdUpdate);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
    res.status(statusCode).json({
      message: error.message || 'Internal server error',
    });
  });

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start backend');
  console.error(error);
  process.exit(1);
});
