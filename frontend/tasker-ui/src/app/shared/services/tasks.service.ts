import { Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubmitTask } from './submit-task';
import { TaskType } from './tasktype';
import { environment } from 'src/environments/environment';
import { ToastService } from 'angular-toastify';
import { GoogleMap, MapGeocoder } from '@angular/google-maps';



@Injectable({
  providedIn: 'root'
})
export class TasksService {

  NO_ADDRESS = "No Address Provided!"
  NO_COORDS = "No coordinates provided!"

  taskList = []
  searchResult = {}
  geoCoder = new google.maps.Geocoder();

  constructor(
    private http: HttpClient,
    private toastService: ToastService) { }

  getTasks() {
    let userId
    try {
      userId = JSON.parse(localStorage.getItem('user') || '{}').uid
    } catch (err) {
      userId = "0"
    }
    return this.http.get<TaskType []>(`${environment.backendUri}/tasks/${userId}}`)
  }

  getSingleTask(taskId: string) {
    console.log("single task")
    return this.http.get<TaskType>(`${environment.backendUri}/task/${taskId}`)
  }


  submitTaskToDB(userTask: SubmitTask):Observable<string> {
    return this.http.post(`${environment.backendUri}/add`, userTask, { responseType: 'text' })
  }

  getInfoFromFormatedAddress(searchAddress: string) {
    if (!searchAddress) {
      return this.toastService.error(this.NO_ADDRESS)
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

  async getTaskAddress(newlat: number, newlong: number) {
    let address;
    await this.geoCoder.geocode( {'location': {lat: newlat, lng: newlong }}, (results, status) => {
      console.log("GEOCOdDE: " )
      if (results !== null && status === 'OK') {
        address = results[0]
      }
    })
    return address;
  }


  async getCoords(address: string) {
    let coords: any = {
      lat: '',
      lng: ''
    };
    await this.geoCoder.geocode({
      'address': address
    }, (results, status) => {
      if (status === 'OK' && results != null) {
        console.log(results[0].geometry.viewport)
        coords = {
         lat: results[0].geometry.location.lat(),
         lng: results[0].geometry.location.lng()
        };
        console.log(coords)
      };
    });
    
    return coords;
  }

}
