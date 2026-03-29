import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController, AdminTeamsController } from './controller';
import { TeamsService } from './service';
import { Team, TeamMember } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember])],
  controllers: [TeamsController, AdminTeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
