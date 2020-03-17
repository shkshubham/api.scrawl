import Database from '../database';

const UserSchema = new Database.Schema({
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
  google_id: {
    type: String,
    default: null,
  },
});

export default UserSchema;
