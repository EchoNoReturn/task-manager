import { IsEnum } from 'class-validator';
import { RegistrationMode } from '@taskmanager/shared';

export class UpdateRegistrationModeDto {
  @IsEnum(RegistrationMode)
  mode: RegistrationMode;
}
