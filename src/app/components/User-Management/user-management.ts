import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { Table, TableModule, TableLazyLoadEvent } from 'primeng/table';
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
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService, CreateUserDto, UpdateUserDto } from '../../services/user';
import { DepartmentService } from '../../services/departments';

interface ExportColumn {
  title: string;
  dataKey: string;
}
interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  role: string;
  department?: string;
  departmentId?: string;
  isActive?: boolean;
  is_verified?: boolean;
  password?: string;
  specialization?: string;
  specializationAr?: string;
  jobTitle?: string;     
  jobTitleAr?: string; 
  birthDate?: string | Date;
  bloodType?: string;
  allergies?: string[];
  createdAt?: string;
  updatedAt?: string;
  shift?: {
    day: number[];  // 0=Sunday, 1=Monday, etc.
    startTime: string;
    endTime: string;
  };
}

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule,
    FormsModule,
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
    PasswordModule,
    AvatarModule,
    TooltipModule,
    DatePickerModule
  ],
  templateUrl: './user-management.html',
  styleUrls: ['user-management.scss'],
  providers: [MessageService, ConfirmationService]
})
export class UserComponent implements OnInit {
  
  // Dialog and form states
  userDialog: boolean = false;
  user: User = {} as User;
  submitted: boolean = false;
  isEditMode: boolean = false;
  
  // Data arrays
  users: User[] = [];
  selectedUsers: User[] = [];
  departments: any[] = [];
  
  // Loading and pagination states
  isLoading: boolean = false;
  totalRecords: number = 0;
  
  // Table reference
  @ViewChild('dt') dt!: Table;
  
  // Export columns
  exportColumns!: ExportColumn[];
  cols!: Column[];
  
  // Search and filter states
  searchTerm: string = '';
  selectedRole: string = '';
  selectedDepartment: string = '';
  selectedStatus: string = 'all'; // 'all', 'active', 'inactive'
  
  // Role options
  userRoles = [
    // { value: 'Admin', label: 'مدير عام' },
    { value: 'DepartmentManager', label: 'مدير قسم' },
    { value: 'Doctor', label: 'طبيب' },
    { value: 'Nurse', label: 'ممرضة' },
    { value: 'Staff', label: 'موظف' },
    { value: 'Patient', label: 'مريض' }
  ];

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}


genderOptions = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' }
];

// Blood types for patients
bloodTypes = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];
// إضافة متغيرات للـ shift في الكلاس
shiftDays: boolean[] = [false, false, false, false, false, false, false]; // Sun-Sat
shiftStartTime: string = '09:00';
shiftEndTime: string = '17:00';

// أيام الأسبوع للعرض
weekDays = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' }
];

// Helper methods
getGenderLabel(gender: string): string {
  return gender === 'male' ? 'ذكر' : 'أنثى';
}


getUserStatus(user: any): string {
  if (user.is_verified === false) return 'غير مؤكد';
  if (user.isActive === false) return 'غير نشط';
  return 'نشط';
}

getUserStatusSeverity(user: any): string {
  if (user.is_verified === false) return 'warning';
  if (user.isActive === false) return 'danger';
  return 'success';
}

formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

viewUser(user: any): void {
  // إظهار تفاصيل المستخدم
  console.log('View user details:', user);
}

// التحقق من وجود job title للموظفين
shouldShowJobTitle(): boolean {
  return this.user.role === 'Staff';
}

// تحديث User interface

// تحديث loadUsersLazy للعمل بدون lazy loading
ngOnInit(): void {
  this.loadDepartments();
  this.initializeColumns();
  this.loadUsers(); // استدعاء مباشر
}

loadUsers(): void {
  this.isLoading = true;
  
  this.userService.getUsers(1, 50).subscribe({ 
    next: (response: any) => {
      console.log('API Response:', response);
      
      if (response) {
        this.users = response.data.users;
        console.log('API Response:===============>', this.users);
        this.totalRecords = response.length;
      } else if (response.data && Array.isArray(response.data)) {
        this.users = response.data;
        this.totalRecords = response.data.length;
      } else if (response.users) {
        this.users = response.users;
        this.totalRecords = response.pagination?.total || response.users.length;
      }
      
      console.log('Users loaded:', this.users.length);
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error:', error);
      this.isLoading = false;
      this.handleError('فشل في تحميل المستخدمين', error);
    }
  });
}

  // Initialize export columns
  initializeColumns(): void {
    this.cols = [
      { field: '_id', header: 'ID' },
      { field: 'name', header: 'الاسم' },
      { field: 'email', header: 'البريد الإلكتروني' },
      { field: 'phone', header: 'الهاتف' },
      { field: 'role', header: 'الدور' },
      { field: 'departmentId', header: 'القسم' },
      { field: 'isActive', header: 'الحالة' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

// Load users with lazy loading (PrimeNG Table format)
loadUsersLazy(event: TableLazyLoadEvent): void {
  console.log('Lazy Load Event:', event); // للتشخيص
  
  this.isLoading = true;
  
  // Calculate page and limit from PrimeNG event
  const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
  const limit = event.rows || 10;
  
  console.log('Requesting page:', page, 'limit:', limit); // للتشخيص
  
  this.userService.getUsers(page, limit).subscribe({
    next: (response: any) => {
      console.log('API Response:', response); // للتشخيص
      
      // تحقق من بنية الاستجابة المختلفة
      if (response && response.users && response.pagination) {
        // بنية مع pagination منفصلة
        this.users = response.users;
        this.totalRecords = response.pagination.total;
        console.log('Users loaded (format 1):', this.users.length);
      } else if (response && response.data) {
        // بنية متداخلة
        if (response.data.users && response.data.pagination) {
          this.users = response.data.users;
          this.totalRecords = response.data.pagination.total;
          console.log('Users loaded (format 2):', this.users.length);
        } else if (response.data.users) {
          this.users = response.data.users;
          this.totalRecords = response.data.users.length;
          console.log('Users loaded (format 3):', this.users.length);
        }
      } else if (Array.isArray(response)) {
        // مصفوفة مباشرة
        this.users = response;
        this.totalRecords = response.length;
        console.log('Users loaded (format 4):', this.users.length);
      } else {
        console.warn('Unexpected response format:', response);
        this.users = [];
        this.totalRecords = 0;
      }
      
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading users:', error);
      this.isLoading = false;
      this.users = [];
      this.totalRecords = 0;
      this.handleError('فشل في تحميل المستخدمين', error);
    }
  });
}

  // Load all users (fallback method)
  loadAllUsers(): void {
    this.isLoading = true;
    
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        this.users = users.data?.users || users.users || users;
        this.totalRecords = users.data?.pagination?.total || users.pagination?.total || users.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('فشل في تحميل المستخدمين', error);
      }
    });
  }

  // Load departments
  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (response: any) => {
        this.departments = response.data?.departments || response.departments || response;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  // Search functionality
  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.dt.reset();
      return;
    }

    this.isLoading = true;
    this.userService.searchUsers(this.searchTerm).subscribe({
      next: (users: any) => {
        this.users = users;
        this.totalRecords = users.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('فشل في البحث', error);
      }
    });
  }

  // Filter users by role
  filterByRole(): void {
    if (!this.selectedRole) {
      this.dt.reset();
      return;
    }

    this.isLoading = true;
    this.userService.getUsersByRole(this.selectedRole).subscribe({
      next: (users: any) => {
        this.users = users;
        this.totalRecords = users.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('فشل في الفلترة', error);
      }
    });
  }

  // Filter users by department
  filterByDepartment(): void {
    if (!this.selectedDepartment) {
      this.dt.reset();
      return;
    }

    this.isLoading = true;
    this.userService.getUsersByDepartment(this.selectedDepartment).subscribe({
      next: (users: any) => {
        this.users = users;
        this.totalRecords = users.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('فشل في الفلترة', error);
      }
    });
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedDepartment = '';
    this.selectedStatus = 'all';
    this.dt.reset();
  }

  // Open new user dialog
 // Open new user dialog - محدث
openNew(): void {
  this.user = { 
    isActive: true,
    gender: 'male'
  } as User;
  
  // إعادة تعيين قيم الـ shift
  this.resetShiftData();
  
  this.submitted = false;
  this.isEditMode = false;
  this.userDialog = true;
}

// Edit user - محدث
editUser(user: User): void {
  this.user = { ...user };
  
  // تعبئة بيانات الـ shift إذا كانت موجودة
  this.loadShiftData(user);
  
  this.isEditMode = true;
  this.userDialog = true;
}

// إعادة تعيين بيانات الوردية
private resetShiftData(): void {
  this.shiftDays = [false, false, false, false, false, false, false];
  this.shiftStartTime = '09:00';
  this.shiftEndTime = '17:00';
}

// تحميل بيانات الوردية للتعديل
private loadShiftData(user: User): void {
  if (user.shift) {
    this.shiftDays = [false, false, false, false, false, false, false];
    if (user.shift.day) {
      user.shift.day.forEach(day => {
        if (day >= 0 && day <= 6) {
          this.shiftDays[day] = true;
        }
      });
    }
    this.shiftStartTime = user.shift.startTime || '09:00';
    this.shiftEndTime = user.shift.endTime || '17:00';
  } else {
    this.resetShiftData();
  }
}


  // Hide dialog
  hideDialog(): void {
    this.userDialog = false;
    this.submitted = false;
    this.isEditMode = false;
  }

  // Save user (create or update)
  saveUser(): void {
    this.submitted = true;

    if (!this.validateUser()) {
      return;
    }

    if (this.isEditMode && this.user._id) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }
// التحقق من وجود shift للمستخدم
shouldShowShift(): boolean {
  return ['Doctor', 'Nurse', 'Staff', 'DepartmentManager'].includes(this.user.role || '');
}

// التحقق من وجود specialization للمستخدم
shouldShowSpecialization(): boolean {
  return ['Doctor', 'DepartmentManager'].includes(this.user.role || '');
}

// التحقق من وجود medical info للمرضى
shouldShowMedicalInfo(): boolean {
  return this.user.role === 'Patient';
}

// تحويل أرقام الأيام إلى أسماء
getShiftDaysNames(days: number[]): string {
  return days.map(day => this.weekDays.find(wd => wd.value === day)?.label || '').join(', ');
}

  // Validate user data
// Validate user data - محدث
private validateUser(): boolean {
  if (!this.user.name?.trim()) {
    this.showError('الاسم مطلوب');
    return false;
  }
  if (!this.user.email?.trim()) {
    this.showError('البريد الإلكتروني مطلوب');
    return false;
  }
  if (!this.user.phone?.trim()) {
    this.showError('رقم الهاتف مطلوب');
    return false;
  }
  if (!this.user.role?.trim()) {
    this.showError('الدور مطلوب');
    return false;
  }
  if (!this.user.gender?.trim()) {
    this.showError('الجنس مطلوب');
    return false;
  }
  if (!this.isEditMode && !this.user.password?.trim()) {
    this.showError('كلمة المرور مطلوبة');
    return false;
  }

  // التحقق من وجود department للجميع ما عدا المدير العام
  if (this.user.role !== 'Admin' && !this.user.department?.trim()) {
    this.showError('القسم مطلوب');
    return false;
  }

  // التحقق من بيانات الوردية للموظفين
  if (this.shouldShowShift()) {
    if (!this.hasSelectedShiftDays()) {
      this.showError('يجب اختيار يوم واحد على الأقل للعمل');
      return false;
    }
    if (!this.shiftStartTime) {
      this.showError('وقت بداية العمل مطلوب');
      return false;
    }
    if (!this.shiftEndTime) {
      this.showError('وقت نهاية العمل مطلوب');
      return false;
    }
    if (this.shiftStartTime >= this.shiftEndTime) {
      this.showError('وقت النهاية يجب أن يكون أكبر من وقت البداية');
      return false;
    }
  }

  return true;
}

// التحقق من وجود أيام محددة للعمل
hasSelectedShiftDays(): boolean {
  return this.shiftDays.some(day => day === true);
}

  // Create new user
// Create new user - مع إنشاء object مثل المطلوب
// Create new user - محدث مع معالجة الأخطاء
private createUser(): void {
  // إنشاء object للـ shift إذا كان المستخدم يحتاج وردية
  const selectedDays = this.shiftDays
    .map((selected, index) => selected ? index : -1)
    .filter(day => day !== -1);

  const createUserData: any = {
    name: this.user.name.trim(),
    email: this.user.email.trim(),
    password: this.user.password,
    phone: this.user.phone.trim(),
    gender: this.user.gender,
    role: this.user.role
  };

  // إضافة department (مطلوب لجميع الأدوار ما عدا Admin)
  if (this.user.role !== 'Admin') {
    if (this.user.department) {
      createUserData.department = this.user.department;
    } else {
      this.showError('القسم مطلوب لهذا الدور');
      return;
    }
  }

  // إضافة specialization للأطباء ومدراء الأقسام
  if (this.shouldShowSpecialization()) {
    if (this.user.specialization) {
      createUserData.specialization = this.user.specialization.trim();
    }
    if (this.user.specializationAr) {
      createUserData.specializationAr = this.user.specializationAr.trim();
    }
  }
  // إضافة job title للموظفين - إضافة جديدة
  if (this.shouldShowJobTitle()) {
    if (this.user.jobTitle) {
      createUserData.jobTitle = this.user.jobTitle.trim();
    }
    if (this.user.jobTitleAr) {
      createUserData.jobTitleAr = this.user.jobTitleAr.trim();
    }
  }
  // إضافة shift للأطباء والموظفين (مطلوبة)
  if (this.shouldShowShift()) {
    if (selectedDays.length > 0 && this.shiftStartTime && this.shiftEndTime) {
      createUserData.shift = {
        day: selectedDays,
        startTime: this.shiftStartTime,
        endTime: this.shiftEndTime
      };
    } else {
      this.showError('معلومات الوردية مطلوبة لهذا الدور');
      return;
    }
  }

  // إضافة الحقول الأخرى للمرضى
  if (this.shouldShowMedicalInfo()) {
    if (this.user.bloodType) createUserData.bloodType = this.user.bloodType;
    if (this.user.allergies?.length) createUserData.allergies = this.user.allergies;
    if (this.user.birthDate) createUserData.birthDate = this.user.birthDate;
  }

  console.log('Creating user with data:', createUserData);

  this.userService.createUser(createUserData).subscribe({
    next: (response) => {
      this.dt.reset();
      this.showSuccess('تم إنشاء المستخدم بنجاح');
      this.hideDialog();
    },
    error: (error) => {
      console.error('Create user error:', error);
      this.handleCreateUserError(error);
    }
  });
}


  // Update existing user
  private updateUser(): void {
    const { password, ...updateData } = this.user;
    
    this.userService.updateUser(this.user._id!, updateData).subscribe({
      next: () => {
        this.dt.reset();
        this.showSuccess('تم تحديث المستخدم بنجاح');
        this.hideDialog();
      },
      error: (error) => {
        this.handleError('فشل في تحديث المستخدم', error);
      }
    });
  }

  // Toggle user status
  toggleUserStatus(user: User): void {
    if (!user._id) return;

    this.userService.toggleUserStatus(user._id, !user.isActive).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.showSuccess(`تم ${user.isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم`);
      },
      error: (error) => {
        this.handleError('فشل في تغيير حالة المستخدم', error);
      }
    });
  }

  // Delete single user
  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المستخدم ${user.name}؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        if (user._id) {
          this.userService.deleteUser(user._id).subscribe({
            next: () => {
              this.dt.reset();
              this.showSuccess('تم حذف المستخدم بنجاح');
            },
            error: (error) => {
              this.handleError('فشل في حذف المستخدم', error);
            }
          });
        }
      }
    });
  }

  // Delete selected users
  deleteSelectedUsers(): void {
    if (!this.selectedUsers || this.selectedUsers.length === 0) return;

    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف المستخدمين المحددين؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.bulkDeleteUsers();
      }
    });
  }

  // Bulk delete users
  private bulkDeleteUsers(): void {
    const usersToDelete = [...this.selectedUsers];
    let successCount = 0;
    let errorCount = 0;

    const handleCompletion = () => {
      if (successCount + errorCount === usersToDelete.length) {
        this.dt.reset();
        
        if (successCount > 0) {
          this.showSuccess(`تم حذف ${successCount} مستخدم بنجاح`);
        }
        
        if (errorCount > 0) {
          this.showError(`فشل في حذف ${errorCount} مستخدم`);
        }
        
        this.selectedUsers = [];
      }
    };

    usersToDelete.forEach(user => {
      if (user._id) {
        this.userService.deleteUser(user._id).subscribe({
          next: () => {
            successCount++;
            handleCompletion();
          },
          error: () => {
            errorCount++;
            handleCompletion();
          }
        });
      }
    });
  }

  // Global filter for search
  onGlobalFilter(table: Table, event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  // Export to CSV
  exportCSV(): void {
    this.dt.exportCSV();
  }

  // Helper methods
  getRoleLabel(role: string): string {
    const roleObj = this.userRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getRoleSeverity(role: string): string {
    const severityMap: { [key: string]: string } = {
      'Admin': 'danger',
      'DepartmentManager': 'warning',
      'Doctor': 'success',
      'Nurse': 'info',
      'Staff': 'secondary',
      'Patient': 'primary'
    };
    return severityMap[role] || 'secondary';
  }

  getUserAvatarColor(role: string): string {
    const colorMap: { [key: string]: string } = {
      'Admin': '#dc3545',
      'DepartmentManager': '#ffc107',
      'Doctor': '#28a745',
      'Nurse': '#17a2b8',
      'Staff': '#6c757d',
      'Patient': '#007bff'
    };
    return colorMap[role] || '#6c757d';
  }


getDepartmentName(departmentId: string): string {
  if (!departmentId) return 'غير محدد';
  const department = this.departments.find(d => d._id === departmentId || d.id === departmentId);
  return department ? department.name : 'غير محدد';
}

  // Message helpers


  private handleError(defaultMessage: string, error: any): void {
    const errorMessage = error?.error?.message || defaultMessage;
    this.showError(errorMessage);
  }
  // Message helpers
  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail: message,
      life: 3000
    });
  }


  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 3000
    });
  }
  // معالجة أخطاء إنشاء المستخدم
private handleCreateUserError(error: any): void {
  console.log('Error details:', error);
  
  let errorMessage = 'فشل في إنشاء المستخدم';
  
  if (error?.error?.message) {
    const apiMessage = error.error.message;
    
    // ترجمة رسائل الخطأ الإنجليزية
    if (apiMessage.includes('Department ID is required')) {
      errorMessage = 'معرف القسم مطلوب';
    } else if (apiMessage.includes('Department ID must be a valid MongoDB ObjectId')) {
      errorMessage = 'معرف القسم غير صحيح';
    } else if (apiMessage.includes('Shift details are required')) {
      errorMessage = 'تفاصيل الوردية مطلوبة';
    } else if (apiMessage.includes('email already exists')) {
      errorMessage = 'البريد الإلكتروني مستخدم من قبل';
    } else if (apiMessage.includes('phone already exists')) {
      errorMessage = 'رقم الهاتف مستخدم من قبل';
    } else {
      errorMessage = apiMessage;
    }
  }
  
  this.showError(errorMessage);
}

}
