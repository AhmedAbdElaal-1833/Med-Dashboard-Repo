import { IconService } from './../../pages/service/icon.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User, CreateUserDto, UpdateUserDto } from '../../services/user';
import { DepartmentService } from '../../services/departments'; // 1. Import DepartmentService
import { HttpErrorResponse } from '@angular/common/http';

// نموذج Department للـ dropdown
export interface Department {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-user-management' ,
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserComponent implements OnInit {
  
  // المتغيرات الأساسية
  users: User[] = [];
  departments: Department[] = [];
  userForm: FormGroup;
  isEditMode = false;
  selectedUserId: string | null = null;
  isLoading = false;
  
  // خيارات الأدوار
  userRoles = [
    { value: 'Admin', label: 'مدير عام' },
    { value: 'DepartmentManager', label: 'مدير قسم' },
    { value: 'Doctor', label: 'طبيب' },
    { value: 'Nurse', label: 'ممرضة' },
    { value: 'Staff', label: 'موظف' },
    { value: 'Patient', label: 'مريض' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private departmentService: DepartmentService // 2. Inject DepartmentService
    // private toastr: ToastrService  // اختياري للـ notifications
  ) {
    // إنشاء النموذج
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      role: ['', [Validators.required]],
      departmentId: [''],
      password: ['', [Validators.required, Validators.minLength(6)]], // للمستخدمين الجدد
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadDepartments();
  }

  // تحميل المستخدمين
  loadUsers(): void {
    this.isLoading = true;
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        console.log('تم تحميل المستخدمين بنجاح:', users);
      },
      error: (error) => {
        console.error('خطأ في تحميل المستخدمين:', error);
        this.isLoading = false;
        
        // عرض رسالة خطأ للمستخدم
        alert('فشل في تحميل المستخدمين. تحقق من الاتصال بالخادم.');
        
        // يمكنك استخدام toastr بدلاً من alert
        // this.toastr.error('فشل في تحميل المستخدمين');
      }
    });
  }

  // تحميل الأقسام (إذا كان عندك departments endpoint)
  loadDepartments(): void {
    // 3. Use the service to fetch real data
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        console.log('Departments loaded successfully:', departments);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        alert('Failed to load departments. Please check server connection.');
      }
    });
  }

  // إضافة/تحديث مستخدم
  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.isEditMode && this.selectedUserId) {
        // تحديث - احذف password من البيانات
        const { password, ...updateData } = userData;
        this.updateUser(this.selectedUserId, updateData);
      } else {
        // إضافة جديد - تأكد من وجود password
        this.createUser(userData);
      }
    } else {
      this.markFormGroupTouched();
      alert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
    }
  }

  // إنشاء مستخدم جديد
  createUser(userData: CreateUserDto): void {
    this.userService.createUser(userData).subscribe({
      next: (HttpErrorResponse : any)=> {

        console.log('تم إنشاء المستخدم بنجاح:', HttpErrorResponse); 
        
        // إعادة تحميل المستخدمين
        this.loadUsers();   
        this.resetForm();
        
        alert('تم إنشاء المستخدم بنجاح');
        // this.toastr.success('تم إنشاء المستخدم بنجاح');
          },
      error: (error) => {
        console.error('خطأ في إنشاء المستخدم:', error);
        
        // معالجة الأخطاء المختلفة
        let errorMessage = 'فشل في إنشاء المستخدم';
        
        if (error.status === 400) {
          errorMessage = 'بيانات غير صحيحة';
        } else if (error.status === 401) {
          errorMessage = 'غير مصرح لك بهذا الإجراء';
        } else if (error.status === 409) {
          errorMessage = 'البريد الإلكتروني موجود بالفعل';
        }
        
        alert(errorMessage);
        // this.toastr.error(errorMessage);
      }
    });
  }

  // تحديث مستخدم
  updateUser(id: string, userData: UpdateUserDto): void {
    this.userService.updateUser(id, userData).subscribe({
      next: (response) => {
        console.log('تم تحديث المستخدم بنجاح:', response);
        
        this.loadUsers();
        this.resetForm();
        
        alert('تم تحديث المستخدم بنجاح');
        // this.toastr.success('تم تحديث المستخدم بنجاح');
      },
      error: (error : HttpErrorResponse) => {

        console.error('خطأ في تحديث المستخدم:', error);
        
        let errorMessage = 'فشل في تحديث المستخدم';     
        
        if (error.status === 404) {
          errorMessage = 'المستخدم غير موجود';
        } else if (error.status === 401) {
          errorMessage = 'غير مصرح لك بهذا الإجراء';
        } else if (error.status === 404) {
          errorMessage = 'المستخدم غير موجود';    
        }
        
        alert(errorMessage);
        // this.toastr.error(errorMessage);
      }
    });
  }

  // تحديد مستخدم للتعديل
  editUser(user: User): void {
    this.isEditMode = true;
    this.selectedUserId = user._id!;
    
    // إخفاء حقل password في وضع التعديل
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      departmentId: user.departmentId || '',
      isActive: user.isActive
    });
  }

  // حذف مستخدم
  deleteUser(id: string): void {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ ��ا يمكن التراجع عن هذا الإجراء.')) {
      this.userService.deleteUser(id).subscribe({
        next: (HttpErrorResponse) => {
          console.log('تم حذف المستخدم بنجاح:', Response); 
          
          this.loadUsers();
          
          alert('تم حذف المستخدم بنجاح');
          // this.toastr.success('تم حذف المستخدم بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حذف المستخدم:', error);
          
          let errorMessage = 'فشل في حذف المستخدم';
          
          if (error.status === 403) {
            errorMessage = 'لا يمكن حذف هذا المستخدم';
          } else if (error.status === 404) {
            errorMessage = 'المستخدم غير موجود';
          }
          
          alert(errorMessage);
          // this.toastr.error(errorMessage);
        }
      });
    }
  }

  // إعادة تعيين النموذج
  resetForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({ isActive: true });
    
    // Always restore password validation on reset
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.isEditMode = false;
    this.selectedUserId = null;
  }

  // باقي الـ methods زي ما هي...
  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['email']) {
        return 'البريد الإلكتروني غير صحيح';
      }
      if (field.errors['minlength']) {
        return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
      }
    }
    
    return '';
  }

  getDepartmentName(departmentId: string): string {
    const department = this.departments.find(d => d._id === departmentId);
    return department ? department.name : 'غير محدد';
  }

  getRoleLabel(role: string): string {
    const roleObj = this.userRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  // دالة للـ trackBy في ngFor (تحسين الأداء)
  trackByUserId(index: number, user: User): string {
    return user._id || index.toString();
  }
}