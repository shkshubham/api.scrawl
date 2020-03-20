import {Schema} from 'mongoose';

const UserModelSchema = new Schema({
  username: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
  },
});

export default UserModelSchema;
