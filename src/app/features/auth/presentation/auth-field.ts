import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-field',
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-field" [formGroup]="group()">
      <div class="label-row">
        <label class="form-label" [for]="fieldId()">{{ label() }}</label>
        <ng-content />
      </div>
      <input class="form-control" [id]="fieldId()" [name]="name()" [formControlName]="name()"
        [type]="type()" [autocomplete]="autocomplete()" [placeholder]="placeholder()"
        [attr.autocapitalize]="type() === 'text' ? 'words' : 'none'"
        [attr.spellcheck]="false" aria-required="true"
        [attr.aria-invalid]="error ? 'true' : null"
        [attr.aria-describedby]="error ? fieldId() + '-error' : null" />
      @if (error; as message) {
        <span class="field-error anim-view" [id]="fieldId() + '-error'" aria-live="polite">{{ message }}</span>
      }
    </div>`,
  styles: [`
    .label-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
    .form-label { transition: color var(--duration-fast) var(--ease-smooth); }
    .form-field:has(.form-control:focus) .form-label { color: var(--color-primary-text); }
  `],
})
export class AuthField {
  readonly group = input.required<FormGroup>();
  readonly name = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly autocomplete = input.required<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly matches = input('');

  get error(): string {
    const field = this.group().controls[this.name()];
    if (!field.touched) return '';
    if (field.hasError('required')) return this.label() + ' is required.';
    if (field.hasError('email')) return 'Enter a valid email address.';
    const length = field.getError('minlength')?.requiredLength;
    if (length) return 'Use at least ' + length + ' characters.';
    if (this.matches() && field.value !== this.group().controls[this.matches()].value) {
      return 'The passwords do not match.';
    }
    return '';
  }
}
