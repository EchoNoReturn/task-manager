import { Module } from '@nestjs/common';
import { AiService } from './service';
import { IAiService } from './interfaces';

@Module({
  providers: [
    {
      provide: 'IAiService',
      useClass: AiService,
    },
  ],
  exports: ['IAiService'],
})
export class AiModule {}
