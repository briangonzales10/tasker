import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastService } from 'angular-toastify';
import { BackendService } from 'src/app/shared/services/backend.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload!: ElementRef;
  FILE_UPLOAD_ERROR = 'File upload error, something went wrong!'

  @Input()
  taskId: string = ''

  fileName = '';
  public proofForm: FormGroup;

  constructor(
    private backend: BackendService,
    private fb: FormBuilder,
    public toastService: ToastService,) {

      this.proofForm = this.fb.group({
        proof: [''],
        fileUpload: ['']
      })
     }

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
    fileData.append('proof', file)

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
    this.resetForm()
    // response.subscribe( res => this.toastService.info(res.toString()))
  }

  resetForm() {
    console.log(`fileUpload ${this.fileUpload.nativeElement.value}`)
    console.log(`Proof: ${this.proofForm.get('proof')?.value}`)
    console.log(`Proof: ${this.proofForm.get('fileUpload')?.value}`)
    this.proofForm.reset()
  }

}
