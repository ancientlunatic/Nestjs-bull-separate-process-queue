# Running Separate Processes in a NestJS using Bull
## Introduction
This documentation outlines the benefits of running a separate process in a NestJS application using the Bull package. The purpose of this approach is to offload CPU-intensive tasks from the main thread, enhancing the overall performance and responsiveness of the application.

# Problem
In a Node.js application, the main thread handles all incoming requests and executes the application's logic. However, if a CPU-intensive task is executed on the main thread, it can cause delays in responding to other requests and potentially make the application feel sluggish.

# Solutions
The solution is to offload these CPU-intensive tasks to separate threads, leaving the main thread available to handle other tasks and respond to requests promptly.

## Prerequisites
- Node.js and npm installed on your system
- Nestjs
- Bull package

# Implementation
