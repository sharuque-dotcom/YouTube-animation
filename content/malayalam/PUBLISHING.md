# Malayalam what-if Shorts: daily publish pipeline

One Short a day. Flow for each video:
1. **Script**: English and a draft Malayalam, fact-checked with sources. Send it to the owner for review. The owner's Gemini Malayalam is the final text.
2. **Voice**: ElevenLabs MCP (`creative_generate_speech`), voice `YC7kIECPG5vM2RiP22Rd`, one take, text-to-speech only. Don't use the [playful], [gasping] or [whispering] tags. Split the take into lines at its pauses: `<episode>/voice/main-N.wav`.
3. **Video**: bean style (`pipeline/bean.js`, `pipeline/toon3d.js`, sets in `episodes/ml-bean/`), captions at the top. Render stills of every shot and check them, then do the full render (`node pipeline/render.mjs <episode> --workers 2`, about 1 hour for 60 s).
4. **Owner check**: send the finished MP4. While the series is new, nothing goes public without the owner's OK.
   An APPROVED mark in queue.md, written by any Claude thread after the owner approves in the project chat, is the owner's final approval (owner rule, 26 Nov 2026). The daily task must not ask for it again.
5. **Host**: push the MP4 to the public repo `sharuque-dotcom/engilo` (branch `main`, clone at `/home/user/engilo`). Zapier downloads it from `https://raw.githubusercontent.com/sharuque-dotcom/engilo/main/<file>.mp4`. (Drive doesn't work: connector calls from here are limited to about 3 MB.) Mark the episode APPROVED in `content/malayalam/queue.md` when the owner OKs it.
6. **Upload**: Zapier `YouTubeV4CLIAPI` → `upload_video` (tool `youtube_upload_video`). Fields: title, description, tags, `default_language: ml`, `default_audio_language: ml`, `made_for_kids: false`, category Education, privacy `public` at the daily slot. Channel: EngiloMalayalam (@engilomalayalam, UCqIf5JWztv5T1CSNQMGBa_A). Daily scheduled task fires at 17:52 Dubai (trigger trig_01DhbegZygTPkc3U5nt1Xx7p, in the project thread "Let publishing use project approvals"; the old trig_01ENcLX8jtusAxjHxSUXeRBK is disabled), so the video is live by about 6 pm. `publish_at` needs a YouTube Partner channel, so a daily scheduled task does the upload at the chosen time instead.
6b. **Cover (optional)**: if the queue row has a Cover path, after the upload succeeds call Zapier `youtube_update_video_thumbnail` with the new `video_id` and `thumbnail` = `https://raw.githubusercontent.com/sharuque-dotcom/engilo/main/<cover path>` (PNG/JPEG, under 2 MB; needs a phone-verified channel). If there is no cover, or this step fails, the video stays up as it is: log the error and tell the owner, never re-upload. Covers are made from `/mnt/project-files/channel/source/covers.js`.
7. **Log**: add the video ID and date to `content/malayalam/published.md`.

Metadata for each video lives in `<episode>/youtube.json` (title, description, tags).

## Keeping the engilo repo safe (added 27 Nov 2026)
On 26 Nov a commit that added ep11 (bb720b6) was made from a clone that didn't have the other files, so it deleted every earlier MP4 and cover from engilo main, and the 27 Nov upload had nothing to fetch. Restored in e06bace.
- To add a video or cover to engilo, clone with `git clone --filter=blob:none --depth 3` (full checkout, so the other files stay), `git add` only the new files, and check `git show --stat HEAD` lists only additions before pushing. Never commit from an empty or sparse checkout, and never use `git add -A` there.
- The daily task checks that today's MP4 and cover return HTTP 200 on raw.githubusercontent.com before uploading. If one is missing, it restores it from engilo history (the last commit that has it) and then uploads.
- Safety net: a second scheduled task at 18:25 Dubai checks the channel (YouTube API search on UCqIf5JWztv5T1CSNQMGBa_A) for today's Short. If it isn't live, it fixes the cause and uploads it, then reports in the project.
