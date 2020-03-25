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
  categoryId: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: 'Category',
  },
  owner: RoomUserSchema,
  users: [RoomUserSchema],
  __v: {type: Number, select: false},
}, {timestamps: true});

export default RoomSchema;
