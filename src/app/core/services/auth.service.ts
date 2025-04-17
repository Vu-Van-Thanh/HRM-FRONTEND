import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalStorage } from '../enums/local-storage.enum';
import {API_ENDPOINT} from '../constants/endpoint';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    private user: any;
    private currentUser: any = {
        id: 1,
        username: 'admin',
        role: 'ADMIN'
    };

    constructor(private http: HttpClient,private router: Router) {
    }

    // Login
    public login(userName: string, password: string,rememberMe: boolean) {
        const body = {
            email: userName,
            password: password,
        };
        console.log('Sending login request to:', API_ENDPOINT.login);
        console.log('Request body:', body);
        
        return this.http.post(API_ENDPOINT.login, body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Skip-Interceptor': 'true'
            },
            observe: 'response'
        }).pipe(
            map(response => {
                console.log('Login response:', response);
                return response.body;
            }),
            catchError(error => {
                console.error('Login error:', error);
                throw error;
            })
        );
    }

    public logout() {
        this.removeAuthToken();
    }

    // Set AuthToken
    public setAuthToken(authToken: any, rememberMe: boolean) {
        const tokenString = JSON.stringify(authToken);
    
        if (rememberMe) {
            localStorage.setItem(LocalStorage.AuthToken, tokenString);
        } else {
            sessionStorage.setItem(LocalStorage.AuthToken, tokenString);
        }
    }
    

    // Get AuthToken
    public getAuthToken(): any {
        const tokenString = localStorage.getItem(LocalStorage.AuthToken) || sessionStorage.getItem(LocalStorage.AuthToken);
        if (tokenString) {
            return JSON.parse(tokenString);
        }
        return null;
    }

    // Delete AuthToken
    private removeAuthToken() {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    }

    // Get Current User
    public GetCurrentUser(): any {
        return this.user;
    }

    public SetCurrentUser(user: any): any {
        this.user = user;
    }

    // Get User Profile
    public GetUserProfile() { 
        return this.http.get(API_ENDPOINT.getUserProfile);
    }

    isAdmin(): boolean {
        return this.currentUser?.role === 'ADMIN';
    }

    getCurrentUserId(): number {
        return this.currentUser?.id;
    }

    getCurrentUser(): any {
        return this.currentUser;
    }
}

