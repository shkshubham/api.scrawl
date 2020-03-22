import UserController from '../controllers/user.controller';
import Routes from './app';
import Auth from '../middlewares/auth';

const router = Routes.Router();

router.post('/auth', Auth.GuestAccess, UserController.auth);
router.get('/profile', Auth.UserAccess, UserController.profile);

export default router;
