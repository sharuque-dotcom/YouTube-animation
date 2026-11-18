"""Malayalam (and other Indic) narration with AI4Bharat Indic Parler-TTS (Apache-2.0).
Writes one clip per narration line to <episode>/voice/<scene>-<n>.wav, which pipeline/tts.py then uses
as recordings. Run with the separate env: /home/user/venvs/parler/bin/python -I pipeline/tts_indic.py episodes/ml-travancore
narration.json may set "speaker_desc" (default: Anjali, dramatic storytelling)."""
import sys, json, os, time, torch, soundfile as sf
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
ep = sys.argv[1]; spec = json.load(open(f"{ep}/narration.json"))
desc = spec.get("speaker_desc", "Anjali speaks in an expressive, engaging storytelling tone at a moderate pace, with very clear, close-up studio audio and no background noise.")
m = ParlerTTSForConditionalGeneration.from_pretrained("ai4bharat/indic-parler-tts").eval()
tok = AutoTokenizer.from_pretrained("ai4bharat/indic-parler-tts"); dtok = AutoTokenizer.from_pretrained(m.config.text_encoder._name_or_path)
os.makedirs(f"{ep}/voice", exist_ok=True); d = dtok(desc, return_tensors="pt")
for sc in spec["scenes"]:
    for i, l in enumerate(sc.get("lines", []), 1):
        say = l if isinstance(l, str) else l.get("say", l["text"])
        torch.manual_seed(7); t0 = time.time(); p = tok(say, return_tensors="pt")
        with torch.no_grad(): a = m.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
        sf.write(f"{ep}/voice/{sc['id']}-{i}.wav", a.cpu().numpy().squeeze(), m.config.sampling_rate); print(sc["id"], i, round(time.time() - t0), "s", flush=True)
