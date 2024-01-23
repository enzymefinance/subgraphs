import { ActivityCounter } from "../generated/schema";

export function getActivityCounter(): i32 {
    let id = "activity";

    let counter = ActivityCounter.load(id);
    if (counter == null) {
        counter = new ActivityCounter(id);
        counter.count = 0;
    }

    counter.count = counter.count + 1;
    counter.save();

    return counter.count;
}