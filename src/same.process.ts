import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('SAME')
export class SameProcess {
  @Process()
  hello(job: Job<{ message: string; }>) {
    Logger.verbose(`${job.data.message} (pid ${process.pid})`, `SAME`);
  }

  @Process('blocked')
  blockProcess(job: Job) {
    for (let index = 0; index < 2900000; index++) {
      if (index % 100 === 0) {
        console.log('running CPU intensive task', index);
      }
    }
    return 'non blocking tasks';
  }
}
