require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
console.log('Connection String:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('Database:', mongoose.connection.name);
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:');
  console.error('Error:', err.message);
  console.error('Code:', err.code);
  console.error('\nPossible causes:');
  console.error('1. Network/Firewall blocking MongoDB Atlas');
  console.error('2. IP address not whitelisted in MongoDB Atlas');
  console.error('3. Incorrect credentials');
  console.error('4. DNS resolution issues');
  process.exit(1);
});
