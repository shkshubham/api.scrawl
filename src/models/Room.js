import {Schema} from 'mongoose';

const RoomUserSchema = new Schema({
  userId: String,
  score: String,
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
    type: String,
    default: null,
  },
  ownerId: Object,
  users: {
    type: [RoomUserSchema],
    default: null,
  },
  __v: {type: Number, select: false},
}, {timestamps: true});

export default RoomSchema;
