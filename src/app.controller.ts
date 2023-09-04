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

  @Get('/local-queue')
  async blockedQue() {
    const job = await this.same.add('blocked');
    return job.finished().then((res) => {
      return res;
    });
  }

  @Get('/cpu-intensive')
  async blockedProcess(@Query('name') name: string, @Res() response: Response) {
    // console.log("************** start execution ******************");
    const job = await this.separate.add({ message: 'FORK OFF.', name });
    // console.log("************** job await end ******************");
    const completionListener = this.onCompletion(job.id);
    return completionListener.then((res) => {
      return response.send('task done');
    });
  }

  @Get('/main-thread')
  async blocked() {
    console.log("main thread Process Id  => ", process.pid);
    const response = await this.cpuIntensive(5);
  }

  @Get('/heavy-lifting-task')
  async heavyLiftedTask(@Res() response: Response) {
    console.log("************** start execution ******************");
    const job = await this.separate.add({ message: 'FORK OFF.' });
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

  cpuIntensive(seconds: number) { // number of seconds to comsume the process
    const newDate = new Date();
    const elapsedTime = (newDate.getTime() + (seconds * 1000));
    let runLoop = true;
    while (runLoop) {
      const currentTime = new Date().getTime();
      if (currentTime % 1000 === 0) {
        console.log('Main Thread process intensive ==> ', seconds);
      }
      runLoop = !(currentTime > elapsedTime);
    }
  }
}
