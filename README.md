# Running Separate Processes in a NestJS using Bull
## Introduction
This documentation outlines the benefits of running a separate process in a NestJS application using the Bull package. The purpose of this approach is to offload CPU-intensive tasks from the main thread, enhancing the overall performance and responsiveness of the application.

## Problem
In a Node.js application, the main thread handles all incoming requests and executes the application's logic. However, if a CPU-intensive task is executed on the main thread, it can cause delays in responding to other requests and potentially make the application feel sluggish.

## Solutions
The solution is to offload these CPU-intensive tasks to separate threads, leaving the main thread available to handle other tasks and respond to requests promptly.

## Prerequisites
- Node.js and npm installed on your system
- Nestjs
- Bull package

## Implementation

```sh
npm install --save @nestjs/bull bull
```

Register bull module with Redis configuration

```
BullModule.forRoot({
      redis: {
        host: '<REDIS_HOST>',
        port: <REDIS_PORT>,
      },
    }),
```

Register your Queue in module
```
BullModule.registerQueue(
      {
        name: 'QUEUE_NAME', // this will run in its own process
        processors: [{
          path: join(__dirname, <SEPERATE_WORKER_FILE_PATH>),
          concurrency: <NUMBER_OF_CUNCURRENCT_PROCESS> //optional by default set by 1
        }],
      },
```
Define your worker
```
Seperate worker file
export default function () {
    // CPU intensive code
    }
}
```

Inject the Queue in service.
```
    @InjectQueue(<QUEUE_NAME>) private readonly newQueue: Queue,
```
Add new job in Queue
```
this.newQueue.add({ message: 'FORK OFF.', name });
```
After adding the job in the Queue it will start executing as soon as the Worker is available.

## Results

Node process before running the bull worker
![image.png](/media/before_running_worker.png)

One process added in after running the Worker, A new tread is created by the worker.
![image.png](/media/after_worker_invoke.png)


### Scenario: Concurrent Execution of Requests
![image.png](/media/network-report.jpeg)

In the context of our system, we have two distinct types of requests:

**CPU-Intensive Requests:**
These requests are designed to execute on a separate thread. The heavy computational workload of these requests is managed by a Bull Queue, which efficiently processes them. Each of these requests takes approximately 10 seconds to complete due to the nature of the computational tasks involved.

**Main-Thread Requests:**
These requests run on the main event loop of our system. Unlike the CPU-intensive requests, they are not offloaded to a separate thread. Each of these requests takes around 4 seconds to execute.

**Observations:**

When we initiate both a "CPU-Intensive Request" and a "Main-Thread Request" simultaneously, they execute concurrently. Each request follows its expected execution time, with the CPU-intensive request taking about 10 seconds and the main-thread request taking about 4 seconds.

However, when we initiate the same "Main-Thread Request" twice in succession, we notice a sequential execution pattern. The second request waits for the completion of the first request before it starts executing. This is likely due to the single-threaded nature of the main event loop, which handles these requests sequentially.
