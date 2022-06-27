import { CategoryTypes } from "./tasktype";

export interface SubmitTask {
    taskname: string;
    location: SubmitDataLocation;
    remarks: string;
    infolink: string;
    isPublic: boolean;
    category: string;
    uid: string;
}

export interface SubmitDataLocation {
    latitude: number;
    longitude: number;
    address: string;
}