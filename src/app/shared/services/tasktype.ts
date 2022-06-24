
export interface TaskType {
    taskid: string;
    data: TaskData;
}

export interface TaskData {
    picUrl: string;
    isComplete: boolean;
    status: string;
    taskname: string;
    timestamp: TaskDataTime;
    location: TaskDataLocation;
    remarks: string;
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