import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalIntroduceComponent } from './portal-introduce.component';

describe('PortalIntroduceComponent', () => {
    let component: PortalIntroduceComponent;
    let fixture: ComponentFixture<PortalIntroduceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PortalIntroduceComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PortalIntroduceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
