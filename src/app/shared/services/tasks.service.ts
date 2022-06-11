import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SubmitTask } from './submit-task';
import { TaskType } from './tasktype';
import { ToastService } from 'angular-toastify';

import { AuthService } from './auth.service';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  NO_ADDRESS = 'No Address Provided!';
  NO_COORDS = 'No coordinates provided!';
  NO_ID_PROVIDED = 'No Id was provided';
  NO_ACCESS = 'You do not have permission to do this!';
  TASK_NOT_FOUND = "Task not found!";
  TASK_UPDATED = 'Task Updated!';
  TASK_DELETE_SUCCESS = 'Task Deleted Successfully!';

  taskList = [];
  singleTask: TaskType | undefined;
  searchResult = {};
  geoCoder = new google.maps.Geocoder();
  userTaskCount: number = 0;
  publicTaskCount: number = 0;

  private userTaskStore: BehaviorSubject<Array<TaskType>> = new BehaviorSubject(Array<TaskType>());
  public readonly userTasks: Observable<Array<TaskType>> = this.userTaskStore.asObservable();

  private allTaskStore: BehaviorSubject<Array<TaskType>> = new BehaviorSubject(Array<TaskType>());
  public readonly allTasks: Observable<Array<TaskType>> = this.allTaskStore.asObservable();

  constructor(
    private backendService: BackendService,
    private toastService: ToastService,
    public authService: AuthService
  ) {
    this.loadInitData();
  }

  loadInitData() {
    //Load All Available
    this.getTasks();
    //Load All User Tasks
    this.getUserTasks();
  }

  private getTasks() {
    this.backendService.getTasks().subscribe(
        (res) => {
          this.allTaskStore.next(res);
          console.log(res)
        }
    )
  }

  private getUserTasks() {
    this.backendService.getUserTasks().subscribe(
      (res) => this.userTaskStore.next(res)
    )
  }

  getSingleTask(reqtaskId: string):TaskType | undefined {
    this.allTasks.subscribe(res => res.forEach(
      task => {
        if (reqtaskId === task.taskid) {
          console.log(task)
          this.singleTask = task;
        }
      }
    ));

    this.userTasks.subscribe(res => res.forEach(
      task => {
        if (reqtaskId == task.taskid) {
          this.singleTask = task;
        }
      }
    ));
    return this.singleTask;
  }

  async submitTaskToDB(userTask: SubmitTask): Promise<Observable<string>> {
    let response = await this.backendService.submitTaskToDB(userTask);

    //Data submitted to server is not same as response so we can't load directly to dataStore
    this.loadInitData();

    return response;
  }

  async deleteTask(reqTaskId: string) {
    let taskFound = false;

    this.allTasks.subscribe(res =>  { 
      taskFound = this.genericDelete(reqTaskId, res, this.allTaskStore);
    });

    if (!taskFound) {
      this.userTasks.subscribe(res =>  { 
        taskFound = this.genericDelete(reqTaskId, res, this.userTaskStore);
      });
   }
   this.backendService.deleteTask(reqTaskId);
  }

  private genericDelete(
    reqTaskId: string,
    taskArray:TaskType[],
    taskStore:BehaviorSubject<TaskType[]> ):boolean {

    let allCurrentTasks: any = taskStore.getValue();
    let index = taskArray.findIndex( (task) => task.taskid == reqTaskId) 
    if (index) {
      taskStore.next(allCurrentTasks.pop(index))
      this.toastService.success(this.TASK_DELETE_SUCCESS);
      return true;
    }
    return false;
  }

  updateTask(reqTaskId: string, updatedStatus: string) {
    this.backendService.updateTask(reqTaskId, updatedStatus);

    let taskFound = false;

    this.allTasks.subscribe(res =>  { 
    taskFound = this.genericUpdate(reqTaskId, res, updatedStatus, this.allTaskStore)
      });

    if (!taskFound) {
      this.userTasks.subscribe(res =>  { 
        taskFound = this.genericUpdate(reqTaskId, res, updatedStatus, this.userTaskStore)
      })
    }
    //this.toastService.error(this.TASK_NOT_FOUND);
  }

  private genericUpdate(
    reqTaskId: string,
    taskArray:TaskType[],
    updatedStatus: string,
    taskStore:BehaviorSubject<TaskType[]>):boolean {

    let allCurrentTasks: any = taskStore.getValue();
    let index = taskArray.findIndex( (task) => task.taskid == reqTaskId) 
    if (index) {

      let updatedTask:TaskType = allCurrentTasks[index];
      updatedTask.data.status = updatedStatus;
      
      taskStore.next(allCurrentTasks)
      //this.toastService.success(this.TASK_UPDATED);
      return true;
    }
  
    return false;
  }

  getInfoFromFormatedAddress(searchAddress: string) {
    return this.backendService.getInfoFromFormatedAddress(searchAddress);
  }

  async getTaskAddress(newlat: number, newlong: number) {
    return this.backendService.getTaskAddress(newlat, newlong);
  }

  async getCoords(address: string) {
    return this.backendService.getCoords(address);
  }

  async getProof(taskId: string) {
    return this.backendService.getProof(taskId)
  }


}
