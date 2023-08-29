import { InjectQueue } from '@nestjs/bull';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Queue } from 'bull';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    @InjectQueue('SAME') private readonly same: Queue,
    @InjectQueue('SEPARATE') private readonly separate: Queue,
  ) { }

  @Get('/cpu-intensive')
  async blockedProcess(@Query('name') name: string, @Res() response: Response) {
    const job = await this.separate.add({ message: 'FORK OFF.', name });
    // job.finished().then((res) => {
    //   console.log('job finished log', res);
    // });
    const completionListener = this.onCompletion(job.id);
    return completionListener.then((res) => {
      return response.send('task done');
    });
  }

  @Get('/main-thread')
  blocked() {
    for (let index = 0; index < 200000; index++) {
      if (index % 100 === 0) {
        console.log('<-----RUNNING IN MAIN THREAD ----->', index);
      }
    }
  }
  onCompletion(jobid) {
    return new Promise((res, rej) => {
      this.separate.on('completed', (job, result) => {
        console.log(job);
        console.log(result);
        res(result);
      });
    });
  }
}
