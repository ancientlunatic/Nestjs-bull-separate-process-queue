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
    console.log("************** start execution ******************");
    const job = await this.separate.add({ message: 'FORK OFF.', name });
    // job.finished().then((res) => {
    //   console.log('job finished log', res);
    // });
    console.log("************** job await end ******************");

    const completionListener = this.onCompletion(job.id);
    return await completionListener.then((res) => {
      return response.send('task done');
    });
  }

  @Get('/main-thread')
  blocked() {
    for (let index = 0; index < 900000; index++) {
      if (index % 50 === 0) {
        console.log('<-----RUNNING IN MAIN THREAD ----->', index);
      }
    }
  }

  @Get('/heavy-lifting-task')
  async heavyLiftedTask(@Res() response: Response) {
    console.log("************** start execution ******************");
    const job = await this.separate.add({ message: 'FORK OFF.' });
    // job.finished().then((res) => {
    //   console.log('job finished log', res);
    // });
    console.log("************** job await end ******************", job.id);
    const completionListener = this.onCompletion(job.id);
    return await completionListener.then((res) => {
      return response.send('task done');
    });
  }
  onCompletion(jobid) {
    return new Promise((res, rej) => {
      this.separate.on('completed', (job, result) => {
        if (job.id === jobid)
          res(result);
      });
    });
  }
}
