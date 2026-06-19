import { Roles } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  roles: Roles;
}
