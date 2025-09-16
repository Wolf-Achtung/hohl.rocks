/* daily-feed.js — tiny fetcher for news/prompt feeds */
window.DailyFeed = {
  async news(){
    try{ const j = await fetch('/api/news.json',{cache:'no-store'}).then(r=>r.json()); return (j.items||[]); } catch(e){ return []; }
  },
  async prompt(){
    try{ const j = await fetch('/api/prompt.json',{cache:'no-store'}).then(r=>r.json()); return (j.items||[]); } catch(e){ return []; }
  }
};