import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { RegistrationMode } from '@taskmanager/shared';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 50, default: RegistrationMode.OPEN })
  value: string;
}
