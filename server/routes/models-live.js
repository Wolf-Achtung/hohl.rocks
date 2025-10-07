
import express from 'express';
export const router = express.Router();
router.get('/api/models-live', (req,res)=>res.json([{name:'gpt-4o-mini-2024-07-18', tier:'low-cost', strengths:['Allround'], best_for:['Kurzrecherche'], sample_prompt:'GIST→FACT→CITE'}]));
