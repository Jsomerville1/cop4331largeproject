// checkUserStatus.js

async function checkUserStatus(db) {
    const now = new Date();
    console.log(`[DEBUG] Current Time: ${now.toISOString()}`); // Debug log
  
    try {
      // Fetch all users
      const users = await db.collection('Users').find().toArray();
      console.log(`[DEBUG] Retrieved ${users.length} users from the database.`); // Debug log
  
      for (const user of users) {
        const { lastLogin, CheckInFreq, status, UserId, Username, Email } = user;
  
        // Debugging: Log user details
        console.log(`[DEBUG] Processing UserID: ${UserId}, Username: ${Username}, Status: ${status}`);
  
        // Validate necessary fields
        if (!lastLogin || !CheckInFreq || !status) {
          console.warn(`[WARN] UserID: ${UserId} has incomplete data. Skipping.`);
          continue; // Skip users with incomplete data
        }
  
        // Ensure CheckInFreq is a positive number
        if (typeof CheckInFreq !== 'number' || CheckInFreq <= 0) {
          console.warn(`[WARN] UserID: ${UserId} has invalid CheckInFreq (${CheckInFreq}). Skipping.`);
          continue;
        }
  
        // Calculate next expected login time
        const nextCheckIn = new Date(lastLogin);
        // Corrected: Use setSeconds() and getSeconds()
        nextCheckIn.setSeconds(nextCheckIn.getSeconds() + CheckInFreq);
        console.log(`[DEBUG] UserID: ${UserId} next expected login time: ${nextCheckIn.toUTCString()}`);
  
        // Check if the user has not logged in within the CheckInFreq
        if (nextCheckIn < now && status.toLowerCase() === "active") {
          console.log(`[INFO] UserID: ${UserId} (${Username}) has not logged in since ${lastLogin}. Marking as Inactive.`);
  
          // Update user status to "Inactive"
          const updateResult = await db.collection('Users').updateOne(
            { UserId: UserId },
            { $set: { status: "Inactive" } }
          );
  
          if (updateResult.modifiedCount === 1) {
            console.log(`[SUCCESS] UserID: ${UserId} status updated to "Inactive".`);
          } else {
            console.warn(`[WARN] Failed to update status for UserID: ${UserId}.`);
          }
        } else {
          console.log(`[INFO] UserID: ${UserId} (${Username}) is still active.`);
        }
      }
    } catch (error) {
      console.error(`[ERROR] Error in checkUserStatus: ${error.message}`);
      console.error(error); // Full stack trace for debugging
    }
  }
  
  module.exports = checkUserStatus;
  