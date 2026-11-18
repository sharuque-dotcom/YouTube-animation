# Travancore Short: copy-paste prompts for Gemini (pixel-art style locked)

**Why it came out realistic:** video models default to realism unless the style leads the prompt and the first frame already looks like pixel art. So for every clip:

1. **Step 1, image:** paste the IMAGE prompt into Gemini (image generation) and attach the character sheets listed. Regenerate until it clearly looks like pixel art.
2. **Step 2, video:** in Veo, choose image-to-video ("frames to video" / "animate image"), upload that image, paste the VIDEO prompt and set the length shown.

Make the character sheets (Part A) first and reuse them in every clip and future episode.

| Clip | Length |
|---|---|
| Clip 1 main-1 | 10 s |
| Clip 2 main-2 | 12 s |
| Clip 3 main-3 | 7 s |
| Clip 4 main-4 | 10 s |
| Clip 5 main-5 | 12 s |
| Clip 6 main-6 | 6 s |
| Clip 7 main-7 | 7 s |
| Clip 8 main-8 | 13 s |
| Clip 9a main-9 | 11 s |
| Clip 9b main-9 | 11 s |
| Clip 10 end-1 | 10 s |

---

# Part A · Recurring cast (image prompts, generate once)

### A1 · KANNAN, our guide (appears in every episode)
```
Pixel-art video game character sprite sheet, retro 16-bit / 32-bit pixel art with chunky visible pixels, no smoothing, plain light background, no text. One character shown 4 times in a row: front, three-quarter, side, back, plus a row of 4 walk frames and 2 idle frames. Character: KANNAN, a friendly young Malayali man from 1940s Kerala, slim, short black side-parted hair, thin moustache, warm brown skin, TEAL short-sleeved shirt, white mundu (Kerala sarong) with a thin gold border, barefoot. Each figure about 34x50 pixels scaled up crisp, 1-pixel dark outline, limited palette with light dithering. The teal shirt is his signature colour. NOT photorealistic, NOT 3D-rendered, NOT a real person, flat 2D game sprite.
```

### A2 · AMMINI, an elder of the coast
```
Pixel-art video game character sprite sheet, retro 16-bit / 32-bit pixel art with chunky visible pixels, no smoothing, plain light background, no text. One character shown 4 times in a row: front, three-quarter, side, back, plus 2 idle frames and 2 frames scooping sand into a basket. Character: AMMINI, a strong Malayali woman in her 50s from 1940s coastal Kerala, grey hair in a bun, warm dark-brown skin, deep RED blouse, white mundu with a red border, a woven palm-leaf basket on her hip, barefoot. Each figure about 34x50 pixels scaled up crisp, 1-pixel dark outline, limited palette with light dithering. NOT photorealistic, NOT 3D-rendered, NOT a real person, flat 2D game sprite.
```

### A3 · VILLAGERS, a crowd pack
```
Pixel-art video game sprite sheet, retro 16-bit / 32-bit pixel art with chunky visible pixels, no smoothing, plain light background, no text. Eight different 1940s Kerala villagers standing in a row, each with 2 idle frames: an old man with a white beard and stick; a shopkeeper with a towel on his shoulder; a young woman in a green blouse with jasmine in her hair; a schoolboy in khaki shorts; a man reading a newspaper; a fisherman with a headband; a woman holding a brass pot; a clerk with round spectacles. Mostly white mundus and earthy shirts, varied warm brown skin. Each about 34x50 pixels, 1-pixel dark outline. NOT photorealistic, NOT 3D-rendered, flat 2D game sprites.
```

### A4 · THE DEWAN, silhouette only (no likeness of the real person)
```
Pixel-art video game character sprite sheet, retro 16-bit / 32-bit pixel art with chunky visible pixels, no smoothing, plain light background, no text. A tall dignified 1940s statesman shown ONLY from behind and as a side silhouette, face never visible: dark buttoned long coat, white trousers, a shawl over one shoulder, hands clasped behind his back. Views: back, back three-quarter, side silhouette, and 4 walking-away frames. About 34x52 pixels, 1-pixel dark outline. NOT photorealistic, NOT 3D-rendered, no face shown, flat 2D game sprite.
```

---

# Part B · Clips

### Clip 1 · main-1 · Hook: "In 1947, one kingdom in Kerala almost said no to India. Travancore."  (10 s)
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Daytime. A tiny royal study in a 1940s Kerala palace: sunlight through tall wooden-shuttered windows in dusty light shafts onto a teak desk. On the desk a hand-drawn old map showing ONLY the south-west Kerala coastline (no other borders, no map of India), with a dashed gold line around the old Travancore state glowing gold. Beside it a brass desk lamp with a green shade, an inkwell, a stack of books and a small golden conch-shell paperweight.
```
**Step 2, VIDEO prompt (10 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: The gold border on the map slowly brightens and pulses; dust motes drift in the light shafts; the camera slowly pushes in toward the map. Duration 10 seconds.
```

### Clip 2 · main-2 · "On 18 June 1947, Travancore announced on the radio it would become independent."  (12 s)
Attach: **Kannan (A1) + Villagers (A3)**
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Night, gentle rain. A tiny 1947 Trivandrum lane: Kerala houses with red-tiled pitched roofs, white walls and warm glowing windows, coconut palms, a wet red-earth road with puddles reflecting lamplight. In the centre a small radio shop with an open front glowing warm orange, shelves of colourful jars and a wooden radio with a glowing dial on the counter. A small crowd of villagers in white mundus gathers in front listening, with KANNAN (teal shirt) at the centre. Two street lamps, cool blue moonlight and fog against warm orange light.
```
**Step 2, VIDEO prompt (12 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: Rain falls in slanted streaks; the shop light flickers softly; villagers do small 2-frame idle bobs; the camera glides slowly down toward the crowd. Duration 12 seconds.
```

### Clip 3 · main-3 · "It already had its own currency, its own stamps, and its own army."  (7 s)
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Indoors, candlelight. A deep crimson velvet tablecloth on a palace table seen from above. On it: a silver old coin with a conch emblem, a red postage stamp with perforated edges and a gold conch, and a brass eight-pointed army badge. A soft spotlight from the upper left, a candle at the edge, glints on the metal.
```
**Step 2, VIDEO prompt (7 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: The three objects drop onto the velvet one after another and settle with a small bounce; the candle flickers; slow push-in. Duration 7 seconds.
```

### Clip 4 · main-4 · "Its beaches held thorium sand, a nuclear fuel the world wanted."  (10 s)
Attach: **Ammini (A2)**
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Sunset. A tiny Kerala beach of BLACK sand with gold and white sparkles. Gentle waves with white foam; the sea reflects a pink, orange and violet sky with pixel clouds; a low sun with a long glittering light path on the water. Coconut palms lean over the beach with warm rim light. AMMINI (red blouse, white mundu, basket) gathers sand into her basket.
```
**Step 2, VIDEO prompt (10 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: Waves roll in gently; the sand sparkles twinkle; palm fronds sway slowly; Ammini bends and scoops sand in a 2-frame loop; the camera slowly descends toward her. Duration 10 seconds.
```

### Clip 5 · main-5 · "On 25 July, the Dewan C.P. Ramaswami Iyer was attacked after a concert in Trivandrum."  (12 s)
Attach: **The Dewan (A4) + Villagers (A3)**
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Night, rain. A tiny 1940s concert hall with white columns, a triangular roof and wide steps; tall doors open with warm golden light spilling out. A black 1940s car waits at the bottom of the steps, headlights on. The DEWAN silhouette (seen only from behind, no face) walks down the steps; a few people leave under umbrellas. Two lamp posts glow in the rain. Cold blue night against warm doorway light.
```
**Step 2, VIDEO prompt (12 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: Rain falls; the Dewan walks down the steps in a 4-frame walk; then one bright lightning flash whitens the scene for an instant and fades (no violence, no weapons, no injuries); slow push-in toward the car. Duration 12 seconds.
```

### Clip 6 · main-6 · "Within days, Travancore agreed to join India."  (6 s)
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Daytime. The same tiny royal study and teak desk with sunlight through wooden shutters; the old Kerala-coast-only map on the desk with its gold border around Travancore.
```
**Step 2, VIDEO prompt (6 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: The glowing gold border slowly fades back to plain ink; dust drifts; the camera slowly rises and pulls back. Duration 6 seconds.
```

### Clip 7 · main-7 · "But imagine if the plan had worked."  (7 s)
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Sunrise. A tiny Kerala harbour city: a modern skyline of slim towers with glowing windows beside old red-tiled roofs and coconut palms, cranes, a container ship in the harbour, the sea glittering, long golden light shafts through morning haze.
```
**Step 2, VIDEO prompt (7 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: Time-lapse feeling: windows light up, cranes turn, the ship glides in, the sun rises a little; slow push-in from high above. Duration 7 seconds.
```

### Clip 8 · main-8 · "A Travancore passport. Embassies in Trivandrum. Ships flying the conch flag."  (13 s)
Attach: **Kannan (A1) + Villagers (A3)**
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Morning. A busy tiny modern Kerala harbour: a container ship with colourful stacked containers at a stone quay, a red flag with a golden conch shell on its mast, a city skyline behind with a boulevard of flags. KANNAN (teal shirt, white mundu) walks along the quay with a small suitcase and a dark-blue passport among other travellers.
```
**Step 2, VIDEO prompt (13 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: The conch flag waves; the water glitters; Kannan walks in a 4-frame walk cycle; the camera tracks sideways along the quay with him. Duration 13 seconds.
```

### Clip 9a · main-9 · the dream  (11 s)
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Sunny day. A gleaming prosperous tiny city-state harbour in Kerala: modern towers, green parks with coconut palms, busy ships, red conch flags. Golden optimistic light.
```
**Step 2, VIDEO prompt (11 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: Flags wave, ships move slowly, slow push-in from high above. Duration 11 seconds.
```

### Clip 9b · main-9 · the fear (same camera angle as 9a)  (11 s)
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Grey rainy day. The same tiny Kerala harbour from the same high angle but struggling: shuttered warehouses, idle rusty cranes, empty quays, a closed shop, puddles. Flat cold light, dull colours.
```
**Step 2, VIDEO prompt (11 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: Drizzle falls, puddles ripple, slow push-in matching the dream version. Duration 11 seconds.
```

### Clip 10 · end-1 · "Part two: what would Travancore look like today? Follow."  (10 s)
Attach: **Kannan (A1)**
**Step 1, IMAGE prompt:**
```
Pixel-art video game screenshot, retro 16-bit / 32-bit pixel art with chunky visible square pixels, crisp edges, no smoothing, limited colour palette with dithering. Seen as a tiny tilt-shift miniature diorama from a high three-quarter angle looking down (never eye level): small 3D blocky buildings and props covered in pixel-art textures, flat 2D pixel-sprite characters (tiny, about 1/10 of the frame height, simple pixel faces, 1-pixel dark outline). Soft glowing bloom around lights, sharp focus band in the middle, blurred top and bottom like a miniature. Vertical 9:16. NOT photorealistic, NOT live action, NOT a photograph, NOT 3D-rendered realistic people, no realistic faces, no text, no watermark. Scene: Sunset. A tiny Kerala palace with a long red-tiled roof, carved wooden pillars and a central tower; on top a large red flag with a golden conch. Coconut palms on both sides; pink, violet and gold sky with pixel clouds. KANNAN (teal shirt) stands small in the courtyard looking up at the flag.
```
**Step 2, VIDEO prompt (10 seconds, image-to-video):**
```
Animate this pixel-art image. Keep EXACTLY the same retro pixel-art video game style, the same chunky pixels, palette and tilt-shift miniature look in every frame: do NOT turn it into photorealism or live action. Characters move in simple stepped pixel animation (2-frame idle, 4-frame walk); the camera, light, water, rain and particles move smoothly and slowly. High three-quarter camera looking down, slow gentle camera move, no cuts. Vertical 9:16, no text. Motion: The flag waves in the breeze; palms sway; Kannan does a 2-frame idle; the camera slowly rises and tilts up toward the flag. Duration 10 seconds.
```

---
**If Veo still drifts toward realism:** shorten the motion, keep the camera move small, and add "retro pixel-art game, every frame pixel art" again at the end. Send me the clips and your 10 Malayalam audio files; I'll cut them to your voice and add the captions, plates and Follow button.
