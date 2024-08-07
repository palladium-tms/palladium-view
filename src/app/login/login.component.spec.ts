import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Import MatInputModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import BrowserAnimationsModule

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let cdSpy: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['login', 'logout']);
    cdSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'detach']);

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        ReactiveFormsModule,
        MatCardModule, // Add MatCardModule to imports
        MatFormFieldModule, // Add MatFormFieldModule to imports
        MatInputModule, // Add MatInputModule to imports
        BrowserAnimationsModule // Add BrowserAnimationsModule for Angular Material animations
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: ChangeDetectorRef, useValue: cdSpy }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get email form control', () => {
    expect(component.email instanceof FormControl).toBe(true);
  });

  it('should get password form control', () => {
    expect(component.password instanceof FormControl).toBe(true);
  });

  it('should navigate to "/" after successful login', async () => {
    authServiceSpy.login.and.returnValue(Promise.resolve());
    await component.login();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBe(false);
  });
});
