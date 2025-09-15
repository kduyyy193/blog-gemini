import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBlogDto {
    @IsString()
    @MaxLength(100)
    title: string

    @IsString()
    content: string

    @IsOptional()
    @IsBoolean()
    published?: boolean = true;
}
