import type { PrismaClient } from "@prisma/client";
import { demoId } from "./demo-content";
import { urlArtworks } from "./url-content";
import { galleryPhotographs } from "../src/data/photography";

// Original mock editorial features. Reference images do not document reported visits.
const articles = [
  {
    title: "Learning to Look at a Painting Slowly",
    category: "Looking at Art",
    excerpt: "A painting can offer more than its first impression. Give your eyes a little time, follow a few details, and see how the whole picture begins to change.",
    image: urlArtworks[0].image,
    paragraphs: [
      "The first thing you notice in a painting is often the loudest thing: a bright sky, a dark silhouette, a face that seems to meet your own. There is nothing wrong with that first response. It is an opening. The interesting part begins when you stay long enough for quieter details to become visible around it.",
      "Try looking before reading the title. Let your eyes move across the surface without asking what the work means. Notice where they stop and where they hurry. A patch of pale colour might pull you towards the edge, while a repeated curve brings you back. You are beginning to discover the painting's internal rhythm through your own attention.",
      "Next, choose one small area. It could be a sleeve, a strip of water, or the boundary between two buildings. Look at how that area is made. Are its edges sharp or soft? Does one colour sit plainly beside another, or do they seem to mingle? A detail that looked ordinary from a distance may contain the most lively passage in the picture.",
      "Step back again, or reduce the image on your screen. Does the detail still matter in the same way? A busy patch may settle into a broad shadow. A tiny highlight may become the point that holds an entire scene together. Moving between the part and the whole can reveal decisions that a quick glance leaves hidden.",
      "You can also follow a single colour through the work. Find every place a warm orange appears, for example, and see whether those marks form an unexpected route. Then look at the spaces between them. This is a useful exercise because it gives your eye a simple task without requiring specialist vocabulary or a correct interpretation.",
      "Now read the title and any available description. Treat that information as another part of the encounter. It may explain a subject, identify a material, or suggest something you had not considered. You do not need to erase your earlier response. Instead, ask how the new information changes what you notice when you return to the image.",
      "Before moving on, write one sentence about something specific. Avoid a general verdict such as beautiful or confusing. Try describing the pale line that separates a boat from the water, or the way a figure almost disappears into a garden. A precise observation gives you something to remember and something to revisit when you meet the painting again.",
    ],
  },
  {
    title: "The Quiet Character of a Ceramic Vessel",
    category: "Material Notes",
    excerpt: "Rims, shoulders, feet, and the space inside: a closer look at the small decisions that give a ceramic vessel its presence.",
    image: urlArtworks[114].image,
    paragraphs: [
      "An empty vessel can be a surprisingly complete subject. Its opening gives you a glimpse of an interior, its curve suggests a way of holding it, and its base decides how firmly it seems to meet the table. Even before flowers or objects enter the picture, there is already a conversation between volume, surface, and the space around it.",
      "Begin with the outline. Imagine tracing it in one continuous movement from the foot to the rim. Does the shape widen quickly, or take its time? Is the neck narrow enough to create a pause? Looking at the silhouette alone can help you understand why two vessels of a similar size feel entirely different beside each other.",
      "Then look at the opening. A broad mouth makes the interior part of the visible composition. A small aperture can make the object feel more enclosed and mysterious. Neither choice is inherently better. What matters is the relationship between the opening and the body, and the particular tension or ease that relationship creates for the viewer.",
      "Surface changes the reading again. A glossy area may catch a clear reflection while a quieter patch seems to absorb attention. Uneven colour can make a curve more apparent or cause it to disappear. On a screen, close views and photographs from several angles are especially helpful because one bright highlight can hide a surprising amount of detail.",
      "Consider the foot as carefully as the shoulder. A low, wide base can make a form appear grounded. A smaller point of contact might lend it an impression of lightness. These are visual responses rather than proof of physical stability. If you are considering an actual object for a particular setting, its dimensions and intended use still need to be confirmed.",
      "Try placing a vessel in an imagined arrangement with one other object. A book creates a horizontal line. A branch introduces a looser gesture. An empty stretch of tabletop offers breathing room. You may discover that the vessel needs very little around it, or that a companion helps make its unusual proportions easier to see.",
      "Finally, resist assigning every ceramic object a practical task. A sculptural vessel may be made primarily to be looked at. Decoration, openings, and a familiar silhouette do not establish whether it can hold water or serve food. Read the maker's stated purpose, then let the work occupy the role it was designed for, including the simple pleasure of being present.",
    ],
  },
  {
    title: "A Landscape Made of Thread",
    category: "Textile Stories",
    excerpt: "How stitches, loose fibres, and changing textures can turn a remembered landscape into something that feels close enough to touch.",
    image: urlArtworks[163].image,
    paragraphs: [
      "A textile landscape does not have to describe every tree to suggest a place. A narrow band of blue can become distant water. A dense patch of green can feel like a wooded hillside. What gives the image its character is often the way those areas are made: small knots, long strands, raised surfaces, and spaces where the ground remains visible.",
      "Look first at the direction of the thread. Stitches travelling across a field can create a different sensation from stitches rising through it. A path might be expressed as a quiet gap rather than a drawn line. Following those directions with your eyes can make the surface feel active, even when the composition describes a very still afternoon.",
      "Distance offers another useful way into the work. From across a room, the whole scene may resolve into a few simple colour areas. Close up, the picture breaks into a collection of individual gestures. There is pleasure in moving between those two readings, especially when a familiar view becomes an unexpectedly abstract arrangement of fibre and light.",
      "Colour does not need to behave literally. A pink hill or a violet shoreline can describe the feeling of a place without copying its appearance. Ask what the colour is doing within this particular composition. Is it separating one area from another, drawing your attention to the horizon, or returning in small echoes that bring the scene together?",
      "The edge matters too. Some textile pictures sit within a firm circular boundary. Others allow threads to extend beyond a rectangle or leave parts of the support exposed. That boundary can make a landscape feel like a remembered fragment, a window, or an object that belongs as much to the room as to the scene it depicts.",
      "When viewing online, look for an image that shows the side or catches the surface in angled light. A front-facing photograph can explain the composition while saying less about its depth. Dimensions are equally useful. Something that resembles a broad field on your phone may be a small, concentrated piece whose detail asks you to lean closer.",
      "One simple looking exercise is to name three textures before naming the place. You might find a rough patch, a soft passage, and a line held under tension. Once you have noticed them, return to the landscape. The scene may now feel less like a view reproduced in thread and more like a place assembled through touch, repetition, and patient attention.",
    ],
  },
  {
    title: "Glass and the Changing Shape of Light",
    category: "Material Notes",
    excerpt: "A glass object can offer several different pictures as its surroundings change. Here are a few ways to notice what happens between colour, reflection, and transparency.",
    image: urlArtworks[123].image,
    paragraphs: [
      "Some objects seem to keep the same expression wherever you encounter them. Glass often invites a more changeable relationship. A pale section may look nearly clear against one background and richly coloured against another. A reflection can interrupt the outline. The room becomes part of what you see, making the encounter feel different each time you return.",
      "Start by separating the object's own outline from the shapes visible within it. Which lines belong to the edge, and which might be reflections or views through the surface? You do not need to solve every ambiguity. Simply noticing that several kinds of line are present can make an apparently simple piece much more interesting to examine.",
      "Next, look for differences in colour across the form. A narrow edge may read more deeply than a broad, pale centre. Overlapping areas might create a different tone. Rather than assuming the object has one fixed colour, describe the range you can actually see in the photographs. That description will be more useful than a single label such as blue.",
      "Background is part of the composition. A busy shelf may make a transparent object difficult to read, while a plain surface can bring its contour into focus. This does not mean every glass work needs an empty room. It means the surrounding lines and colours deserve the same consideration you would give to a frame around a drawing.",
      "Imagine the piece from more than one viewpoint. A front view may emphasise symmetry, while a side view reveals an unexpected fold or opening. If several photographs are available, compare them before deciding which aspect is most compelling. The image that attracts you first may show only one of the object's possible personalities.",
      "For an arrangement at home, begin with observation rather than elaborate lighting. Notice the ordinary light already present at different times of day and the backgrounds visible from your usual seat. Follow any stated display and care guidance for the actual work. The aim is a setting that lets the piece be understood without turning the surrounding space into a performance.",
      "A useful final question is what remains when the reflections quieten. Perhaps it is the weight of a curve, the meeting of two colours, or the pause beneath an opening. Glass can be immediately dazzling, but its quieter structure is often what makes you want to keep looking after the first bright impression has passed.",
    ],
  },
  {
    title: "Following the Grain in Contemporary Woodwork",
    category: "Craft & Process",
    excerpt: "Wood grain can become a line, a rhythm, or a small landscape. Looking closely reveals how a maker's chosen form meets the material's visible character.",
    image: urlArtworks[64].image,
    paragraphs: [
      "In a wooden object, there are often two drawings to notice. One is the silhouette chosen by the maker. The other is the pattern visible in the material itself. Sometimes the two seem to travel together, carrying your eye around a bowl or through a curve. Sometimes they pull in different directions, giving a restrained form an unexpected liveliness.",
      "Begin with a broad view. Is the object primarily rounded, upright, open, or closed? Then choose one visible line in the grain and follow it as far as you can. It may disappear around an edge or return elsewhere on the surface. This simple exercise encourages you to see the object as a continuous volume rather than a flat image.",
      "Notice where the maker has allowed a pattern to become prominent. A sweeping curve might echo the outline of a vessel. A dense cluster of marks may draw attention to one end of a sculptural form. These observations describe what is visible. They do not require guessing the exact species of wood, the age of the material, or the tools used to shape it.",
      "The treatment of an edge can change the entire mood. A thin rim may feel precise and light, while a fuller one gives an impression of generosity. A sharply defined corner can interrupt the movement of the grain. Compare the outer contour with any interior opening and see whether those two lines seem to answer each other.",
      "Small objects are particularly rewarding to study at more than one scale. A turned form may look almost architectural in a close photograph, then become intimate when you read its dimensions. Keep both experiences in mind. The enlarged image helps reveal detail, while a measured sketch beside a familiar object helps you imagine its actual presence in a room.",
      "When assembling a group, resist the urge to match every tone exactly. You might choose objects connected by a repeated curve, or let a quiet form sit beside one with a more active surface. Leave enough space to see the differences. A collection becomes more readable when each object has room to complete its own outline.",
      "Material can carry associations of landscape, furniture, tools, and everyday touch. Let those associations enrich the encounter without making them into unsupported claims about a particular work. Read the supplied material and finish information, ask about anything that matters to your use, and return to the visible meeting of grain and form that first caught your attention.",
    ],
  },
  {
    title: "The Space Around a Sculpture",
    category: "Looking at Art",
    excerpt: "Sometimes the most revealing part of a sculpture is the opening beside a curve or the gap beneath a gesture. Looking at empty space offers another way in.",
    image: urlArtworks[39].image,
    paragraphs: [
      "A sculpture occupies space, but it also gives shape to the space around it. Think of an arm reaching away from a body, a loop returning towards its beginning, or two forms leaning close without meeting. The gaps are part of the experience. They can make a solid object seem light, a quiet gesture seem tense, or a small work feel unexpectedly expansive.",
      "Try looking at an opening as though it were the main subject. Trace the patch of background visible through it. Does that shape narrow towards one end? Does it echo another part of the sculpture? Reversing your attention in this way can reveal relationships that are harder to notice when you focus only on the material surface.",
      "Now imagine a small change in viewpoint. A gap might close, two separate lines might overlap, or a balanced arrangement might become deliberately uneven. Online, photographs taken from different sides can help you follow these changes. Be cautious about treating one striking image as the complete explanation of an object intended to be seen in the round.",
      "The base offers another clue. Sometimes it creates a clear boundary between the work and its surroundings. Sometimes the form seems to rise directly from the surface beneath it. Notice how that meeting changes your sense of weight and movement. A visual impression of balance can be compelling even when the physical construction remains outside the photograph.",
      "Scale is equally important. An opening that feels dramatic in a close view may be small enough to sit on a shelf. A work that appears modest against a plain background may need substantial space. Read the full dimensions, including depth, and make a simple outline on paper before imagining where it might belong.",
      "When considering a setting, think about the routes your eyes already take through the room. A sculpture may reward a passing glance from several directions, or ask for a quieter place where its silhouette can be read clearly. Any real installation should follow the work's requirements and appropriate mounting guidance. Visual spaciousness alone does not establish a safe arrangement.",
      "Before leaving the piece, describe one relationship rather than one object. You might notice the distance between two forms, the curve of an enclosed opening, or a gesture that almost touches the ground. Those relationships often carry the sculpture's particular character. They also remind us that empty space is something a work can actively compose.",
    ],
  },
  {
    title: "Building a Colour Story in Digital Art",
    category: "Digital Practice",
    excerpt: "A limited palette can make an imagined world feel coherent. Explore how a dominant colour, a quiet companion, and a small accent can guide the eye.",
    image: urlArtworks[27].image,
    paragraphs: [
      "An imagined world can contain almost anything, yet a convincing colour story often begins with a few clear choices. A scene might be mostly blue, with a soft neutral holding the quieter areas and one warm accent drawing attention to a figure. The interest comes from the relationship between those choices, rather than from the number of colours available.",
      "Start by describing the largest colour area. Is it a dark field surrounding a bright centre, a pale sky above a crowded foreground, or a wash that reaches almost everywhere? This dominant area sets an expectation. Smaller colours can support it, interrupt it, or make it feel more intense by appearing only where the artist wants your eye to linger.",
      "Look next at the accent. An orange light in a cool setting can feel much larger than its actual area. Follow its echoes through the picture. Perhaps it reappears in a reflection or on the edge of an object. Those small repetitions can connect separate parts of a scene and keep a strong focal point from feeling detached from everything around it.",
      "Brightness creates another layer of organisation. Two areas may belong to different colour families while feeling similar in lightness. A nearly dark silhouette might be easy to miss until it crosses a pale background. Without reducing the work to a formula, ask whether changes in brightness are helping you understand distance, emphasis, or the direction of an imagined light source.",
      "For a small creative exercise, choose a familiar subject and invent three different palettes for it. A doorway could become welcoming, uneasy, or dreamlike without changing its outline. Write down what each version emphasises. This encourages a practical conversation between colour and intention instead of an endless search for a palette that looks attractive on its own.",
      "When viewing digital work online, remember that you are encountering an image through your own display. Screens and room conditions can change the experience. If a physical print or downloadable file is actually offered, read its stated specifications separately. A vivid preview does not by itself describe a print surface, a delivered file, or the permissions attached to it.",
      "Return finally to the scene as a whole. Can you still follow its colour story without analysing every choice? The most satisfying arrangements often feel direct even when their construction is complex. You may remember a blue hush, a warm window, or a small bright figure long after the details fade, because the palette gave those details a shared atmosphere.",
    ],
  },
  {
    title: "A Walk with a Camera and One Small Rule",
    category: "Photography",
    excerpt: "Choose one subject for a short photo walk: doorways, reflections, shadows, or a single colour. A modest constraint can make an ordinary route feel newly visible.",
    image: galleryPhotographs[27].image,
    paragraphs: [
      "A familiar walk can become difficult to photograph precisely because it is familiar. You know where the shops begin, which corner catches the sun, and how long it takes to reach the next crossing. Your attention moves ahead of your feet. A small photographic rule can bring it back to the pavement, asking you to notice what is actually in front of you.",
      "Choose one thing before you leave. It could be a repeated shape, a particular colour, reflections in glass, or the meeting of light and shadow. Keep the rule simple enough to remember without checking a note. The point is to give yourself a starting place, not to turn the walk into a test you can fail.",
      "When something catches your eye, pause before taking the picture. Look at the edges of the frame. Is there a bright sign pulling attention away from the subject? Would a small change in position simplify the background? Sometimes the most useful decision is to leave a little more space around a shape, or to wait until a distracting overlap has passed.",
      "Make two or three versions of the same idea. One might include the surroundings, another might concentrate on a detail, and a third might place the subject near the edge. Comparing them later will tell you more about your preferences than collecting dozens of almost identical frames. Stay attentive to your surroundings and respect people's privacy while you work.",
      "You do not need an extraordinary location. A painted wall, a row of chairs, or rain gathered beside a kerb can provide enough material for a short sequence. The constraint helps you recognise connections. A colour found in a doorway may return in a bicycle or a discarded wrapper, giving separate photographs a quiet conversation of their own.",
      "After the walk, choose a small set rather than keeping every image equally prominent. Look for photographs that contribute something different. One can establish a place, another can offer a closer observation, and a final image can leave a little uncertainty. The sequence may feel more complete with five distinct pictures than with twenty versions of the strongest one.",
      "Write a few words about what surprised you. Perhaps your chosen colour appeared mostly in the shade, or reflections kept breaking your compositions into unexpected shapes. Next time, keep the same route and change the rule. The value of the exercise is not a single perfect photograph. It is a repeatable way to practise attention in a place you thought you already knew.",
    ],
  },
  {
    title: "Your First Art Wall Starts with Attention",
    category: "Collecting Notes",
    excerpt: "Before choosing a work, spend time with what you return to. A personal collection can begin with curiosity, a measured space, and a few clear questions.",
    image: urlArtworks[4].image,
    paragraphs: [
      "It is easy to imagine a first art wall as a finished photograph: the right frame, the right room, everything already in place. A more useful beginning is less polished. Notice which images you return to over several days. The work that stays interesting after the first burst of excitement can tell you more about your taste than a room assembled around a passing mood.",
      "Keep a short looking list. Save a few works and write one specific reason beside each. You might be drawn to an unusual patch of colour, an unresolved gesture, or a surface you want to examine more closely. Over time, patterns may appear. You may discover that your interest crosses categories while returning to the same kind of rhythm or atmosphere.",
      "Next, measure the place you have in mind. Write down the available width and height, then note the furniture and everyday objects around it. A paper outline can help you imagine a work's scale without relying on an enlarged screen image. Include any frame dimensions supplied in the listing rather than assuming that the pictured image represents the full outer size.",
      "Read the artwork information with the same attention you give to the picture. What is the medium? Is the work an original, an edition, or a digital item? What dimensions and condition details are stated? If an important fact is missing, keep it as an open question. Enthusiasm is easier to sustain when it is accompanied by a clear understanding of what is being offered.",
      "Separate the artwork from the presentation around it. A styled room photograph may help suggest a mood, but it should not be treated as proof of scale or included furnishings. Look for direct images of the work itself and compare the stated measurements. Ask for clarification about the frame or display accessories if their inclusion matters to your choice.",
      "Leave room for your taste to develop. A first work does not need to explain everything you will ever like. It can mark one particular interest at one particular time. You may later place it beside something very different and find a connection you could not have planned. That possibility is part of the pleasure of collecting gradually.",
      "A final useful exercise is to explain your choice without mentioning how it will impress anyone else. Describe what you want to keep seeing. That answer might be a colour that changes your mood, a question you cannot settle, or a small detail that continues to surprise you. A personal art wall begins to feel convincing when it reflects sustained attention rather than a borrowed idea of taste.",
    ],
  },
  {
    title: "Making Room for Art in a Small Home",
    category: "Living with Art",
    excerpt: "A small room does not need to become a crowded one. Think about sightlines, quiet surfaces, and the everyday places where an artwork can be enjoyed.",
    image: urlArtworks[65].image,
    paragraphs: [
      "In a small home, every object shares space with everyday life. A picture may sit above the place where bags are dropped, a vessel may appear beside the books you actually read, and a textile may be visible from both the table and the bed. Art becomes part of these ordinary arrangements rather than occupying a separate room reserved for contemplation.",
      "Begin with the places you look towards most often. The view from your usual chair may matter more than the view from the doorway. Notice which surfaces already feel busy and which offer a little visual rest. An artwork does not need to fill the largest available gap if a smaller, quieter position would let you enjoy it more frequently.",
      "Think in relationships rather than isolated objects. A tall form beside a low stack of books can create a useful change in rhythm. A small picture might become more legible when the surrounding wall is left clear. These are arrangements to explore on paper or with existing objects before making any permanent decisions about a particular work.",
      "Scale deserves a practical check. Write down the actual dimensions and compare them with something familiar in the room. Include depth for objects that project from a shelf or surface. A photograph can make an object feel substantial while hiding the space it needs around it. Measurement gives your imagination a dependable starting point.",
      "Try editing before adding. Move one decorative object away and see whether another becomes easier to notice. You may find that a room needs a clearer arrangement rather than more things. This approach can be particularly helpful when several small pieces compete for attention but none has enough space to establish its own outline.",
      "Consider the work's needs as well as the room's appearance. Read any display guidance and avoid assuming that a convenient location is suitable for every material. Keep access, everyday movement, and stable support in mind. Where mounting or specialist care is involved, use appropriate advice for the actual object rather than relying on a styled photograph as an installation guide.",
      "Allow the arrangement to remain changeable. A small home often serves several purposes through the day, and the way you encounter a work may change with it. You might enjoy a different grouping for a few weeks and then return to a single piece. Making room for art can be an ongoing habit of noticing, adjusting, and giving the things you value enough attention.",
    ],
  },
  {
    title: "The Sketchbook Before the Finished Work",
    category: "Studio Practice",
    excerpt: "Loose marks, repeated shapes, colour notes, and crossed-out ideas: a sketchbook can hold the questions that a finished work no longer shows.",
    image: urlArtworks[5].image,
    paragraphs: [
      "A finished work can look inevitable, as though its shapes always belonged exactly where they ended up. A sketchbook suggests a less direct journey. It can contain a figure tried three ways, a colour that never reaches the final surface, or a note about something glimpsed on a bus. The unfinished page gives uncertainty somewhere useful to live.",
      "Imagine beginning a page with one ordinary object. Draw its outline quickly, then turn the page and draw only the shadow. On a third attempt, look for the spaces around it. These are different questions about the same subject. The value lies in finding which question opens a possibility, rather than deciding which drawing deserves to be called the best.",
      "Written notes can sit beside visual ones. A phrase such as too crowded, lighter near the edge, or try this upside down can preserve a thought that a drawing alone would lose. The note does not need to sound like an artist statement. It only needs to be clear enough to help you recognise the idea when you return to it later.",
      "Repetition can be more revealing than constant novelty. Fill a page with variations on a curve, a doorway, or a small cluster of leaves. Let one feature change each time. You may notice a rhythm you would not have found through a single careful study. A modest motif can become a useful starting point precisely because it leaves room for experimentation.",
      "Colour pages offer another kind of record. Place a few colours together and describe their relationship in plain language. One might feel too loud beside another, or a quiet grey might make a small warm patch feel unexpectedly vivid. These observations can remain specific to the page. You do not have to turn them into universal rules before they become useful.",
      "When revisiting old pages, look for unresolved questions as well as successful images. A composition you abandoned may contain one detail worth carrying forward. Cropping, rotating, or redrawing a small section can help you separate that detail from the rest. Revisiting is an active part of making, not merely a way of judging what your earlier self could do.",
      "For viewers, thinking about this kind of working page can soften the demand to understand a finished work immediately. An image may have grown through attempts, interruptions, and changes of mind that remain invisible. You cannot reconstruct a maker's process without evidence, but you can leave space for the possibility that an assured surface began with a much more open question.",
    ],
  },
  {
    title: "How a Collection Becomes a Conversation",
    category: "Curatorial Notes",
    excerpt: "A group of artworks can do more than repeat a theme. Sequence, contrast, and a little breathing room can create connections that emerge only when works are seen together.",
    image: urlArtworks[170].image,
    paragraphs: [
      "A collection often begins with a simple connection. Several works share a colour, a material, or an interest in landscape. That connection helps establish a starting point, but it does not have to explain every choice. The most engaging groups also contain differences that keep the eye moving and give each work a reason to be there.",
      "Try beginning with three works rather than a large selection. Choose one that establishes the main idea, another that approaches it differently, and a third that introduces a question. A quiet landscape could sit beside a more abstract response to the same colours. The third work might change the scale or texture enough to make you reconsider the first two.",
      "Sequence affects the experience. The first image creates an expectation, while the next can fulfil or interrupt it. A strong contrast may feel exciting at the beginning and exhausting when repeated throughout a group. A quieter work can offer a pause. Looking at the order as a whole helps distinguish an intentional rhythm from a series of individually attractive choices.",
      "Write a short reason for each inclusion. Be specific about what the work contributes. If two pieces appear to perform exactly the same role, ask whether both are needed or whether their small differences are the real subject. This exercise helps a collection become an argument you can examine rather than a folder that keeps growing without direction.",
      "Titles and descriptions should help a viewer enter the group without closing down its possibilities. A useful introduction can point towards a recurring line, a shared material, or a changing idea of place. It does not need to claim that every work means the same thing. Leave enough openness for someone else to find a connection you had not noticed.",
      "For a digital collection, consider the cover separately from the entire sequence. It should offer an honest introduction to the works within, while remaining clear at a small size. Once someone opens the collection, the order and descriptions can provide more nuance. A striking cover is an invitation, and the selection itself needs to reward the attention that invitation brings.",
      "Return to the group after a little time away. Remove a work, reverse two positions, or imagine a different opening image. Notice what changes and what remains. A collection becomes a conversation when its parts can answer, challenge, and illuminate one another. The curator's role is to make that encounter possible while allowing the individual works to keep their own voices.",
    ],
  },
];

export const demoJournalStories = articles.map((article, index) => ({
  id: demoId(5000000 + index),
  title: article.title,
  excerpt: article.excerpt,
  category: article.category,
  image: article.image,
  content: [...article.paragraphs, "Editorial note: This is original mock journal content for the Artistically demo. The image is an illustrative reference, not documentation of an interview, studio visit, or featured maker."].join("\n\n"),
  // Fixed sample publication dates keep ordering stable and avoid future dates.
  createdAt: new Date(`2026-10-${String(24 - index).padStart(2, "0")}T09:00:00.000Z`),
  published: true,
}));

export async function seedJournal(prisma: PrismaClient) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development journal seed must not run in production");
  }
  await prisma.$transaction(async (tx) => {
    for (const story of demoJournalStories) {
      await tx.story.upsert({ where: { id: story.id }, create: story, update: story });
    }
  }, { timeout: 30000 });
}
