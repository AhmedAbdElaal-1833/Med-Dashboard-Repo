import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  
  private baseUrl = 'http://localhost:4200/api';

  // Get all appointments
  getAppointments(): Observable<any> {
    return this.http.get<any>('http://localhost:4200/api/appointment', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  // Create new appointment
  createAppointment(appointment: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/appointment`, appointment, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      }
    });
  }

  // Update existing appointment
  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/appointment/${id}`, appointment, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      }
    });
  }

  // Delete appointment
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/appointment/${id}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  // Get appointment by ID (إضافية)
  getAppointmentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appointment/${id}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  }


}
