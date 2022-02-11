
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
}

export interface  TaskDataTime {
    _seconds: number
    _nanoseconds: number
}

export interface TaskDataLocation {
    latitude: number;
    longitude: number;
}