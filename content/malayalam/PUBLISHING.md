# Malayalam what-if Shorts: daily publish pipeline

One Short a day. Flow for each video:
1. **Script**: English and a draft Malayalam, fact-checked with sources. Send it to the owner for review. The owner's Gemini Malayalam is the final text.
2. **Voice**: ElevenLabs MCP (`creative_generate_speech`), voice `YC7kIECPG5vM2RiP22Rd`, one take, text-to-speech only. Don't use the [playful], [gasping] or [whispering] tags. Split the take into lines at its pauses: `<episode>/voice/main-N.wav`.
3. **Video**: bean style (`pipeline/bean.js`, `pipeline/toon3d.js`, sets in `episodes/ml-bean/`), captions at the top. Render stills of every shot and check them, then do the full render (`node pipeline/render.mjs <episode> --workers 2`, about 1 hour for 60 s).
4. **Owner check**: send the finished MP4. While the series is new, nothing goes public without the owner's OK.
   An APPROVED mark in queue.md, written by any Claude thread after the owner approves in the project chat, is the owner's final approval (owner rule, 26 Nov 2026). The daily task must not ask for it again.
5. **Host**: push the MP4 to the public repo `sharuque-dotcom/engilo` (branch `main`, clone at `/home/user/engilo`). Zapier downloads it from `https://raw.githubusercontent.com/sharuque-dotcom/engilo/main/<file>.mp4`. (Drive doesn't work: connector calls from here are limited to about 3 MB.) Mark the episode APPROVED in `content/malayalam/queue.md` when the owner OKs it.
6. **Upload**: Zapier `YouTubeV4CLIAPI` → `upload_video` (tool `youtube_upload_video`). Fields: title, description, tags, `default_language: ml`, `default_audio_language: ml`, `made_for_kids: false`, category Education, privacy `public` at the daily slot. Channel: EngiloMalayalam (@engilomalayalam, UCqIf5JWztv5T1CSNQMGBa_A). Daily scheduled task fires at 17:52 Dubai (trigger trig_01DhbegZygTPkc3U5nt1Xx7p, in the project thread "Let publishing use project approvals"; the old trig_01ENcLX8jtusAxjHxSUXeRBK is disabled), so the video is live by about 6 pm. `publish_at` works on this channel (tested 27 Nov: Colachel uploaded private with publish_at 2026-11-28T14:00:00Z). Preferred: upload ahead as private with publish_at = the slot (14:00 UTC) and set the cover, then mark the row SCHEDULED (<id>). The daily task only uploads rows still APPROVED for today's date.
6b. **Cover (optional)**: if the queue row has a Cover path, after the upload succeeds call Zapier `youtube_update_video_thumbnail` with the new `video_id` and `thumbnail` = `https://raw.githubusercontent.com/sharuque-dotcom/engilo/main/<cover path>` (PNG/JPEG, under 2 MB; needs a phone-verified channel). If there is no cover, or this step fails, the video stays up as it is: log the error and tell the owner, never re-upload. Covers are made from `/mnt/project-files/channel/source/covers.js`.
7. **Log**: add the video ID and date to `content/malayalam/published.md`.

Metadata for each video lives in `<episode>/youtube.json` (title, description, tags).

## Title rules (added 27 Nov 2026)
- **Sequel titles never start with "Part N" / "ഭാഗം N".** Lead with the episode's own bold what-if hook so a Shorts-feed viewer who never saw Part 1 still gets it in the first glance. A series mark is fine at the end, before #shorts, e.g. `(Pt 2)`. Why: YouTube Studio flagged Travancore Part 2 (59% stayed-to-watch vs 60–67% on earlier Shorts) because "Part 2" up front makes new viewers feel they missed something. It was retitled to `ഗൾഫുകാർ ജോലിക്ക് തിരുവിതാംകൂറിലേക്ക് വന്നിരുന്നെങ്കിൽ? 🐚 If Travancore Existed Today (Pt 2) #shorts`.
- The spoken opening of a sequel must also stand alone: a bold what-if statement, not "last time we saw...".
- Pre-1956 states (Travancore, Cochin, Malabar) are not "Kerala": no "Kerala" framing or size words ("small kingdom") for them in Malayalam or English titles. Kerala state was formed in 1956.
- YouTube titles max out at 100 characters (Malayalam letters with their vowel signs count as several). Check with `python3 -c "print(len('<title>'))"`.
- Series linking: when a sequel goes up, add its link to the earlier part's description and post a comment on each part linking to the other, ending with an open question. Pin both comments (one tap in YouTube Studio or the app: comment ⋮ → Pin; the API can't pin).

## Keeping the engilo repo safe (added 27 Nov 2026)
On 26 Nov a commit that added ep11 (bb720b6) was made from a clone that didn't have the other files, so it deleted every earlier MP4 and cover from engilo main, and the 27 Nov upload had nothing to fetch. Restored in e06bace.
- To add a video or cover to engilo, clone with `git clone --filter=blob:none --depth 3` (full checkout, so the other files stay), `git add` only the new files, and check `git show --stat HEAD` lists only additions before pushing. Never commit from an empty or sparse checkout, and never use `git add -A` there.
- The daily task checks that today's MP4 and cover return HTTP 200 on raw.githubusercontent.com before uploading. If one is missing, it restores it from engilo history (the last commit that has it) and then uploads.
- Safety net: a second scheduled task at 18:25 Dubai checks the channel (YouTube API search on UCqIf5JWztv5T1CSNQMGBa_A) for today's Short. If it isn't live, it fixes the cause and uploads it, then reports in the project.
