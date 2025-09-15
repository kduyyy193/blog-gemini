import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service';
import { RegisterUsersDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prisma: PrismaService ){}

    async getTokens(userId: number, username: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {sub: userId, username},
                {secret: process.env.JWT_SECRET,  expiresIn: '15m' }
            ),
            this.jwtService.signAsync(
                {sub: userId, username},
                {secret: process.env.JWT_REFRESH_SECRET,  expiresIn: '7d' }
            )
        ])
        return {accessToken, refreshToken}
    }

    async saveRefreshToken(userId: number, refreshToken: string, ip?: string, device?: string) {
        const hashedToken = await bcrypt.hash(refreshToken, 10)
        await this.prisma.userToken.create({
            data: {
                userId,
                refreshToken: hashedToken,
                ip,
                device,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })
    }

    async refreshTokens(userId: number, refreshToken: string) {
        const userTokens = await this.prisma.userToken.findMany({
            where: {
                userId
            }
        })

        if (userTokens.length === 0) throw new UnauthorizedException();

        let validToken = null;

        for (const token of userTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.refreshToken)
            if (isValid && token.expiresAt > new Date()) {
                validToken = token
            }
        }

        if(!validToken) throw new UnauthorizedException();

        const tokens = await this.getTokens(userId, '');
        await this.saveRefreshToken(userId, tokens.refreshToken)

        return tokens
    }

    async register(registerUserDto: RegisterUsersDto) {
        try {
            const exist = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: registerUserDto.username },
                    { email: registerUserDto.email }
                ]
            }
            })

            if(exist) throw new ConflictException('Username or email already exists')

            const hashedPassword = await bcrypt.hash(registerUserDto.password, 10)

            const user = await this.prisma.user.create({
                data: {
                    ...registerUserDto,
                    password: hashedPassword
                }
            })

            const tokens = await this.getTokens(user.id, user.username) 
            await this.saveRefreshToken(user.id, tokens.refreshToken)

            return {
                tokens,
                user,
            }
        } catch (error) {
            throw error
        }
    }

    async login(loginDto: LoginUserDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                username: loginDto.username
            }
        })

        if (!user) {
            throw new NotFoundException('User not found')
        }
        
        const validatePassword = await bcrypt.compare(loginDto.password, user.password)

        if (!validatePassword) {
            throw new UnauthorizedException('Invalid Password')
        }

        const tokens = await this.getTokens(user.id, user.username)
        return {
            tokens, 
            user
        }
    }

}

