import { Job } from "bull";

export default async function (job: Job, cb) {
  for (let index = 0; index < 500000000; index++) {
    if (index % 100 === 0) {
      console.log('separate process first CPU intensive ==> ', job?.data?.name, job?.data?.name, index);
    }
  }
  cb('its completed');
}