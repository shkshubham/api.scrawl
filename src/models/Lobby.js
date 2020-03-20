import {Schema} from 'mongoose';

const LobbySchema = new Schema({
  rounds: {
    type: Array,
  },
  drawTime: {
    type: Array,
  },
  language: {
    type: Object,
  },
});

export default LobbySchema;
