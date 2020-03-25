import Database from '../database';
import Utils from '../utils';
class RoomService {
  static createRoom = async (req) => {
    const {user} = req;
    const roomCode = Utils.generateRandomString();
    const room = await Database.Room.create({
      roomCode,
      ownerId: user._id,
    });
    return room.roomCode;
  }
}

export default RoomService;

// Users
// id, name, picture, is_online

// Score
// id, user_id, total_score

// list of matches
// id, user_id, room_id

// Room Create
// id, name, language, rounds, drawtime, customWords[] if any

// RoomUser
// id, room_id, user_id, score

// Custom Words
// id, words Array, room_id

// Start Game

// Categories
// id, name, words[], language_id

// Sub categories
// id, category_id, words[], name

// Rounds
// id, rounds

// Langauge
// id, name

// game

// Drawing data => path, score, rounds, time, correct answer
