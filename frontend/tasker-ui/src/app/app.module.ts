import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps'
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AuthGuard } from './shared/guard/auth.guard'
import { environment } from '../environments/environment';
import { AuthService } from './shared/services/auth.service'
import { ReactiveFormsModule } from '@angular/forms';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TasklistComponent } from './tasklist/tasklist.component';
import { Routes, RouterModule } from '@angular/router';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { SubmitTaskComponent } from './submit-task/submit-task.component';

@NgModule({
  declarations: [
    AppComponent,
    TasklistComponent,
    TaskDetailsComponent,
    NavbarComponent,
    SignInComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    UserSettingsComponent,
    SubmitTaskComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    GoogleMapsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularToastifyModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: TasklistComponent },
      { path: 'showtask/:taskId', component: TaskDetailsComponent },
      { path: 'sign-in', component: SignInComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'verify-email-address', component: VerifyEmailComponent },
      { path: 'user-settings', component: UserSettingsComponent, canActivate: [AuthGuard] },
      { path: 'submit', component: SubmitTaskComponent, canActivate: [AuthGuard] }
    ])
  ],
  providers: [AuthService, ToastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
