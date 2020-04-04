import {Schema} from 'mongoose';

const CountrySchema = new Schema({
  name: String,
  svg: String,
  __v: {type: Number, select: false},
});

export default CountrySchema;
