export interface SubmitTask {
    taskname: string;
    location: SubmitDataLocation;
    remarks: string;
    isPublic: boolean;
    uid: string;
    tokenId: string;
}

export interface SubmitDataLocation {
    latitude: number;
    longitude: number;
    address: string;
}