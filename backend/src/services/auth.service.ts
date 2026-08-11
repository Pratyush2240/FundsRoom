import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken, AuthUserPayload } from '../utils/jwt';
import { LoginInput } from '../validations/auth.validation';

export class AuthService {
  static async login(data: LoginInput) {
    const emailNormalized = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const userPayload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(userPayload);

    return {
      token,
      user: userPayload,
    };
  }
}
