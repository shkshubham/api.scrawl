import {Schema} from 'mongoose';

const RoomUserSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  score: {
    type: String,
    default: '0',
  },
});

const RoomSchema = new Schema({
  roomCode: String,
  rounds: {
    type: String,
    default: null,
  },
  drawTime: {
    type: String,
    default: null,
  },
  category: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: 'Category',
  },
  owner: RoomUserSchema,
  users: [RoomUserSchema],
  kickedUsers: [{
    type: Schema.Types.ObjectId,
  }],
  privacy: {
    type: String,
    default: 'PUBLIC',
  },
  gameStarted: {
    type: Boolean,
    default: false,
  },
  __v: {type: Number, select: false},
}, {timestamps: true});

export default RoomSchema;
