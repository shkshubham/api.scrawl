import {Schema} from 'mongoose';

const LobbySchema = new Schema({
  rounds: Array,
  drawTime: Array,
});

export default LobbySchema;
