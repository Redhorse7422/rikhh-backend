import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CustomerInfoDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ConfirmOrderDto {
  @IsString()
  checkoutId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  guestId?: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
