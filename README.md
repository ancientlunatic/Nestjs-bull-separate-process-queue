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

Before the execution of the Bull Queue task, the task manager shows three active processes that are concurrently operational, managing different aspects of the system's tasks.
![image.png](/media/before_running_worker.png)

Once the Bull Queue task is initiated, an additional process becomes visible in the task manager. This newly added process is dedicated to executing the Bull Queue task, contributing to the efficient multitasking and workload distribution of the system.
![image.png](/media/after_worker_invoke.png)


### Scenario: Concurrent Execution of Requests
![image.png](/media/network-report.png)

In the context of our system, we have two distinct types of requests:

**CPU-Intensive Requests:**
These requests are designed to execute on a separate thread. The heavy computational workload of these requests is managed by a Bull Queue, which efficiently processes them. Each of these requests takes approximately 10 seconds to complete due to the nature of the computational tasks involved.

**Main-Thread Requests:**
These requests run on the main event loop of our system. Unlike the CPU-intensive requests, they are not offloaded to a separate thread. Each of these requests takes around 5 seconds to execute.

**Observations:**

**Block 1: Sequential Execution**

In this block, two types of API calls are made (**"Main-thread" API Call** and **CPU-Intensive API Call**) sequentially to observe their individual execution times, with minimal time spacing to prevent overlap.

We have observed that **"Main-thread" API Call** is taking approximately 5 second and **CPU-Intensive API Call** is taking approximately 10 second to execute.

**Block 2: Concurrent Execution with Queue**

In this block, both **"Main-thread"** and **"CPU-intensive"** API calls are initiated simultaneously to observe how the system handles concurrency, particularly the parallel processing of **"CPU-intensive"** tasks through a separate queue.

We have observed that the **"Main-thread"** API call's execution remains unaffected by the concurrent initiation of a **"CPU-intensive"** call, **"CPU-intensive"** API call's execution is managed in parallel using a separate processing mechanism, resulting in reduced impact on the "Main-thread" call's 

![image.png](/media/sepreate_process_info.png)

As we can also see that we have 2 different process Ids are printed in console one is for main thread process Process which consumed by the main thread and another one the separate thread process id which is consumed by the CPU intensive task.

**Block 3: Sequential "Main-thread" Calls**

In this block, two consecutive "Main-thread" API calls are made, we notice a sequential execution pattern. The second request waits for the completion of the first request before it starts executing. This is likely due to the single-threaded nature of the main event loop, which handles these requests sequentially.
