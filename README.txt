Gold-Standard Patch
1) Dateien ins Web-Root.
2) In jede Seite (HEAD):
   <link rel="stylesheet" href="/site-frame.css?v=1">
   <link rel="stylesheet" href="/chatbox.css?v=1">
3) Vor </body>:
   <script>window.BG_VIDEO_SRC='/media/desert-drive.mp4';</script>
   <script defer src="/video-bg.js?v=1"></script>
   <script>window.CHAT_ENDPOINT='https://<dein-railway-endpoint>/chat';</script>
   <script defer src="/chatbox.js?v=1"></script>
