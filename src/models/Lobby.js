import {Schema} from 'mongoose';

const LobbyUserSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  score: {
    type: Number,
    default: 0,
  },
});

const LobbySchema = new Schema({
  lobbyCode: String,
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
  owner: LobbyUserSchema,
  users: [LobbyUserSchema],
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

export default LobbySchema;
