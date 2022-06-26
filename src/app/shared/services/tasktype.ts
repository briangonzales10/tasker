
export interface TaskType {
    taskid: string;
    data: TaskData;
}

export interface TaskData {
    picUrl: string;
    category: CategoryTypes;
    status: string;
    taskname: string;
    timestamp: TaskDataTime;
    completedTime: TaskDataTime;
    location: TaskDataLocation;
    remarks: string;
    infolink: string;
    isPublic: boolean;
    proof: Proof;
}

export interface  TaskDataTime {
    _seconds: number
    _nanoseconds: number
}

export interface TaskDataLocation {
    address: any;
    latitude: number;
    longitude: number;
}

export interface Proof {
    filename: string;
    proofURL: string;
}

export enum CategoryTypes {
    Food = "food",
    Landmark = "landmark",
    Experience = "experience",
    Entertainment = "entertainment",
    Travel = "travel",
    Other = "other"
}