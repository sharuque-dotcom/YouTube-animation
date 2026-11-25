# Malayalam what-if Shorts: daily publish pipeline

One Short a day. Flow for each video:
1. **Script**: English and a draft Malayalam, fact-checked with sources. Send it to the owner for review. The owner's Gemini Malayalam is the final text.
2. **Voice**: ElevenLabs MCP (`creative_generate_speech`), voice `YC7kIECPG5vM2RiP22Rd`, one take, text-to-speech only. Don't use the [playful], [gasping] or [whispering] tags. Split the take into lines at its pauses: `<episode>/voice/main-N.wav`.
3. **Video**: bean style (`pipeline/bean.js`, `pipeline/toon3d.js`, sets in `episodes/ml-bean/`), captions at the top. Render stills of every shot and check them, then do the full render (`node pipeline/render.mjs <episode> --workers 2`, about 1 hour for 60 s).
4. **Owner check**: send the finished MP4. While the series is new, nothing goes public without the owner's OK.
5. **Host**: upload the MP4 to Google Drive folder `What-If Shorts – uploads` (id `1HLHICI6VZcyk3AiI8OtSjoO5cSz3DCWU`) and share it as "anyone with link" (reader). Zapier downloads it from `https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t`.
6. **Upload**: Zapier `YouTubeV4CLIAPI` → `upload_video` (tool `youtube_upload_video`). Fields: title, description, tags, `default_language: ml`, `default_audio_language: ml`, `made_for_kids: false`, category Education, privacy `public` at the daily slot. Channel: EngiloMalayalam (@engilomalayalam, UCqIf5JWztv5T1CSNQMGBa_A). Daily scheduled task fires at 17:52 Dubai (trigger trig_01ENcLX8jtusAxjHxSUXeRBK), so the video is live by about 6 pm. `publish_at` needs a YouTube Partner channel, so a daily scheduled task does the upload at the chosen time instead.
7. **Log**: add the video ID and date to `content/malayalam/published.md`.

Metadata for each video lives in `<episode>/youtube.json` (title, description, tags).
