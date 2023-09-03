import { Job } from "bull";

export default async function (job: Job, cb) {
  try {
    console.log("Seperate Thread Process Id  => ", process.pid);
    await cpuIntensive(9);
    cb(null,
      'work Done'
    );
  } catch (err) {
    cb(err, null);
  }
}


export function cpuIntensive(seconds: number) { // number of seconds to comsume the process
  const newDate = new Date();
  const elapsedTime = (newDate.getTime() + (seconds * 1000));
  let runLoop = true;
  while (runLoop) {
    const currentTime = new Date().getTime();
    if (currentTime % 1000 === 0) {
      console.log('separate process second CPU intensive ==> ', seconds);
    }
    runLoop = !(currentTime > elapsedTime);
  }
}