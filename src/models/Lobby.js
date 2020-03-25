import {Schema} from 'mongoose';

const LobbySchema = new Schema({
  rounds: Array,
  drawTime: Array,
  __v: {type: Number, select: false},
}, {timestamps: true});

export default LobbySchema;
