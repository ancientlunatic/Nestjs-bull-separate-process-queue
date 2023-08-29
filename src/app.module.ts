import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { SameProcess } from './same.process';

@Module({
  imports: [
    // register root
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    // register queues
    BullModule.registerQueue(
      {
        name: 'SAME', // this will run in same process as this module
      },
      {

        name: 'SEPARATE', // this will run in its own process
        processors: [{
          path: join(__dirname, 'separate.process'),
          concurrency: 3
        }],
      },
    ),
  ],
  controllers: [AppController],
  providers: [SameProcess],
})
export class AppModule { }
