# Core Java Concurrency - Consolidated Study Output

Source: `dzone-rc061-corejavaconcurrency.pdf`

Generated outputs:

- `output/dzone-rc061-corejavaconcurrency/document.txt`
- `output/dzone-rc061-corejavaconcurrency/metadata.json`
- `output/dzone-rc061-corejavaconcurrency/page_previews/`
- `output/dzone-rc061-corejavaconcurrency/images/`
- `output/dzone-rc061-corejavaconcurrency/dzone-rc061-corejavaconcurrency_workshop.html`
- `output/dzone-rc061-corejavaconcurrency/dzone-rc061-corejavaconcurrency_quiz.json`
- `output/dzone-rc061-corejavaconcurrency/dzone-rc061-corejavaconcurrency_consolidated.md`

## How to use this guide

Use this as a linear reference beside the interactive workshop. The source is a compact refcard, so this output keeps the same breadth but expands the decision rules: what each primitive is for, what failure it prevents, and when to choose a higher-level java.util.concurrent abstraction.

## Source page map

| Page | Main focus |
| --- | --- |
| 1 | Atomicity, visibility, race condition, data race, and happens-before introduction |
| 2 | Happens-before details, synchronized, reentrant monitors, wait/notify condition loops |
| 3 | volatile, atomics, LongAdder, ThreadLocal, and safe publication entry points |
| 4 | Safe publication examples, final fields, this escape, synchronized access, immutability |
| 5 | Thread states, thread methods, interruption handling, uncaught exceptions, deadlock setup |
| 6 | Deadlock avoidance, livelock/starvation, ExecutorService, pool factories and implementations |
| 7 | Runnable, Callable, Future, explicit locks, ReadWriteLock, CountDownLatch, CompletableFuture |
| 8 | CompletableFuture composition and concurrent list/map/set choices |
| 9 | Concurrent queue choices and producer-consumer behavior |

## Foundations: races, visibility, and happens-before

Source pages: 1, 2

### Concurrency starts with atomicity and visibility

The refcard begins with the two ideas that explain most Java concurrency bugs: atomicity and visibility. Atomicity asks whether an operation can be observed half-done. Visibility asks whether one thread is guaranteed to see another thread's write.

A program can be wrong even if every individual line looks harmless. The risky boundary is usually a multi-step action against shared state.

- Atomic operations behave as all-or-nothing actions.
- Visibility requires a defined relationship between the writer and the reader.
- Shared mutable state needs a guard: a lock, volatile, atomics, immutable publication, or another concurrency abstraction.

**Working rule:** When a shared field crosses thread boundaries, first ask: who writes it, who reads it, and what makes the read see the write?

### Race condition vs data race

A race condition is a broader design problem: the result depends on an unlucky ordering between threads. Lazy initialization is a typical example when the check and the initialization are not one atomic action.

A data race is a memory-model problem: multiple threads access the same non-final variable, at least one access writes, and the program does not use synchronization that orders those accesses.

- Race condition: the interleaving changes behavior.
- Data race: unsynchronized conflicting access can produce stale reads and broken assumptions.
- A data race may trigger symptoms such as loops that never stop, corrupted state, or incorrect computations.

```java
// Safer lazy initialization: make the state transition atomic.
private final AtomicReference<Service> service = new AtomicReference<>();

Service current() {
  service.compareAndSet(null, createService());
  return service.get();
}
```
**Working rule:** Do not treat volatile or synchronization as decoration. They are the mechanism that makes shared-state communication meaningful.

### Happens-before is the reasoning tool

The Java Memory Model gives developers a way to reason about visibility through happens-before relationships. If action A happens-before action B, the effects of A must be visible to the thread performing B.

The refcard highlights common edges: Thread.start before actions inside the started thread, releasing a monitor before a later acquisition of the same monitor, volatile write before later volatile read, final-field construction rules, and actions in a thread before a successful join on that thread.

- Use start and join to reason about thread lifecycle visibility.
- Use the same monitor to pair lock release and lock acquisition.
- Use volatile for simple state publication where one variable carries the signal.
- Use final fields and safe construction to publish immutable state.

**Working rule:** A concurrency fix is not complete until you can name the happens-before edge it creates.

## Intrinsic synchronization and condition waiting

Source pages: 2

### synchronized gives mutual exclusion and visibility

The synchronized keyword makes a block or method run while holding a monitor. That protects the guarded data from simultaneous mutation and creates a visibility edge when another thread later acquires the same monitor.

A static synchronized method locks the class object. A non-static synchronized method locks the receiver, the current this object.

- Use one consistent monitor for the state it protects.
- Do not split related fields across unrelated locks unless you have a clear design reason.
- A synchronized method is shorthand for acquiring the associated monitor around the whole method body.

```java
final class PairCounter {
  private int left;
  private int right;

  synchronized void incrementBoth() {
    left++;
    right++;
  }
}
```
**Working rule:** A lock protects a specific invariant. Name that invariant before deciding what monitor to use.

### Intrinsic locks are reentrant

The refcard points out that Java intrinsic locks are reentrant. If a thread already owns a monitor, it can enter another synchronized method or block guarded by the same monitor without deadlocking itself.

This matters in object-oriented code where public synchronized methods call private synchronized helpers. Reentrancy makes that pattern legal, but it does not make the design automatically simple.

- Reentrancy prevents self-deadlock on the same monitor.
- Nested synchronized calls can still increase coupling and make lock scope harder to audit.
- Contention changes the implementation cost of monitor acquisition.

**Working rule:** Reentrancy is a convenience, not a reason to make every method synchronized.

### wait/notify needs a condition loop

wait, notify, and notifyAll live on Object because they operate on an object's monitor. A thread must hold that monitor before using them.

The durable pattern is a loop: while the condition is false, wait. Another thread changes the condition while holding the same monitor and then notifies waiters. The loop handles timing races and spurious wakeups.

- Acquire the object's monitor before calling wait, notify, or notifyAll.
- Wait in a loop that checks the real condition.
- Change the condition before notifying.
- Prefer notifyAll when multiple condition types may be waiting on the same monitor.

```java
synchronized void awaitReady() throws InterruptedException {
  while (!ready) {
    wait();
  }
}

synchronized void markReady() {
  ready = true;
  notifyAll();
}
```
**Working rule:** Never wait for a notification alone. Wait for a condition, and re-check it after waking.

## Volatile, atomics, ThreadLocal, and safe publication

Source pages: 3, 4

### volatile is a visibility tool for simple state

A volatile write happens-before a later read of that same volatile variable. That makes it a good fit for a simple signal, such as a stop flag.

Volatile does not make a multi-step compound action magically safe. If the operation is read-modify-write, use an atomic class or a lock.

- Good volatile use: simple flags, latest-value publication, one-variable signals.
- Bad volatile use: counters that require atomic increment, compound invariants, check-then-act sequences.
- The variable carrying the signal should be the one declared volatile.

```java
private volatile boolean stopRequested;

void runLoop() {
  while (!stopRequested) {
    doOneUnitOfWork();
  }
}
```
**Working rule:** Use volatile when one variable is the protocol. Use a stronger tool when the protocol spans multiple steps or fields.

### Atomics make single-value compound actions safe

The java.util.concurrent.atomic package supports lock-free atomic operations on single values. compareAndSet is the key operation for safe check-then-act transitions.

AtomicInteger and AtomicLong are useful for exact atomic updates. LongAdder is often a better fit for high-contention counters where exact read-on-every-update is not required.

- AtomicReference handles one-reference state transitions.
- AtomicInteger and AtomicLong handle exact numeric updates.
- LongAdder spreads contention across cells and can perform better for hot counters.

```java
private final AtomicInteger requests = new AtomicInteger();

int recordRequest() {
  return requests.incrementAndGet();
}
```
**Working rule:** Choose atomics when the invariant fits inside one atomic variable. Use a lock when it does not.

### ThreadLocal removes sharing by making state per-thread

ThreadLocal gives each thread its own value. That can remove the need for locking because the state is no longer shared between threads.

This pattern is useful for per-thread context such as transaction state, request metadata, counters, or ID generation. The tradeoff is lifecycle management: stale ThreadLocal values in pooled threads can surprise later tasks.

- Use ThreadLocal for thread-confined state, not as a hidden global variable.
- Clear values when a pooled thread may be reused for unrelated work.
- Prefer explicit context passing when it keeps ownership clearer.

**Working rule:** ThreadLocal is a confinement tool. It is strongest when the lifecycle is obvious.

### Safe publication means no one sees a half-built object

Publishing an object means making its reference available outside the current scope. Safe publication means other threads can only see a fully constructed object with its intended state.

The refcard highlights static initialization, volatile references, atomics, final fields, and synchronized access as safe publication strategies. It also warns against letting this escape during construction.

- Static initializers run under class initialization rules.
- Volatile and atomics publish through volatile semantics.
- Final fields help when the object is correctly constructed.
- Correct synchronization can lazily initialize shared state.
- Do not register this with caches, listeners, or other threads before construction finishes.

**Working rule:** An object is not safely published just because its constructor returned somewhere. The reference must cross threads through a safe mechanism.

### Immutable objects are the easiest shared objects

Immutable objects are naturally thread-safe because their observable state does not change after construction.

The guide's requirements are practical: final class or no unsafe subclassing, final fields, no mutable internals escaping, defensive copies for mutable inputs, and no this escape during construction.

- Copy mutable constructor inputs before storing them.
- Expose unmodifiable views or copies instead of mutable internals.
- Prefer immutable value objects for data passed across threads.

```java
public final class Snapshot {
  private final List<String> names;

  public Snapshot(List<String> names) {
    this.names = List.copyOf(names);
  }

  public List<String> names() {
    return names;
  }
}
```
**Working rule:** The best lock is often the one you do not need because the object cannot change.

## Threads, interruption, exception handling, and liveness

Source pages: 5, 6

### Thread states explain why code is not moving

The Thread class represents JVM and application threads. The refcard summarizes the core states: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, and TERMINATED.

These states are diagnostic vocabulary. BLOCKED usually means a thread is trying to enter a monitor. WAITING and TIMED_WAITING usually mean it is waiting for another action, such as notification, unpark, join, sleep, or a timeout.

- NEW: constructed but not started.
- RUNNABLE: eligible to run or currently running.
- BLOCKED: waiting to acquire a monitor.
- WAITING/TIMED_WAITING: waiting for another action, optionally with timeout.
- TERMINATED: execution has ended.

**Working rule:** Thread states are a debugging map. They tell you what kind of wait to investigate first.

### Use start, join, and interrupt deliberately

Thread.start begins execution of the thread's run method. Thread.join waits for that thread to finish. Thread.interrupt is the cooperative cancellation signal.

The guide warns against deprecated methods such as stop, suspend, resume, and destroy. They can leave shared state damaged because they act without respecting the thread's current invariant.

- Use interrupt or a volatile flag for cooperative shutdown.
- When catching InterruptedException, either finish cleanly, declare it, or restore the interrupt status before throwing a more appropriate exception.
- Use an UncaughtExceptionHandler for failures that terminate a thread unexpectedly.

```java
catch (InterruptedException e) {
  Thread.currentThread().interrupt();
  throw new IllegalStateException("Interrupted while waiting", e);
}
```
**Working rule:** Interruption is a request, not a kill switch. Preserve the signal unless you fully handle it.

### Deadlock is a cycle of ownership and waiting

A deadlock occurs when threads wait on resources held by each other, forming a cycle. The refcard's account-transfer example illustrates the classic mistake: one transfer locks account A then B, while another locks B then A.

The practical fix is to eliminate the cycle. Lock ordering is the most direct technique: all code paths acquire related locks in the same global order.

- Look for nested locks acquired in different orders.
- Assign an ordering key and always lock in that order.
- For explicit locks, time-bounded tryLock can back out and retry instead of waiting forever.
- Thread dumps can report monitor deadlocks.

**Working rule:** Deadlock prevention is design work. Once a cycle is possible, testing may only find it by luck.

### Livelock and starvation are progress failures too

Not every liveness bug is a deadlock. Livelock happens when threads keep reacting to each other but no useful work completes. Starvation happens when some threads rarely or never get access because another thread or group monopolizes a resource.

These bugs often require looking beyond stack traces into scheduling, lock hold times, retry policies, fairness settings, and workload shape.

- Livelock: high activity, low progress.
- Starvation: one participant keeps losing access.
- Long lock scopes, unfair acquisition, and aggressive retries can all contribute.

**Working rule:** A healthy concurrent system needs progress, not just absence of crashes.

## ExecutorService, Future, locks, and CompletableFuture

Source pages: 6, 7, 8

### ExecutorService separates tasks from threads

The java.util.concurrent executor APIs let code submit work without manually managing Thread objects for every task. ExecutorService is the central interface; Executors supplies common factory methods.

The refcard also points to implementations such as ThreadPoolExecutor, ScheduledThreadPoolExecutor, and ForkJoinPool. Pool sizing often starts with Runtime.getRuntime().availableProcessors(), then adjusts for workload and blocking behavior.

- Use fixed pools for bounded parallelism.
- Use scheduled pools for delayed or periodic tasks.
- Use ForkJoinPool/work stealing for divide-and-conquer or many small tasks.
- Prefer explicit ThreadPoolExecutor configuration for production services that need clear queue, rejection, and thread-factory policies.

**Working rule:** Do not hide capacity decisions inside a convenient factory call if the service needs predictable production behavior.

### Runnable, Callable, and Future shape task results

Runnable represents work with no return value. Callable represents a computation that returns a value and can throw Exception.

Future represents the result of asynchronous work. Calling get can block, throw if the task failed, or time out if a timeout overload is used. InterruptedException, ExecutionException, and TimeoutException should be handled distinctly.

- Use Runnable when completion is enough.
- Use Callable when the caller needs a value or checked failure.
- Use timed Future.get when indefinite waiting would be unsafe.
- Unwrap ExecutionException to handle the task failure rather than the wrapper.

```java
Future<Result> future = executor.submit(this::loadResult);
try {
  return future.get(500, TimeUnit.MILLISECONDS);
} catch (TimeoutException e) {
  future.cancel(true);
  throw e;
}
```
**Working rule:** A Future is a handle to a result, not a promise that waiting forever is acceptable.

### Explicit locks add capabilities to mutual exclusion

ReentrantLock overlaps with synchronized but adds useful operations such as tryLock, interruptible acquisition, and lock state inspection.

ReadWriteLock separates read and write access. A ReentrantReadWriteLock can allow many readers at the same time while still restricting mutation to one writer.

- Always unlock in a finally block.
- Use tryLock when backing out is better than waiting indefinitely.
- Use read/write locks when reads dominate and write sections are clear.
- Measure before assuming a read/write lock will beat a simpler lock.

```java
lock.lock();
try {
  updateSharedState();
} finally {
  lock.unlock();
}
```
**Working rule:** Explicit locks buy control. They also require stricter discipline because the compiler will not add finally for you.

### Coordination utilities reduce custom waiting code

CountDownLatch starts with a count. Threads can await the count reaching zero while other work calls countDown. Once it reaches zero, it is not reset.

CompletableFuture extends the Future idea with pipelines and callbacks. supplyAsync and runAsync create stages, thenApply transforms results, thenCombine joins results, whenComplete observes success or failure, and allOf/anyOf aggregate multiple futures.

- Use CountDownLatch for one-time gates.
- Use CompletableFuture when composing async steps is clearer than blocking.
- Remember that non-async CompletableFuture callbacks may run in the completing or caller thread.
- Specify an Executor when the default common pool is not appropriate.

**Working rule:** Prefer library coordination primitives over custom wait/notify when they match the shape of the problem.

## Concurrent collections and selection heuristics

Source pages: 8, 9

### Concurrent collections encode synchronization policy

Collections.synchronized wrappers can make a collection thread-safe, but the refcard notes that they can perform poorly under high contention. java.util.concurrent offers specialized structures with concurrency behavior built into their design.

The right collection depends on the read/write ratio, ordering needs, blocking requirements, and contention pattern.

- Copy-on-write collections favor many reads and rare writes.
- ConcurrentHashMap favors scalable concurrent map access.
- ConcurrentSkipListMap and ConcurrentSkipListSet add sorted access.
- Queues model producer-consumer handoff.

**Working rule:** Pick collections by access pattern, not by the word concurrent in the class name.

### Lists, maps, and sets have different tradeoffs

CopyOnWriteArrayList and CopyOnWriteArraySet create a fresh internal copy on mutation. That makes writes expensive but lets readers work against a stable snapshot.

ConcurrentHashMap avoids blocking most reads and uses finer-grained internal coordination for writes. ConcurrentSkipListMap and ConcurrentSkipListSet provide sorted concurrent access with different performance tradeoffs.

- Use copy-on-write when iteration is common and mutation is rare.
- Use ConcurrentHashMap for high-throughput key/value access.
- Use skip-list variants when sorted traversal matters.
- A concurrent set can also be backed by a concurrent map.

**Working rule:** A collection optimized for reads can be terrible for write-heavy paths. Match it to the workload.

### Queues connect producers and consumers

Queues behave like pipes between producer and consumer code. The BlockingQueue interface adds choices for full and empty cases: wait forever, wait for a bounded time, fail, or return a sentinel depending on the method used.

The guide lists common options: ConcurrentLinkedQueue, LinkedBlockingQueue, PriorityBlockingQueue, DelayQueue, and SynchronousQueue.

- Use ConcurrentLinkedQueue for unbounded non-blocking FIFO needs.
- Use LinkedBlockingQueue when producers and consumers should block across a bounded or optionally bounded pipe.
- Use PriorityBlockingQueue when priority order matters more than FIFO.
- Use DelayQueue when items become available after a delay.
- Use SynchronousQueue for direct producer-to-consumer handoff with no queue capacity.

**Working rule:** The queue is part of your backpressure design. Its capacity and blocking behavior matter as much as its type.

### A practical decision checklist

The refcard is broad, so a useful consolidated takeaway is a selection checklist. Start with ownership and sharing. Then choose the simplest tool that creates the necessary visibility, atomicity, and progress guarantees.

Many bugs come from using a low-level primitive where a higher-level utility would express intent better.

- Can you remove sharing with immutability or ThreadLocal?
- Is the state transition one variable? Consider volatile or an atomic.
- Is there a multi-field invariant? Use a lock or a higher-level abstraction.
- Is this task execution? Use an executor, not ad hoc thread creation.
- Is this producer-consumer coordination? Use a queue.
- Is this async composition? Consider CompletableFuture with an explicit executor.

**Working rule:** Prefer the tool whose contract matches the problem. Lower-level primitives should have a clear reason.

## Consolidated Decision Guide

- If state never changes after construction, prefer an immutable object and publish it safely.
- If state belongs to one thread, prefer local variables or ThreadLocal with a clear cleanup policy.
- If a single flag or latest value crosses threads, consider volatile.
- If one numeric or reference value needs atomic state transitions, consider atomic classes or LongAdder for high-contention counters.
- If a multi-field invariant must be preserved, use synchronized, ReentrantLock, or a higher-level abstraction.
- If threads need a one-time gate, use CountDownLatch.
- If work should be submitted rather than manually threaded, use ExecutorService with explicit capacity choices.
- If async stages should compose, use CompletableFuture and choose the executor deliberately.
- If producers and consumers exchange work, choose a Queue or BlockingQueue based on capacity, ordering, and blocking needs.

## Common Failure Patterns

- Check-then-act without atomicity can run the action more than once.
- Non-volatile stop flags can keep loops alive because the reader may not observe the writer's update.
- Calling wait without checking a condition loop can miss notifications or fail on spurious wakeups.
- Publishing this during construction can expose partially initialized state.
- Catching InterruptedException and ignoring it can break cancellation protocols.
- Acquiring the same locks in inconsistent order can deadlock.
- Using copy-on-write collections for write-heavy workloads can create avoidable overhead.
- Blocking on Future.get without a timeout can turn an async design into an indefinite wait.
