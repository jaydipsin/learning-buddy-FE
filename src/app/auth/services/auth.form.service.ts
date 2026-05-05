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
            userName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
            role: [Role.Student, Validators.required],
            parentEmail: [''],
            organizationName: [''],
            course: [''],
        });
    }

    createLoginForm(): FormGroup {
        return this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

}