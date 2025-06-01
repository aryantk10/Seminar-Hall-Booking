const { MongoClient } = require('mongodb');

// MongoDB connection string (replace with your actual connection string)
const MONGODB_URI = 'mongodb+srv://aryantk1020:Timber2014@cluster0.qlhqy.mongodb.net/seminar-hall-booking?retryWrites=true&w=majority';

async function updateUserToAdmin() {
  console.log('🔧 Updating User Role to Admin...\n');

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('seminar-hall-booking');
    const usersCollection = db.collection('users');

    // Find your user
    const user = await usersCollection.findOne({ email: 'aryantk1020@outlook.com' });
    
    if (!user) {
      console.log('❌ User not found with email: aryantk1020@outlook.com');
      return;
    }

    console.log('📋 Current user details:');
    console.log(`👤 Name: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Current Role: ${user.role}`);

    // Update user role to admin
    const updateResult = await usersCollection.updateOne(
      { email: 'aryantk1020@outlook.com' },
      { $set: { role: 'admin' } }
    );

    if (updateResult.modifiedCount === 1) {
      console.log('\n✅ SUCCESS: User role updated to admin!');
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ email: 'aryantk1020@outlook.com' });
      console.log('📋 Updated user details:');
      console.log(`👤 Name: ${updatedUser.name}`);
      console.log(`📧 Email: ${updatedUser.email}`);
      console.log(`🔑 New Role: ${updatedUser.role}`);
      
      console.log('\n🎉 DONE! Now you can:');
      console.log('1. Logout from your current session');
      console.log('2. Login again with aryantk1020@outlook.com');
      console.log('3. You will now see all admin features!');
      console.log('4. Navigate to /dashboard/admin/halls to manage halls');
      
    } else {
      console.log('❌ Failed to update user role');
    }

  } catch (error) {
    console.error('💥 Error updating user role:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

updateUserToAdmin();
