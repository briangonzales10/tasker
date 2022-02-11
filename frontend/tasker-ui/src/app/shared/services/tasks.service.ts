import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubmitTask } from './submit-task';
import { TaskType } from './tasktype';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TasksService {

  taskList = []
  searchResult = {}

  constructor(private http: HttpClient) { }

  getTasks() {
    return this.http.get<TaskType []>(`${environment.backendUri}/tasks`)
  }

  getSingleTask(taskId: string) {
    return this.http.get<TaskType []>(`${environment.backendUri}/task/${taskId}`)
  }


  submitTaskToDB(userTask: SubmitTask):Observable<string> {
    return this.http.post(`${environment.backendUri}/add`, userTask, { responseType: 'text' })
  }

  getInfoFromFormatedAddress(searchAddress: string) {
    if (!searchAddress) {
      return {'result': 'no address provided'}
    }

    let postResponse;

    postResponse = this.http.post(`${environment.backendUri}/places`, {address: searchAddress})
    .subscribe({
      next: (val) => {console.log(val); this.searchResult = val},
      error: (err) => console.error(err),
      complete: () => console.info('complete')
    })
      
      return this.searchResult
  }


}
