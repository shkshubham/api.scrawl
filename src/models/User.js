import Database from '../database';
import UserSchema from '../schema/user';

const User = Database.mongoose.model('User', UserSchema);

export default User;
