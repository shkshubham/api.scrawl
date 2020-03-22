import {Schema} from 'mongoose';

const RoomUserSchema = new Schema({
  userId: String,
  score: String,
});

const RoomSchema = new Schema({
  round: String,
  drawTime: String,
  ownerId: Object,
  users: [RoomUserSchema],
});


export default RoomSchema;

// const lobby = {
//   rounds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//   language: {
//     english: {
//       adult: ['word1', 'word2'],
//       movies: ['movie1', 'movie2'],
//     },
//     hindi: {
//       adult: ['word1', 'word2'],
//       movies: ['movie1', 'movie2'],
//     }},
// };

// const created_lobby = {
//   round: 4,
//   language: 'english',
//   subcategory: 'adult',
//   admin: 'user_id',
//   users: [
//     {
//       user_id: '1234567',
//       score: '2345',
//     },
//     {
//       user_id: '123489',
//       score: '2345',
//     },
//   ],
// };
