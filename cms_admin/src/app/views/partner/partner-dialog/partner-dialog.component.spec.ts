import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerDialogComponent } from './partner-dialog.component';

describe('PartnerDialogComponent', () => {
    let component: PartnerDialogComponent;
    let fixture: ComponentFixture<PartnerDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PartnerDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PartnerDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
