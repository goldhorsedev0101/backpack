// server/itineraryRoutes.ts - API routes for trip planning

import express from 'express';
import { itineraryService } from './itineraryService.js';

export const itineraryRouter = express.Router();

// Get user's saved itineraries
itineraryRouter.get('/api/itineraries', async (req, res) => {
  try {
    // For now, use a mock user ID - in production this would come from auth
    const userId = req.query.userId as string || 'guest-user';
    
    const { data, error } = await itineraryService.getUserItineraries(userId);
    
    if (error) {
      console.error('Get itineraries error:', error);
      return res.status(500).json({ 
        error: error.type,
        message: error.userMessage 
      });
    }
    
    res.json({ itineraries: data || [] });
  } catch (err) {
    console.error('Get itineraries error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to fetch itineraries' });
  }
});

// Get specific itinerary with items
itineraryRouter.get('/api/itineraries/:id', async (req, res) => {
  try {
    const userId = req.query.userId as string || 'guest-user';
    const itineraryId = req.params.id;
    
    const { data, error } = await itineraryService.getItineraryById(itineraryId, userId);
    
    if (error) {
      console.error('Get itinerary error:', error);
      return res.status(500).json({ 
        error: error.type,
        message: error.userMessage 
      });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'not_found', message: 'Itinerary not found' });
    }
    
    res.json({ itinerary: data });
  } catch (err) {
    console.error('Get itinerary error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to fetch itinerary' });
  }
});

// Save a suggested trip as new itinerary
itineraryRouter.post('/api/itineraries/save', async (req, res) => {
  try {
    const userId = req.body.userId || 'guest-user';
    const suggestion = req.body.suggestion;
    
    if (!suggestion) {
      return res.status(400).json({ error: 'validation', message: 'Suggestion data is required' });
    }
    
    const { data, error } = await itineraryService.saveTrip(userId, suggestion);
    
    if (error) {
      console.error('Save trip error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return res.status(503).json({ 
          error: 'database_setup',
          message: 'Database tables not ready. The itinerary feature needs to be initialized.',
          details: 'Please contact support or run database setup first.'
        });
      }
      
      return res.status(500).json({ 
        error: error.type || 'database',
        message: error.userMessage || 'Database connection failed. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    console.log(`✅ Suggested trip persisted (trip_id=${data?.id})`);
    
    res.json({ 
      success: true, 
      itinerary: data,
      message: 'Trip saved successfully'
    });
  } catch (err) {
    console.error('Save trip error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to save trip' });
  }
});

// Merge suggested trip into existing itinerary
itineraryRouter.post('/api/itineraries/:id/merge', async (req, res) => {
  try {
    const userId = req.body.userId || 'guest-user';
    const existingTripId = req.params.id;
    const suggestion = req.body.suggestion;
    
    if (!suggestion) {
      return res.status(400).json({ error: 'validation', message: 'Suggestion data is required' });
    }
    
    const { data, error } = await itineraryService.mergeTrip(userId, existingTripId, suggestion);
    
    if (error) {
      console.error('Merge trip error:', error);
      return res.status(500).json({ 
        error: error.type,
        message: error.userMessage 
      });
    }
    
    console.log(`✅ Suggested trip merged into existing (trip_id=${existingTripId})`);
    
    res.json({ 
      success: true, 
      itinerary: data,
      message: 'Trip merged successfully'
    });
  } catch (err) {
    console.error('Merge trip error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to merge trip' });
  }
});

// Update itinerary item
itineraryRouter.put('/api/itinerary-items/:id', async (req, res) => {
  try {
    const userId = req.body.userId || 'guest-user';
    const itemId = req.params.id;
    const updates = req.body.updates;
    
    const { data, error } = await itineraryService.updateItineraryItem(userId, itemId, updates);
    
    if (error) {
      console.error('Update item error:', error);
      return res.status(500).json({ 
        error: error.type,
        message: error.userMessage 
      });
    }
    
    // After update, resequence positions and refresh plan
    if (data) {
      await itineraryService.resequenceItineraryPositions(data.itineraryId);
      await itineraryService.refreshItineraryPlan(data.itineraryId);
    }
    
    res.json({ 
      success: true, 
      item: data,
      message: 'Item updated successfully'
    });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to update item' });
  }
});

// Delete itinerary item
itineraryRouter.delete('/api/itinerary-items/:id', async (req, res) => {
  try {
    const userId = req.query.userId as string || 'guest-user';
    const itemId = req.params.id;
    
    // Get item info before deletion for position management
    const itemResult = await itineraryService.getItineraryById(itemId, userId);
    let itineraryId = '';
    if (itemResult.data) {
      // Find the item to get its itinerary ID
      const item = itemResult.data.items.find(i => i.id === itemId);
      if (item) itineraryId = item.itineraryId;
    }
    
    const { data, error } = await itineraryService.deleteItineraryItem(userId, itemId);
    
    if (error) {
      console.error('Delete item error:', error);
      return res.status(500).json({ 
        error: error.type,
        message: error.userMessage 
      });
    }
    
    // After deletion, resequence positions and refresh plan
    if (itineraryId) {
      await itineraryService.resequenceItineraryPositions(itineraryId);
      await itineraryService.refreshItineraryPlan(itineraryId);
    }
    
    res.json({ 
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to delete item' });
  }
});

// Rename itinerary
itineraryRouter.put('/api/itineraries/:id/title', async (req, res) => {
  try {
    const userId = req.body.userId || 'guest-user';
    const itineraryId = req.params.id;
    const { title } = req.body;
    
    if (!title?.trim()) {
      return res.status(400).json({ error: 'validation', message: 'Title is required' });
    }
    
    const { data, error } = await itineraryService.renameItinerary(userId, itineraryId, title.trim());
    
    if (error) {
      console.error('Rename itinerary error:', error);
      return res.status(500).json({ 
        error: error.type,
        message: error.userMessage 
      });
    }
    
    res.json({ 
      success: true, 
      itinerary: data,
      message: 'Itinerary renamed successfully'
    });
  } catch (err) {
    console.error('Rename itinerary error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to rename itinerary' });
  }
});

// Delete itinerary
itineraryRouter.delete('/api/itineraries/:id', async (req, res) => {
  try {
    const userId = req.query.userId as string || 'guest-user';
    const itineraryId = req.params.id;
    
    const { data, error } = await itineraryService.deleteItinerary(userId, itineraryId);
    
    if (error) {
      console.error('Delete itinerary error:', error);
      return res.status(500).json({ 
        error: error.type,
        message: error.userMessage 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (err) {
    console.error('Delete itinerary error:', err);
    res.status(500).json({ error: 'unknown', message: 'Failed to delete itinerary' });
  }
});

export default itineraryRouter;