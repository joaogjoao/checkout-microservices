import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BffController } from './controllers/bff.controller';
import { BffService } from './services/bff.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    HttpModule,
  ],
  controllers: [BffController],
  providers: [BffService],
})
export class AppModule {}
