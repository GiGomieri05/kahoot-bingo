import { useEffect, useState } from 'react';
import { ref, set, remove, onValue, push } from 'firebase/database';
import { db } from '../firebase';
import type { Theme, ThemeItem } from '../types';

const DEFAULT_THEMES: Omit<Theme, 'id'>[] = [
  {
    name: 'Space English',
    description: 'Vocabulary about outer space',
    createdAt: Date.now(),
    items: [
      { word: 'Moon', clue: "Earth's natural satellite" },
      { word: 'Star', clue: 'A ball of burning gas in space' },
      { word: 'Sun', clue: 'The star at the center of our solar system' },
      { word: 'Earth', clue: 'Our home planet' },
      { word: 'Planet', clue: 'A large body orbiting a star' },
      { word: 'Rocket', clue: 'Vehicle used to travel to space' },
      { word: 'Astronaut', clue: 'A person who travels to space' },
      { word: 'Space', clue: 'The vast expanse beyond Earth' },
      { word: 'Orbit', clue: 'Circular path around a celestial body' },
      { word: 'Comet', clue: 'Icy body with a glowing tail' },
      { word: 'Galaxy', clue: 'A system of billions of stars' },
      { word: 'Gravity', clue: 'Force that attracts objects toward each other' },
      { word: 'Crater', clue: 'Bowl-shaped hole on a planet or moon surface' },
      { word: 'Telescope', clue: 'Instrument for observing distant objects' },
      { word: 'Satellite', clue: 'Object orbiting a planet' },
      { word: 'Atmosphere', clue: 'Layer of gases surrounding a planet' },
    ],
  },
  {
    name: 'Colors & Animals',
    description: 'Animals and colors in English',
    createdAt: Date.now(),
    items: [
      { word: 'Red', clue: 'Color of blood and fire' },
      { word: 'Blue', clue: 'Color of the sky and sea' },
      { word: 'Green', clue: 'Color of grass and leaves' },
      { word: 'Yellow', clue: 'Color of the sun and bananas' },
      { word: 'Purple', clue: 'Color of lavender flowers' },
      { word: 'Orange', clue: 'Color of oranges and sunsets' },
      { word: 'Lion', clue: 'King of the jungle' },
      { word: 'Elephant', clue: 'Largest land animal with a trunk' },
      { word: 'Tiger', clue: 'Striped big cat from Asia' },
      { word: 'Penguin', clue: 'Black and white bird that cannot fly' },
      { word: 'Dolphin', clue: 'Intelligent marine mammal' },
      { word: 'Eagle', clue: 'Large bird of prey with sharp talons' },
      { word: 'Frog', clue: 'Amphibian that jumps and lives near water' },
      { word: 'Giraffe', clue: 'Tallest animal with a very long neck' },
      { word: 'Parrot', clue: 'Colorful bird that can mimic speech' },
      { word: 'Shark', clue: 'Fierce ocean predator with sharp teeth' },
    ],
  },
  {
    name: 'Food & Drinks',
    description: 'Food and beverages in English',
    createdAt: Date.now(),
    items: [
      { word: 'Pizza', clue: 'Italian dish with tomato sauce and cheese' },
      { word: 'Burger', clue: 'Sandwich with a meat patty' },
      { word: 'Sushi', clue: 'Japanese dish with rice and raw fish' },
      { word: 'Pasta', clue: 'Italian noodle dish' },
      { word: 'Salad', clue: 'Dish made with mixed vegetables' },
      { word: 'Soup', clue: 'Liquid dish served hot' },
      { word: 'Coffee', clue: 'Hot drink made from roasted beans' },
      { word: 'Tea', clue: 'Hot drink made by steeping leaves' },
      { word: 'Juice', clue: 'Drink made from squeezed fruits' },
      { word: 'Cake', clue: 'Sweet baked dessert often for celebrations' },
      { word: 'Bread', clue: 'Staple food made from flour and baked' },
      { word: 'Cheese', clue: 'Dairy product made from curdled milk' },
      { word: 'Chocolate', clue: 'Sweet treat made from cacao' },
      { word: 'Apple', clue: 'Round fruit, red or green' },
      { word: 'Rice', clue: 'Grain staple food of Asia' },
      { word: 'Egg', clue: 'Food laid by birds and hens' },
    ],
  },
];

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const themesRef = ref(db, 'themes');
    const unsub = onValue(themesRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list: Theme[] = Object.entries(data).map(([id, val]) => ({
          id,
          ...(val as Omit<Theme, 'id'>),
        }));
        setThemes(list);
      } else {
        setThemes([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function createTheme(theme: Omit<Theme, 'id'>): Promise<string> {
    const newRef = push(ref(db, 'themes'));
    await set(newRef, theme);
    return newRef.key!;
  }

  async function deleteTheme(id: string): Promise<void> {
    await remove(ref(db, `themes/${id}`));
  }

  async function seedDefaultThemes(): Promise<void> {
    for (const theme of DEFAULT_THEMES) {
      const newRef = push(ref(db, 'themes'));
      await set(newRef, theme);
    }
  }

  async function updateTheme(id: string, items: ThemeItem[], name: string, description: string): Promise<void> {
    await set(ref(db, `themes/${id}`), { name, description, items, createdAt: Date.now() });
  }

  return { themes, loading, createTheme, deleteTheme, seedDefaultThemes, updateTheme };
}
