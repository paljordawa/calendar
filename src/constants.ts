export const STICKERS = [
  '🕉️', '🧘', '🔥', '💧', '☀️', '🌙', '🏔️', '🏠', 
  '🎨', '💼', '💊', '✈️', '🍲', '💰', '🌳', '🕯️',
  '⚡', '🌈', '☸️', '🐚', '📿', '🥣'
];

export const HOROSCOPE_RULES: Record<string, { title: string, text: string, advice: string }> = {
  'life': {
    title: "Celestial Nourishment",
    text: "The current elements act as a 'Mother' to your spirit, providing profound support and energy. Your vital essence is naturally replenished by the day's alignment.",
    advice: "An ideal time for starting new ventures, seeking blessings, or beginning a health retreat."
  },
  'son': {
    title: "Pathway of Prosperity",
    text: "Your internal energy supports the day's flow, creating a 'Son' relationship of outward growth. Efforts spent on others or business will yield merit.",
    advice: "Perform acts of generosity (Dana) or engage in commercial activities. Success follows active effort today."
  },
  'same': {
    title: "Balanced Equanimity",
    text: "The day shares your own elemental vibration. There is a resonance of stability and quiet power. You are in your natural home.",
    advice: "Focus on internal stabilization. Recite long-life mantras or engage in grounding physical practice."
  },
  'enemy': {
    title: "Vigilant Guard",
    text: "The day's energy poses a challenge to your birth element. Obstacles may arise in communication or coordination. Your spirit is under mild tension.",
    advice: "Avoid starting major projects. Postpone surgery or risky travel. Best spent in recitation of protective sutras or quiet study."
  },
  'neutral': {
    title: "Quiet Alignment",
    text: "A neutral interaction between the celestial winds and your inner spirit. Neither significantly supportive nor challenging.",
    advice: "A good day for routine tasks and refining your daily discipline (Dharma). Maintain the middle path."
  }
};

export const ANIMAL_CHARACTERISTICS: Record<string, string> = {
  "Rat": "Resourceful, charming, and highly intelligent. Excellent at finding opportunities where others see obstacles.",
  "Ox": "Strong, reliable, and deeply determined. Possesses the endurance to see complex projects through to completion.",
  "Tiger": "Brave, competitive, and natural-born leaders. Their unpredictable energy drives innovation and bold action.",
  "Rabbit": "Gentle, elegant, and peaceful. Skilled at diplomacy and creating harmony in their surroundings.",
  "Dragon": "Energetic, fearless, and charismatic. A powerful symbol of transformation and spiritual vitality.",
  "Snake": "Wise, mystical, and deeply intuitive. Operates with a graceful intelligence that sees beneath the surface.",
  "Horse": "Independent, enthusiastic, and fast-paced. They thrive on freedom and bring a dynamic momentum to any task.",
  "Sheep": "Compassionate, artistic, and gentle-hearted. Often considered the most creative and empathetic sign.",
  "Monkey": "Clever, innovative, and playful. They are master problem-solvers with a sharp wit and versatile mind.",
  "Bird": "Observant, hardworking, and courageous. They possess a sharp eye for detail and a strong sense of duty.",
  "Dog": "Loyal, honest, and deeply responsible. Their unwavering integrity makes them the most trusted companions.",
  "Pig": "Generous, compassionate, and diligent. They approach life with a pure heart and find joy in simple service."
};

export const ANIMAL_ICONS: Record<string, string> = {
  "Rat": "🐭",
  "Ox": "🐂",
  "Tiger": "🐯",
  "Rabbit": "🐰",
  "Dragon": "🐲",
  "Snake": "🐍",
  "Horse": "🐎",
  "Sheep": "🐑",
  "Monkey": "🐒",
  "Bird": "🐔",
  "Dog": "🐕",
  "Pig": "🐖"
};

export const PARKHA_ICONS: Record<string, string> = {
  "Li": "🔥",
  "Khon": "🌍",
  "Dwa": "🔔",
  "Khen": "☁️",
  "Kham": "💧",
  "Gin": "🏔️",
  "Zon": "💨",
  "Zin": "🌳"
};

export const MEWA_ICONS: Record<string, string> = {
  "1-White": "⚪",
  "2-Black": "⚫",
  "3-Blue": "🔵",
  "4-Green": "🟢",
  "5-Yellow": "🟡",
  "6-White": "⚪",
  "7-Red": "🔴",
  "8-White": "⚪",
  "9-Purple": "🟣"
};

export const PARKHA_CHARACTERISTICS: Record<string, string> = {
  "Li": "Fire energy. Auspicious for clarity, illumination, and spiritual insight. Representing the South.",
  "Khon": "Earth energy. Focus on stability, grounding, and traditional foundations. Representing the South-West.",
  "Dwa": "Iron energy. Good for decisive actions, setting boundaries, and technical precision. Representing the West.",
  "Khen": "Sky energy. A time for inspiration, high vision, and connecting with lineage. Representing the North-West.",
  "Kham": "Water energy. Fluidity, cleansing, and deep emotional or intuitive work. Representing the North.",
  "Gin": "Mountain energy. Meditation, stillness, and internal stabilization. Representing the North-East.",
  "Zon": "Wind energy. Communication, gentle movement, and adaptive change. Representing the East.",
  "Zin": "Wood energy. Growth, healing, vital renewal, and nature connection. Representing the South-East."
};

export const MEWA_CHARACTERISTICS: Record<string, string> = {
  "1-White": "Purity and clarity. A day for starting fresh and simple auspicious acts.",
  "2-Black": "Grounding and containment. Best for internal stabilization and boundaries.",
  "3-Blue": "Expansive transformation. Good for communication and wider perspective.",
  "4-Green": "Healing and growth. Vital energy for physical and spiritual recovery.",
  "5-Yellow": "Equanimity and centrality. The power of the mountain and deep focus.",
  "6-White": "Auspicious luck and light. A period of celestial protection.",
  "7-Red": "Dynamic power and activity. Best for energetic work and forward momentum.",
  "8-White": "Refined wisdom and peace. High clarity for meditation and study.",
  "9-Purple": "Royal completion and vision. The peak of the cycle for total awareness."
};
export const TIBETAN_ANIMALS: Record<string, string> = {
  "Rat": "བྱི་བ།",
  "Ox": "གླང་།",
  "Tiger": "སྟག་།",
  "Rabbit": "ཡོས་།",
  "Dragon": "འབྲུག་།",
  "Snake": "སྦྲུལ་།",
  "Horse": "རྟ་།",
  "Sheep": "ལུག་།",
  "Monkey": "སྤྲེལ་།",
  "Bird": "བྱ་།",
  "Dog": "ཁྱི་།",
  "Pig": "ཕག་།"
};

export const TIBETAN_ELEMENTS: Record<string, string> = {
  "Fire": "མེ།",
  "Earth": "ས།",
  "Iron": "ལྕགས།",
  "Water": "ཆུ།",
  "Wood": "ཤིང་།"
};
