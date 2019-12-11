import Crown from "./Crown";
import Peak from "./Peak";

export type VisitedPeak = {
    peak: Peak,
    visited: boolean,
    visitDate?: Date,
}

export type UserCrown = {
    crown: Crown,
    visitedPeaks: VisitedPeak[],
}

export type UserCrownsObj = { [crownId: string]: UserCrown };

export class User extends Object {
    crowns: UserCrownsObj = {};
    visitedPeaks: VisitedPeak[] = [];
}