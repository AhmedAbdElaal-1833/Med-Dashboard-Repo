import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@/services/user';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule,ProgressSpinnerModule,SkeletonModule],
    template: `
    <div class="grid grid-cols-12 gap-4">
    <!-- Patient Card -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Patients</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ roleStats.Patient || 0 }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" 
                     style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-user text-blue-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ getPatientPercentage() }}% </span>
            <span class="text-muted-color">of total users</span>
        </div>
    </div>

    <!-- Doctor Card -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Doctors</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ roleStats.Doctor || 0 }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" 
                     style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-heart text-green-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ getActiveDoctors() }} </span>
            <span class="text-muted-color">currently active</span>
        </div>
    </div>

    <!-- Nurse Card -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Nurses</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ roleStats.Nurse || 0 }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" 
                     style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-shield text-purple-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ getNursePercentage() }}% </span>
            <span class="text-muted-color">of medical staff</span>
        </div>
    </div>

    <!-- Admin Card -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Admins</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ roleStats.Admin || 0 }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" 
                     style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-cog text-orange-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ getRecentlyRegistered() }} </span>
            <span class="text-muted-color">new this week</span>
        </div>
    </div>

    <!-- Total Users Card -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-12">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Total Users</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ users.length }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" 
                     style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-users text-cyan-500 text-xl!"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ getVerifiedUsers() }} </span>
            <span class="text-muted-color">verified accounts</span>
        </div>
    </div>

<!-- Loading Skeleton -->
<div *ngIf="isLoading" class="grid grid-cols-12 gap-4">
    <div *ngFor="let i of [1,2,3,4]" class="col-span-12 lg:col-span-6 xl:col-span-6">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div class="w-full">
                    <p-skeleton height="1rem" class="mb-4" width="60%"></p-skeleton>
                    <p-skeleton height="1.5rem" width="40%"></p-skeleton>
                </div>
                <p-skeleton shape="circle" size="2.5rem"></p-skeleton>
            </div>
            <p-skeleton height="1rem" width="80%"></p-skeleton>
        </div>
    </div>
</div>


    `
})
export class StatsWidget {
    users: any[] = []; // تأكد إنها array فاضية في البداية
    isLoading = false;
    totalRecords = 0;
    roleStats: any = {
        Patient: 0,
        Doctor: 0,
        Nurse: 0,
        Admin: 0
    };
    constructor(private userService: UserService) {}

    ngOnInit(): void {
        // Provide default values for TableLazyLoadEvent
        this.loadAllUsers({ first: 0, rows: 50 } as TableLazyLoadEvent);
    }

    loadAllUsers(event: TableLazyLoadEvent): void {
        this.isLoading = true;
          // Calculate page and limit from PrimeNG event
        const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
        const limit = event.rows || 10;
        
        console.log('Requesting page:', page, 'limit:', limit); // للتشخيص
        this.userService.getUsers(page, limit).subscribe({
            next: (users: any) => {
                this.users = users.data?.users || users.users || users;
                this.totalRecords = users.data?.pagination?.total || users.pagination?.total || users.length;
                this.calculateRoleStats();
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this.handleError('فشل في تحميل المستخدمين', error);
            }
        });
    }

    calculateRoleStats(): void {
        this.roleStats = {
            Patient: 0,
            Doctor: 0,
            Nurse: 0,
            Admin: 0
        };

        this.users.forEach(user => {
            if (this.roleStats.hasOwnProperty(user.role)) {
                this.roleStats[user.role]++;
            }
        });
    }



    handleError(message: string, error: any): void {
        console.error(message, error);
        // Handle error display
    }
    getPatientPercentage(): number {
    if (this.users.length === 0) return 0;
    return Math.round((this.roleStats.Patient / this.users.length) * 100);
}

getNursePercentage(): number {
    const medicalStaff = this.roleStats.Doctor + this.roleStats.Nurse;
    if (medicalStaff === 0) return 0;
    return Math.round((this.roleStats.Nurse / medicalStaff) * 100);
}

getActiveDoctors(): number {
    return this.users.filter(user => 
        user.role === 'Doctor' && user.shift?.days?.length > 0
    ).length;
}

getRecentlyRegistered(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.users.filter(user => 
        new Date(user.createdAt) >= oneWeekAgo
    ).length;
}

getVerifiedUsers(): number {
    return this.users.filter(user => user.is_verified === true).length;
}

// لو عايز تعرض بيانات إضافية
getMaleUsers(): number {
    return this.users.filter(user => user.gender === 'male').length;
}

getFemaleUsers(): number {
    return this.users.filter(user => user.gender === 'female').length;
}

getUsersWithAllergies(): number {
    return this.users.filter(user => 
        user.allergies && user.allergies.length > 0
    ).length;
}

}
