import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SubmitTask } from './submit-task';


@Injectable({
  providedIn: 'root'
})
export class BackendService {

  baseUri = "http://localhost:3000"

  searchResult = {}
  response:any
  
  constructor(private http: HttpClient) { }


  getInfoFromFormatedAddress(searchAddress: string) {
    if (!searchAddress) {
      return {'result': 'no address provided'}
    }

    let postResponse;

    postResponse = this.http.post(`${this.baseUri}/places`, {address: searchAddress})
    .subscribe({
      next: (val) => {console.log(val); this.searchResult = val},
      error: (err) => console.error(err),
      complete: () => console.info('complete')
    })
      
      return this.searchResult
  }

  submitTaskToDB(userTask: SubmitTask):Observable<string> {
    return this.http.post(`${this.baseUri}/add`, userTask, { responseType: 'text' })
  }

}
