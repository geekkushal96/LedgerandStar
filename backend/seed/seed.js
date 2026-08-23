// // Creates the first System Administrator account so someone can log in
// // and start using the admin features. Run with: npm run seed
// require('dotenv').config();
// const bcrypt = require('bcryptjs');
// const { sequelize, User } = require('../models');

// const run = async () => {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync();

//     const email = process.env.ADMIN_EMAIL;
//     const existing = await User.findOne({ where: { email } });

//     if (existing) {
//       console.log(`Admin user already exists: ${email}`);
//       process.exit(0);
//     }

//     const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

//     await User.create({
//       name: process.env.ADMIN_NAME,
//       email,
//       password: hashedPassword,
//       address: process.env.ADMIN_ADDRESS,
//       role: 'admin',
//     });

//     console.log(`Admin user created: ${email} / (password from .env)`);
//     process.exit(0);
//   } catch (err) {
//     console.error('Seeding failed:', err);
//     process.exit(1);
//   }
// };

// run();

// Creates the first System Administrator account, plus a set of sample
// users, store owners, stores, and ratings so the app has data to explore
// immediately. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Store, Rating } = require('../models');

const hash = (plain) => bcrypt.hash(plain, 10);

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // ---------- 1. System Administrator ----------
    const adminEmail = process.env.ADMIN_EMAIL;
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME,
        email: adminEmail,
        password: await hash(process.env.ADMIN_PASSWORD),
        address: process.env.ADMIN_ADDRESS,
        role: 'admin',
      });
      console.log(`Admin created: ${adminEmail}`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }

    // ---------- 2. Sample normal users ----------
    const sampleUsers = [
      {
        name: 'Rajesh Kumar Sharma Testing Account',
        email: 'rajesh.sharma@example.com',
        address: '123 MG Road, Pune, Maharashtra',
        password: 'Passw0rd!',
      },
      {
        name: 'Ananya Iyer Consumer Test Account',
        email: 'ananya.iyer@example.com',
        address: '45 Koregaon Park, Pune, Maharashtra',
        password: 'Passw0rd!',
      },
      {
        name: 'Vikram Singh Rathore Shopper Acct',
        email: 'vikram.rathore@example.com',
        address: '78 Camp Area, Pune, Maharashtra',
        password: 'Passw0rd!',
      },
    ];

    const users = [];
    for (const u of sampleUsers) {
      let user = await User.findOne({ where: { email: u.email } });
      if (!user) {
        user = await User.create({ ...u, password: await hash(u.password), role: 'user' });
        console.log(`Normal user created: ${u.email}`);
      }
      users.push(user);
    }

    // ---------- 3. Sample store owners ----------
    const sampleOwners = [
      {
        name: 'Priya Deshmukh Store Owner Acct',
        email: 'priya.deshmukh@example.com',
        address: '7 FC Road, Pune, Maharashtra',
        password: 'Owner@123',
      },
      {
        name: 'Arjun Mehta Retail Owner Account',
        email: 'arjun.mehta@example.com',
        address: '19 Baner Road, Pune, Maharashtra',
        password: 'Owner@123',
      },
    ];

    const owners = [];
    for (const o of sampleOwners) {
      let owner = await User.findOne({ where: { email: o.email } });
      if (!owner) {
        owner = await User.create({ ...o, password: await hash(o.password), role: 'store_owner' });
        console.log(`Store owner created: ${o.email}`);
      }
      owners.push(owner);
    }

    // ---------- 4. Sample stores (linked to owners) ----------
    const sampleStores = [
      {
        name: 'The Coffee Bean And Tea Leaf Cafe',
        email: 'store.coffeebean@example.com',
        address: '7 Koregaon Park, Pune, Maharashtra',
        owner_id: owners[0].id,
      },
      {
        name: 'Fresh Mart Grocery Supermarket',
        email: 'store.freshmart@example.com',
        address: '19 Baner Road, Pune, Maharashtra',
        owner_id: owners[1].id,
      },
      {
        name: 'Bookworm Corner Bookstore Outlet',
        email: 'store.bookworm@example.com',
        address: '32 Aundh Road, Pune, Maharashtra',
        owner_id: null, // no owner linked yet, to test that case too
      },
    ];

    const stores = [];
    for (const s of sampleStores) {
      let store = await Store.findOne({ where: { email: s.email } });
      if (!store) {
        store = await Store.create(s);
        console.log(`Store created: ${s.name}`);
      }
      stores.push(store);
    }

    // ---------- 5. Sample ratings ----------
    const sampleRatings = [
      { user: users[0], store: stores[0], rating: 5 },
      { user: users[1], store: stores[0], rating: 4 },
      { user: users[2], store: stores[0], rating: 4 },
      { user: users[0], store: stores[1], rating: 3 },
      { user: users[1], store: stores[1], rating: 5 },
      { user: users[2], store: stores[2], rating: 2 },
      { user: users[0], store: stores[2], rating: 3 },
    ];

    for (const r of sampleRatings) {
      const [rating, created] = await Rating.findOrCreate({
        where: { user_id: r.user.id, store_id: r.store.id },
        defaults: { rating: r.rating },
      });
      if (created) {
        console.log(`Rating added: ${r.user.email} -> ${r.store.name} (${r.rating})`);
      }
    }

    console.log('\nSeeding complete.');
    console.log(`Admin login:        ${adminEmail} / (ADMIN_PASSWORD from .env)`);
    console.log('Sample user login:  rajesh.sharma@example.com / Passw0rd!');
    console.log('Sample owner login: priya.deshmukh@example.com / Owner@123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

run();