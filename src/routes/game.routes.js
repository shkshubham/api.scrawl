import Routes from './app';
import GameController from '../controllers/game.controller';
import Auth from '../middlewares/auth';
const router = Routes.Router();

router.get('/start/:lobbyCode', Auth.UserAccess, GameController.startGame);
router.post('/select/word', Auth.UserAccess, GameController.selectWord);
router.post('/game/init', Auth.UserAccess, GameController.init);

export default router;

