import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Role } from "../../shared/types/global.interface";

@Injectable({
    providedIn: 'root'
})
export class AuthFormService {
    constructor(private fb: FormBuilder) { }

    createRegisterForm(): FormGroup {
        return this.fb.group({
            userName: ['test1', Validators.required],
            email: ['test1@gmail.com', [Validators.required, Validators.email]],
            password: ['1234Qwer!', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['1234Qwer!', [Validators.required, Validators.minLength(6)]],
            role: [Role.Student, Validators.required],
            parentEmail: [''],
            organizationName: [''],
            course: this.fb.array([]),
        });
    }

    createLoginForm(): FormGroup {
        return this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

}