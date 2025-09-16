
import express from 'express';
export const router = express.Router();
router.post('/llm/compare', (req,res)=>res.json({modelA:{name:'A',text:'demo'}, modelB:{name:'B',text:'demo'}}));
