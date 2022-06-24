import { Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SubmitTask } from './submit-task';
import { TaskType } from './tasktype';
import { environment } from 'src/environments/environment';
import { ToastService } from 'angular-toastify';


import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  //String Labels
  NO_ADDRESS = 'No Address Provided!';
  NO_COORDS = 'No coordinates provided!';
  NO_ID_PROVIDED = 'No Id was provided';
  NO_ACCESS = 'You do not have permission to do this!';

  geoCoder = new google.maps.Geocoder();
  searchResult = {};

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    public toastService: ToastService
  ) { }

uploadFile(taskId:string, formData: FormData) {
  return this.http.post(`${environment.backendUri}/upload/${taskId}`, formData, {responseType: 'text'})
}

getProof(taskId: string) {
  return this.http.get(`${environment.backendUri}/proof/${taskId}`, {responseType: "blob"})
}

getTasks() {
  // let userToken = await this.authService.getToken();
  let headers = {
    // 'Authorization': userToken,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  let ReqOptions = {
    headers: new HttpHeaders(headers)
  };
  let userId;
  try {
    userId = JSON.parse(localStorage.getItem('user') || '{}').uid;
  } catch (err) {
    userId = '0';
  }
  return this.http.get<TaskType[]>(
    `${environment.backendUri}/tasks/${userId}`, ReqOptions
  );
}

getUserTasks() {
  // let userToken = await this.authService.getToken();
  let headers = {
    // 'Authorization': userToken,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  let ReqOptions = {
    headers: new HttpHeaders(headers)
  };
  let userId;
  try {
    userId = JSON.parse(localStorage.getItem('user') || '{}').uid;
  } catch (err) {
    userId = '0';
  }
  return this.http.get<TaskType[]>(
    `${environment.backendUri}/mytasks/${userId}`, ReqOptions
  );
}

getSingleTask(taskId: string) {
  console.log('single task');
  return this.http.get<TaskType>(`${environment.backendUri}/task/${taskId}`);
}

submitToDB(userTask: SubmitTask): Observable<string> {
  return this.http.post(`${environment.backendUri}/add`, userTask, {
    responseType: 'text'
  });
}

async deleteTask(id: string) {
  if (!id) {
    console.warn(this.NO_ID_PROVIDED);
    return;
  }
  if (
    this.authService.isLoggedIn === false ||
    this.authService.loggedInUser.uid !== environment.adminUid
  ) {
    console.warn(this.NO_ACCESS);
    console.log(this.authService.isLoggedIn);
    console.log(this.authService.loggedInUser.uid);
    return;
  }

  // let user = this.authService.getToken()
  //   .subscribe({
  //     next: (userData) => { userData?.token }
  //   })

  console.log(`deleting task ${id}`);
  let response = await this.http.delete(
    `${environment.backendUri}/delete/${id}`
  );
  response.subscribe({
    next: (res) => {
      console.log('!!!response:' + res);
    },
    error: (err) => console.warn(err),
  });
}

async updateTask(taskId: string, updatedStatus: string) {
  if (!taskId) {
    console.warn(this.NO_ID_PROVIDED);
    return;
  }
  if (
    this.authService.isLoggedIn === false ||
    this.authService.loggedInUser.uid !== environment.adminUid
  ) {
    console.warn(this.NO_ACCESS);
    console.log(this.authService.isLoggedIn);
    console.log(this.authService.loggedInUser.uid);
    return;
  }

  const status = {
    status: updatedStatus,
  };

  let response = this.http.put(
    `${environment.backendUri}/update/${taskId}`,
    status,
    {
      responseType: 'text',
    }
  );
  response.subscribe({
    next: (res) => {
      console.log('!!!response:' + res);
    },
    error: (err) => console.warn(err),
  });
}


getInfoFromFormatedAddress(searchAddress: string) {
  if (!searchAddress) {
    return this.toastService.error(this.NO_ADDRESS);
  }

  let postResponse;

  postResponse = this.http
    .post(`${environment.backendUri}/places`, { address: searchAddress })
    .subscribe({
      next: (val) => {
        console.log(val);
        this.searchResult = val;
      },
      error: (err) => console.error(err),
      complete: () => console.info('complete'),
    });

  return this.searchResult;
}

async getTaskAddress(newlat: number, newlong: number) {
  let address;
  await this.geoCoder.geocode(
    { location: { lat: newlat, lng: newlong } },
    (results, status) => {
      console.log('GEOCOdDE: ');
      if (results !== null && status === 'OK') {
        address = results[0];
      }
    }
  );
  return address;
}

async getCoords(address: string) {
  let coords: any = {
    lat: '',
    lng: '',
  };
  await this.geoCoder.geocode(
    {
      address: address,
    },
    (results, status) => {
      if (status === 'OK' && results != null) {
        console.log(results[0].geometry.viewport);
        coords = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        console.log(coords);
      }
    }
  );

  return coords;
}


}