import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const users = [
  {
    name: 'Grace Wanjiru',
    email: 'wanjirugrace678@gmail.com',
    password: 'Millenium@2026!',
    role: 'admin',
  },
  {
    name: 'Rose Kirwa',
    email: 'rosekirwa@millenium.co.ke',
    password: 'Millenium@2026!',
    role: 'hr',
  },
];

async function seedUsers() {
  console.log('Seeding users...');
  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    const { error } = await supabase
      .from('users')
      .upsert({ name: user.name, email: user.email.toLowerCase(), password_hash, role: user.role }, { onConflict: 'email' });
    if (error) {
      console.error(`Failed to seed ${user.email}:`, error.message);
    } else {
      console.log(`✓ Seeded ${user.name} (${user.role})`);
    }
  }
  console.log('Done.');
}

seedUsers();
