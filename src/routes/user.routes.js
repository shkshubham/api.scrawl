import UserController from '../controllers/user.controller';
import Routes from '.';

const router = Routes.Router();

router.post('/auth', UserController.createUser);

export default router;
