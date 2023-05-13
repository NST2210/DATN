import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalIntroduceDialogComponent } from './portal-introduce-dialog.component';

describe('PortalIntroduceDialogComponent', () => {
    let component: PortalIntroduceDialogComponent;
    let fixture: ComponentFixture<PortalIntroduceDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PortalIntroduceDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PortalIntroduceDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
