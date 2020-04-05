import {Schema} from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Config from '../configs';
import Database from '../database';

const UserModelSchema = new Schema({
  username: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error({error: 'Invalid Email address'});
      }
    },
  },
  picture: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  password: {
    type: String,
    required: true,
    minLength: 7,
  },
  looking: {
    type: Boolean,
    default: false,
  },
  country: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: 'Country',
  },
  __v: {type: Number, select: false},
}, {timestamps: true});


UserModelSchema.pre('save', async function(next) {
  // Hash the password before saving the user model
  // eslint-disable-next-line no-invalid-this
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserModelSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign({_id: user._id}, Config.SECRET_KEY);
  user.tokens = user.tokens.concat({token});
  await user.save();
  return token;
};

UserModelSchema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password.
  const user = await Database.User.findOne({email});
  if (!user) {
    return null;
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return null;
  }
  return user;
};

export default UserModelSchema;
