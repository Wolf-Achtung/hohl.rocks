
import express from 'express';
export const router = express.Router();
router.post('/image/face-age', (req,res)=>res.json({ok:true,imageUrl:null}));
router.post('/image/variations', (req,res)=>res.json({ok:true,images:[]}));
router.post('/video/storyboard', (req,res)=>res.json({ok:true,frames:[]}));
