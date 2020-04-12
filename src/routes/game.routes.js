import Routes from './app';
import GameController from '../controllers/game.controller';
import Auth from '../middlewares/auth';
const router = Routes.Router();

router.get('/start/:roomCode', Auth.UserAccess, GameController.startGame);
router.post('/select/word', Auth.UserAccess, GameController.selectWord);

export default router;

