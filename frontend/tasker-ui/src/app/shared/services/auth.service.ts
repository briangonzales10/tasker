import { Injectable, NgZone } from '@angular/core';
import { User } from "./user";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from "@angular/router";
// import firebase from 'firebase/compat';
import firebase from 'firebase/compat/app';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedInUser: any;
  userMessage: string = '';

  constructor(
    public fs: AngularFirestore,
    public fAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) {
    this.fAuth.authState.subscribe({
      next: (user) => {
      if (user) {
        // console.log("LOGGED IN: " + JSON.stringify(user))
        this.loggedInUser = user;
        localStorage.setItem('user', JSON.stringify(this.loggedInUser))
        JSON.parse(localStorage.getItem('user') || '{}');
      } else {
        localStorage.setItem('user', "") //can't set to null so setting to blank
        JSON.parse(localStorage.getItem('user') || '{}');
      }
    },
    error: (error) => { console.error(error) }
    })
   }

   setDataForUser(user: any) {
      const userRef: AngularFirestoreDocument<any> = this.fs.doc(`users/${user.uid}`);
      const userData: User = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        submittedTasks: {
          taskid: []
        }
      }
      return userRef.set(userData, {
        merge: true
      })
   }

   get isLoggedIn(): boolean {
    console.log("+1")
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      return true;
    }
    else {
      return false;
    }
  }

   authLogin(provider: firebase.auth.AuthProvider) {
     return this.fAuth.signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run ( () => {
          this.router.navigate(['/'])
        })
        this.setDataForUser(result.user)
      })
      .catch((error) => {
        window.alert(error)
      })
   }

   signIn(email: string, password: string) {
      return this.fAuth.signInWithEmailAndPassword(email, password)
      .then( (result) => {
        this.setDataForUser(result.user)
        this.fAuth.authState.subscribe((user) => {
            if (user) { 
              console.log("user logged in")
            }
        })
      })
      .then(() => {
          this.ngZone.run( () => {
            this.router.navigate(['/'])
          });
            
        })
        .catch((error) => {
          window.alert(error.message)
          console.warn(error)
        })
   }

   register(email: string, password: string) {
     return this.fAuth.createUserWithEmailAndPassword(email, password)
     .then( (result) => {
       this.sendVerificationEmail();
       this.setDataForUser(result.user)
       this.userMessage = `User created with: ${email}, please verify email address`
     })
   }

  async sendVerificationEmail() {
     return await(await this.fAuth.currentUser)?.sendEmailVerification()
    .then( () => {
      console.log('email verification sent')
      this.router.navigate(['verify-email-address'])
    });
   }

   forgotPassword(passwordResetEmail: string) {
     return this.fAuth.sendPasswordResetEmail(passwordResetEmail)
     .then(() => {
       this.userMessage = "Password reset email has been sent, please check your inbox"
       window.alert(this.userMessage)
     })
     .then( () => {
       this.router.navigate(['sign-in'])
     })
     .catch((error) => {
       window.alert(error.message)
     })
   }

   async signOut() {
    return this.fAuth.signOut()
      .then(() => {
        localStorage.removeItem('user')
        this.isLoggedIn
        this.loggedInUser = '';
        console.log("removed user")
        this.router.navigate(['/'])
      })
   }

   googleAuth() {
     return this.authLogin(new firebase.auth.GoogleAuthProvider());
   }

   facebookAuth() {
     return this.authLogin(new firebase.auth.FacebookAuthProvider());
   }
}
