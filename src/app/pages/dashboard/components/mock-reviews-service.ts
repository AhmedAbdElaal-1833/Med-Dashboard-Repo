import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockReviewsService {
   private mockReviews = [
        { id: 1, userId: 20, rating: 4, comment: 'موقع ممتاز جداً، الخدمة سريعة والتعامل مهذب', createdAt: '2025-02-07T10:30:00' },
        { id: 2, userId: 13, rating: 4, comment: 'تجربة جيدة بشكل عام، لكن يحتاج تحسينات بسيطة', createdAt: '2025-08-24T14:20:00' },
        { id: 3, userId: 11, rating: 1, comment: 'خدمة سيئة جداً، وقت الاستجابة بطيء', createdAt: '2025-01-17T09:15:00' },
        { id: 4, userId: 10, rating: 4, comment: 'راضي عن الخدمة، سأستخدمها مرة أخرى', createdAt: '2025-08-15T16:45:00' },
        { id: 5, userId: 4, rating: 1, comment: 'تجربة مخيبة للآمال، لا أنصح بها', createdAt: '2025-06-18T11:30:00' },
        { id: 6, userId: 18, rating: 5, comment: 'رائع! أفضل خدمة استخدمتها، أنصح بها بشدة', createdAt: '2025-03-24T13:22:00' },
        { id: 7, userId: 6, rating: 1, comment: 'مشاكل تقنية كثيرة، الموقع يحتاج إعادة تطوير', createdAt: '2025-01-27T08:10:00' },
        { id: 8, userId: 11, rating: 1, comment: 'صعوبة في الوصول للخدمات المطلوبة', createdAt: '2025-03-18T15:45:00' },
        { id: 9, userId: 13, rating: 4, comment: 'خدمة جيدة ولكن يمكن تحسين واجهة المستخدم', createdAt: '2025-01-02T12:05:00' },
        { id: 10, userId: 4, rating: 5, comment: 'خدمة ممتازة، سرعة في التنفيذ ودقة عالية', createdAt: '2025-06-07T17:30:00' },
        { id: 11, userId: 7, rating: 3, comment: 'خدمة عادية، لا سيء ولا ممتاز', createdAt: '2025-04-12T10:20:00' },
        { id: 12, userId: 15, rating: 5, comment: 'تجربة رائعة، سأنصح أصدقائي بالموقع', createdAt: '2025-05-08T14:15:00' },
        { id: 13, userId: 8, rating: 2, comment: 'خدمة ضعيفة، تحتاج تحسينات كبيرة', createdAt: '2025-02-28T11:40:00' },
        { id: 14, userId: 19, rating: 4, comment: 'راضي بشكل عام، بعض المميزات مفيدة جداً', createdAt: '2025-07-15T16:20:00' },
        { id: 15, userId: 3, rating: 5, comment: 'الأفضل في المجال، استمروا هكذا', createdAt: '2025-08-30T09:45:00' },
        { id: 16, userId: 12, rating: 3, comment: 'مقبولة لكن تحتاج المزيد من المميزات', createdAt: '2025-03-05T13:30:00' },
        { id: 17, userId: 16, rating: 4, comment: 'خدمة موثوقة، أستخدمها بانتظام', createdAt: '2025-06-22T15:10:00' },
        { id: 18, userId: 5, rating: 2, comment: 'واجهة المستخدم صعبة الاستخدام', createdAt: '2025-04-18T08:25:00' },
        { id: 19, userId: 14, rating: 5, comment: 'خدمة عملاء ممتازة، حلوا مشكلتي بسرعة', createdAt: '2025-07-03T12:55:00' },
        { id: 20, userId: 9, rating: 3, comment: 'تجربة متوسطة، يمكن أن تكون أفضل', createdAt: '2025-05-20T14:40:00' },
        { id: 21, userId: 21, rating: 4, comment: 'خدمة جيدة وموثوقة للاستخدام اليومي', createdAt: '2025-08-05T10:15:00' },
        { id: 22, userId: 1, rating: 5, comment: 'تجربة استثنائية، تجاوزت توقعاتي', createdAt: '2025-01-15T16:30:00' },
        { id: 23, userId: 17, rating: 2, comment: 'بطء في الاستجابة وأخطاء متكررة', createdAt: '2025-02-10T09:20:00' },
        { id: 24, userId: 22, rating: 4, comment: 'أعجبني التصميم والسهولة في الاستخدام', createdAt: '2025-09-01T11:45:00' },
        { id: 25, userId: 2, rating: 5, comment: 'أفضل قرار اتخذته هو استخدام هذه الخدمة', createdAt: '2025-07-28T15:20:00' },
        { id: 26, userId: 26, rating: 4, comment: 'أعجبني التصميم والسهولة في الاستخدام', createdAt: '2025-09-02T11:45:00' },
    ];

    getReviews(): Observable<any[]> {
        return of(this.mockReviews).pipe(delay(500)); 
    }

    getReviewsWithPagination(page: number, size: number): Observable<{reviews: any[], total: number}> {
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedReviews = this.mockReviews.slice(startIndex, endIndex);
        
        return of({
            reviews: paginatedReviews,
            total: this.mockReviews.length
        }).pipe(delay(500));
    } 
}
