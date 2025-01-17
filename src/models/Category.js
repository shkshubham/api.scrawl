import {Schema} from 'mongoose';

const CategorySchema = new Schema({
  name: String,
  words: Array,
  language: String,
  __v: {type: Number, select: false},
}, {timestamps: true});

export default CategorySchema;
