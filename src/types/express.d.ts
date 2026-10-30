import { ReqUser } from '../auth/types/req-user';

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}
