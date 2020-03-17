import Database from '../database';

const UserSchema = new Database.Schema({
  name:  String,
  email: String,
  avatar:  String,
});

export default UserSchema;