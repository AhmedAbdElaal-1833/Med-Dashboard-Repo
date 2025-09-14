import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { debounceTime, Subscription } from 'rxjs';
import { MockReviewsService } from '../../components/mock-reviews-service';
import { LayoutService } from '@/layout/service/layout.service';
import { UserService } from '@/services/user';

@Component({
  standalone: true,
  selector: 'app-revenue',
  imports: [ChartModule, ProgressSpinnerModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './revenue.html',
  styleUrl: './revenue.scss'
})
export class Revenue {

    chartData: any;
    chartOptions: any;
    subscription!: Subscription;
    reviews: any[] = [];
    loading: boolean = false;
    users: any[] = [];
    isLoading = false;
    totalRecords = 0;
    roleStats: any = {};
    constructor(
        public layoutService: LayoutService,
        private mockReviewsService: MockReviewsService,
        private userService: UserService
    ) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe(() => {
                this.initChart();
            });
    }

    ngOnInit() {
        this.loadReviews();
    }

    loadReviews() {
        this.loading = true;
        this.mockReviewsService.getReviews().subscribe({
            next: (reviews) => {
                this.reviews = reviews;
                this.loading = false;
                this.initChart();
            },
            error: (error) => {
                console.error('Error loading reviews:', error);
                this.loading = false;
            }
        });
    }

    initChart() {
        if (this.reviews.length === 0) return;

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        // تجميع الريفيوهات حسب الريتنج
        const ratingCounts = this.groupReviewsByRating();

        this.chartData = {
            labels: ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'],
            datasets: [
                {
                    label: 'عدد الريفيوهات',
                    backgroundColor: [
                        '#ef4444', // أحمر للـ 1 نجمة
                        '#f97316', // برتقالي للـ 2 نجمة  
                        '#eab308', // أصفر للـ 3 نجوم
                        '#3b82f6', // أزرق للـ 4 نجوم
                        '#22c55e'  // أخضر للـ 5 نجوم
                    ],
                    data: [
                        ratingCounts[1] || 0,
                        ratingCounts[2] || 0,
                        ratingCounts[3] || 0,
                        ratingCounts[4] || 0,
                        ratingCounts[5] || 0
                    ],
                    barThickness: 100,
                    borderRadius: 4
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: false // مخفي لأن الألوان واضحة
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const percentage = ((context.parsed.y / this.reviews.length) * 100).toFixed(1);
                            return `${context.parsed.y} ريفيو (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textMutedColor,
                        font: {
                            family: 'Cairo, sans-serif'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textMutedColor,
                        stepSize: 1
                    },
                    grid: {
                        color: borderColor,
                        drawTicks: false
                    }
                }
            }
        };
    }

    groupReviewsByRating(): { [key: number]: number } {
        const ratingCounts: { [key: number]: number } = {};
        
        this.reviews.forEach(review => {
            ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
        });

        return ratingCounts;
    }

    getAverageRating(): number {
        if (this.reviews.length === 0) return 0;
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round((sum / this.reviews.length) * 10) / 10;
    }

    getRecentReviewsCount(): number {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.reviews.filter(review => {
            const reviewDate = new Date(review.createdAt);
            return reviewDate.getMonth() === currentMonth && 
                   reviewDate.getFullYear() === currentYear;
        }).length;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
