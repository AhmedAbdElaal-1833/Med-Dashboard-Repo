import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  
  private baseUrl = 'http://localhost:4200/api';


  getDepartments(): Observable<any> {
    return this.http.get<any>('http://localhost:4200/api/department', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  createDepartment(department: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/department`, department, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      }
    });
  }

  updateDepartment(id: string, department: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/department/${id}`, department, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      }
    });
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/department/${id}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }
}