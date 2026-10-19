import jwt from 'jsonwebtoken';

export function publicUser(user) {
  return {
    id: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, role: user.role,
  };
}

export function signToken(user) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: 'HS256', subject: user.id, expiresIn: '1h',
    issuer: 'jobrecruit-api', audience: 'jobrecruit-frontend',
  });
}
