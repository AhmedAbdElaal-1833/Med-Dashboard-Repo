import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  
  private baseUrl = '/api';

  getDepartments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/departments`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  createDepartment(department: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/departments`, department, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });
  }

  updateDepartment(id: string, department: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/departments/${id}`, department, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/departments/${id}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }
}