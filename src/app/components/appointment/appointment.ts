import { AppointmentService } from '@/services/appointment';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { TreeTable } from 'primeng/treetable';

// PrimeNG Imports
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { ColumnFilter, TableModule } from 'primeng/table';
import { catchError, forkJoin, of } from 'rxjs';


@Component({
  selector: 'app-appointment',
  imports: [
    CommonModule,
    FormsModule,
    TreeTableModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    ToastModule,
    CheckboxModule,
    AvatarModule,
    TooltipModule,
    DatePickerModule,

  ],
  templateUrl: './appointment.html',
  styleUrl: './appointment.scss',
  providers: [MessageService, ConfirmationService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Appointment {
  @ViewChild('appointmentTreeTable') appointmentTreeTable!: TreeTable;
  constructor( 
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private appointmentService: AppointmentService
  ) {}

  // Appointments data
  appointments: any[] = [];
  appointmentNodes: TreeNode[] = [];
  selectedAppointmentNodes: TreeNode[] = [];
  selectedAppointments: any[] = [];
  isLoadingAppointments: boolean = false;
  
  // Search
  globalFilter: string = '';

  // Dialog states
  appointmentDialog: boolean = false;
  appointment: any = {};
  isEditAppointmentMode: boolean = false;
  appointmentSubmitted: boolean = false;

  // Detail dialog
  detailDialog: boolean = false;
  detailType: 'department' | 'doctor' | 'patient' = 'department';
  selectedDetailData: any = null;
  detailDialogTitle: string = '';

  // Additional data
  doctors: any[] = [];
  patients: any[] = [];

  ngOnInit(): void {
    this.loadAppointments();
  }
// تحديد تسمية نوع العقدة
getNodeTypeLabel(type: string): string {
  switch(type) {
    case 'appointment': return 'موعد';
    case 'doctor': return 'طبيب';
    case 'department': return 'قسم';
    case 'patient': return 'مريض';
    default: return 'غير محدد';
  }
}

// تحديد لون tag النوع
getNodeTypeSeverity(type: string): string {
  switch(type) {
    case 'appointment': return 'primary';
    case 'doctor': return 'success';
    case 'department': return 'info';
    case 'patient': return 'warning';
    default: return 'secondary';
  }
}

// البحث في TreeTable


// في الـ transformNodesToTreeTable method، استبدل الموجود بهذا:
private transformNodesToTreeTable(appointmentNodes: any[]): TreeNode[] {
  return appointmentNodes.map(appointment => {
    // المستوى الأول: الموعد الرئيسي
    const appointmentNode: TreeNode = {
      key: `appointment-${appointment._id}`,
      label: this.formatAppointmentDate(appointment.date),
      data: {
        ...appointment,
        type: 'appointment'
      },
      type: 'appointment',
      expanded: false,
      children: [
        // إضافة child واحد فقط يحتوي على الجدول
        {
          key: `details-${appointment._id}`,
          label: 'تفاصيل الموعد',
          data: {
            type: 'appointment-details',
            appointmentData: appointment
          },
          type: 'appointment-details',
          leaf: true
        }
      ]
    };

    return appointmentNode;
  });
}


 toggleNode(rowNode: any): void {
    rowNode.expanded = !rowNode.expanded;
  }

  // Methods لعرض التفاصيل (الموجودة بالفعل - تأكد من وجودها)
  viewDoctorProfile(doctor: any): void {
    this.selectedDetailData = doctor;
    this.detailType = 'doctor';
    this.detailDialogTitle = `الملف الشخصي: د. ${doctor.name}`;
    this.detailDialog = true;
  }

  viewDepartmentDetails(department: any): void {
    this.selectedDetailData = department;
    this.detailType = 'department';
    this.detailDialogTitle = `تفاصيل القسم: ${department.nameAr}`;
    this.detailDialog = true;
  }

  viewPatientProfile(patient: any): void {
    this.selectedDetailData = patient;
    this.detailType = 'patient';
    this.detailDialogTitle = `الملف الشخصي: ${patient.name}`;
    this.detailDialog = true;
  }

  // Methods إضافية للتفاعل
  assignPatientToAppointment(appointment: any): void {
    console.log('تحديد مريض للموعد:', appointment);
    // يمكنك فتح dialog لاختيار مريض من قائمة المرضى
    // أو فتح form لإضافة مريض جديد
  }

  callDoctor(doctor: any): void {
    if (doctor.phone) {
      console.log('اتصال بالطبيب:', doctor.phone);
      // يمكنك إضافة منطق لفتح تطبيق الهاتف
      // window.open(`tel:${doctor.phone}`);
    }
  }

  callPatient(patient: any): void {
    if (patient.phone) {
      console.log('اتصال بالمريض:', patient.phone);
      // يمكنك إضافة منطق لفتح تطبيق الهاتف
      // window.open(`tel:${patient.phone}`);
    }
  }

  viewDepartmentDoctors(department: any): void {
    console.log('عرض أطباء القسم:', department);
    // يمكنك فتح dialog لعرض جميع أطباء القسم
  }

  selectExistingPatient(appointment: any): void {
    console.log('اختيار مريض موجود للموعد:', appointment);
    // يمكنك فتح dialog لاختيار مريض موجود
  }

  // Methods للتحكم الشامل
  expandAllNodes(): void {
    this.appointmentNodes.forEach(node => {
      node.expanded = true;
    });
  }

  collapseAllNodes(): void {
    this.appointmentNodes.forEach(node => {
      node.expanded = false;
    });
  }
  // Load appointments
loadAppointments(): void {
  this.isLoadingAppointments = true;
  
  this.appointmentService.getAppointments().subscribe({
    next: (response: any) => {
      console.log('Response:', response);
      
      // استخراج البيانات مباشرة كـ nodes
      this.appointments = response.data?.appointments || 
                         response.appointments || 
                         response || 
                         [];
      
      console.log('Appointments (as nodes):', this.appointments);
      
      if (this.appointments.length === 0) {
        console.warn('No appointments found');
        this.isLoadingAppointments = false;
        return;
      }
      
      // تحويل البيانات إلى TreeNode format المطلوب للـ TreeTable
      this.appointmentNodes = this.transformNodesToTreeTable(this.appointments);
      console.log('TreeTable Nodes:', this.appointmentNodes);
      
      this.isLoadingAppointments = false;
    },
    error: (error) => {
      console.error('Error loading appointments:', error);
      this.isLoadingAppointments = false;
      this.handleError('فشل في تحميل المواعيد', error);
    }
  });
}




  // Search functionality
  onGlobalFilter(event: any): void {
    this.appointmentTreeTable.filterGlobal(event.target.value, 'contains');
  }

  // Detail dialog methods
  showDepartmentDetails(department: any): void {
    this.selectedDetailData = department;
    this.detailType = 'department';
    this.detailDialogTitle = 'تفاصيل القسم';
    this.detailDialog = true;
  }

  showDoctorDetails(doctor: any): void {
    this.selectedDetailData = doctor;
    this.detailType = 'doctor';
    this.detailDialogTitle = 'تفاصيل الطبيب';
    this.detailDialog = true;
  }

  showPatientDetails(patient: any): void {
    this.selectedDetailData = patient;
    this.detailType = 'patient';
    this.detailDialogTitle = 'تفاصيل المريض';
    this.detailDialog = true;
  }

  hideDetailDialog(): void {
    this.detailDialog = false;
    this.selectedDetailData = null;
  }

  // Helper methods
  formatAppointmentDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAppointmentStatus(appointment: any): string {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    if (appointmentDate < today) return 'منتهي';
    if (appointmentDate.toDateString() === today.toDateString()) return 'اليوم';
    return 'قادم';
  }

  getAppointmentStatusSeverity(appointment: any): string {
    const status = this.getAppointmentStatus(appointment);
    switch(status) {
      case 'منتهي': return 'danger';
      case 'اليوم': return 'warning';
      case 'قادم': return 'success';
      default: return 'info';
    }
  }

  // Dialog methods
  openNewAppointment(): void {
    this.appointment = {};
    this.appointmentDialog = true;
    this.isEditAppointmentMode = false;
    this.appointmentSubmitted = false;
  }

  openNewAppointmentForDepartment(department: any): void {
    this.appointment = {
      department: department._id
    };
    this.appointmentDialog = true;
    this.isEditAppointmentMode = false;
    this.appointmentSubmitted = false;
  }

  editAppointment(appointment: any): void {
    this.appointment = { ...appointment };
    this.appointmentDialog = true;
    this.isEditAppointmentMode = true;
  }

  hideAppointmentDialog(): void {
    this.appointmentDialog = false;
    this.appointmentSubmitted = false;
  }

  saveAppointment(): void {
    this.appointmentSubmitted = true;
    
    if (this.isEditAppointmentMode) {
      this.updateAppointment();
    } else {
      this.createAppointment();
    }
  }

  private createAppointment(): void {
    this.appointmentService.createAppointment(this.appointment).subscribe({
      next: () => {
        this.loadAppointments();
        this.hideAppointmentDialog();
        this.showSuccess('تم إنشاء الموعد بنجاح');
      },
      error: (error) => {
        this.handleError('فشل في إنشاء الموعد', error);
      }
    });
  }

  private updateAppointment(): void {
    this.appointmentService.updateAppointment(this.appointment._id, this.appointment).subscribe({
      next: () => {
        this.loadAppointments();
        this.hideAppointmentDialog();
        this.showSuccess('تم تحديث الموعد بنجاح');
      },
      error: (error) => {
        this.handleError('فشل في تحديث الموعد', error);
      }
    });
  }

  viewAppointment(appointment: any): void {
    // يمكنك إضافة dialog منفصل لعرض تفاصيل الموعد
    console.log('View appointment:', appointment);
  }

deleteAppointment(appointmentOrId: any): void {
  // تحديد هل هو object أم id
  const appointment = typeof appointmentOrId === 'string' 
    ? this.appointments.find(apt => apt._id === appointmentOrId)
    : appointmentOrId;
    
  if (!appointment) {
    this.showError('الموعد غير موجود');
    return;
  }

  console.log('Delete appointment:', appointment);
  

      this.isLoadingAppointments = true;
      
      this.appointmentService.deleteAppointment(appointment._id).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          this.loadAppointments();
          this.showSuccess('تم حذف الموعد بنجاح');
        },
        error: (error) => {
          this.isLoadingAppointments = false;
          this.handleError('فشل في حذف الموعد', error);
        }
  });
}

deleteSelectedAppointments(): void {
  if (!this.selectedAppointmentNodes || !this.selectedAppointmentNodes.length) {
    this.showError('الرجاء تحديد مواعيد للحذف');
    return;
  }
  
  // استخراج المواعيد فقط (ليس العناصر الفرعية)
  const appointmentsToDelete = this.selectedAppointmentNodes
    .filter(node => node.data?.type === 'appointment')
    .map(node => node.data);
    
  if (appointmentsToDelete.length === 0) {
    this.showError('لم يتم تحديد أي مواعيد للحذف. تأكد من تحديد المواعيد الرئيسية وليس العناصر الفرعية');
    return;
  }

  this.confirmationService.confirm({
    message: `هل أنت متأكد من حذف ${appointmentsToDelete.length} موعد محدد؟ هذا الإجراء لا يمكن التراجع عنه.`,
    header: 'تأكيد الحذف المتعدد',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'نعم، احذف الكل',
    rejectLabel: 'إلغاء',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-outlined',
    accept: () => {
      this.performMultipleDelete(appointmentsToDelete);
    }
  });
}

private performMultipleDelete(appointmentsToDelete: any[]): void {
  this.isLoadingAppointments = true;
  
  // إنشاء array من Observable للحذف مع error handling لكل واحد
  const deleteObservables = appointmentsToDelete.map(appointment => 
    this.appointmentService.deleteAppointment(appointment._id).pipe(
      catchError(error => {
        console.error(`Failed to delete appointment ${appointment._id}:`, error);
        // إرجاع error object بدلاً من throwing
        return of({ success: false, appointmentId: appointment._id, error });
      })
    )
  );
  
  // استخدام forkJoin للتنفيذ المتوازي
  forkJoin(deleteObservables).subscribe({
    next: (results) => {
      this.handleMultipleDeleteResults(results, appointmentsToDelete.length);
    },
    error: (error) => {
      this.isLoadingAppointments = false;
      console.error('Unexpected error in multiple delete:', error);
      this.handleError('حدث خطأ غير متوقع أثناء عملية الحذف', error);
    }
  });
}

private handleMultipleDeleteResults(results: any[], totalCount: number): void {
  // تحليل النتائج
  const successCount = results.filter(result => result.success !== false).length;
  const failureCount = totalCount - successCount;
  
  // تحديث البيانات
  this.loadAppointments(); // سيوقف loading state
  this.selectedAppointmentNodes = []; // مسح التحديد
  
  // عرض الرسائل المناسبة
  if (failureCount === 0) {
    this.showSuccess(`تم حذف جميع المواعيد بنجاح (${successCount} موعد)`);
  } else if (successCount > 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'حذف جزئي',
      detail: `تم حذف ${successCount} موعد بنجاح، فشل في حذف ${failureCount} موعد`,
      life: 5000
    });
  } else {
    this.showError(`فشل في حذف جميع المواعيد المحددة`);
  }
}

  exportAppointmentsCSV(): void {
    // تنفيذ تصدير البيانات
    const csvData = this.appointments.map(appointment => ({
      'التاريخ': this.formatAppointmentDate(appointment.date),
      'الطبيب': appointment.doctor.name,
      'القسم': appointment.department.nameAr,
      'المريض': appointment.patient?.name || 'غير محدد',
      'الحالة': this.getAppointmentStatus(appointment)
    }));
    
    // يمكنك استخدام مكتبة لتصدير CSV
    console.log('Export CSV:', csvData);
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail: message,
      life: 3000
    });
  }

private handleError(defaultMessage: string, error: any): void {
  console.error('Error details:', error);
  
  let errorMessage = defaultMessage;
  
  // معالجة أنواع مختلفة من الأخطاء
  if (error?.error) {
    if (typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.error.message) {
      errorMessage = error.error.message;
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  // معالجة HTTP status codes
  switch (error?.status) {
    case 404:
      errorMessage = 'الموعد المطلوب غير موجود';
      break;
    case 401:
      errorMessage = 'غير مخول لحذف هذا الموعد. تأكد من تسجيل الدخول';
      break;
    case 403:
      errorMessage = 'ممنوع حذف هذا الموعد. تحقق من الصلاحيات';
      break;
    case 500:
      errorMessage = 'خطأ في الخادم. حاول مرة أخرى لاحقاً';
      break;
  }
  
  this.showError(errorMessage);
}
showNodeDetails(nodeData: any): void {
  switch(nodeData.type) {
    case 'doctor':
      this.viewDoctorProfile(nodeData);
      break;
    case 'department':
      this.viewDepartmentDetails(nodeData);
      break;
    case 'patient':
      this.viewPatientProfile(nodeData);
      break;
    default:
      console.warn('Unknown node type:', nodeData.type);
  }
}


  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 3000
    });
  }
}
