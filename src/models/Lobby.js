import {Schema} from 'mongoose';

const LobbySchema = new Schema({
  rounds: Array,
  drawTime: Array,
  language: Array,
});

export default LobbySchema;
