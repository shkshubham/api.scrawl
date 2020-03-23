import {Schema} from 'mongoose';

const CategorySchema = new Schema({
  name: String,
  words: Array,
  language: String,
});

export default CategorySchema;
