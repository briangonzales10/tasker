import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskType } from './tasktype';


@Injectable({
  providedIn: 'root'
})
export class TasksService {

  uri = "http://localhost:3000";
  taskList = []

  getTasks() {
    return this.http.get<TaskType []>(`${this.uri}/tasks`)
  }

  getSingleTask(taskId: string) {
    return this.http.get<TaskType []>(`${this.uri}/task/${taskId}`)
  }

  constructor(private http: HttpClient) { }
}
