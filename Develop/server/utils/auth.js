const jwt = require('jsonwebtoken')

const secret = 'mysecretsshhhhh'
const expiration = '2h'

module.exports = {
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id }
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration })
  },
  authMiddleware: function ({ req }) {
    if (
      req.body?.operationName === 'login' ||
      req.body?.operationName === 'addUser'
    ) {
      return req
    }
    // allows token to be sent via req.body, req.query, or headers
    let token =
      req.body?.token || req.query?.token || req.headers?.authorization

    // separate "Bearer" from "<tokenvalue>"
    if (req.headers.authorization) {
      token = token
        .split(' ')
        .pop()
        .trim()
    }

    // if no token, return request object as is
    if (!token) {
      return req
    }
    try {
      // decode and attach user data to request object
      console.log(jwt.verify(token, secret, { maxAge: expiration }))
      const { data } = jwt.verify(token, secret, { maxAge: expiration })
      req.user = data
    } catch(err){
      console.log('Invalid token:', err)
    }
    // return updated request object
    return req
  }
}
