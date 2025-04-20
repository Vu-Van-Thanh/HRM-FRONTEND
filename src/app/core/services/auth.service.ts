import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalStorage } from '../enums/local-storage.enum';
import {API_ENDPOINT} from '../constants/endpoint';
import { map, catchError } from 'rxjs/operators';
import { UserProfile } from '../models/employee.model';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    private user: {
        AccountId: string;
        email: string;
        roles: string[];
        FullName: string;
        avartar: string;
    } = {
        AccountId: "",
        email: "",
        roles: [],  
        FullName: "",
        avartar: ""};
    private currentUser: any = {
        id: 1,
        username: 'admin',
        role: 'ADMIN'
    };
    private userprofile : UserProfile;

    constructor(private http: HttpClient,private router: Router) {
    }

    // Login
    public login(userName: string, password: string,rememberMe: boolean) {
        const body = {
            email: userName,
            password: password,
        };
        
        return this.http.post(API_ENDPOINT.login, body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Skip-Interceptor': 'true'
            },
            observe: 'response'
        }).pipe(
            map(response => {
                return response.body;
            }),
            catchError(error => {
                console.error('Login error:', error);
                throw error;
            })
        );
    }
    public changepassword(passwordInfo : any)
    {   console.log("API endpoint:", API_ENDPOINT.changePassword);

        return this.http.post(API_ENDPOINT.changePassword, passwordInfo, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            observe: 'response'
        }).pipe(
            map(response => {
                return response.body;
            }),
            catchError(error => {
                console.error('Change Password error:', error);
                throw error;
            })
        );
    }

    public logout() {
        this.removeAuthToken();
        this.removeUserProfile();
    }
    

    // Set AuthToken
    public setAuthToken(token : {accessToken: string, refresh_token : string}, rememberMe: boolean) {
        const authtokenString = JSON.stringify(token.accessToken);
        const refreshTokenString = JSON.stringify(token.refresh_token);
    
        if (rememberMe) {
            localStorage.setItem(LocalStorage.AuthToken, authtokenString);
            localStorage.setItem(LocalStorage.RefreshToken, refreshTokenString);
        } else {
            sessionStorage.setItem(LocalStorage.AuthToken, authtokenString);
            sessionStorage.setItem(LocalStorage.RefreshToken, refreshTokenString);
        }
    }
    

    // Get AuthToken
    public getAuthToken(): any {
        const tokenString = localStorage.getItem(LocalStorage.AuthToken) || sessionStorage.getItem(LocalStorage.AuthToken);
        if (tokenString) {
            console.log("Token String:", tokenString);
            return JSON.parse(tokenString);
        }
        return null;
    }

    // Delete AuthToken
    private removeAuthToken() {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
    }
    private removeUserProfile() {
        this.user = null;
        this.userprofile = null;
        localStorage.removeItem('currentUserProfile');
        localStorage.removeItem('currentUser');
    }

    // Get Current User
    public GetCurrentUser(): any {
        if (this.user.AccountId === null || this.user.AccountId === "" || this.user.AccountId === undefined) {
            const userString = localStorage.getItem('currentUser');
            if (userString) {
                this.user = JSON.parse(userString);
            }
        }
        return this.user;
    }

    public SetCurrentUser(userinput: any): any {
        this.user = {
            AccountId: userinput.id,
            email: userinput.email,
            roles: userinput.roles,
            FullName: userinput.fullName,
            avartar: userinput.avatarUrl
          };
    }

    public SetCurrentUserProfile(profile: any) {
        var userProfile = JSON.stringify(profile);
        this.userprofile = JSON.parse(userProfile);
        localStorage.setItem('currentUserProfile', userProfile);
      }
    // Get User Profile
    public GetUserProfile(accountId: string) { 
        return this.http.get(`${API_ENDPOINT.getUserProfile}/${accountId}`);
    }

    public GetCurrentUserProfile() { 
        if ( this.userprofile === undefined) {
            const userProfileString = localStorage.getItem('currentUserProfile');
            if (userProfileString) {
                this.userprofile = JSON.parse(userProfileString);
            }
        }
        return this.userprofile;
    }
    isAdmin(): boolean {
        return this.currentUser?.role === 'ADMIN';
    }

    getCurrentUserId(): number {
        return this.currentUser?.id;
    }

}

