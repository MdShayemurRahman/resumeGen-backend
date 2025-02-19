import User from '../models/user.model.js';

export const verifyUserData = async (userId) => {
  const user = await User.findById(userId);

  const verificationResult = {
    timestamp: new Date(),
    userId: userId,
    hasName: !!user.name,
    nameValue: user.name,
    email: user.email,
  };

  console.log('User Verification Check:', verificationResult);

  if (!user.name) {
    console.error('User found without name:', verificationResult);
  }

  return verificationResult;
};

// Add this to your error middleware
export const monitorUserUpdates = async (req, res, next) => {
  const originalSend = res.send;
  res.send = async function (data) {
    try {
      if (req.user && req.user.id) {
        await verifyUserData(req.user.id);
      }
    } catch (error) {
      console.error('Error in user monitoring:', error);
    }
    originalSend.apply(res, arguments);
  };
  next();
};
