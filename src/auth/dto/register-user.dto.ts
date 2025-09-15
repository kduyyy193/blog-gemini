import { IsString, Length } from "class-validator";


export class RegisterUsersDto {
     @IsString()
     username: string;
     
     @IsString()
     @Length(6,12)
     password: string

     @IsString()
     email:string
}