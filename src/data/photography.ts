// Maintained, noncommercial inspiration-board content; no product or purchase fields.
export const photographyTopics = ["Night & light", "Wildlife", "Places", "People", "Details"] as const;
export type PhotographyTopic = typeof photographyTopics[number];
export interface GalleryPhotograph {
  id: string;
  title: string;
  topic: PhotographyTopic;
  caption: string;
  image: string;
  width: number;
  height: number;
}
export const galleryPhotographs = [
  {
    "id": "photo-01",
    "title": "The Sky Writes Once",
    "topic": "Night & light",
    "caption": "A bright fork of lightning meets its reflection on still water beneath a deep orange horizon and heavy dark clouds.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Colby-Brown.jpg",
    "width": 2000,
    "height": 1299
  },
  {
    "id": "photo-02",
    "title": "Every Colour After Dark",
    "topic": "Night & light",
    "caption": "Pink, green, and turquoise light spreads above a quiet beach, with a lone rock reflected in the shallow water.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Ben-Moon.jpg",
    "width": 2000,
    "height": 1333
  },
  {
    "id": "photo-03",
    "title": "Branches Among the Stars",
    "topic": "Night & light",
    "caption": "Two rough branching trunks frame a dense field of stars above a dark desert silhouette.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Jude-Allen.jpg",
    "width": 1333,
    "height": 2000
  },
  {
    "id": "photo-04",
    "title": "A Curtain Beyond the Ridge",
    "topic": "Night & light",
    "caption": "Vertical pink and red light rises above a low rocky ridge, fading into a fine scatter of stars.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Andrew-Eggers.jpg",
    "width": 2000,
    "height": 1333
  },
  {
    "id": "photo-05",
    "title": "The Desert Waits Up",
    "topic": "Night & light",
    "caption": "Tall cactus silhouettes stand beside a narrow path beneath a faint band of stars in the blue-black sky.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Michael-Hollender.JPG",
    "width": 1600,
    "height": 2000
  },
  {
    "id": "photo-06",
    "title": "A Small Gesture Beneath Infinity",
    "topic": "Night & light",
    "caption": "A figure and a bright sweep of light appear beneath a tall star-filled sky, mirrored in a dark pool at their feet.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Quay-Hu.jpg",
    "width": 1333,
    "height": 2000
  },
  {
    "id": "photo-07",
    "title": "Room for One More Star",
    "topic": "Night & light",
    "caption": "A seated figure rests on a large rock below a luminous blue-white band of stars.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Mike-Meyers.jpg",
    "width": 1463,
    "height": 2000
  },
  {
    "id": "photo-08",
    "title": "The Blue at the Edge of Sleep",
    "topic": "Night & light",
    "caption": "Electric blue traces shine along dark waves beneath a headland lined with palms and small lights.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Stan-Moniz.jpg",
    "width": 2000,
    "height": 1334
  },
  {
    "id": "photo-09",
    "title": "Together Under the Green Sky",
    "topic": "Night & light",
    "caption": "Two figures stand on a reflective shoreline as a vivid green arc stretches across the night above them.",
    "image": "https://alphauniverseglobal.media.zestyio.com/Alpha-Universe-Best-Of-2024-Autumn-Schrock.jpg",
    "width": 2000,
    "height": 1334
  },
  {
    "id": "photo-10",
    "title": "A Quiet Conversation Underwater",
    "topic": "Wildlife",
    "caption": "Pale rounded whales overlap in dark green water, their smooth bodies and small fins catching the soft underwater light.",
    "image": "https://mymodernmet.com/wp/wp-content/uploads/2024/11/Natures-Best-Photography-7-WinnerPolarPassion%C2%A9BrettFreliche-Belugas.jpg",
    "width": 1300,
    "height": 928
  },
  {
    "id": "photo-11",
    "title": "One Step Across the Sun",
    "topic": "People",
    "caption": "A tiny balancing figure is silhouetted on a line between dark cliffs, directly in front of a bright crescent in a warm clouded sky.",
    "image": "https://mymodernmet.com/wp/wp-content/uploads/2024/11/Natures-Best-Photography-9-WinnerOutdoorAdventure%C2%A9BelvaHayden-Highliner.jpg",
    "width": 1300,
    "height": 867
  },
  {
    "id": "photo-12",
    "title": "The Field Holds Its Own Constellations",
    "topic": "Places",
    "caption": "Small glowing flower-like forms cover a wide dark field beneath a low sun and orange-edged clouds.",
    "image": "https://mymodernmet.com/wp/wp-content/uploads/2024/11/Natures-Best-Photography-8-WinnerLandscapes%C2%A9MarcioCabral-FireworksBrazil.jpg",
    "width": 1300,
    "height": 867
  },
  {
    "id": "photo-13",
    "title": "The Playful Space Between Two Leaps",
    "topic": "Wildlife",
    "caption": "Two spotted cats tumble together above dusty ground, with curved tails and reaching paws caught in the movement.",
    "image": "https://mymodernmet.com/wp/wp-content/uploads/2024/11/Natures-Best-Photography-4-WinnerWildlife%C2%A9KevinDooley-Leopards.jpg",
    "width": 1300,
    "height": 849
  },
  {
    "id": "photo-14",
    "title": "A Perch Between Rust and Gold",
    "topic": "Wildlife",
    "caption": "A small brown bird sits on a narrow bar between heavy hanging chains and weathered green metal against a warm yellow background.",
    "image": "https://mymodernmet.com/wp/wp-content/uploads/2024/11/Natures-Best-Photography-2-YouthPhotogOfTheYear%C2%A9AlbertoRomanGomez.jpg",
    "width": 1300,
    "height": 975
  },
  {
    "id": "photo-15",
    "title": "A White Wing Above the Water",
    "topic": "Wildlife",
    "caption": "A white bird rises from pale surf with its long legs hanging below, while a small fish arcs near its open wings.",
    "image": "https://mymodernmet.com/wp/wp-content/uploads/2024/11/Natures-Best-Photography-3-WinnerBirds%C2%A9XiaopingLin-PassByEgret.jpg",
    "width": 1300,
    "height": 867
  },
  {
    "id": "photo-16",
    "title": "The Smallest Kind of Affection",
    "topic": "Wildlife",
    "caption": "Two young foxes touch noses on sandy ground, their large ears outlined by the warm light.",
    "image": "https://mymodernmet.com/wp/wp-content/uploads/2024/11/Natures-Best-Photography-5-WinnerAnimalAntics%C2%A9BrianClopp-KitFoxes.jpg",
    "width": 1300,
    "height": 889
  },
  {
    "id": "photo-17",
    "title": "A Gaze Through Green Silk",
    "topic": "People",
    "caption": "Clear blue-grey eyes look over a bright green cloth scattered with small gold-toned details.",
    "image": "https://webneel.com/daily/sites/default/files/images/daily/11-2017/5-green-girl-by-famous-photographer-rehahn.preview.jpg",
    "width": 660,
    "height": 679
  },
  {
    "id": "photo-18",
    "title": "The Lantern at the End of the Trees",
    "topic": "People",
    "caption": "A figure in a pale flowing dress stands in a small boat among tall trees, holding a lantern beneath shafts of misty light.",
    "image": "https://webneel.com/daily/sites/default/files/images/daily/11-2017/13-woods-by-famous-photographer-joe-mcnally.preview.jpg",
    "width": 660,
    "height": 450
  },
  {
    "id": "photo-19",
    "title": "The Path to a Little Red Roof",
    "topic": "Places",
    "caption": "A narrow path crosses dense green ground toward a small pale tower beneath an open turquoise sky.",
    "image": "https://images.unsplash.com/photo-1790949242096-b2c67c01af43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 740
  },
  {
    "id": "photo-20",
    "title": "A Bridge Beyond the Wire",
    "topic": "Places",
    "caption": "A red suspension bridge appears through a close diamond-shaped fence, with a small pole and roadside details in the foreground.",
    "image": "https://images.unsplash.com/photo-1790206946311-dac0e111183a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  },
  {
    "id": "photo-21",
    "title": "A House Where the Rocks Gather",
    "topic": "Places",
    "caption": "A low stone building nestles among large weathered rocks beneath a broad clear blue sky.",
    "image": "https://images.unsplash.com/photo-1791475746949-b2da2d3b6635?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 375
  },
  {
    "id": "photo-22",
    "title": "A Circle of Roofs and Passing People",
    "topic": "Places",
    "caption": "A round tiered building rises above pale terraces as visitors gather in dark silhouettes along the lower edge of the scene.",
    "image": "https://images.unsplash.com/photo-1791896160725-22d35e99c4c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 333
  },
  {
    "id": "photo-23",
    "title": "The Shape of an Interrupted Second",
    "topic": "Details",
    "caption": "A dark irregular cluster is suspended within a bright splash of clear water against a pale blue background.",
    "image": "https://images.unsplash.com/photo-1792701308490-a7b08e1e38dd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 667
  },
  {
    "id": "photo-24",
    "title": "Red Hair in the Afternoon Grass",
    "topic": "People",
    "caption": "A reclining figure in a white shirt looks toward the camera, with vivid orange-red hair spread across the green ground.",
    "image": "https://plus.unsplash.com/premium_photo-1791312841777-844b59f5a72a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 736
  },
  {
    "id": "photo-25",
    "title": "The Warmth of a Direct Gaze",
    "topic": "People",
    "caption": "A close portrait combines a deep orange-red background with green-tinted light across the face and shoulders.",
    "image": "https://images.unsplash.com/photo-1792011019486-c7b6945c65f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 754
  },
  {
    "id": "photo-26",
    "title": "A Turn Beside the Flowers",
    "topic": "Places",
    "caption": "A pale car follows a curved road above thick red flowers and green planting, with the sea visible beyond the verge.",
    "image": "https://images.unsplash.com/photo-1791848030230-3990b7c7c29e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  },
  {
    "id": "photo-27",
    "title": "The Reflection Keeps Dancing",
    "topic": "People",
    "caption": "A silhouetted figure moves beside a shallow pool beneath a pale golden sun, with a clear reflection on the still surface.",
    "image": "https://images.unsplash.com/photo-1792815037202-626320f6d9cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 667
  },
  {
    "id": "photo-28",
    "title": "The Doorway Borrows the Sun",
    "topic": "Places",
    "caption": "A sharply defined patch of sunlight falls through a pointed stone doorway into a quiet courtyard with warm yellow walls.",
    "image": "https://images.unsplash.com/photo-1792802140724-9e30b2f639e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  },
  {
    "id": "photo-29",
    "title": "Small Shadows on a Familiar Floor",
    "topic": "Details",
    "caption": "Black paper-like bats and spiders scatter across pale stone and warm wooden flooring beside a plant pot and a small apple.",
    "image": "https://plus.unsplash.com/premium_photo-1788443816442-cccc5bf02652?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  },
  {
    "id": "photo-30",
    "title": "The Long Face of the Coast",
    "topic": "Places",
    "caption": "Layered golden cliffs and a tall rock stack rise above pale blue water, seen from the front of a small boat.",
    "image": "https://images.unsplash.com/photo-1792803002995-2a54fac6941c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  },
  {
    "id": "photo-31",
    "title": "A Window for the Last Light",
    "topic": "Places",
    "caption": "A warm coastal view appears through a small mirror-like rectangle surrounded by a dark interior.",
    "image": "https://plus.unsplash.com/premium_photo-1791374201605-b476c8e4daf2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 333
  },
  {
    "id": "photo-32",
    "title": "A Shelter Beneath the Burning Sky",
    "topic": "Places",
    "caption": "A small roofed shelter stands in silhouette above a dark shore beneath a wide orange and pink evening sky.",
    "image": "https://images.unsplash.com/photo-1792264656228-a25b165990b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 667
  },
  {
    "id": "photo-33",
    "title": "The Mountains Before We Speak",
    "topic": "Places",
    "caption": "A dark foreground figure faces a long range of snow-edged mountains beneath warm clouds at dusk.",
    "image": "https://images.unsplash.com/photo-1792685517706-12e89133de27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 333
  },
  {
    "id": "photo-34",
    "title": "The Market Between the Rushes",
    "topic": "Places",
    "caption": "Repeating pale roofs cover warmly lit stalls inside a large market hall, with a few figures crossing the open floor.",
    "image": "https://images.unsplash.com/photo-1792802140584-fb06a0ef7279?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 333
  },
  {
    "id": "photo-35",
    "title": "The First Step into Cool Water",
    "topic": "People",
    "caption": "A small figure stands at the edge of rippling shallow water, facing away toward a pale blue horizon.",
    "image": "https://images.unsplash.com/photo-1791475747123-927c8d2d91ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  },
  {
    "id": "photo-36",
    "title": "A City Slipping into Evening",
    "topic": "Places",
    "caption": "A dark corner building with glowing hotel signs stands above the blurred band of a passing tram.",
    "image": "https://images.unsplash.com/photo-1790059631122-7614b81c5085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  },
  {
    "id": "photo-37",
    "title": "The Landscape Through the Dark",
    "topic": "Places",
    "caption": "An irregular stone opening frames a pale sky and distant green-brown hills beyond a deeply shadowed interior.",
    "image": "https://images.unsplash.com/photo-1791661432757-ac64e7e88849?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 754
  },
  {
    "id": "photo-38",
    "title": "A Feathered Study in Soft Light",
    "topic": "Wildlife",
    "caption": "A small bird is shown in close profile, with fine brown-and-cream feather markings and a bright dark eye against a soft blue background.",
    "image": "https://images.unsplash.com/photo-1792083685877-15691d1bacb1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 333
  },
  {
    "id": "photo-39",
    "title": "A Small Silhouette Before the Sun",
    "topic": "Wildlife",
    "caption": "A dark pointed-eared animal sits among fine plants beneath a broad orange sky and a bright low sun.",
    "image": "https://images.unsplash.com/photo-1792692408822-db89719ac79a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 323
  },
  {
    "id": "photo-40",
    "title": "An Empty Chair in Warm Light",
    "topic": "Details",
    "caption": "A yellow hanging shade lights a quiet table and chair beside an open view of green trees.",
    "image": "https://plus.unsplash.com/premium_photo-1792674568534-9c8464d6dd98?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    "width": 500,
    "height": 750
  }
] satisfies GalleryPhotograph[];
