import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAndFeedbackComponent } from './contact-and-feedback.component';

describe('ContactAndFeedbackComponent', () => {
    let component: ContactAndFeedbackComponent;
    let fixture: ComponentFixture<ContactAndFeedbackComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ContactAndFeedbackComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ContactAndFeedbackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
