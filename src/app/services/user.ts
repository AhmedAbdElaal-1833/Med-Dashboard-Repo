// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  departmentId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  role: string;
  departmentId?: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  departmentId?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/user'; // الـ proxy هيوجه للبورت 8000

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  createUser(userData: CreateUserDto): Observable<any> {
    return this.http.post(this.apiUrl, userData, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: string, userData: UpdateUserDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, userData, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getUsersByDepartment(departmentId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?departmentId=${departmentId}`, {
      headers: this.getHeaders()
    });
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?role=${role}`, {
      headers: this.getHeaders()
    });
  }

  toggleUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { isActive }, {
      headers: this.getHeaders()
    });
  }

  searchUsers(searchTerm: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?q=${searchTerm}`, {
      headers: this.getHeaders()
    });
  }
}