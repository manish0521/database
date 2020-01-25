const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function createAdminToken(user) {
  payload = {
    email: user.email,
    id: user._id
  };
  let jwtToken = await jwt.sign(payload, process.env.ADMIN_SECRET_KEY, {
    expiresIn: 3600
  });
  return jwtToken;

}

async function createJwtToken(user) {
  let payload;

  if (user.pictureName.length > 1) {
    payload = {
      email: user.email,
      id: user._id,
      pictureName: user.pictureName
    };
  } else {
    payload = {
      email: user.email,
      id: user._id
    };
  }

  let jwtToken = await jwt.sign(payload, process.env.USER_SECRET_KEY, {
    expiresIn: 3600
  });
  return jwtToken;
}

async function comparePassword(incomingPassword, userPassword) {
  try {
    let comparedPassword = await bcrypt.compare(incomingPassword, userPassword);
    if (comparedPassword) {
      return comparedPassword;
    } else {
      throw 409;
    }
  } catch (error) {
    return error;
  }
}

async function createLinkedInUserJwtToken(user, foundUser) {
  let payload;
  if (foundUser) {
    payload = {
      email: user.email,
      linkedinID: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      photos: user.pictureName,
      id: user._id,
      linkedInStrategy: user.linkedInStrategy
    };

    let jwtToken = await jwt.sign(payload, process.env.USER_SECRET_KEY, {
      expiresIn: 3600
    });
    return jwtToken;
  } else {
    payload = {
      email: user.email,
      linkedinID: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      photos: user.pictureName,
      id: user._id,
      linkedInStrategy: user.linkedInStrategy
    };

    let jwtToken = await jwt.sign(payload, process.env.USER_SECRET_KEY, {
      expiresIn: 3600
    });
    return jwtToken;
  }
}

async function createJWTResetPassword(user) {
  let jwtToken = await jwt.sign(
    {
      email: user.email
    },
    process.env.RESET_PASSWORD_SECRET_KEY,
    {
      expiresIn: 3600
    }
  );
  return jwtToken;
}

module.exports = {
  createJwtToken,
  comparePassword,
  createLinkedInUserJwtToken,
  createJWTResetPassword,
  createAdminToken
};
