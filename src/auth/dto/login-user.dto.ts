import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";


export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    username: string

    @IsString()
    @Length(6,12)
    password: string
}