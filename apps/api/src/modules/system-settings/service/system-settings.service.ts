import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../entities';
import { RegistrationMode, RegistrationSettings } from '@taskmanager/shared';

const REGISTRATION_MODE_KEY = 'registration_mode';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
  ) {}

  async getRegistrationMode(): Promise<RegistrationMode> {
    const setting = await this.settingRepo.findOne({
      where: { key: REGISTRATION_MODE_KEY },
    });
    return (setting?.value as RegistrationMode) || RegistrationMode.OPEN;
  }

  async getRegistrationSettings(): Promise<RegistrationSettings> {
    const mode = await this.getRegistrationMode();
    return { mode };
  }

  async updateRegistrationMode(mode: RegistrationMode): Promise<RegistrationSettings> {
    let setting = await this.settingRepo.findOne({
      where: { key: REGISTRATION_MODE_KEY },
    });

    if (setting) {
      setting.value = mode;
    } else {
      setting = this.settingRepo.create({
        key: REGISTRATION_MODE_KEY,
        value: mode,
      });
    }

    await this.settingRepo.save(setting);
    return { mode };
  }
}
