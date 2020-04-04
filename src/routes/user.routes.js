import UserController from '../controllers/user.controller';
import Routes from './app';
import Auth from '../middlewares/auth';

const router = Routes.Router();

router.post('/auth', Auth.GuestAccess, UserController.auth);
router.get('/logout', Auth.UserAccess, UserController.logout);
router.get('/profile', Auth.UserAccess, UserController.profile);
router.post('/invite', Auth.UserAccess, UserController.invite);
router.get('/looking/all', Auth.AllAccess, UserController.allLookingUsers);
router.get('/looking/:type', Auth.UserAccess, UserController.lookingForGame);

export default router;
