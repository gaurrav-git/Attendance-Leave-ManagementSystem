const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/attendance_system');
mongoose.connection.once('open', async () => {
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'archana@jims.edu' },
    { $set: { name: 'Prof. Archana B. Saxena' } }
  );
  console.log('Done! Name updated.');
  process.exit();
});
