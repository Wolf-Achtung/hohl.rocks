// server/routes/models-live.js
import express from 'express'; export const router=express.Router(); let cache={t:0,data:[]};
router.get('/api/models-live', async (req,res)=>{ const ttl=7*24*60*60*1000, now=Date.now(); if(cache.data.length && (now-cache.t)<ttl) return res.json(cache.data);
  const src=process.env.MODELS_SOURCE_URL; if(!src) return res.status(404).json({ok:false}); try{ const r=await fetch(src,{cache:'no-store'}); const j=await r.json(); cache={t:now,data:j}; res.json(j); }catch(e){ res.status(500).json({ok:false,error:String(e)}); }});
