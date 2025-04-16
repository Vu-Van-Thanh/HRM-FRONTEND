import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINT } from '../constants/endpoint';

import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`/api/login`);
    }

    register(user: User) {
        console.log('Sending registration request to:', user);
        return this.http.post(API_ENDPOINT.register, user);
    }
}
