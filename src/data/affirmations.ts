// 100 original affirmations, grouped by theme.
// To add or edit: keep each entry short (ideally under ~110 characters) so it reads well on a phone.

export type Affirmation = { id: number; text: string; theme: Theme };
export type Theme =
  | "self-worth"
  | "calm"
  | "confidence"
  | "gratitude"
  | "growth"
  | "body"
  | "love"
  | "abundance"
  | "boundaries"
  | "joy";

const raw: Record<Theme, string[]> = {
  "self-worth": [
    "I am enough, exactly as I am today.",
    "My worth is not measured by how much I do.",
    "I deserve the same kindness I give to others.",
    "I am allowed to take up space.",
    "Who I am is worth celebrating.",
    "I speak to myself the way I would speak to someone I love.",
    "I no longer wait for permission to value myself.",
    "My voice matters, and I let it be heard.",
    "I honor the woman I am becoming.",
    "I am worthy of rest, joy and good things.",
  ],
  calm: [
    "I breathe in calm and breathe out what I cannot control.",
    "Peace begins the moment I choose it.",
    "I move through this day gently, one step at a time.",
    "I release the need to have everything figured out.",
    "My mind is quiet and my heart is steady.",
    "I let go of yesterday and welcome this fresh morning.",
    "I am safe in this moment.",
    "Slowing down is not falling behind.",
    "I choose ease over urgency today.",
    "Whatever comes today, I can meet it softly.",
  ],
  confidence: [
    "I trust myself to handle whatever today brings.",
    "I walk into every room as my true self.",
    "I am capable of far more than I imagine.",
    "My ideas have value and I share them with confidence.",
    "I am brave enough to begin before I feel ready.",
    "I believe in the path I am creating.",
    "I carry myself with quiet strength.",
    "Every challenge today is proof of what I can do.",
    "I make decisions from clarity, not fear.",
    "I am proud of how far I have come.",
  ],
  gratitude: [
    "I notice the small beautiful things around me.",
    "Today I choose to see what is going right.",
    "I am grateful for this body, this breath, this day.",
    "My life is full of quiet blessings.",
    "I appreciate the people who make my world warmer.",
    "Gratitude turns what I have into enough.",
    "I say thank you to this new morning.",
    "I find something to appreciate in every hour.",
    "I am thankful for the lessons that shaped me.",
    "There is so much good here, and I let myself feel it.",
  ],
  growth: [
    "I am growing, even on the days I cannot see it.",
    "Every small step forward still counts.",
    "I allow myself to learn without judging myself.",
    "Mistakes are how I become wiser.",
    "I welcome change as a chance to bloom.",
    "I am becoming the best version of myself, gently.",
    "Progress matters more than perfection.",
    "I let go of who I was expected to be.",
    "Each day I choose habits that support my future self.",
    "I trust the timing of my life.",
  ],
  body: [
    "I treat my body with patience and care.",
    "My body is my home, and I make it a kind place to live.",
    "I listen to what my body needs today.",
    "I am grateful for everything my body does for me.",
    "I nourish myself because I deserve to feel good.",
    "I move my body with joy, not punishment.",
    "I am beautiful in ways a mirror cannot show.",
    "Rest is a gift I give my body without guilt.",
    "I feel at home in my own skin.",
    "I glow from the inside out.",
  ],
  love: [
    "I attract relationships that feel safe and warm.",
    "I give love freely and receive it openly.",
    "I am surrounded by people who see and value me.",
    "My heart is open, and it is also protected.",
    "I am a loving presence in the lives around me.",
    "I forgive myself and make room for new beginnings.",
    "I deserve love that feels calm, not confusing.",
    "I am my own lifelong best friend.",
    "Love flows to me easily and naturally.",
    "I bring softness to everyone I meet today.",
  ],
  abundance: [
    "Good things are finding their way to me.",
    "I am open to opportunities I have not imagined yet.",
    "I welcome abundance in every area of my life.",
    "There is enough for me, and there is enough for everyone.",
    "My work creates value, and value returns to me.",
    "I make choices that support a rich and stable life.",
    "I am worthy of financial peace.",
    "Every day brings new chances to grow my dreams.",
    "I plant seeds today that will bloom tomorrow.",
    "My future is bright, and I am building it now.",
  ],
  boundaries: [
    "Saying no to others can mean saying yes to myself.",
    "I protect my energy without apologizing.",
    "I am allowed to change my mind.",
    "I release what no longer serves me.",
    "My needs are just as important as anyone else's.",
    "I choose where my time and energy go.",
    "I do not have to carry what is not mine.",
    "I can be kind and still be clear.",
    "I let go of people-pleasing and choose authenticity.",
    "My peace is a priority, not a luxury.",
  ],
  joy: [
    "I let myself laugh freely today.",
    "Joy is my natural state, and I return to it easily.",
    "I choose to find delight in simple moments.",
    "Today holds something lovely waiting for me.",
    "I give myself permission to have fun.",
    "My light makes the world a little brighter.",
    "I welcome happiness without waiting for a reason.",
    "I create moments that make my heart feel full.",
    "I am open to being pleasantly surprised today.",
    "I am radiant, hopeful and ready for this day.",
  ],
};

export const affirmations: Affirmation[] = (Object.keys(raw) as Theme[]).flatMap(
  (theme, t) => raw[theme].map((text, i) => ({ id: t * 10 + i + 1, text, theme })),
);
