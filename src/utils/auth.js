const bcrypt = require('bcrypt');
const { sequelize } = require('../db/connection');

// Advanced password verification with detailed logging
exports.advancedPasswordVerification = async (username, providedPassword) => {
  try {
    // Find user by username (case-insensitive)
    const [user] = await sequelize.query(
      `SELECT user_id, username, password FROM users WHERE LOWER(username) = LOWER($1)`,
      {
        bind: [username],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      console.log('User not found:', username);
      return {
        success: false,
        message: 'User not found',
        details: {
          username,
          usernameLength: username.length,
          usernameChars: [...username].map(char => char.charCodeAt(0))
        }
      };
    }

    // Detailed password verification
    console.log('Stored Hashed Password:', user.password);
    console.log('Provided Password Length:', providedPassword.length);
    console.log('Stored Hash Length:', user.password.length);

    // Try different bcrypt comparison methods
    const comparisonResults = {
      standard: false,
      trimmed: false,
      lowercaseTrimmed: false
    };

    try {
      comparisonResults.standard = await bcrypt.compare(providedPassword, user.password);
    } catch (standardError) {
      console.error('Standard comparison error:', standardError);
    }

    try {
      comparisonResults.trimmed = await bcrypt.compare(
        providedPassword.trim(), 
        user.password
      );
    } catch (trimmedError) {
      console.error('Trimmed comparison error:', trimmedError);
    }

    try {
      comparisonResults.lowercaseTrimmed = await bcrypt.compare(
        providedPassword.trim().toLowerCase(), 
        user.password
      );
    } catch (lowercaseError) {
      console.error('Lowercase trimmed comparison error:', lowercaseError);
    }

    console.log('Comparison Results:', comparisonResults);

    // If no match found
    if (!Object.values(comparisonResults).some(result => result)) {
      return {
        success: false,
        message: 'Password verification failed',
        details: {
          storedHashInfo: {
            length: user.password.length,
            prefix: user.password.slice(0, 10),
            bcryptPrefix: user.password.startsWith('$2b$') || user.password.startsWith('$2y$')
          },
          providedPasswordInfo: {
            length: providedPassword.length,
            containsSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(providedPassword),
            containsNumbers: /\d/.test(providedPassword)
          }
        }
      };
    }

    // Password matches
    return {
      success: true,
      message: 'Password verified successfully',
      userId: user.user_id
    };
  } catch (error) {
    console.error('Advanced password verification error:', error);
    return {
      success: false,
      message: 'Verification process failed',
      error: error.message
    };
  }
};

// Password reset utility with enhanced security
exports.resetUserPassword = async (username, newPassword) => {
  try {
    // Generate a strong salt
    const salt = await bcrypt.genSalt(12); // Increased salt rounds for extra security
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password in the database
    const [result] = await sequelize.query(
      `UPDATE users 
       SET password = $1, 
           updated_at = NOW() 
       WHERE LOWER(username) = LOWER($2) 
       RETURNING user_id`,
      {
        bind: [hashedPassword, username],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    return {
      success: result.length > 0,
      message: result.length > 0 ? 'Password reset successful' : 'User not found',
      details: {
        hashedPasswordLength: hashedPassword.length,
        hashedPasswordPrefix: hashedPassword.slice(0, 10)
      }
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'Password reset failed',
      error: error.message
    };
  }
};

// Utility to generate a temporary password
exports.generateTemporaryPassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};