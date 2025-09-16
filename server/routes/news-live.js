
import express from 'express';
export const router = express.Router();
router.get('/news/live', (req,res)=>res.json({items:[{gist:'Live-News aktiv',url:''}], updated: new Date().toISOString()}));
