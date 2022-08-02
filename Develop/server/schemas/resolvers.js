const { AuthenticationError } = require('apollo-server-express')

const { User, Thought } = require('../models')
const { signToken } = require('../utils/auth')

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          '-__v -password'
        )
        return userData
      }
      throw new AuthenticationError('Not logged in')
    },
    getSingleUser: async (parent, args, context) => {
      console.log('parent', parent)
      console.log('args', args)
      console.log('context', context)
      if (context.user) {
        //   const userData = await User.findOne({ _id: context.user._id })
        //     .select('-__v -password')
        const userData = await User.findOne({
          $or: [
            { _id: context.user ? context.user._id : params.id },
            { username: params.username }
          ]
        }).populate('savedBooks')
        return userData
      }
    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args)
      const token = signToken(user)

      return { token, user }
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email })

      if (!user) {
        throw new AuthenticationError('Incorrect credentials')
      }

      const correctPw = await user.isCorrectPassword(password)

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials')
      }

      const token = signToken(user)
      return { token, user }
    },
    saveBook: async (parent, args) => {
        console.log("parent", parent)
        console.log("args", args)
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: args._id },
          { $addToSet: { savedBooks: args.book } },
          { new: true, runValidators: true }
        )
        return updatedUser
      } catch (err) {
        console.log(err)
        throw new Error('unable to update user for saveBook')
      }
    }
  }
}

module.exports = resolvers
