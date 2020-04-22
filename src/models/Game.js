import {Schema} from 'mongoose';

const GameSchema = new Schema({
  rounds: Array,
  drawTime: Array,
  colors: Array,
  __v: {type: Number, select: false},
}, {timestamps: true});

export default GameSchema;
