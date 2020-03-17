import Database from '../database';
import UserSchema from '../schema/user';

export default Database.mongoose.model('Blog', UserSchema);
