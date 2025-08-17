import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';

import { Component, inject, signal, ViewChild } from '@angular/core';
import { DepartmentService } from '@/services/departments';
import { Idepartment } from '@/idepartment';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-departments-managment',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule
],
  templateUrl: './departments-managment.html',
  styleUrl: './departments-managment.scss',
  providers: [MessageService, ConfirmationService],
})
export class DepartmentsManagment {
  departmentDialog: boolean = false;

  departments = signal<Idepartment[]>([]);

  department!: Idepartment;

  selectedDepartments!: Idepartment[] | null;

  submitted: boolean = false;

  statuses!: any[];

  @ViewChild('dt') dt!: Table;

  exportColumns!: ExportColumn[];

  cols!: Column[];

  constructor(
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private departmentsService:DepartmentService
  ) {}
  exportCSV() {
      this.dt.exportCSV();
  }

  ngOnInit() {
    this.getDepartments();
  }
getDepartments(){
    this.departmentsService.getDepartments().subscribe({
      next: (response: any) => {
        // Extract departments array from the API response
        const departments = response.data?.departments || response.departments || response;
        this.departments.set(departments);
        console.log('Departments loaded:', departments);
      },
      error: (error: any) => {
        console.log("error=================>", error);
      },
      complete: () => {
        console.log('complete=================>');
      }
    });

    this.cols = [
        { field: '_id', header: 'ID' },
        { field: 'name', header: 'Name' },
        { field: 'nameAr', header: 'Name (Arabic)' },
        { field: 'description', header: 'Description' },
        { field: 'descriptionAr', header: 'Description (Arabic)' },
        { field: 'staffCount', header: 'Staff Count' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
}


  saveDepartment(){
    this.submitted = true;
    if (this.department.name?.trim()) {
      if (this.department._id) {
        this.departmentsService.updateDepartment(this.department._id,this.department).subscribe({
          next:()=>{
            this.getDepartments();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Department Updated', life: 3000 });
          },
          error:(err)=>{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 3000 });
          }
        })
      } else {
        this.departmentsService.createDepartment(this.department).subscribe({
          next:()=>{
            this.getDepartments();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Department Created', life: 3000 });
          },
          error:(err)=>{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 3000 });
          }
        })
      }
      this.departmentDialog = false;
      this.department = {} as Idepartment;
    }
  }

  onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
      this.department = {} as Idepartment;
      this.submitted = false;
      this.departmentDialog = true;
  }

  editDepartment(department: Idepartment) {
      this.department = { ...department };
      this.departmentDialog = true;
  }

  deleteSelectedDepartments() {
    if (!this.selectedDepartments || this.selectedDepartments.length === 0) {
        return;
    }
    const departmentsToDelete = [...this.selectedDepartments];

    this.confirmationService.confirm({
        message: 'Are you sure you want to delete the selected departments?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            let successCount = 0;
            let errorCount = 0;

            const handleCompletion = () => {
                if (successCount + errorCount === departmentsToDelete.length) {
                    this.getDepartments();
                    if (successCount > 0) {
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: `${successCount} Departments Deleted`, life: 3000 });
                    }
                    if (errorCount > 0) {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: `${errorCount} Departments could not be deleted`, life: 3000 });
                    }
                    this.selectedDepartments = null;
                }
            };

            departmentsToDelete.forEach((department) => {
                this.departmentsService.deleteDepartment(department._id).subscribe({
                    next: () => {
                        successCount++;
                        handleCompletion();
                    },
                    error: () => {
                        errorCount++;
                        handleCompletion();
                    }
                });
            });
        }
    });
}

  hideDialog() {
      this.departmentDialog = false;
      this.submitted = false;
  }

  deleteDepartment(department: Idepartment) {
      this.confirmationService.confirm({
          message: 'Are you sure you want to delete ' + department.name + '?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.departmentsService.deleteDepartment(department._id).subscribe({
              next:()=>{
                this.getDepartments();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Successful',
                  detail: 'Department Deleted',
                  life: 3000
              });
              },
              error:(error:any)=>{
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: error.message,
                  life: 3000
              });
              }
            })
          }
      });
  }
}