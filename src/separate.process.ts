import { Job } from "bull";

export default async function (job: Job, cb) {
  try {
    await cpuIntensiveTask(job, 9);
    cb(new Error('unexpected error'),
      'Work done'
    );
  } catch (err) {
    cb(err, null);
  }
}

async function cpuIntensiveTask(job, seconds) {
  return new Promise((res, rej) => {
    setTimeout(async () => {
      if (seconds > 0) {
        console.log('separate process second CPU intensive ==> ', job?.data?.name, job?.data?.name, seconds);
        res(await cpuIntensiveTask(job, seconds - 1));
      } else {
        res(true);
      }
    }, 1000);
  });
}