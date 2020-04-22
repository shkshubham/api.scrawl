import Routes from './app';
import GameController from '../controllers/game.controller';
import Auth from '../middlewares/auth';
const router = Routes.Router();

router.get('/start/:lobbyCode', Auth.UserAccess, GameController.startGame);
router.post('/select/word', Auth.UserAccess, GameController.selectWord);
router.get('/init', Auth.AllAccess, GameController.init);

export default router;

