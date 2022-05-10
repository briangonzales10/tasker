import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { Toast } from 'angular-toastify/lib/toast';
import { BackendService } from 'src/app/shared/services/backend.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  FILE_UPLOAD_ERROR = 'File upload error, something went wrong!'

  @Input()
  taskId: string = ''

  fileName = '';
  fileUploadURL = '';

  constructor(
    private http: HttpClient,
    private backend: BackendService,
    public toastService: ToastService) { }

  ngOnInit(): void {
    if (this.taskId === '') {
      this.toastService.error(this.FILE_UPLOAD_ERROR)
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement
    const file:File = target.files![0]
    
    if (file) {
      this.fileName = file.name
    }

    const fileData = new FormData();
    fileData.append(`proof`, file)

    let response = this.backend.uploadFile(this.taskId, fileData)
    response.subscribe({
      next: (res) => { 
        this.toastService.success(`${this.fileName} uploaded!`)
        console.log(res)
      },
      error: (error) => {
        this.toastService.error('Could not upload file')
        console.error(error)
      }
    })
  }
  
}
